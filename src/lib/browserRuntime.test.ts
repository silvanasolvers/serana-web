import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBrowserUuid,
  isBrowserUuid,
  readBrowserStorage,
  removeBrowserStorage,
  writeBrowserStorage,
} from './browserRuntime.ts';

test('UUID fallback contract matches the checkout server validator', () => {
  const value = createBrowserUuid();
  assert.equal(isBrowserUuid(value), true);
  assert.equal(isBrowserUuid('not-a-uuid'), false);
});

test('storage helpers degrade safely outside a browser', () => {
  assert.equal(readBrowserStorage('localStorage', 'missing'), null);
  assert.doesNotThrow(() => writeBrowserStorage('localStorage', 'key', 'value'));
  assert.doesNotThrow(() => removeBrowserStorage('sessionStorage', 'key'));
});
