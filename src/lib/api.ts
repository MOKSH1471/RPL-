import { DynamicField, DynamicSport } from '@/types';

const rawBase = import.meta.env.VITE_API_URL || 'https://rpl-back.onrender.com/api';
const cleanBase = String(rawBase).trim().replace(/\/+$/, '');
const API_BASE_URL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

export async function fetchSports(): Promise<DynamicSport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/sports`);
    if (!res.ok) throw new Error('Failed to fetch sports');
    return await res.json();
  } catch (err) {
    console.warn('Backend sports API unavailable, using fallback:', err);
    return [];
  }
}

export async function fetchRegistrationFields(): Promise<DynamicField[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/registration-fields`);
    if (!res.ok) throw new Error('Failed to fetch registration fields');
    return await res.json();
  } catch (err) {
    console.warn('Backend fields API unavailable, using fallback:', err);
    return [];
  }
}

export async function uploadFileToDrive(file: File, customName?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (customName) {
    formData.append('customName', customName);
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to upload file to Google Drive');
  }

  const data = await res.json();
  return data.url;
}

export interface RegistrationPayload {
  sport_id: string;
  full_name: string;
  email: string;
  mobile: string;
  check_in_date?: string;
  check_out_date?: string;
  player_photo_url?: string;
  payment_utr?: string;
  payment_receipt_url?: string;
  general_details?: Record<string, any>;
  sport_answers?: Record<string, any>;
  answers: Record<string, any>;
}

export async function submitRegistration(payload: RegistrationPayload): Promise<{ success: boolean; message: string; registration_id: string }> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = {};
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    const rawText = await res.text().catch(() => '');
    data = { error: rawText.replace(/<[^>]*>/g, '').trim() || `Server error (${res.status})` };
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
      (data.errors ? Object.values(data.errors).join(', ') : `Failed to submit registration (Status ${res.status})`)
    );
  }

  return data;
}

export interface MumukshuData {
  cardNo?: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth: string;
  email: string;
  centre: string;
  photoUrl?: string;
  isMumukshu: boolean;
}

export async function lookupMumukshu(mobile: string): Promise<{ found: boolean; data?: MumukshuData }> {
  try {
    const url = `${API_BASE_URL}/card/lookup?mobile=${encodeURIComponent(mobile)}`;
    console.log(`[API] Looking up Mumukshu for: "${mobile}" via ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[API] Mumukshu lookup response error (status ${res.status}) from ${url}`);
      return { found: false };
    }
    const result = await res.json();
    console.log('[API] Mumukshu lookup result:', result);
    return result;
  } catch (err) {
    console.error('[API] Mumukshu lookup network error:', err);
    return { found: false };
  }
}

// ==========================================
// ADMIN API CLIENT METHODS
// ==========================================

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE_URL}/admin/stats`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load admin statistics (Status ${res.status})`);
  return data;
}

export async function fetchAdminRegistrations(params?: { payment_status?: string; search?: string; sport?: string }) {
  const query = new URLSearchParams();
  if (params?.payment_status) query.append('payment_status', params.payment_status);
  if (params?.search) query.append('search', params.search);
  if (params?.sport) query.append('sport', params.sport);

  const res = await fetch(`${API_BASE_URL}/admin/registrations?${query.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load registrations (Status ${res.status})`);
  return data;
}

export async function updateRegistration(id: string, updates: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to update registration (Status ${res.status})`);
  return data;
}

export async function updatePaymentStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to update payment status (Status ${res.status})`);
  return data;
}

export async function deleteRegistration(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to delete registration (Status ${res.status})`);
  return data;
}

export async function fetchAdminAccommodation() {
  const res = await fetch(`${API_BASE_URL}/admin/accommodation`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load accommodation stays (Status ${res.status})`);
  return data;
}

export async function assignRoomNumber(bookingid: string, roomno: string) {
  const res = await fetch(`${API_BASE_URL}/admin/accommodation/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingid, roomno }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to assign room number (Status ${res.status})`);
  return data;
}
