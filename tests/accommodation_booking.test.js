import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  processAccommodationBooking,
  calculateNights,
  RPL_START_DATE,
  RPL_END_DATE,
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
