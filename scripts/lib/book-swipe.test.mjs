import assert from 'node:assert/strict';
import test from 'node:test';
import { horizontalSwipe } from '../../src/lib/attachments/horizontal-swipe.ts';
import { longPress, LONG_PRESS_MS } from '../../src/lib/attachments/long-press.ts';

function element(document = Object.assign(new EventTarget(), { defaultView: new EventTarget() })) {
  return Object.assign(new EventTarget(), { ownerDocument: document });
}

function dispatch(target, type, properties = {}) {
  const event = Object.assign(new Event(type, { cancelable: true }), properties);
  target.dispatchEvent(event);
  return event;
}

const touch = {
  isPrimary: true,
  button: 0,
  pointerId: 1,
  pointerType: 'touch',
  clientX: 100,
  clientY: 100
};

test('left and right swipes report their direction once, suppress cover clicks, and preserve the next tap', () => {
  for (const clientX of [30, 170]) {
    const rack = element();
    let flips = 0;
    const directions = [];
    const destroy = horizontalSwipe((direction) => {
      flips++;
      directions.push(direction);
    })(rack);
    dispatch(rack, 'pointerdown', touch);
    dispatch(rack.ownerDocument, 'pointermove', { ...touch, clientX });
    dispatch(rack.ownerDocument, 'pointerup', { ...touch, clientX });
    dispatch(rack.ownerDocument, 'pointerup', { ...touch, clientX });
    assert.equal(flips, 1);
    assert.deepEqual(directions, [clientX < touch.clientX ? 'left' : 'right']);
    assert.equal(dispatch(rack, 'click', { detail: 1 }).defaultPrevented, true);
    dispatch(rack, 'pointerdown', touch);
    dispatch(rack.ownerDocument, 'pointerup', touch);
    assert.equal(dispatch(rack, 'click', { detail: 1 }).defaultPrevented, false);
    destroy();
  }
});

test('scrolling, diagonal movement, mouse drags, multitouch, and cancellation do not flip', () => {
  for (const scenario of [
    'scroll',
    'diagonal',
    'mouse',
    'multitouch',
    'cancel',
    'blur',
    'destroy'
  ]) {
    const rack = element();
    let flips = 0;
    const destroy = horizontalSwipe(() => flips++)(rack);
    dispatch(rack, 'pointerdown', {
      ...touch,
      pointerType: scenario === 'mouse' ? 'mouse' : 'touch'
    });
    if (scenario === 'scroll') dispatch(rack.ownerDocument, 'scroll');
    if (scenario === 'diagonal')
      dispatch(rack.ownerDocument, 'pointermove', { ...touch, clientY: 130 });
    if (scenario === 'multitouch')
      dispatch(rack, 'pointerdown', { ...touch, pointerId: 2, isPrimary: false });
    if (scenario === 'cancel') dispatch(rack.ownerDocument, 'pointercancel', touch);
    if (scenario === 'blur') dispatch(rack.ownerDocument.defaultView, 'blur');
    if (scenario === 'destroy') destroy();
    dispatch(rack.ownerDocument, 'pointerup', { ...touch, clientX: 30 });
    assert.equal(flips, 0, scenario);
    assert.equal(dispatch(rack, 'click', { detail: 0 }).defaultPrevented, false);
    destroy();
  }
});

test('swiping across a cover cancels its pending PDF download', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const rack = element();
  const cover = element(rack.ownerDocument);
  let flips = 0;
  let downloads = 0;
  const destroySwipe = horizontalSwipe(() => flips++)(rack);
  const destroyHold = longPress(() => downloads++)(cover);
  dispatch(cover, 'pointerdown', touch);
  dispatch(rack, 'pointerdown', touch);
  dispatch(rack.ownerDocument, 'pointermove', { ...touch, clientX: 30 });
  dispatch(rack.ownerDocument, 'pointerup', { ...touch, clientX: 30 });
  t.mock.timers.tick(LONG_PRESS_MS);
  assert.equal(flips, 1);
  assert.equal(downloads, 0);
  destroySwipe();
  destroyHold();
});

test('holding a cover downloads without also flipping the shelf', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let now = 0;
  t.mock.method(Date, 'now', () => now);
  const rack = element();
  const cover = element(rack.ownerDocument);
  let flips = 0;
  let downloads = 0;
  const destroySwipe = horizontalSwipe(() => flips++)(rack);
  const destroyHold = longPress(() => downloads++)(cover);
  dispatch(cover, 'pointerdown', touch);
  dispatch(rack, 'pointerdown', touch);
  now += LONG_PRESS_MS;
  t.mock.timers.tick(LONG_PRESS_MS);
  dispatch(rack.ownerDocument, 'pointerup', { ...touch, clientX: 30 });
  assert.equal(downloads, 1);
  assert.equal(flips, 0);
  destroySwipe();
  destroyHold();
});
