import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import { PgDialect } from 'drizzle-orm/pg-core';
import {
  normalizePrototypeImages,
  prototypeImageGroups,
  prototypeImageFrame,
  prototypeImageOverview
} from '../../src/lib/frameworks/prototypes.ts';

const require = createRequire(import.meta.url);
const id = 'a'.repeat(64);
const image = {
  id,
  src: `/api/story-prototypes/24/${id}`,
  caption: 'KYB · Company profile',
  alt: 'CheckDAQ company profile',
  width: 1859,
  height: 1018
};

test('different records stay separate and revisiting a record preserves reading order', () => {
  const make = (hash, example) => ({
    ...image,
    id: hash.repeat(64),
    src: `/api/story-prototypes/24/${hash.repeat(64)}`,
    example
  });
  const screenshots = [
    make('a', 'Wallex Developer'),
    make('b', 'Wallex Developer'),
    make('c', 'KD2035'),
    make('d', 'Wallex Developer')
  ];
  const groups = prototypeImageGroups(screenshots);
  assert.deepEqual(
    groups.map((group) => group.label),
    ['Wallex Developer', 'KD2035', 'Wallex Developer']
  );
  assert.deepEqual(
    groups.map((group) => group.images.length),
    [2, 1, 1]
  );
  assert.deepEqual(
    groups.flatMap((group) => group.images),
    screenshots
  );
  assert.deepEqual(prototypeImageGroups(undefined), []);
});

test('unlabelled references do not inherit the preceding record context', () => {
  const next = { ...image, id: 'b'.repeat(64), src: `/api/story-prototypes/24/${'b'.repeat(64)}` };
  const groups = prototypeImageGroups([{ ...image, example: ' test kyc member ' }, next]);
  assert.deepEqual(
    groups.map((group) => group.label),
    ['test kyc member', '']
  );
  assert.deepEqual(
    prototypeImageGroups([image, next]).map((group) => group.images.length),
    [2]
  );
});

test('gallery preserves ordered images and natural dimensions while removing duplicates', () => {
  const next = { ...image, id: 'b'.repeat(64), src: `/api/story-prototypes/24/${'b'.repeat(64)}` };
  assert.deepEqual(normalizePrototypeImages([image, next, image]), [image, next]);
  assert.deepEqual(normalizePrototypeImages(undefined), []);
});

test('whole-image view preserves original highlight coordinates and source dimensions', () => {
  const frame = prototypeImageOverview({
    ...image,
    crop: { x: 25, y: 20, width: 50, height: 40 },
    highlights: [{ x: 30, y: 30, width: 10, height: 8, label: 'Relevant control' }]
  });
  assert.equal(frame.imageStyle, undefined);
  assert.equal(frame.maxWidth, `${image.width}px`);
  assert.deepEqual(frame.highlights, [
    { x: 30, y: 30, width: 10, height: 8, label: 'Relevant control' }
  ]);
});

test('whole-image view marks the former crop area when there is no control highlight', () => {
  const crop = { x: 25, y: 20, width: 50, height: 40 };
  const frame = prototypeImageOverview({ ...image, crop });
  assert.equal(frame.imageStyle, undefined);
  assert.deepEqual(frame.highlights, [{ ...crop, label: image.caption }]);
  assert.deepEqual(prototypeImageOverview(image).highlights, []);
});

test('step markers keep explicit positive numbers and omit invalid or absent steps', () => {
  const region = { x: 10, y: 10, width: 20, height: 20, label: 'Choose method' };
  const frame = prototypeImageOverview({ ...image, highlights: [{ ...region, step: 2 }] });
  assert.equal(frame.highlights[0].step, 2);
  for (const step of [undefined, 0, -1, 1.5, '1']) {
    assert.equal(
      prototypeImageOverview({ ...image, highlights: [{ ...region, step }] }).highlights[0].step,
      undefined
    );
  }
});

test('gallery rejects external URLs, mismatched hashes and invalid dimensions', () => {
  const invalid = [
    { ...image, src: 'javascript:alert(1)' },
    { ...image, src: 'https://example.com/image.png' },
    { ...image, src: `${image.src}?redirect=1` },
    { ...image, id: 'b'.repeat(64) },
    { ...image, width: -1 },
    { ...image, height: 1.5 },
    null
  ];
  assert.deepEqual(normalizePrototypeImages(invalid), []);
});

test('crop geometry preserves the source aspect ratio and scales highlights with the crop', () => {
  const frame = prototypeImageFrame({
    ...image,
    width: 1600,
    height: 900,
    crop: { x: 25, y: 20, width: 50, height: 40 },
    highlights: [{ x: 30, y: 30, width: 10, height: 8, label: 'Relevant control' }]
  });
  assert.equal(frame.aspectRatio, 800 / 360);
  assert.equal(frame.maxWidth, '800px');
  assert.match(frame.imageStyle, /width:200%/);
  assert.match(frame.imageStyle, /left:-50%/);
  assert.match(frame.imageStyle, /top:-50%/);
  assert.deepEqual(frame.highlights, [
    { x: 10, y: 25, width: 20, height: 20, label: 'Relevant control' }
  ]);
});

test('invalid crop metadata falls back to natural dimensions without breaking the image', () => {
  for (const crop of [
    null,
    { x: 95, y: 0, width: 20, height: 10 },
    { x: 0, y: 0, width: 0, height: 10 },
    { x: NaN, y: 0, width: 20, height: 10 }
  ]) {
    const frame = prototypeImageFrame({ ...image, crop });
    assert.equal(frame.aspectRatio, undefined);
    assert.equal(frame.imageStyle, undefined);
    assert.equal(frame.maxWidth, `${image.width}px`);
  }
  assert.equal(
    prototypeImageFrame({
      ...image,
      width: undefined,
      crop: { x: 10, y: 10, width: 50, height: 50 }
    }).imageStyle,
    undefined
  );
});

test('highlights outside the visible crop and malformed metadata are omitted', () => {
  const frame = prototypeImageFrame({
    ...image,
    crop: { x: 25, y: 25, width: 50, height: 50 },
    highlights: [
      null,
      { x: 10, y: 20, width: 5, height: 5, label: 'Outside' },
      { x: 70, y: 30, width: 10, height: 10, label: 'Partially clipped' },
      { x: 30, y: 30, width: 10, height: 10, label: 'Visible' }
    ]
  });
  assert.deepEqual(
    frame.highlights.map((region) => region.label),
    ['Visible']
  );
});

function loadTs(relative, resolve = require) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(relative, import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
  );
  new Function('require', 'module', 'exports', outputText)(resolve, module, module.exports);
  return module.exports;
}

const schema = loadTs('../../src/lib/server/db/schema.ts');
const { error } = await import('@sveltejs/kit');
const bytes = Buffer.from('private-image');
const dialect = new PgDialect();

function endpoint() {
  const queries = [];
  const accesses = [];
  const db = {
    select() {
      const query = {
        from() {
          return query;
        },
        where(predicate) {
          queries.push(dialect.sqlToQuery(predicate).params);
          return query;
        },
        async limit() {
          const [project, hash] = queries.at(-1);
          return project === 24 && hash === id ? [{ contentType: 'image/png', data: bytes }] : [];
        }
      };
      return query;
    }
  };
  const { GET } = loadTs(
    '../../src/routes/api/story-prototypes/[project]/[asset]/+server.ts',
    (name) => {
      if (name === '@sveltejs/kit') return { error };
      if (name === '$lib/server/db/index.js') return { db };
      if (name === '$lib/server/db/schema.js') return schema;
      if (name === '$lib/server/access.js')
        return {
          assertProjectAccess: async (locals, project) => {
            accesses.push(project);
            if (!locals.user) error(401, 'Unauthorized');
            if (!locals.projects.includes(project)) error(403, 'Forbidden');
          }
        };
      return require(name);
    }
  );
  const call = ({ project = '24', asset = id, user = true, projects = [24], etag } = {}) =>
    GET({
      params: { project, asset },
      locals: { user, projects },
      request: new Request('http://localhost/image', {
        headers: etag ? { 'if-none-match': etag } : {}
      })
    });
  return { call, queries, accesses };
}

test('private image endpoint denies access before fetching bytes, including cached requests', async () => {
  const route = endpoint();
  await assert.rejects(route.call({ user: false }), { status: 401 });
  await assert.rejects(route.call({ projects: [], etag: `"${id}"` }), { status: 403 });
  assert.deepEqual(route.queries, []);
});

test('private image endpoint scopes asset lookup by project and validates identifiers', async () => {
  const route = endpoint();
  await assert.rejects(route.call({ project: '25', projects: [25] }), { status: 404 });
  assert.deepEqual(route.queries, [[25, id]]);
  for (const params of [{ project: '0' }, { project: '24x' }, { asset: '../secret' }]) {
    await assert.rejects(route.call(params), { status: 404 });
  }
  assert.deepEqual(route.accesses, [25]);
});

test('authorized images return exact bytes and revalidate private browser caches', async () => {
  const route = endpoint();
  const response = await route.call();
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.equal(response.headers.get('content-type'), 'image/png');
  assert.equal(response.headers.get('cache-control'), 'private, no-cache');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const cached = await route.call({ etag: `W/"${id}"` });
  assert.equal(cached.status, 304);
  assert.equal(await cached.text(), '');
  assert.deepEqual(route.accesses, [24, 24]);
});
