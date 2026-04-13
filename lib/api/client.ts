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

  verifyOtp: (email: string, code: string) =>
    apiFetch<{ success: boolean; data: { user: Record<string, unknown>; accessToken: string; refreshToken: string; isNewUser: boolean } }>(
      '/api/auth/magic-link/verify', { method: 'POST', body: { email, code }, noAuth: true }
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
  getRecentPlans: (city?: string) =>
    apiFetch(`/api/web/plans-recent?limit=10${city ? `&city=${encodeURIComponent(city)}` : ''}`),

  // Requests (reuse existing backend)
  requestJoin: (planId: string, note?: string) =>
    apiFetch('/api/web/plans/' + planId + '/request', { method: 'POST', body: note ? { note } : undefined }),
  getPlanRequests: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/requests`),
  handleRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    apiFetch(`/api/web/requests/${requestId}`, { method: 'PATCH', body: { status: action } }),

  // Leave plan
  leavePlan: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/leave`, { method: 'DELETE' }),
  removeParticipant: (planId: string, participantId: string) =>
    apiFetch(`/api/web/plans/${planId}/remove/${participantId}`, { method: 'DELETE' }),

  // Host transfer
  transferHost: (planId: string, targetUserId: string) =>
    apiFetch(`/api/web/plans/${planId}/transfer-host`, { method: 'POST', body: { targetUserId } }),
  acceptHostTransfer: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/transfer-host/accept`, { method: 'POST' }),
  declineHostTransfer: (planId: string) =>
    apiFetch(`/api/web/plans/${planId}/transfer-host/decline`, { method: 'POST' }),

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

  // Push tokens
  registerPushToken: (token: string, platform: string) =>
    apiFetch('/api/web/push-token', { method: 'POST', body: { token, platform } }),
  deletePushToken: (token?: string) =>
    apiFetch('/api/web/push-token', { method: 'DELETE', body: token ? { token } : undefined }),

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
        let opts;
        if (section === 'profile') {
          opts = { maxSizeMB: 0.4, maxWidthOrHeight: 600, useWebWorker: true };
        } else if (section === 'gallery') {
          opts = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true, initialQuality: 0.5 };
        } else if (section === 'community') {
          opts = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.8 };
        } else {
          opts = { maxSizeMB: 0.6, maxWidthOrHeight: 1200, useWebWorker: true };
        }
        fileToUpload = await imageCompression(file, opts);
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
  getDigestPreview: (includeOptedOut?: boolean) =>
    apiFetch(`/api/web/admin/digest/preview${includeOptedOut ? '?includeOptedOut=true' : ''}`),
  sendDigest: (includeOptedOut?: boolean) =>
    apiFetch('/api/web/admin/digest/send', { method: 'POST', body: includeOptedOut ? { includeOptedOut: true } : undefined }),
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

  // Account
  deleteAccount: () =>
    apiFetch('/api/web/account', { method: 'DELETE' }),

  // Block
  blockUser: (userId: string) =>
    apiFetch('/api/web/block/' + userId, { method: 'POST' }),

  // Incomplete onboarding
  getIncompleteOnboarding: () =>
    apiFetch('/api/web/admin/incomplete-onboarding'),
  sendOnboardingReminder: (userIds?: string[]) =>
    apiFetch('/api/web/admin/incomplete-onboarding/remind', { method: 'POST', body: userIds ? { userIds } : {} }),

  // Gallery
  uploadGalleryPhoto: (planId: string, photoUrl: string) =>
    apiFetch(`/api/web/plans/${planId}/gallery`, { method: 'POST', body: { photoUrl } }),
  deleteGalleryPhoto: (planId: string, index: number) =>
    apiFetch(`/api/web/plans/${planId}/gallery/${index}`, { method: 'DELETE' }),

  // Profile hosted plans
  getHostedPlans: (userId: string) =>
    apiFetch<{ success: boolean; data: { plans: Record<string, unknown>[] } }>(`/api/web/profile/${userId}/hosted-plans`, { noAuth: true }),
  getActivePlans: (userId: string) =>
    apiFetch<{ success: boolean; data: { plans: Record<string, unknown>[] } }>(`/api/web/profile/${userId}/active-plans`, { noAuth: true }),

  // Plan Ratings
  ratePlan: (planId: string, score: number, review?: string) =>
    apiFetch('/api/web/plans/' + planId + '/rate', { method: 'POST', body: { score, review } }),
  getPlanRatings: (planId: string) =>
    apiFetch<{ success: boolean; data: { ratings: Record<string, unknown>[]; avgScore: string | null; count: number } }>('/api/web/plans/' + planId + '/ratings', { noAuth: true }),
  getProfileRating: (userId: string) =>
    apiFetch<{ success: boolean; data: { avgScore: string | null; totalRatings: number } }>('/api/web/profile/' + userId + '/rating', { noAuth: true }),

  // Communities
  getCommunities: (city?: string, search?: string) =>
    apiFetch(`/api/web/communities?${city ? `city=${encodeURIComponent(city)}&` : ''}${search ? `search=${encodeURIComponent(search)}` : ''}`),
  getCommunity: (id: string) =>
    apiFetch(`/api/web/communities/${id}`, { noAuth: true }),
  createCommunity: (data: Record<string, unknown>) =>
    apiFetch('/api/web/communities', { method: 'POST', body: data }),
  updateCommunity: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/web/communities/${id}`, { method: 'PUT', body: data }),
  followCommunity: (id: string) =>
    apiFetch(`/api/web/communities/${id}/follow`, { method: 'POST' }),
  addModerator: (communityId: string, userId: string) =>
    apiFetch(`/api/web/communities/${communityId}/moderator`, { method: 'POST', body: { userId } }),
  removeModerator: (communityId: string, userId: string) =>
    apiFetch(`/api/web/communities/${communityId}/moderator/${userId}`, { method: 'DELETE' }),
  checkCommunityEligibility: () =>
    apiFetch('/api/web/communities-eligibility'),
  getProfileCommunities: (userId: string) =>
    apiFetch(`/api/web/profile/${userId}/communities`, { noAuth: true }),
  getCommunityReviews: (id: string) =>
    apiFetch(`/api/web/communities/${id}/reviews`, { noAuth: true }),
  getCommunityPendingPlans: (id: string) =>
    apiFetch(`/api/web/communities/${id}/pending-plans`),
  approveCommunityPlan: (communityId: string, planId: string) =>
    apiFetch(`/api/web/communities/${communityId}/approve-plan/${planId}`, { method: 'POST' }),
  rejectCommunityPlan: (communityId: string, planId: string) =>
    apiFetch(`/api/web/communities/${communityId}/reject-plan/${planId}`, { method: 'POST' }),
  linkPlanToCommunity: (planId: string, communityId: string | null) =>
    apiFetch(`/api/web/plans/${planId}/link-community`, { method: 'POST', body: { communityId } }),
  searchCommunityMembers: (communityId: string, q?: string) =>
    apiFetch(`/api/web/communities/${communityId}/members${q ? `?q=${encodeURIComponent(q)}` : ''}`),
};
