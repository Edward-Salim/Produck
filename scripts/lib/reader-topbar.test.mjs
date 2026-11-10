import assert from 'node:assert/strict';
import test from 'node:test';
import { autoHideReaderTopbar } from '../../src/lib/attachments/reader-topbar.ts';

function reader() {
  const mobile = Object.assign(new EventTarget(), { matches: true });
  const scroller = Object.assign(new EventTarget(), {
    scrollTop: 0,
    scrollHeight: 2000,
    clientHeight: 600
  });
  let hidden = false;
  let menuOpen = false;
  const header = {
    closest: () => scroller,
    ownerDocument: { defaultView: { matchMedia: () => mobile } },
    offsetHeight: 48,
    querySelector: () => (menuOpen ? {} : null),
    removeAttribute: () => (hidden = false),
    toggleAttribute: (_, value) => (hidden = value)
  };
  const destroy = autoHideReaderTopbar('/books/example')(header);
  return {
    mobile,
    scroller,
    destroy,
    get hidden() {
      return hidden;
    },
    set menuOpen(value) {
      menuOpen = value;
    },
    scroll(top) {
      scroller.scrollTop = top;
      scroller.dispatchEvent(new Event('scroll'));
    }
  };
}

test('mobile reading hides the topbar downward and reveals it after a deliberate upward scroll', () => {
  const r = reader();
  r.scroll(30);
  assert.equal(r.hidden, false);
  r.scroll(100);
  assert.equal(r.hidden, true);
  r.scroll(98);
  assert.equal(r.hidden, true, 'ignore a small reversal');
  r.scroll(87);
  assert.equal(r.hidden, false);
  r.scroll(120);
  assert.equal(r.hidden, true);
  r.scroll(0);
  assert.equal(r.hidden, false);
  r.destroy();
});

test('the attachment only runs on individual book reader pages', () => {
  assert.equal(autoHideReaderTopbar('/books'), undefined);
  assert.equal(autoHideReaderTopbar('/frameworks'), undefined);
  assert.equal(autoHideReaderTopbar('/tools/books'), undefined);
  assert.equal(typeof autoHideReaderTopbar('/books/example/'), 'function');
});

test('elastic overscroll does not create a false change of direction', () => {
  const r = reader();
  r.scroll(1400);
  assert.equal(r.hidden, true);
  r.scroll(1440);
  r.scroll(1400);
  assert.equal(r.hidden, true);
  r.scroll(1380);
  assert.equal(r.hidden, false);
  r.scroll(-30);
  r.scroll(0);
  assert.equal(r.hidden, false);
  r.destroy();
});

test('navigation focus and an open project menu keep the topbar available', () => {
  const r = reader();
  r.scroll(100);
  r.scroller.dispatchEvent(new Event('focusin'));
  assert.equal(r.hidden, false);
  r.scroll(500);
  assert.equal(r.hidden, false, 'section focus followed by programmatic scrolling stays visible');
  r.scroll(530);
  assert.equal(r.hidden, true);
  r.menuOpen = true;
  r.scroll(600);
  assert.equal(r.hidden, false);
  r.destroy();
});

test('desktop resize and attachment cleanup restore the topbar and remove listeners', () => {
  const r = reader();
  r.scroll(100);
  assert.equal(r.hidden, true);
  r.mobile.matches = false;
  r.mobile.dispatchEvent(new Event('change'));
  assert.equal(r.hidden, false);
  r.scroll(200);
  assert.equal(r.hidden, false);
  r.mobile.matches = true;
  r.scroll(300);
  assert.equal(r.hidden, true);
  r.destroy();
  assert.equal(r.hidden, false);
  r.scroll(400);
  assert.equal(r.hidden, false);
});
