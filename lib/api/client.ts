const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://d2oulqfcyna7a4.cloudfront.net';

// Extract the S3 key from a full S3 URL or return as-is if already a key
function toS3Key(value: string): string {
  // Full S3 URL like https://bucket.s3.region.amazonaws.com/userId/section/file.jpg
  const s3Match = value.match(/amazonaws\.com\/(.+)$/);
  if (s3Match) return s3Match[1];
  return value;
}

// Resolve an image field to a displayable URL via the backend signed URL proxy
export function imageUrl(value: string | undefined | null): string {
  if (!value) return '';
  const key = toS3Key(value);
  return `${API_BASE}/api/upload/get-file-url?fileKey=${encodeURIComponent(key)}`;
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  noAuth?: boolean;
};

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, noAuth = false } = options;

  if (!noAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('slanup_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // If token expired, clear auth
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('slanup_token');
        localStorage.removeItem('slanup_refresh_token');
        localStorage.removeItem('slanup_user');
      }
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Auth helpers
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('slanup_user');
  return raw ? JSON.parse(raw) : null;
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('slanup_token');
}

export function isLoggedIn() {
  return !!getStoredToken();
}

export function storeAuth(accessToken: string, refreshToken: string, user: Record<string, unknown>) {
  localStorage.setItem('slanup_token', accessToken);
  localStorage.setItem('slanup_refresh_token', refreshToken);
  localStorage.setItem('slanup_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('slanup_token');
  localStorage.removeItem('slanup_refresh_token');
  localStorage.removeItem('slanup_user');
}

// API methods
export const api = {
  // Auth
  sendMagicLink: (email: string) =>
    apiFetch('/api/auth/magic-link/send', { method: 'POST', body: { email }, noAuth: true }),

  verifyMagicLink: (token: string) =>
    apiFetch<{ success: boolean; data: { user: Record<string, unknown>; accessToken: string; refreshToken: string; isNewUser: boolean } }>(
      '/api/auth/magic-link/verify', { method: 'POST', body: { token }, noAuth: true }
    ),

  // Profile
  getMe: () => apiFetch<{ success: boolean; data: { user: Record<string, unknown> } }>('/api/web/me'),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch('/api/web/profile', { method: 'PUT', body: data }),
  getProfile: (id: string) => apiFetch(`/api/web/profile/${id}`),

  // Plans
  getPlans: (page = 1, search?: string, city?: string, tags?: string[]) =>
    apiFetch(`/api/web/plans?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}${city ? `&city=${encodeURIComponent(city)}` : ''}${tags && tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(','))}` : ''}`),
  getPlan: (id: string) => apiFetch(`/api/web/plans/${id}`),
  createPlan: (data: Record<string, unknown>) =>
    apiFetch('/api/web/plans', { method: 'POST', body: data }),
  updatePlan: (planId: string, data: Record<string, unknown>) =>
    apiFetch(`/api/web/plans/${planId}`, { method: 'PUT', body: data }),
  deletePlan: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}`, { method: 'DELETE' }),
  getMyPlans: (tab = 'created') => apiFetch(`/api/web/my-plans?tab=${tab}`),
  getCompletedPlans: () => apiFetch('/api/web/plans-completed'),

  // Requests (reuse existing backend)
  requestJoin: (planId: string) =>
    apiFetch('/api/web/plans/' + planId + '/request', { method: 'POST' }),
  getPlanRequests: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/requests`),
  handleRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    apiFetch(`/api/web/requests/${requestId}`, { method: 'PATCH', body: { status: action } }),

  // Leave plan
  leavePlan: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/leave`, { method: 'DELETE' }),
  removeParticipant: (planId: string, participantId: string) =>
    apiFetch(`/api/web/plans/${planId}/remove/${participantId}`, { method: 'DELETE' }),

  // Felt Safe ratings
  submitFeltSafe: (planId: string, ratedUserId: string) =>
    apiFetch(`/api/web/plans/${planId}/felt-safe`, { method: 'POST', body: { ratedUserId } }),
  getFeltSafeRatings: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/felt-safe`),
  getMyFeltSafeRatings: () =>
    apiFetch('/api/web/felt-safe/my-ratings'),
  revokeFeltSafe: (ratedUserId: string) =>
    apiFetch(`/api/web/felt-safe/${ratedUserId}`, { method: 'DELETE' }),

  // Profile-based ratings
  canRateProfile: (userId: string) =>
    apiFetch(`/api/web/profile/${userId}/can-rate`),
  profileFeltSafe: (userId: string) =>
    apiFetch(`/api/web/profile/${userId}/felt-safe`, { method: 'POST' }),
  profileFlag: (userId: string, reason?: string) =>
    apiFetch(`/api/web/profile/${userId}/flag`, { method: 'POST', body: { reason } }),

  // Notifications
  getNotifications: () => apiFetch('/api/web/notifications'),

  // Upload via S3 signed URL (two-step: get URL, then PUT to S3)
  getSignedUrl: (section: string, fileType = 'image/jpeg') =>
    apiFetch<{ uploadUrl: string; fileUrl: string }>(
      `/api/upload/get-signed-url?section=${encodeURIComponent(section)}&fileType=${encodeURIComponent(fileType)}`
    ),

  uploadToS3: async (section: string, file: File): Promise<string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('slanup_token') : null;

    // Compress image before upload
    let fileToUpload: File | Blob = file;
    if (file.type.startsWith('image/')) {
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
      } catch {
        // Fall back to original file if compression fails
        fileToUpload = file;
      }
    }

    // Step 1: Get signed URL
    const res = await fetch(
      `${API_BASE}/api/upload/get-signed-url?section=${encodeURIComponent(section)}&fileType=${encodeURIComponent(file.type)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get upload URL');

    // Step 2: Upload compressed file to S3
    await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: fileToUpload,
    });

    return data.fileUrl; // S3 key to store in DB
  },

  // Conversations
  getConversations: () => apiFetch(`/api/chat/conversations`),

  // Messages (reuse existing backend)
  getMessages: (conversationId: string) =>
    apiFetch(`/api/web/chat/${conversationId}`),

  // Unread count
  getUnreadCount: () => apiFetch('/api/web/chat/unread-total'),

  // Admin
  getAdminPlans: (status = 'pending') =>
    apiFetch(`/api/web/admin/plans?status=${status}`),
  getAdminStats: () =>
    apiFetch('/api/web/admin/stats'),
  getAdminUsers: (page = 1, search?: string) =>
    apiFetch(`/api/web/admin/users?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  approvePlan: (id: string) =>
    apiFetch(`/api/web/admin/plans/${id}/approve`, { method: 'PATCH' }),
  rejectPlan: (id: string, reason?: string) =>
    apiFetch(`/api/web/admin/plans/${id}/reject`, { method: 'PATCH', body: { reason } }),
  adminDeletePlan: (id: string) =>
    apiFetch(`/api/web/admin/plans/${id}`, { method: 'DELETE' }),
  flagUsers: (planId: string, flaggedUserIds: string[], reason?: string, context?: string) =>
    apiFetch('/api/web/flag-users', { method: 'POST', body: { planId, flaggedUserIds, reason, context } }),
  revokeFlag: (ratedUserId: string) =>
    apiFetch(`/api/web/flag-users/${ratedUserId}`, { method: 'DELETE' }),
  getMyFlags: () =>
    apiFetch('/api/web/flag-users/my-flags'),
  getAdminFlaggedUsers: () =>
    apiFetch('/api/web/admin/flagged-users'),
  dismissFlag: (id: string, notes?: string) =>
    apiFetch(`/api/web/admin/flagged-users/${id}/dismiss`, { method: 'PATCH', body: { notes } }),
  getDigestPreview: () =>
    apiFetch('/api/web/admin/digest/preview'),
  sendDigest: () =>
    apiFetch('/api/web/admin/digest/send', { method: 'POST' }),
  // Waitlist
  getWaitlist: () =>
    apiFetch('/api/web/admin/waitlist'),
  importWaitlist: (entries: { name: string; email: string; city?: string; instagram?: string }[]) =>
    apiFetch('/api/web/admin/waitlist/import', { method: 'POST', body: { entries } }),
  sendWaitlistInvites: (ids: string[] | 'all') =>
    apiFetch('/api/web/admin/waitlist/invite', { method: 'POST', body: { ids } }),
  deleteWaitlistEntry: (id: string) =>
    apiFetch(`/api/web/admin/waitlist/${id}`, { method: 'DELETE' }),

  // Concerns
  submitConcern: (message: string) =>
    apiFetch('/api/web/concerns', { method: 'POST', body: { message } }),
  getConcerns: (status?: string) =>
    apiFetch(`/api/web/admin/concerns${status ? `?status=${status}` : ''}`),
  updateConcern: (id: string, status: string) =>
    apiFetch(`/api/web/admin/concerns/${id}`, { method: 'PUT', body: { status } }),
};
