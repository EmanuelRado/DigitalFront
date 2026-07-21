/* ================================================================
   DIGITALFRONT — PocketBase Client Adapter
   ================================================================ */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://127.0.0.1:8090';
const pb = new PocketBase(POCKETBASE_URL);

/**
 * Check if demo mode is enabled (always false now that PocketBase is active).
 */
export function isDemoMode() {
  return false;
}

export function initSupabase() { return pb; }
export function getSupabase() { return pb; }
export function getPocketBase() { return pb; }

/* ================================================================
   PROJECT QUERIES
   ================================================================ */

/**
 * Fetch all published projects.
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Array>} Array of project objects
 */
export async function getProjects(category = null) {
  try {
    const filter = category ? `status = "published" && category = "${category}"` : 'status = "published"';
    const records = await pb.collection('projects').getFullList({
      filter,
      sort: 'sort_order,-created'
    });
    return records;
  } catch (err) {
    console.error('Error fetching projects from PocketBase:', err);
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
    const project = await pb.collection('projects').getFirstListItem(`slug = "${slug}"`);
    
    // Load timeline items
    const timeline = await pb.collection('project_timeline').getFullList({
      filter: `project = "${project.id}"`,
      sort: 'sort_order'
    });
    project.project_timeline = timeline;

    // Load media items
    const media = await pb.collection('project_media').getFullList({
      filter: `project = "${project.id}"`,
      sort: 'sort_order'
    });
    project.project_media = media;

    return project;
  } catch (err) {
    console.error('Error fetching project by slug from PocketBase:', err);
    return null;
  }
}

/**
 * Fetch a project by ID.
 * @param {string} id - Project ID
 * @returns {Promise<Object|null>}
 */
export async function getProjectById(id) {
  try {
    const project = await pb.collection('projects').getOne(id);

    const timeline = await pb.collection('project_timeline').getFullList({
      filter: `project = "${project.id}"`,
      sort: 'sort_order'
    });
    project.project_timeline = timeline;

    const media = await pb.collection('project_media').getFullList({
      filter: `project = "${project.id}"`,
      sort: 'sort_order'
    });
    project.project_media = media;

    return project;
  } catch (err) {
    console.error('Error fetching project by ID from PocketBase:', err);
    return null;
  }
}

/**
 * Get distinct project categories.
 * @returns {Promise<Array<string>>}
 */
export async function getCategories() {
  try {
    const records = await pb.collection('projects').getFullList({
      filter: 'status = "published"',
      fields: 'category'
    });
    const categories = [...new Set(records.map(r => r.category).filter(Boolean))];
    return categories;
  } catch (err) {
    console.error('Error fetching categories from PocketBase:', err);
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
    await pb.collection('contact_submissions').create({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      business_type: formData.business_type || '',
      budget_range: formData.budget_range || '',
      message: formData.message,
      status: 'new'
    });
    return { success: true };
  } catch (err) {
    console.error('Error submitting contact form to PocketBase:', err);
    return { success: false, error: err.message };
  }
}

/* ================================================================
   AUTH (for Admin)
   ================================================================ */

/**
 * Sign in with email and password (Superuser authentication).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user?: Object, error?: string }>}
 */
export async function signIn(email, password) {
  try {
    const authData = await pb.collection('_superusers').authWithPassword(email, password);
    return { user: authData.record };
  } catch (err) {
    console.error('Error signing in to PocketBase:', err);
    return { error: 'Invalid credentials or PocketBase superuser account.' };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  pb.authStore.clear();
}

/**
 * Get the current authenticated user.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  return pb.authStore.isValid ? pb.authStore.record : null;
}

/**
 * Check if user is authenticated.
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  return pb.authStore.isValid;
}
