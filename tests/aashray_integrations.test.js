import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cleanDomesticPhone, formatWhatsAppPhone } from '../apps/api/src/utils/phoneFormatter.js';
import connectionMonitor from '../apps/api/src/config/connectionMonitor.js';
import { ensureGuestCard } from '../apps/api/src/services/guestCardService.js';
import db from '../apps/api/src/config/db.js';

after(async () => {
  connectionMonitor.stop();
  try {
    await db.end();
  } catch {}
});

test('Phone Formatter: cleanDomesticPhone normalizes all Indian mobile variants to 10 digits', () => {
  assert.strictEqual(cleanDomesticPhone('+91 98765 43210'), '9876543210');
  assert.strictEqual(cleanDomesticPhone('+91-98765-43210'), '9876543210');
  assert.strictEqual(cleanDomesticPhone('919876543210'), '9876543210');
  assert.strictEqual(cleanDomesticPhone('09876543210'), '9876543210');
  assert.strictEqual(cleanDomesticPhone('9876543210'), '9876543210');
  assert.strictEqual(cleanDomesticPhone('  9876543210  '), '9876543210');
  assert.strictEqual(cleanDomesticPhone(''), '');
  assert.strictEqual(cleanDomesticPhone(null), '');
  assert.strictEqual(cleanDomesticPhone(undefined), '');
});

test('Phone Formatter: formatWhatsAppPhone formats Indian and international numbers correctly', () => {
  // India default & fallbacks
  assert.strictEqual(formatWhatsAppPhone('9876543210', 'India'), '919876543210');
  assert.strictEqual(formatWhatsAppPhone('919876543210', 'india'), '919876543210');
  assert.strictEqual(formatWhatsAppPhone('9876543210', null), '919876543210');

  // UAE (including correction of UAE number starting with errant 1)
  assert.strictEqual(formatWhatsAppPhone('504504553', 'UAE'), '971504504553');
  assert.strictEqual(formatWhatsAppPhone('1504504553', 'Dubai'), '971504504553');
  assert.strictEqual(formatWhatsAppPhone('971504504553', 'United Arab Emirates'), '971504504553');

  // USA & UK
  assert.strictEqual(formatWhatsAppPhone('2125551234', 'USA'), '12125551234');
  assert.strictEqual(formatWhatsAppPhone('7123456789', 'UK'), '447123456789');

  // Null/Empty handling
  assert.strictEqual(formatWhatsAppPhone(null), null);
  assert.strictEqual(formatWhatsAppPhone(''), null);
});

test('Guest Card: ensureGuestCard gracefully handles invalid or short phone numbers', async () => {
  const shortResult = await ensureGuestCard({
    fullName: 'Invalid Player',
    mobile: '123',
    email: 'test@example.com',
  });
  assert.strictEqual(shortResult, null);

  const emptyResult = await ensureGuestCard({
    fullName: 'Empty Player',
    mobile: '',
    email: 'test@example.com',
  });
  assert.strictEqual(emptyResult, null);
});

test('Connection Monitor: lifecycle controls start and stop without throwing or leaking', () => {
  // Can start cleanly
  connectionMonitor.start();
  assert.strictEqual(connectionMonitor.isMonitoring, true);

  // Calling start again warns but does not crash
  connectionMonitor.start();
  assert.strictEqual(connectionMonitor.isMonitoring, true);

  // Stops cleanly
  connectionMonitor.stop();
  assert.strictEqual(connectionMonitor.isMonitoring, false);
});
