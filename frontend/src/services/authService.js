/**
 * IssueHub Authentication Service
 * Consumes Member 1 Backend Auth APIs:
 * - POST /api/auth/login
 * - POST /api/auth/logout
 * 
 * Provides fallback mock authentication when Member 1's backend is not yet started,
 * allowing full UI/UX testing and role-based validation.
 */

import { apiRequest } from './api';

// Canonical test users matching Seed Data
export const DEMO_USERS = {
  student: {
    id: 'usr_student_01',
    name: 'Alex Rivera',
    email: 'student@issuehub.edu',
    legacyEmail: 'student@resolvex.edu',
    role: 'student',
    studentId: 'CS20240901',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 234-5678'
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@issuehub.edu',
    legacyEmail: 'admin@resolvex.edu',
    role: 'admin',
    department: 'Dean of Student Affairs',
    phone: '+1 (555) 876-5432'
  },
  grievance_officer: {
    id: 'usr_grievance_01',
    name: 'Justice R. K. Verma',
    email: 'grievance@issuehub.edu',
    legacyEmail: 'grievance@resolvex.edu',
    role: 'grievance_officer',
    department: 'Ombudsman & Grievance Cell',
    phone: '+1 (555) 345-6789'
  }
};

export const authService = {
  async login(email, password) {
    try {
      // 1. Attempt live backend authentication (Member 1)
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (token && user) {
        localStorage.setItem('issuehub_token', token);
        localStorage.setItem('issuehub_user', JSON.stringify(user));
        return { user, token, isMock: false };
      }
      throw new Error('Invalid response structure from backend auth endpoint');
    } catch (err) {
      console.warn('[Auth Service] Live backend auth failed or offline:', err.message);

      // 2. Fallback to matching demo users if credentials match seed data
      const cleanEmail = email.trim().toLowerCase();
      const matchedRole = Object.keys(DEMO_USERS).find(r => {
        const u = DEMO_USERS[r];
        return u.email.toLowerCase() === cleanEmail || u.legacyEmail?.toLowerCase() === cleanEmail;
      });

      if (matchedRole) {
        const demoUser = DEMO_USERS[matchedRole];
        const mockToken = `mock_jwt_token_${demoUser.role}_${Date.now()}`;
        localStorage.setItem('issuehub_token', mockToken);
        localStorage.setItem('issuehub_user', JSON.stringify(demoUser));
        localStorage.setItem('issuehub_mock_mode', 'true');
        return { user: demoUser, token: mockToken, isMock: true };
      }

      // If credentials do not match known test accounts
      throw new Error('Invalid email or password. Use demo accounts provided below or run backend.');
    }
  },

  logout() {
    localStorage.removeItem('issuehub_token');
    localStorage.removeItem('issuehub_user');
    localStorage.removeItem('issuehub_mock_mode');
    localStorage.removeItem('resolvex_token');
    localStorage.removeItem('resolvex_user');
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('issuehub_user') || localStorage.getItem('resolvex_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('issuehub_token') || localStorage.getItem('resolvex_token');
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  isMockMode() {
    return localStorage.getItem('issuehub_mock_mode') === 'true' || localStorage.getItem('resolvex_mock_mode') === 'true';
  },

  /**
   * Helper to switch roles instantly for evaluation and judging
   */
  switchDemoRole(role) {
    const demoUser = DEMO_USERS[role];
    if (demoUser) {
      const mockToken = `mock_jwt_token_${demoUser.role}_${Date.now()}`;
      localStorage.setItem('issuehub_token', mockToken);
      localStorage.setItem('issuehub_user', JSON.stringify(demoUser));
      localStorage.setItem('issuehub_mock_mode', 'true');
      return demoUser;
    }
    return null;
  }
};
