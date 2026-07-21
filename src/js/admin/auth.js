/* ================================================================
   DIGITALFRONT — Admin Auth
   Login/logout, session management, route protection
   ================================================================ */

import { initSupabase, signIn, signOut, getCurrentUser, isDemoMode } from '../supabase.js';

/**
 * Check if the user is authenticated.
 * If not, redirect to the login page.
 */
export async function requireAuth() {
  if (isDemoMode()) {
    return { email: 'demo@digitalfront.dev', role: 'admin', isDemo: true };
  }

  initSupabase();
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = '/admin/login.html';
    return null;
  }

  return user;
}

/**
 * Initialize the login form handler.
 */
export function initLoginForm() {
  initSupabase();

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }

    // Loading state
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    hideError();

    if (isDemoMode()) {
      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        window.location.href = '/admin/index.html';
      }, 800);
      return;
    }

    const result = await signIn(email, password);

    if (result.error) {
      showError(result.error);
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      return;
    }

    // Success — redirect to dashboard
    window.location.href = '/admin/index.html';
  });

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function hideError() {
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }
}

/**
 * Initialize the logout button handler.
 */
export function initLogout() {
  const logoutBtn = document.getElementById('btn-logout');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    await signOut();
    window.location.href = '/admin/login.html';
  });
}
