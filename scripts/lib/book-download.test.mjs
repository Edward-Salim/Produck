import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { longPress, LONG_PRESS_MS } from '../../src/lib/attachments/long-press.ts';
import { pdfDownloadHeaders, streamPdf } from '../../src/lib/server/book-download.ts';

function element() {
  const document = Object.assign(new EventTarget(), { defaultView: new EventTarget() });
  return Object.assign(new EventTarget(), { ownerDocument: document });
}

function dispatch(target, type, properties = {}) {
  const event = Object.assign(new Event(type, { cancelable: true }), properties);
  target.dispatchEvent(event);
  return event;
}

const primaryPointer = {
  isPrimary: true,
  button: 0,
  pointerId: 1,
  clientX: 20,
  clientY: 20
};

test('tap navigates, hold downloads once and suppresses only its pointer click', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const anchor = element();
  let downloads = 0;
  const destroy = longPress(() => downloads++)(anchor);
  dispatch(anchor, 'pointerdown', primaryPointer);
  t.mock.timers.tick(LONG_PRESS_MS - 1);
  dispatch(anchor.ownerDocument, 'pointerup', primaryPointer);
  t.mock.timers.tick(1);
  assert.equal(downloads, 0);
  assert.equal(dispatch(anchor, 'click', { detail: 1 }).defaultPrevented, false);

  dispatch(anchor, 'pointerdown', primaryPointer);
  t.mock.timers.tick(LONG_PRESS_MS);
  t.mock.timers.tick(LONG_PRESS_MS);
  assert.equal(downloads, 1);
  dispatch(anchor.ownerDocument, 'pointerup', primaryPointer);
  assert.equal(dispatch(anchor, 'click', { detail: 1 }).defaultPrevented, true);
  dispatch(anchor, 'pointerdown', primaryPointer);
  dispatch(anchor.ownerDocument, 'pointerup', primaryPointer);
  assert.equal(dispatch(anchor, 'click', { detail: 1 }).defaultPrevented, false);
  destroy();
});

test('movement, scrolling, blur, pointer cancellation and unmount cancel pending downloads', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (const scenario of ['move', 'scroll', 'blur', 'cancel', 'destroy']) {
    const anchor = element();
    let downloads = 0;
    const destroy = longPress(() => downloads++)(anchor);
    dispatch(anchor, 'pointerdown', primaryPointer);
    if (scenario === 'move')
      dispatch(anchor.ownerDocument, 'pointermove', { ...primaryPointer, clientY: 50 });
    if (scenario === 'scroll') dispatch(anchor.ownerDocument, 'scroll');
    if (scenario === 'blur') dispatch(anchor.ownerDocument.defaultView, 'blur');
    if (scenario === 'cancel') dispatch(anchor.ownerDocument, 'pointercancel', primaryPointer);
    if (scenario === 'destroy') destroy();
    t.mock.timers.tick(LONG_PRESS_MS);
    assert.equal(downloads, 0, scenario);
    destroy();
  }
});

test('modified clicks keep browser behavior and keyboard download avoids navigation', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const anchor = element();
  let downloads = 0;
  const destroy = longPress(() => downloads++)(anchor);
  dispatch(anchor, 'pointerdown', { ...primaryPointer, ctrlKey: true });
  t.mock.timers.tick(LONG_PRESS_MS);
  assert.equal(downloads, 0);
  assert.equal(dispatch(anchor, 'contextmenu').defaultPrevented, false);
  const keyboard = dispatch(anchor, 'keydown', { key: 'Enter', altKey: true });
  assert.equal(keyboard.defaultPrevented, true);
  assert.equal(downloads, 1);
  dispatch(anchor, 'keydown', { key: 'Enter', altKey: true, repeat: true });
  assert.equal(downloads, 1);
  assert.equal(dispatch(anchor, 'click', { detail: 0 }).defaultPrevented, false);
  destroy();
});

test('PDF streaming preserves every byte while limiting each emitted chunk', async () => {
  const data = Buffer.alloc(200_003);
  for (let index = 0; index < data.length; index++) data[index] = index % 251;
  const reader = streamPdf(data).getReader();
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    assert(value.length > 0 && value.length <= 64 * 1024);
    chunks.push(value);
  }
  const actual = Buffer.concat(chunks);
  assert.equal(actual.length, data.length);
  assert.equal(
    createHash('sha256').update(actual).digest('hex'),
    createHash('sha256').update(data).digest('hex')
  );
});

test('download headers preserve Unicode filenames and neutralize header and path characters', () => {
  const headers = pdfDownloadHeaders({
    filename: 'A\r\n"/\\: 创始人.pdf',
    byteLength: 123,
    sha256: 'a'.repeat(64)
  });
  const disposition = headers.get('content-disposition');
  assert(disposition.startsWith('attachment; filename="'));
  assert(disposition.includes("filename*=UTF-8''"));
  assert(disposition.includes(encodeURIComponent('创始人')));
  assert(!disposition.includes('\r') && !disposition.includes('\n'));
  assert.equal(headers.get('content-type'), 'application/pdf');
  assert.equal(headers.get('content-length'), '123');
  assert.equal(headers.get('cache-control'), 'private, no-store');
});
