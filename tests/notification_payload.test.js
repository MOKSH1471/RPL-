import { test } from 'node:test';
import assert from 'node:assert/strict';

// Normalizes telephone number to E.164 without '+' for WhatsApp API (e.g. 919876543210)
function normalizeWhatsAppPhone(phone) {
  if (!phone) throw new Error('Phone number is required');
  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 10) {
    return `91${digits}`; // Standard 10-digit Indian mobile
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`; // 0-prefixed Indian mobile
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits; // Already has 91 prefix
  } else if (digits.length >= 10 && digits.length <= 15) {
    return digits; // Other international format
  } else {
    throw new Error(`Invalid telephone number: ${phone}`);
  }
}

// Formats payload for WhatsApp Business Cloud / Graph API
function buildWhatsAppConfirmationPayload({ recipientPhone, playerName, registrationId, sports, amount, passUrl }) {
  const normalizedTo = normalizeWhatsAppPhone(recipientPhone);
  const sportsStr = Array.isArray(sports) ? sports.join(', ') : String(sports || '');

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedTo,
    type: 'template',
    template: {
      name: 'rpl_registration_confirmation',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: playerName },
            { type: 'text', text: registrationId },
            { type: 'text', text: sportsStr },
            { type: 'text', text: `₹${amount}` },
            { type: 'text', text: passUrl || 'https://rpl-s9.vercel.app' },
          ],
        },
      ],
    },
  };
}

// Generates quick WhatsApp web chat URL for admin roster actions
function buildWhatsAppChatUrl(phone, text) {
  const normalized = normalizeWhatsAppPhone(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

// --- Test Suites ---

test('Notification Payload: normalizes Indian and international phone numbers', () => {
  assert.strictEqual(normalizeWhatsAppPhone('9876543210'), '919876543210');
  assert.strictEqual(normalizeWhatsAppPhone('09876543210'), '919876543210');
  assert.strictEqual(normalizeWhatsAppPhone('+91 98765-43210'), '919876543210');
  assert.strictEqual(normalizeWhatsAppPhone('919876543210'), '919876543210');
  assert.strictEqual(normalizeWhatsAppPhone('+1 (555) 234-5678'), '15552345678');

  assert.throws(() => normalizeWhatsAppPhone('12345'), /Invalid telephone number/);
  assert.throws(() => normalizeWhatsAppPhone(''), /Phone number is required/);
});

test('Notification Payload: builds valid WhatsApp Cloud API template payload', () => {
  const payload = buildWhatsAppConfirmationPayload({
    recipientPhone: '9876543210',
    playerName: 'Harshil K',
    registrationId: 'reg_test_999',
    sports: ['cricket', 'badminton'],
    amount: 2900,
    passUrl: 'https://rpl-s9.vercel.app/pass/reg_test_999',
  });

  assert.strictEqual(payload.messaging_product, 'whatsapp');
  assert.strictEqual(payload.to, '919876543210');
  assert.strictEqual(payload.type, 'template');
  assert.strictEqual(payload.template.name, 'rpl_registration_confirmation');
  assert.strictEqual(payload.template.language.code, 'en');

  const params = payload.template.components[0].parameters;
  assert.strictEqual(params.length, 5);
  assert.strictEqual(params[0].text, 'Harshil K');
  assert.strictEqual(params[1].text, 'reg_test_999');
  assert.strictEqual(params[2].text, 'cricket, badminton');
  assert.strictEqual(params[3].text, '₹2900');
  assert.strictEqual(params[4].text, 'https://rpl-s9.vercel.app/pass/reg_test_999');
});

test('Notification Payload: generates compliant wa.me deep links for direct contact', () => {
  const url = buildWhatsAppChatUrl('9876543210', 'Hi Harshil, your RPL registration has been verified!');
  assert.ok(url.startsWith('https://wa.me/919876543210?text='));
  assert.ok(url.includes('Hi%20Harshil'));
  assert.ok(url.includes('verified!'));
});
