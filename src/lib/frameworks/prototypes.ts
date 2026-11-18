import type { StoryPrototypeImage, StoryPrototypeRegion } from '../types/story-map.js';

function validRegion(value: unknown): value is StoryPrototypeRegion {
  if (!value || typeof value !== 'object') return false;
  const region = value as StoryPrototypeRegion;
  return (
    [region.x, region.y, region.width, region.height].every(Number.isFinite) &&
    region.x >= 0 &&
    region.y >= 0 &&
    region.width > 0 &&
    region.height > 0 &&
    region.x + region.width <= 100 &&
    region.y + region.height <= 100
  );
}

export function prototypeImageFrame(image: StoryPrototypeImage) {
  const cropped = validRegion(image.crop) && image.width && image.height;
  const crop = cropped ? image.crop! : { x: 0, y: 0, width: 100, height: 100 };
  const highlights = (Array.isArray(image.highlights) ? image.highlights : [])
    .filter((region) => validRegion(region) && typeof region.label === 'string')
    .filter(
      (region) =>
        region.x >= crop.x &&
        region.y >= crop.y &&
        region.x + region.width <= crop.x + crop.width &&
        region.y + region.height <= crop.y + crop.height
    )
    .map((region) => ({
      label: region.label,
      ...(Number.isSafeInteger(region.step) && region.step! > 0 ? { step: region.step } : {}),
      x: ((region.x - crop.x) / crop.width) * 100,
      y: ((region.y - crop.y) / crop.height) * 100,
      width: (region.width / crop.width) * 100,
      height: (region.height / crop.height) * 100
    }));
  return {
    maxWidth: image.width ? `${(image.width * crop.width) / 100}px` : undefined,
    aspectRatio: cropped ? (image.width! * crop.width) / (image.height! * crop.height) : undefined,
    imageStyle: cropped
      ? `position:absolute;width:${10000 / crop.width}%;max-width:none;left:${(-crop.x / crop.width) * 100}%;top:${(-crop.y / crop.height) * 100}%;`
      : undefined,
    highlights
  };
}

export function prototypeImageOverview(image: StoryPrototypeImage) {
  return prototypeImageFrame({
    ...image,
    crop: undefined,
    highlights:
      Array.isArray(image.highlights) && image.highlights.length
        ? image.highlights
        : validRegion(image.crop)
          ? [{ ...image.crop, label: image.caption }]
          : []
  });
}

export function normalizePrototypeImages(value: unknown): StoryPrototypeImage[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((image): image is StoryPrototypeImage => {
    if (!image || typeof image !== 'object') return false;
    const match =
      typeof image.src === 'string'
        ? /^\/api\/story-prototypes\/([1-9]\d*)\/([a-f0-9]{64})$/.exec(image.src)
        : null;
    if (
      !match ||
      !Number.isSafeInteger(Number(match[1])) ||
      image.id !== match[2] ||
      typeof image.caption !== 'string' ||
      typeof image.alt !== 'string' ||
      seen.has(image.id)
    )
      return false;
    if (
      [image.width, image.height].some(
        (size) => size !== undefined && (!Number.isSafeInteger(size) || size <= 0)
      )
    )
      return false;
    seen.add(image.id);
    return true;
  });
}

/** Keep separate records apart without changing screenshot reading order. */
export function prototypeImageGroups(value: unknown) {
  const groups: { key: string; label: string; images: StoryPrototypeImage[] }[] = [];
  for (const image of normalizePrototypeImages(value)) {
    const label = typeof image.example === 'string' ? image.example.trim() : '';
    const previous = groups.at(-1);
    if (previous && previous.label === label) previous.images.push(image);
    else groups.push({ key: image.id, label, images: [image] });
  }
  return groups;
}
