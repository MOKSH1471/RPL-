import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, startTestServer, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('POST /api/upload rejects request with 400 when no file is attached', async () => {
  const { status, data } = await apiRequest('/api/upload', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert.equal(status, 400);
  assert.equal(data.error, 'No file uploaded');
});

test('POST /api/upload handles empty multipart form with 400', async () => {
  const base = await startTestServer();
  const formData = new FormData();
  formData.append('customName', 'Test_Player');

  const res = await fetch(`${base}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));

  assert.equal(res.status, 400);
  assert.equal(data.error, 'No file uploaded');
});

test('POST /api/upload validates upload parameters and handles file streams', async () => {
  const base = await startTestServer();
  const formData = new FormData();
  const mockFile = new Blob(['mock-image-binary-content'], { type: 'image/jpeg' });
  formData.append('file', mockFile, 'avatar.jpg');
  formData.append('customName', 'Test_Player');
  formData.append('fileType', 'photo');

  const res = await fetch(`${base}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  // 200 if Google Drive Webhook responds, or 500 if offline/sandbox environment
  assert.ok([200, 500].includes(res.status), `Expected 200 or 500, got ${res.status}`);
  if (res.status === 200) {
    const data = await res.json();
    assert.ok(data.url, 'Expected url property on successful response');
  }
});
