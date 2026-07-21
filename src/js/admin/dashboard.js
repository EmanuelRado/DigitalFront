/* ================================================================
   DIGITALFRONT — Admin Dashboard JS
   Projects listing, leads listing, stats, delete functionality
   ================================================================ */

import { requireAuth, initLogout } from './auth.js';
import { getPocketBase } from '../supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  initLogout();
  await loadDashboard();
  initDeleteModal();
});

/* ================================================================
   LOAD DASHBOARD DATA
   ================================================================ */
async function loadDashboard() {
  const pb = getPocketBase();
  try {
    // Load projects
    const projects = await pb.collection('projects').getFullList({ sort: '-created' });
    renderProjects(projects);
    updateStats(projects, 'projects');

    // Load leads
    const leads = await pb.collection('contact_submissions').getFullList({ sort: '-created' });
    renderLeads(leads);
    updateStats(leads, 'leads');
  } catch (err) {
    console.error('Error loading dashboard data from PocketBase:', err);
  }
}

/* ================================================================
   RENDER PROJECTS TABLE
   ================================================================ */
function renderProjects(projects) {
  const tbody = document.getElementById('projects-tbody');
  const empty = document.getElementById('projects-empty');

  if (!projects.length) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = projects.map(p => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">
        <a href="./project-editor.html?id=${p.id}" style="color:var(--color-text);transition:color var(--duration-fast);" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text)'">${p.name}</a>
      </td>
      <td>${p.category || '—'}</td>
      <td><span class="status-badge status-${p.status}">${p.status}</span></td>
      <td>${new Date(p.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>
        <div class="admin-actions">
          <a href="./project-editor.html?id=${p.id}" class="admin-action-btn">Edit</a>
          <button class="admin-action-btn is-danger" data-delete-id="${p.id}" data-delete-name="${p.name}" aria-label="Delete ${p.name}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ================================================================
   RENDER LEADS TABLE
   ================================================================ */
function renderLeads(leads) {
  const tbody = document.getElementById('leads-tbody');
  const empty = document.getElementById('leads-empty');

  if (!leads.length) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = leads.map(l => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">${l.name}</td>
      <td><a href="mailto:${l.email}" style="color:var(--color-accent);">${l.email}</a></td>
      <td>${l.business_type || '—'}</td>
      <td>${l.budget_range || '—'}</td>
      <td><span class="status-badge status-${l.status}">${l.status}</span></td>
      <td>${new Date(l.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
    </tr>
  `).join('');
}

/* ================================================================
   UPDATE STATS
   ================================================================ */
function updateStats(data, type) {
  if (type === 'projects') {
    const el = (id) => document.getElementById(id);
    if (el('stat-total')) el('stat-total').textContent = data.length;
    if (el('stat-published')) el('stat-published').textContent = data.filter(p => p.status === 'published').length;
    if (el('stat-draft')) el('stat-draft').textContent = data.filter(p => p.status === 'draft').length;
  }
  if (type === 'leads') {
    const el = document.getElementById('stat-leads');
    if (el) el.textContent = data.filter(l => l.status === 'new').length;
  }
}

/* ================================================================
   DELETE MODAL
   ================================================================ */
function initDeleteModal() {
  const modal = document.getElementById('delete-modal');
  const cancelBtn = document.getElementById('delete-cancel');
  const confirmBtn = document.getElementById('delete-confirm');
  let deleteId = null;

  if (!modal) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete-id]');
    if (!btn) return;

    deleteId = btn.dataset.deleteId;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  });

  cancelBtn?.addEventListener('click', closeDeleteModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeDeleteModal(); });

  confirmBtn?.addEventListener('click', async () => {
    if (!deleteId) return;

    confirmBtn.classList.add('is-loading');

    try {
      const pb = getPocketBase();
      await pb.collection('projects').delete(deleteId);
    } catch (err) {
      console.error('Error deleting project in PocketBase:', err);
      alert('Failed to delete project in PocketBase.');
    }

    closeDeleteModal();
    confirmBtn.classList.remove('is-loading');

    await loadDashboard();
  });

  function closeDeleteModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    deleteId = null;
  }
}
