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
  if (!trimmed) return '';

  // Data URLs and blob URLs are local and ready to render
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Already a direct CDN image stream
  if (trimmed.includes('googleusercontent.com/d/')) {
    return trimmed;
  }

  // Extract Google Drive file ID from all known link formats
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const match =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  return trimmed;
}



// 1. Export Master Registrations Sheet (Includes full historical active & archived records)
export function exportMasterRegistrations(registrations: any[]) {
  const headers = [
    'Registration ID',
    'Record Status',
    'Participant Type',
    'Full Name',
    'Mobile Number',
    'Email Address',
    'Centre',
    'Gender',
    'Date of Birth',
    'Selected Sports',
    'Pass / Stay Option',
    'Spectator T-Shirt (+₹500)',
    '90’s Nostalgia Games',
    'Jersey Size',
    'Custom Jersey Name',
    'Preferred Jersey Number',
    'Food Preference',
    'Accommodation Required',
    'Staying Room (Self)',
    'Check-In Date',
    'Check-Out Date',
    'Referrer Name',
    'Referrer Mobile',
    'Referrer Card No',
    'Payment Status',
    'Payment UTR',
    'Player Photo URL',
    'Payment Receipt URL',
    'Submitted At',
    'Archived At',
  ];

  const rows = registrations.map((r) => {
    const gen = r.general_details || {};
    const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports.join(', ') : '';
    const isArchived = Boolean(r.is_archived || gen.isArchived);
    const isSpectator = gen.registrationType === 'spectator' || (Array.isArray(gen.selectedSports) && gen.selectedSports.includes('spectator')) || r.sport_id === 'spectator';
    const participantType = isSpectator ? 'SPECTATOR' : 'PLAYER';
    const passOption = isSpectator
      ? (gen.spectatorOption === 'with-stay' || gen.accommodationRequired === 'Yes' ? 'With Stay (₹2,700)' : 'Day Pass (₹400)')
      : 'Player League Entry';
    const spectatorTshirt = isSpectator
      ? (gen.spectatorTshirt === 'Yes' || gen.extraTshirt === 'Yes' ? `YES (+₹500, Size ${gen.tshirtSize || 'L'})` : 'NO')
      : 'N/A (Included with Player)';
    const nostalgiaGames = Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport)
      ? (gen.nostalgiaSport || gen.nostalgia_sport).join(', ')
      : (gen.nostalgiaSport || gen.nostalgia_sport || '-');

    return [
      escapeCSV(r.id),
      escapeCSV(isArchived ? 'ARCHIVED' : 'ACTIVE'),
      escapeCSV(participantType),
      escapeCSV(r.full_name),
      escapeCSV(r.mobile),
      escapeCSV(r.email),
      escapeCSV(gen.centre || ''),
      escapeCSV(gen.gender || ''),
      escapeCSV(gen.dateOfBirth || ''),
      escapeCSV(sports || (isSpectator ? 'spectator' : '')),
      escapeCSV(passOption),
      escapeCSV(spectatorTshirt),
      escapeCSV(nostalgiaGames),
      escapeCSV(gen.tshirtSize || ''),
      escapeCSV(gen.customJerseyName || ''),
      escapeCSV(gen.preferredJerseyNumber || ''),
      escapeCSV(gen.foodPreference || ''),
      escapeCSV(gen.accommodationRequired || 'No'),
      escapeCSV(gen.stayingRoomNumber || ''),
      escapeCSV(r.check_in_date || gen.checkInDate || ''),
      escapeCSV(r.check_out_date || gen.checkOutDate || ''),
      escapeCSV(gen.referrerName || ''),
      escapeCSV(gen.referrerMobile ? `${gen.referrerCountryCode || '+91'} ${gen.referrerMobile}` : ''),
      escapeCSV(gen.referrerCardNo || ''),
      escapeCSV((r.payment_status || 'pending').toUpperCase()),
      escapeCSV(r.payment_utr || ''),
      escapeCSV(r.player_photo_url || ''),
      escapeCSV(r.payment_receipt_url || ''),
      escapeCSV(r.submitted_at || ''),
      escapeCSV(r.archived_at || gen.archivedAt || '-'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `RPL9_Master_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
}

// 2. Export Jersey Manufacturing Order Sheet (Active Players Only)
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

  // Exclude archived registrations so vendors don't manufacture for cancelled participants
  // Also exclude spectators who did NOT purchase a T-Shirt
  const activeOnly = registrations.filter((r) => {
    const isArchived = Boolean(r.is_archived || r.general_details?.isArchived);
    if (isArchived) return false;
    const gen = r.general_details || {};
    const sports = gen.selectedSports || [];
    const isSpectator = gen.registrationType === 'spectator' || (Array.isArray(sports) && sports.includes('spectator')) || r.sport_id === 'spectator';
    if (isSpectator && gen.spectatorTshirt !== 'Yes' && gen.extraTshirt !== 'Yes') {
      return false; // Skip spectator without T-shirt purchase
    }
    return true;
  });

  const rows = activeOnly.map((r, idx) => {
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

// 3. Export Sport Squad Sheets (Cricket Auction / Badminton / Football - Active Players Only)
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
    const isArchived = Boolean(r.is_archived || r.general_details?.isArchived);
    if (isArchived) return false;
    const sports = r.general_details?.selectedSports || [];
    const isSpectator = r.general_details?.registrationType === 'spectator' || (Array.isArray(sports) && sports.includes('spectator')) || r.sport_id === 'spectator';
    if (sportKey === 'spectator') {
      return isSpectator;
    }
    return Array.isArray(sports) && sports.includes(sportKey);
  });

  const rows = filtered.map((r, idx) => {
    const gen = r.general_details || {};
    const isSpectator = gen.registrationType === 'spectator' || (Array.isArray(gen.selectedSports) && gen.selectedSports.includes('spectator')) || r.sport_id === 'spectator';
    const sportDetails = r.sport_answers?.[sportKey] || {};
    const formattedDetails = isSpectator
      ? `Package: ${gen.spectatorOption === 'with-stay' || gen.accommodationRequired === 'Yes' ? 'With Stay (₹2,700)' : 'Day Pass (₹400)'} | T-Shirt: ${gen.spectatorTshirt === 'Yes' || gen.extraTshirt === 'Yes' ? `Opted In (${gen.tshirtSize || 'L'})` : 'No'} | 90's Nostalgia Games: ${Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport) ? (gen.nostalgiaSport || gen.nostalgia_sport).join('; ') : 'Open'}`
      : Object.entries(sportDetails)
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
    const gen = item.general_details || {};
    const roomNumber = mainBooking.roomno || (gen.stayingRoomNumber ? `Self (${gen.stayingRoomNumber})` : 'PENDING_ALLOCATION');
    const status = mainBooking.status || (gen.stayingRoomNumber ? 'SELF_STAY' : 'pending');

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
