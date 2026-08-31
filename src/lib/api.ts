import { DynamicField, DynamicSport } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

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

export async function submitRegistration(payload: {
  sport_id: string;
  full_name: string;
  email: string;
  mobile: string;
  answers: Record<string, any>;
}): Promise<{ success: boolean; message: string; registration_id: string }> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error ||
      (data.errors ? Object.values(data.errors).join(', ') : 'Failed to submit registration')
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
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 7) return { found: false };

    const res = await fetch(`${API_BASE_URL}/mumukshu-lookup?mobile=${encodeURIComponent(cleanMobile)}`);
    if (!res.ok) return { found: false };

    return await res.json();
  } catch (err) {
    console.warn('Mumukshu lookup failed:', err);
    return { found: false };
  }
}
