/**
 * Export Utilities for RPL Season 9 Admin Portal
 * Generates formatted CSV / Excel-compatible sheets for downloads.
 */

function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Convert Google Drive view URL to direct high-res image stream
export function getDriveDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed.includes('drive.google.com') && !trimmed.includes('googleusercontent.com')) return trimmed;

  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}



// 1. Export Master Registrations Sheet
export function exportMasterRegistrations(registrations: any[]) {
  const headers = [
    'Registration ID',
    'Full Name',
    'Mobile Number',
    'Email Address',
    'Centre',
    'Gender',
    'Date of Birth',
    'Selected Sports',
    'Jersey Size',
    'Custom Jersey Name',
    'Preferred Jersey Number',
    'Food Preference',
    'Accommodation Required',
    'Check-In Date',
    'Check-Out Date',
    'Payment Status',
    'Payment UTR',
    'Player Photo URL',
    'Payment Receipt URL',
    'Submitted At',
  ];

  const rows = registrations.map((r) => {
    const gen = r.general_details || {};
    const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports.join(', ') : '';
    return [
      escapeCSV(r.id),
      escapeCSV(r.full_name),
      escapeCSV(r.mobile),
      escapeCSV(r.email),
      escapeCSV(gen.centre || ''),
      escapeCSV(gen.gender || ''),
      escapeCSV(gen.dateOfBirth || ''),
      escapeCSV(sports),
      escapeCSV(gen.tshirtSize || ''),
      escapeCSV(gen.customJerseyName || ''),
      escapeCSV(gen.preferredJerseyNumber || ''),
      escapeCSV(gen.foodPreference || ''),
      escapeCSV(gen.accommodationRequired || 'No'),
      escapeCSV(r.check_in_date || gen.checkInDate || ''),
      escapeCSV(r.check_out_date || gen.checkOutDate || ''),
      escapeCSV((r.payment_status || 'pending').toUpperCase()),
      escapeCSV(r.payment_utr || ''),
      escapeCSV(r.player_photo_url || ''),
      escapeCSV(r.payment_receipt_url || ''),
      escapeCSV(r.submitted_at || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `RPL9_Master_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
}

// 2. Export Jersey Manufacturing Order Sheet
export function exportJerseyVendorSheet(registrations: any[]) {
  const headers = [
    'Sr No',
    'Player Full Name',
    'Mobile',
    'Centre',
    'Jersey Size',
    'Custom Name on Jersey (Back)',
    'Preferred Number (Back)',
    'Payment Status',
  ];

  const rows = registrations.map((r, idx) => {
    const gen = r.general_details || {};
    return [
      idx + 1,
      escapeCSV(r.full_name),
      escapeCSV(r.mobile),
      escapeCSV(gen.centre || ''),
      escapeCSV(gen.tshirtSize || 'L'),
      escapeCSV(gen.customJerseyName || r.full_name.toUpperCase()),
      escapeCSV(gen.preferredJerseyNumber || '-'),
      escapeCSV((r.payment_status || 'pending').toUpperCase()),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `RPL9_Jersey_Manufacturing_Order_${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3. Export Sport Squad Sheets (Cricket Auction / Badminton / Football)
export function exportSportSquadSheet(registrations: any[], sportKey: string, sportTitle: string) {
  const headers = [
    'Sr No',
    'Player Name',
    'Mobile',
    'Centre',
    'Gender',
    'Payment Status',
    'Sport Questions & Details',
  ];

  const filtered = registrations.filter((r) => {
    const sports = r.general_details?.selectedSports || [];
    return Array.isArray(sports) && sports.includes(sportKey);
  });

  const rows = filtered.map((r, idx) => {
    const gen = r.general_details || {};
    const sportDetails = r.sport_answers?.[sportKey] || {};
    const formattedDetails = Object.entries(sportDetails)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');

    return [
      idx + 1,
      escapeCSV(r.full_name),
      escapeCSV(r.mobile),
      escapeCSV(gen.centre || ''),
      escapeCSV(gen.gender || ''),
      escapeCSV((r.payment_status || 'pending').toUpperCase()),
      escapeCSV(formattedDetails || 'Standard Entry'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `RPL9_Squad_${sportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
}

// 4. Export Accommodation & Ashram Gate List
export function exportAccommodationGateList(accommodationList: any[]) {
  const headers = [
    'Sr No',
    'Player Name',
    'Mobile',
    'Centre',
    'Gender',
    'Check-In Date',
    'Check-Out Date',
    'Allocated Room Number',
    'Stay Status',
  ];

  const rows = accommodationList.map((item, idx) => {
    const mainBooking = item.bookings?.[0] || {};
    const roomNumber = mainBooking.roomno || 'PENDING_ALLOCATION';
    const status = mainBooking.status || 'pending';

    return [
      idx + 1,
      escapeCSV(item.full_name),
      escapeCSV(item.mobile),
      escapeCSV(item.centre),
      escapeCSV(item.gender),
      escapeCSV(item.check_in_date || '2026-12-24'),
      escapeCSV(item.check_out_date || '2026-12-26'),
      escapeCSV(roomNumber),
      escapeCSV(status.toUpperCase()),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `RPL9_Ashram_Accommodation_GateList_${new Date().toISOString().slice(0, 10)}.csv`);
}
