import { DynamicField, DynamicSport } from '@/types';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultApiUrl = isLocalhost ? 'http://localhost:5005/api' : 'https://rpl-api-w3x1.onrender.com/api';
const rawBase = import.meta.env.VITE_API_URL || defaultApiUrl;
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

export async function uploadFileToDrive(
  file: File,
  customName?: string,
  fileType: 'photo' | 'receipt' = 'photo',
  receiptIndex?: number
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (customName) {
    formData.append('customName', customName);
  }
  formData.append('fileType', fileType);
  if (receiptIndex) {
    formData.append('receiptIndex', String(receiptIndex));
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
  registration_id?: string;
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

export async function submitRegistration(payload: RegistrationPayload): Promise<{ success: boolean; isUpdate?: boolean; message: string; registration_id: string }> {
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
  mobile?: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth: string;
  email: string;
  centre: string;
  photoUrl?: string;
  isMumukshu: boolean;
}

export interface ExistingRegistrationData {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  checkInDate?: string;
  checkOutDate?: string;
  playerPhotoUrl?: string;
  paymentStatus: string;
  paymentUtr?: string;
  paymentReceiptUrl?: string;
  receiptList?: string[];
  utrList?: string[];
  previouslyPaidSportsCount?: number;
  hasPreviouslyPaid?: boolean;
  previouslyPaidExtraTshirt?: boolean;
  generalDetails: Record<string, any>;
  sportAnswers: Record<string, any>;
  cardNo?: string;
}

export interface PlayerLookupResponse {
  found: boolean;
  isExistingRegistration?: boolean;
  registration?: ExistingRegistrationData;
  data?: MumukshuData;
  message?: string;
}

export async function lookupMumukshu(mobile: string): Promise<PlayerLookupResponse> {
  try {
    const url = `${API_BASE_URL}/player-lookup?mobile=${encodeURIComponent(mobile)}&onlyPhone=true`;
    console.log(`[API] Looking up player/Mumukshu strictly by phone: "${mobile}" via ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[API] Lookup response error (status ${res.status}) from ${url}`);
      return { found: false };
    }
    const result = await res.json();
    console.log('[API] Lookup result:', result);
    return result;
  } catch (err) {
    console.error('[API] Lookup network error:', err);
    return { found: false };
  }
}

export const lookupPlayer = lookupMumukshu;

/**
 * Dedicated Referrer Lookup for unregistered participants.
 * Strictly verifies the referrer by 10-digit mobile number, NEVER by card number.
 */
export async function lookupReferrer(mobile: string): Promise<PlayerLookupResponse> {
  try {
    const url = `${API_BASE_URL}/referrer-lookup?mobile=${encodeURIComponent(mobile)}&onlyPhone=true`;
    console.log(`[API] Looking up referrer strictly by phone: "${mobile}" via ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      // Fallback to player-lookup with strictly phone-only parameter if legacy server
      const fallbackUrl = `${API_BASE_URL}/player-lookup?mobile=${encodeURIComponent(mobile)}&onlyPhone=true&referenceCheck=true`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) return { found: false };
      return await fallbackRes.json();
    }
    const result = await res.json();
    console.log('[API] Referrer lookup result:', result);
    return result;
  } catch (err) {
    console.error('[API] Referrer lookup network error:', err);
    return { found: false };
  }
}

// ==========================================
// AUTH & SESSION UTILITIES
// ==========================================

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  last_login?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rpl_admin_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rpl_admin_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rpl_admin_token');
    localStorage.removeItem('rpl_admin_user');
  }
}

export function getSavedAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('rpl_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAdminUser(user: AdminUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rpl_admin_user', JSON.stringify(user));
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==========================================
// AUTHENTICATION API METHODS
// ==========================================

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Login failed (Status ${res.status})`);
  }

  setAuthToken(data.token);
  saveAdminUser(data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<AdminUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
      if (res.status === 401) {
        removeAuthToken();
      }
      return null;
    }
    const data = await res.json();
    if (data.user) {
      saveAdminUser(data.user);
      return data.user;
    }
    return null;
  } catch (err) {
    console.warn('Session verification error:', err);
    return getSavedAdminUser();
  }
}

// ==========================================
// ADMIN USER MANAGEMENT (SUPER ADMIN)
// ==========================================

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin users');
  return data.data || [];
}

export async function createAdminUser(payload: {
  username: string;
  name: string;
  password: string;
  role: string;
  permissions: string[];
}): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create admin user');
  return data.data;
}

export async function updateAdminUser(
  id: number,
  updates: { name?: string; role?: string; permissions?: string[]; is_active?: boolean }
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update admin user');
}

export async function resetAdminUserPassword(id: number, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to reset password');
}

export async function deleteAdminUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to delete admin user');
}

// ==========================================
// ADMIN API CLIENT METHODS
// ==========================================

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load admin statistics (Status ${res.status})`);
  return data;
}

export async function fetchAdminRegistrations(params?: { payment_status?: string; search?: string; sport?: string }) {
  const query = new URLSearchParams();
  if (params?.payment_status) query.append('payment_status', params.payment_status);
  if (params?.search) query.append('search', params.search);
  if (params?.sport) query.append('sport', params.sport);

  const res = await fetch(`${API_BASE_URL}/admin/registrations?${query.toString()}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load registrations (Status ${res.status})`);
  return data;
}

export async function updateRegistration(id: string, updates: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to update registration (Status ${res.status})`);
  return data;
}

export async function updatePaymentStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to update payment status (Status ${res.status})`);
  return data;
}

export async function toggleArchiveRegistration(id: string, is_archived: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}/archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ is_archived }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to update archive status (Status ${res.status})`);
  return data;
}

export async function deleteRegistration(id: string) {
  return toggleArchiveRegistration(id, true);
}

export async function fetchAdminAccommodation() {
  const res = await fetch(`${API_BASE_URL}/admin/accommodation`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load accommodation stays (Status ${res.status})`);
  return data;
}

export async function assignRoomNumber(bookingid: string, roomno: string) {
  const res = await fetch(`${API_BASE_URL}/admin/accommodation/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ bookingid, roomno }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to assign room number (Status ${res.status})`);
  return data;
}

export interface CreateOrderParams {
  fullName: string;
  email: string;
  mobile: string;
  selectedSports: string[];
  extraTshirt?: string;
  spectatorTshirt?: string;
  registrationType?: string;
  accommodationRequired?: string;
  spectatorDates?: string[];
  isExistingPlayer?: boolean;
  previouslyPaidSportsCount?: number;
  hasPreviouslyPaid?: boolean;
  registrationId?: string;
  registrationPayload?: Record<string, any>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const res = await fetch(`${API_BASE_URL}/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to create payment order (Status ${res.status})`);
  return data;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registrationPayload: Record<string, any>;
}

export async function verifyRazorpayPayment(params: VerifyPaymentParams) {
  const res = await fetch(`${API_BASE_URL}/razorpay/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to verify payment (Status ${res.status})`);
  return data;
}

export async function fetchAdminTransactions(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  const res = await fetch(`${API_BASE_URL}/admin/transactions?${query.toString()}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to fetch transaction records');
  return data;
}

