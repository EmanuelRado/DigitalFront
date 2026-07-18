/* ================================================================
   DIGITALFRONT — SQLite / REST API Client Adapter
   Replaces Supabase direct queries with standard fetch requests
   to the local Express API (in dev) / Vercel Serverless (in prod).
   ================================================================ */

/**
 * Check if the database is in demo mode.
 * Now always returns false since we are using a real local SQLite DB.
 */
export function isDemoMode() {
  return false;
}

// Dummy initializers to preserve compatibility with existing imports
export function initSupabase() { return null; }
export function getSupabase() { return null; }

/* ================================================================
   PROJECT QUERIES
   ================================================================ */

/**
 * Fetch all published projects.
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Array>} Array of project objects
 */
export async function getProjects(category = null) {
  const url = category ? `/api/projects?category=${encodeURIComponent(category)}` : '/api/projects';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API server returned error status');
    return await res.json();
  } catch (err) {
    console.error('Error fetching projects:', err);
    return [];
  }
}

/**
 * Fetch a single project by slug, including media and timeline.
 * @param {string} slug - Project slug
 * @returns {Promise<Object|null>} Project object with media and timeline
 */
export async function getProjectBySlug(slug) {
  try {
    const res = await fetch(`/api/projects/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('API server returned error status');
    return await res.json();
  } catch (err) {
    console.error('Error fetching project by slug:', err);
    return null;
  }
}

/**
 * Fetch a project by ID.
 * @param {string} id - Project UUID
 * @returns {Promise<Object|null>}
 */
export async function getProjectById(id) {
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('API server returned error status');
    return await res.json();
  } catch (err) {
    console.error('Error fetching project by ID:', err);
    return null;
  }
}

/**
 * Get distinct project categories.
 * @returns {Promise<Array<string>>}
 */
export async function getCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('API server returned error status');
    return await res.json();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

/* ================================================================
   CONTACT FORM
   ================================================================ */

/**
 * Submit a contact form.
 * @param {Object} formData - { name, email, phone, business_type, message, budget_range }
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitContactForm(formData) {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return { success: true };
  } catch (err) {
    console.error('Error submitting contact form:', err);
    return { success: false, error: err.message };
  }
}

/* ================================================================
   AUTH (for Admin)
   ================================================================ */

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user?: Object, error?: string }>}
 */
export async function signIn(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    
    // Save session in localStorage
    localStorage.setItem('df_admin_user', JSON.stringify(data.user));
    return { user: data.user };
  } catch (err) {
    console.error('Error signing in:', err);
    return { error: err.message };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Sign out error:', err);
  }
  localStorage.removeItem('df_admin_user');
}

/**
 * Get the current authenticated user.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  const userStr = localStorage.getItem('df_admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem('df_admin_user');
    return null;
  }
}

/**
 * Check if user is authenticated.
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
