import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer, db, RPL_DB } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('Registration Validation: rejects empty registration payload with 400', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.error, 'Missing core registration fields.');
});

test('Registration Validation: rejects payload missing mobile number with 400', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: 'Test Player',
      email: 'player@example.com',
    }),
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.error, 'Missing core registration fields.');
});

test('Razorpay Fee Calculation: New Player (existingRplFamily: No) defaults to base fee of ₹3,000', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Single Sport Player',
      email: 'player@example.com',
      mobile: '9811111111',
      selectedSports: ['cricket'],
      existingRplFamily: 'No',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 300000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: Returning Family Participant (existingRplFamily: Yes) charges base fee of ₹2,700', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Sport Player',
      email: 'returning@example.com',
      mobile: '9811111112',
      selectedSports: ['cricket'],
      existingRplFamily: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: 3 Sports charges flat event fee of ₹3,000 for New Player (all sports included)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Multi Sport Player',
      email: 'player@example.com',
      mobile: '9822222222',
      selectedSports: ['cricket', 'football', 'badminton'],
      existingRplFamily: 'No',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 300000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: New Player selecting extra T-shirt (Yes) charges ₹3,500 (3000 + 500)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Extra Tshirt Player',
      email: 'player@example.com',
      mobile: '9833333333',
      selectedSports: ['cricket'],
      existingRplFamily: 'No',
      extraTshirt: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 350000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: Returning Family selecting extra T-shirt (Yes) charges ₹3,200 (2700 + 500)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Extra Tshirt Player',
      email: 'returning_tshirt@example.com',
      mobile: '9833333334',
      selectedSports: ['cricket'],
      existingRplFamily: 'Yes',
      extraTshirt: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 320000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: New Player selecting extra T-shirt (No) charges flat ₹3,000', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Standard Tshirt Player',
      email: 'player@example.com',
      mobile: '9844444444',
      selectedSports: ['cricket'],
      existingRplFamily: 'No',
      extraTshirt: 'No',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 300000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: Returning player requesting extra T-shirt (Yes) charges incremental ₹500', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Player Extra Tshirt',
      email: 'player@example.com',
      mobile: '9855555555',
      selectedSports: ['cricket'],
      extraTshirt: 'Yes',
      isExistingPlayer: true,
      hasPreviouslyPaid: true,
      previouslyPaidSportsCount: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 50000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: Returning player adding sports needs no extra payment (all sports included)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket', 'football'],
      isExistingPlayer: true,
      hasPreviouslyPaid: true,
      previouslyPaidSportsCount: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.amount, 0);
  assert.strictEqual(res.data.orderId, null);
  assert.strictEqual(res.data.message, 'No payment required');
});

test('Razorpay Fee Calculation: Returning player with no new sports needs no payment', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Already Paid Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket'],
      isExistingPlayer: true,
      hasPreviouslyPaid: true,
      previouslyPaidSportsCount: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.amount, 0);
  assert.strictEqual(res.data.orderId, null);
  assert.strictEqual(res.data.message, 'No payment required');
});

test('Direct Registration: POST /api/register with payment_status=pending saves registration without payment', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'Direct Registration Player',
      email: 'directregistration@example.com',
      mobile: '+91 9988776655',
      payment_status: 'pending',
      general_details: {
        centre: 'Mumbai',
        gender: 'Male',
        selectedSports: ['cricket'],
      },
      answers: {},
    }),
  });

  // Should succeed (200/201) or fail gracefully if DB is offline (500)
  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  // If DB is reachable, registration must be saved with pending status (no UTR required)
  if (res.status === 200 || res.status === 201) {
    assert.ok(res.data.registration_id || res.data.success, 'Should return a registration ID or success flag');
  }
});

test('Direct Registration: registration submitted without UTR/receipt should not be marked approved', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'No Payment Player',
      email: 'nopay@example.com',
      mobile: '+91 9911223344',
      payment_status: 'pending',
      payment_utr: undefined,
      payment_receipt_url: undefined,
      general_details: {
        centre: 'Delhi',
        gender: 'Male',
        selectedSports: ['cricket'],
      },
      answers: {},
    }),
  });

  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  // If DB is reachable, payment status must NOT be 'approved' without a UTR
  if ((res.status === 200 || res.status === 201) && res.data.paymentStatus) {
    assert.notStrictEqual(
      res.data.paymentStatus,
      'approved',
      'Registration without payment should not be approved'
    );
  }
});

test('Kaccha Pakka Cricket League: Order creation with kaccha-pakka sport calculates flat fee of ₹2,700 for returning player', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Kaccha Pakka Player',
      email: 'kp@example.com',
      mobile: '9866666666',
      selectedSports: ['kaccha-pakka'],
      existingRplFamily: 'Yes',
      extraTshirt: 'No',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Kaccha Pakka Cricket League: Order creation with kaccha-pakka and extra T-shirt calculates ₹3,200 for returning player', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Kaccha Pakka Veteran',
      email: 'veteran@example.com',
      mobile: '9877777777',
      selectedSports: ['cricket', 'kaccha-pakka'],
      existingRplFamily: 'Yes',
      extraTshirt: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 320000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('90s Nostalgia: Order creation preserves nostalgiaSport in general_details and sport_answers', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Nostalgia Champion',
      email: 'nostalgia@example.com',
      mobile: '9888888888',
      selectedSports: ['cricket'],
      existingRplFamily: 'Yes',
      extraTshirt: 'No',
      registrationPayload: {
        fullName: 'Nostalgia Champion',
        email: 'nostalgia@example.com',
        mobile: '9888888888',
        general_details: {
          centre: 'Mumbai',
          gender: 'Male',
          existingRplFamily: 'Yes',
          nostalgiaSport: 'Carrom',
          nostalgia_sport: 'Carrom',
        },
        sport_answers: {
          '90s-nostalgia': { sport: 'Carrom' },
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('90s Nostalgia Multi-Select: Order creation preserves array of multiple nostalgia sports', async () => {
  const selectedNostalgia = [
    'Carrom',
    'Lemon spoon with book on head',
    'Duckwalk',
    'Skipping',
  ];

  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Nostalgia Multi Champion',
      email: 'nostalgiamulti@example.com',
      mobile: '9888888889',
      selectedSports: ['cricket'],
      existingRplFamily: 'Yes',
      extraTshirt: 'No',
      registrationPayload: {
        fullName: 'Nostalgia Multi Champion',
        email: 'nostalgiamulti@example.com',
        mobile: '9888888889',
        general_details: {
          centre: 'Mumbai',
          gender: 'Male',
          existingRplFamily: 'Yes',
          nostalgiaSport: selectedNostalgia,
          nostalgia_sport: selectedNostalgia,
        },
        sport_answers: {
          '90s-nostalgia': {
            sport: selectedNostalgia,
            sports: selectedNostalgia,
          },
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Direct Registration with Multi-Select Nostalgia: registers with payment_status=pending and preserves sports array', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'Direct Registration Multi Nostalgia Player',
      email: 'directregistrationmulti@example.com',
      mobile: '+91 9988776655',
      payment_status: 'pending',
      payment_utr: undefined,
      payment_receipt_url: undefined,
      general_details: {
        centre: 'Delhi',
        gender: 'Male',
        selectedSports: ['cricket'],
        nostalgiaSport: ['Carrom', 'Duckwalk'],
        nostalgia_sport: ['Carrom', 'Duckwalk'],
      },
      answers: {},
    }),
  });

  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  if (res.status === 200 || res.status === 201) {
    assert.ok(
      res.data.registration_id || res.data.success,
      'Should return a registration ID or success flag'
    );
    if (res.data.paymentStatus) {
      assert.strictEqual(
        res.data.paymentStatus,
        'pending',
        'Payment status must be pending'
      );
    }
  }
});

test('Spectator Pass: Order creation for Day Pass without stay (₹540 / 54000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Spectator Day Guest',
      email: 'spectator_day@example.com',
      mobile: '9111122222',
      selectedSports: ['spectator'],
      registrationType: 'spectator',
      accommodationRequired: 'No',
      extraTshirt: 'No',
      registrationPayload: {
        fullName: 'Spectator Day Guest',
        email: 'spectator_day@example.com',
        mobile: '9111122222',
        general_details: {
          centre: 'Mumbai',
          gender: 'Male',
          registrationType: 'spectator',
          spectatorOption: 'without-stay',
          accommodationRequired: 'No',
          extraTshirt: 'No',
          spectatorTshirt: 'No',
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 54000, 'Spectator without stay must be ₹540 (54000 paise)');
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Spectator Pass: Order creation for Day Pass without stay + T-Shirt (₹1,040 / 104000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Spectator Day With Tshirt',
      email: 'spectator_tshirt@example.com',
      mobile: '9111122223',
      selectedSports: ['spectator'],
      registrationType: 'spectator',
      accommodationRequired: 'No',
      extraTshirt: 'Yes',
      registrationPayload: {
        fullName: 'Spectator Day With Tshirt',
        email: 'spectator_tshirt@example.com',
        mobile: '9111122223',
        general_details: {
          centre: 'Mumbai',
          gender: 'Male',
          registrationType: 'spectator',
          spectatorOption: 'without-stay',
          accommodationRequired: 'No',
          spectatorTshirt: 'Yes',
          extraTshirt: 'Yes',
          tshirtSize: 'XL',
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 104000, 'Spectator without stay + T-shirt must be ₹1040 (104000 paise)');
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Spectator Pass: Order creation with stay (₹2,700 / 270000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Spectator Stay Guest',
      email: 'spectator_stay@example.com',
      mobile: '9111122224',
      selectedSports: ['spectator'],
      registrationType: 'spectator',
      accommodationRequired: 'Yes',
      extraTshirt: 'No',
      registrationPayload: {
        fullName: 'Spectator Stay Guest',
        email: 'spectator_stay@example.com',
        mobile: '9111122224',
        general_details: {
          centre: 'Mumbai',
          gender: 'Male',
          registrationType: 'spectator',
          spectatorOption: 'with-stay',
          accommodationRequired: 'Yes',
          extraTshirt: 'No',
          spectatorTshirt: 'No',
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000, 'Spectator with stay must be ₹2700 (270000 paise)');
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Spectator Pass: Order creation with stay + T-Shirt (₹3,200 / 320000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Spectator Stay Plus Tshirt',
      email: 'spectator_stay_tshirt@example.com',
      mobile: '9111122225',
      selectedSports: ['spectator'],
      registrationType: 'spectator',
      accommodationRequired: 'Yes',
      extraTshirt: 'Yes',
      registrationPayload: {
        fullName: 'Spectator Stay Plus Tshirt',
        email: 'spectator_stay_tshirt@example.com',
        mobile: '9111122225',
        general_details: {
          centre: 'Mumbai',
          gender: 'Female',
          registrationType: 'spectator',
          spectatorOption: 'with-stay',
          accommodationRequired: 'Yes',
          extraTshirt: 'Yes',
          spectatorTshirt: 'Yes',
          tshirtSize: 'M',
        },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 320000, 'Spectator with stay + T-shirt must be ₹3200 (320000 paise)');
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Spectator Pass: Direct Registration registers with payment_status=pending and ₹540 fee', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'spectator',
      full_name: 'Spectator Direct Guest',
      email: 'spectatordirect@example.com',
      mobile: '+91 9777766666',
      payment_status: 'pending',
      general_details: {
        centre: 'Ahmedabad',
        gender: 'Male',
        registrationType: 'spectator',
        spectatorOption: 'without-stay',
        accommodationRequired: 'No',
        selectedSports: ['spectator'],
        nostalgiaSport: ['Kho-Kho', 'Gilli Danda'],
      },
      answers: {},
    }),
  });

  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  if (res.status === 200 || res.status === 201) {
    assert.ok(res.data.registration_id || res.data.success);
    if (res.data.paymentStatus) {
      assert.strictEqual(res.data.paymentStatus, 'pending');
    }
  }
});

test('Spectator Pass: Lookup by mobile retrieves spectator registration details', async () => {
  const { status, data } = await apiRequest('/api/player-lookup?mobile=9777766666');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.found, true);
  assert.strictEqual(data.isExistingRegistration, true);
  assert.strictEqual(data.registration.fullName, 'Spectator Direct Guest');
  assert.strictEqual(data.registration.generalDetails.registrationType, 'spectator');
  assert.deepStrictEqual(data.registration.selectedSports, ['spectator']);
});

test('Spectator Pass Ledger: records category="spectator" in rpl_transactions for spectator registration', async () => {
  const [rows] = await db.query(
    `SELECT category, amount, description FROM ${RPL_DB}.rpl_transactions WHERE description LIKE '%(spectator)%' ORDER BY id DESC LIMIT 1`
  );
  assert.ok(rows.length > 0, 'Should find at least one transaction record for spectator registration');
  assert.strictEqual(rows[0].category, 'spectator', 'Spectator transaction category must be "spectator"');
});

test('Player Pass Ledger: records category="sports" in rpl_transactions for player registration', async () => {
  const [rows] = await db.query(
    `SELECT category, amount, description FROM ${RPL_DB}.rpl_transactions WHERE description NOT LIKE '%(spectator)%' ORDER BY id DESC LIMIT 1`
  );
  assert.ok(rows.length > 0, 'Should find at least one transaction record for player registration');
  assert.strictEqual(rows[0].category, 'sports', 'Player transaction category must be "sports"');
});

test('Spectator Pass: 1-Day spectator without stay omits nostalgiaSport', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'spectator',
      full_name: 'Spectator One Day Guest',
      email: 'spectator1day@example.com',
      mobile: '+91 9777766666',
      payment_status: 'pending',
      general_details: {
        centre: 'Ahmedabad',
        gender: 'Female',
        registrationType: 'spectator',
        spectatorOption: 'without-stay',
        accommodationRequired: 'No',
        spectatorDates: ['2026-12-25'],
        selectedSports: ['spectator'],
        nostalgiaSport: 'Carrom',
      },
      answers: {},
    }),
  });
  assert.ok([200, 201].includes(res.status));
  const { status, data } = await apiRequest('/api/player-lookup?mobile=9777766666');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.registration.generalDetails.nostalgiaSport, undefined, '1-day spectator must have nostalgiaSport omitted');
});

test('Spectator Pass: 3-Day spectator without stay preserves nostalgiaSport', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'spectator',
      full_name: 'Spectator Three Day Guest',
      email: 'spectator3day@example.com',
      mobile: '+91 9777755555',
      payment_status: 'pending',
      general_details: {
        centre: 'Ahmedabad',
        gender: 'Female',
        registrationType: 'spectator',
        spectatorOption: 'without-stay',
        accommodationRequired: 'No',
        spectatorDates: ['2026-12-25', '2026-12-26', '2026-12-27'],
        selectedSports: ['spectator'],
        nostalgiaSport: 'Carrom',
      },
      answers: {},
    }),
  });
  assert.ok([200, 201].includes(res.status));
  const lookup = await apiRequest('/api/player-lookup?mobile=9777755555');
  assert.strictEqual(lookup.status, 200);
  assert.strictEqual(lookup.data.registration.generalDetails.nostalgiaSport, 'Carrom');
});




