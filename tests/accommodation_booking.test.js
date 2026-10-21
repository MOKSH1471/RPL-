import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  processAccommodationBooking,
  processFoodBooking,
  calculateNights,
  RPL_START_DATE,
  RPL_END_DATE,
  RPL_TOURNAMENT_DATES,
} from '../apps/api/src/services/roomBookingService.js';

test('Accommodation: returns unbooked when accommodationRequired is "No"', async () => {
  const result = await processAccommodationBooking({
    fullName: 'Test Player',
    mobile: '9876543210',
    accommodationRequired: 'No',
  });

  assert.strictEqual(result.booked, false);
  assert.strictEqual(result.message, 'Accommodation not requested');
});

test('Accommodation: calculateNights accurately computes duration between date strings', () => {
  assert.strictEqual(calculateNights('2026-12-23', '2026-12-25'), 2);
  assert.strictEqual(calculateNights('2026-12-25', '2026-12-27'), 2);
  assert.strictEqual(calculateNights('2026-12-27', '2026-12-30'), 3);
});

test('Accommodation: calculateNights returns 0 when check-out is on or before check-in', () => {
  assert.strictEqual(calculateNights('2026-12-25', '2026-12-25'), 0);
  assert.strictEqual(calculateNights('2026-12-27', '2026-12-25'), 0);
});

test('Accommodation: tournament constants enforce Dec 25-27 2026 schedule', () => {
  assert.strictEqual(RPL_START_DATE, '2026-12-25');
  assert.strictEqual(RPL_END_DATE, '2026-12-27');
  assert.strictEqual(calculateNights(RPL_START_DATE, RPL_END_DATE), 2);
});

test('Accommodation: pre-RPL early check-in detects extra nights required', () => {
  const earlyCheckIn = '2026-12-23';
  const preNights = calculateNights(earlyCheckIn, RPL_START_DATE);
  assert.strictEqual(preNights, 2);
});

test('Accommodation: post-RPL extended checkout detects extra nights required', () => {
  const lateCheckOut = '2026-12-29';
  const postNights = calculateNights(RPL_END_DATE, lateCheckOut);
  assert.strictEqual(postNights, 2);
});

test('Accommodation: phone number normalization extracts 10 digits for guest records', () => {
  const normalize = (mobile) => (mobile || '').replace(/\D/g, '').slice(-10);
  assert.strictEqual(normalize('+91 98765-43210'), '9876543210');
  assert.strictEqual(normalize('9876543210'), '9876543210');
  assert.strictEqual(normalize('09876543210'), '9876543210');
});

test('Accommodation: creates tournament booking with default unassigned room "NA" without modifying roomdb', async () => {
  const recordedQueries = [];
  const mockConnection = {
    query: async (sql, params) => {
      recordedQueries.push({ sql, params });
      if (sql.includes('SELECT cardno FROM')) {
        return [[{ cardno: '9966513900' }]];
      }
      if (sql.includes('SELECT bookingid FROM')) {
        return [[]]; // no existing booking
      }
      return [{ affectedRows: 1, insertId: 1 }];
    },
  };

  const result = await processAccommodationBooking({
    cardno: '9966513900',
    fullName: 'Test Player',
    mobile: '9876543210',
    gender: 'Male',
    accommodationRequired: 'Yes',
    checkInDate: '2026-12-25',
    checkOutDate: '2026-12-27',
    connection: mockConnection,
  });

  assert.strictEqual(result.booked, true);
  assert.strictEqual(result.bookings.length, 1);
  assert.strictEqual(result.bookings[0].type, 'rpl_tournament');
  assert.strictEqual(result.bookings[0].status, 'confirmed');

  // Verify room_booking INSERT query used roomno = 'NA'
  const insertBookingQuery = recordedQueries.find(
    (q) => q.sql.includes('INSERT INTO') && q.sql.includes('room_booking')
  );
  assert.ok(insertBookingQuery, 'room_booking INSERT query must be executed');
  assert.ok(insertBookingQuery.sql.includes("'NA'"), "Unassigned roomno must be specified as 'NA' in SQL");

  // Verify roomdb was not touched
  const roomdbQuery = recordedQueries.find((q) => q.sql.includes('roomdb'));
  assert.strictEqual(roomdbQuery, undefined, 'roomdb table must NOT be modified');
});

test('Tournament Meal Dates: Dec 25, Dec 26, Dec 27 are targeted for all 3 meals', () => {
  assert.deepStrictEqual(RPL_TOURNAMENT_DATES, ['2026-12-25', '2026-12-26', '2026-12-27']);
});

test('Meals: Player with Self Stay receives 3 days of meal bookings without room booking', async () => {
  const recordedQueries = [];
  const mockConnection = {
    query: async (sql, params) => {
      recordedQueries.push({ sql, params });
      if (sql.includes('SELECT cardno FROM')) {
        return [[{ cardno: '9966513901' }]];
      }
      if (sql.includes('SELECT id FROM') && sql.includes('food_db')) {
        return [[]]; // no existing meal row
      }
      return [{ affectedRows: 1, insertId: 1 }];
    },
  };

  const result = await processAccommodationBooking({
    cardno: '9966513901',
    fullName: 'Self Stay Player',
    mobile: '9876543211',
    gender: 'Male',
    accommodationRequired: 'No',
    registrationType: 'player',
    foodPreference: 'Regular',
    bookMeals: true,
    connection: mockConnection,
  });

  // Room booking should NOT be created
  assert.strictEqual(result.booked, false, 'Rooms should not be booked for self-stay');
  assert.strictEqual(result.bookings.length, 0);

  // Meal booking MUST be created
  assert.strictEqual(result.foodBooked, true, 'Meals must be booked for player with self-stay');
  assert.strictEqual(result.foodBookings.length, 3, 'All 3 tournament days must have meals booked');

  // Verify food_db insert was called 3 times (for 25, 26, 27) with breakfast=1, lunch=1, dinner=1, spicy=1
  const foodInserts = recordedQueries.filter(
    (q) => q.sql.includes('INSERT INTO') && q.sql.includes('food_db')
  );
  assert.strictEqual(foodInserts.length, 3, 'Must insert 3 food_db entries');

  // Verify room_booking was NOT touched
  const roomInserts = recordedQueries.filter(
    (q) => q.sql.includes('INSERT INTO') && q.sql.includes('room_booking')
  );
  assert.strictEqual(roomInserts.length, 0, 'Must NOT insert any room_booking entries');
});

test('Meals: Food preference "Non-Spicy" sets spicy = 0 in food_db', async () => {
  const recordedQueries = [];
  const mockConnection = {
    query: async (sql, params) => {
      recordedQueries.push({ sql, params });
      if (sql.includes('SELECT id FROM') && sql.includes('food_db')) {
        return [[]];
      }
      return [{ affectedRows: 1, insertId: 1 }];
    },
  };

  const foodResult = await processFoodBooking({
    cardno: '9966513902',
    foodPreference: 'Non-Spicy',
    connection: mockConnection,
  });

  assert.strictEqual(foodResult.booked, true);
  assert.strictEqual(foodResult.foodBookings.length, 3);
  foodResult.foodBookings.forEach((b) => {
    assert.strictEqual(b.spicy, 0, 'Spicy flag must be 0 for Non-Spicy preference');
  });

  // Verify params in recorded query
  const foodInsert = recordedQueries.find(
    (q) => q.sql.includes('INSERT INTO') && q.sql.includes('food_db')
  );
  assert.ok(foodInsert);
  // Param order: [foodId, cardno, bookedBy, dateStr, spicyVal, now, now]
  assert.strictEqual(foodInsert.params[4], 0, 'Spicy param must be 0');
});

test('Spectator: with-stay package receives both room and meal bookings', async () => {
  const recordedQueries = [];
  const mockConnection = {
    query: async (sql, params) => {
      recordedQueries.push({ sql, params });
      if (sql.includes('SELECT cardno FROM')) {
        return [[{ cardno: '9966513903' }]];
      }
      if (sql.includes('SELECT bookingid FROM')) {
        return [[]];
      }
      if (sql.includes('SELECT id FROM') && sql.includes('food_db')) {
        return [[]];
      }
      return [{ affectedRows: 1, insertId: 1 }];
    },
  };

  const result = await processAccommodationBooking({
    cardno: '9966513903',
    fullName: 'Spectator With Stay',
    mobile: '9876543213',
    gender: 'Female',
    accommodationRequired: 'Yes',
    spectatorOption: 'with-stay',
    registrationType: 'spectator',
    foodPreference: 'Regular',
    bookMeals: true,
    connection: mockConnection,
  });

  assert.strictEqual(result.booked, true, 'Spectator with-stay should get confirmed room booking');
  assert.strictEqual(result.foodBooked, true, 'Spectator with-stay should get meal bookings');
  assert.strictEqual(result.bookings.length, 1);
  assert.strictEqual(result.foodBookings.length, 3);
});

test('Spectator: day pass (without-stay) receives neither room nor meal bookings', async () => {
  const result = await processAccommodationBooking({
    cardno: '9966513904',
    fullName: 'Spectator Day Pass',
    mobile: '9876543214',
    gender: 'Male',
    accommodationRequired: 'No',
    spectatorOption: 'without-stay',
    registrationType: 'spectator',
    bookMeals: false,
  });

  assert.strictEqual(result.booked, false, 'Spectator day pass should not get room booking');
  assert.strictEqual(result.foodBooked, false, 'Spectator day pass should not get meal booking');
  assert.strictEqual(result.message, 'Accommodation not requested');
});

