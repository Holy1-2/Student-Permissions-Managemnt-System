/**
 * GateFlow API helpers — thin wrappers over the axios instance.
 * All functions return response.data directly.
 */
import { api } from './apiInstance'; 

// ── Auth ───────────────────────────────────────────────────────────────────
export const authLogin = (email, password) => api.post('/auth/login', { email, password }).then(r => r.data);
export const authSignup = (payload) => api.post('/auth/signup', payload).then(r => r.data);

// ── Gate ───────────────────────────────────────────────────────────────────
export const gateSearch = (query) => api.get(`/gate/search?query=${encodeURIComponent(query)}`).then(r => r.data);
export const gateCheckpoint = (payload) => api.post('/gate/checkpoint', payload).then(r => r.data);
export const gateHistory = () => api.get('/gate/history').then(r => r.data);

// ── Permissions ────────────────────────────────────────────────────────────
export const permissionsActive = () => api.get('/permissions/active').then(r => r.data);
export const permissionsAll = (limit, offset) => api.get(`/permissions?limit=${limit}&offset=${offset}`).then(r => r.data);
export const permissionIssue = (payload) => api.post('/permissions/issue', payload).then(r => r.data);
export const permissionWaive = (id, reason) => api.put(`/permissions/${id}/waive`, { waived_reason: reason }).then(r => r.data);

// ── Entities ───────────────────────────────────────────────────────────────
export const entitiesAll = (type) => api.get(type ? `/entities?type=${type}` : '/entities').then(r => r.data);
export const entityCreate = (payload) => api.post('/entities', payload).then(r => r.data);

// ── Admin / Registration ───────────────────────────────────────────────────
export const registerNewStudent = (studentData) => api.post('/admin/register-student', studentData).then(r => r.data);
export const getAllStudents = () => api.get('/admin/students').then(r => r.data);
export const updateStudent = (id, studentData) => api.put(`/admin/students/${id}`, studentData).then(r => r.data);
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`).then(r => r.data);
export const adminGetConfig = () => api.get('/admin/config').then(r => r.data);
export const adminUpdateBridge = (payload) => api.put('/admin/config/academic-bridge', payload).then(r => r.data);
export const adminSyncStudents = (params = {}) => api.post('/admin/sync-students', params).then(r => r.data);
export const adminUpdatePenalty = (rate) => api.put('/admin/config/penalty-rate', { marks_per_hour: rate }).then(r => r.data);
export const adminRotateCodes = (payload) => api.put('/admin/config/activation-codes', payload).then(r => r.data);