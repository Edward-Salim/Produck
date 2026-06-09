let _fullscreen = $state(false);

export function getFullscreen() {
  return _fullscreen;
}

export function toggleFullscreen() {
  _fullscreen = !_fullscreen;
}

export function exitFullscreen() {
  _fullscreen = false;
}
