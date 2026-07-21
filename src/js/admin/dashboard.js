/* ================================================================
   DIGITALFRONT — Admin Dashboard Controller
   Unified Project, Lead, Client & Subscription Management
   ================================================================ */

import { requireAuth, initLogout } from './auth.js';
import {
  fetchProjects, deleteProject,
  fetchLeads, updateLeadStatus, deleteLead,
  fetchClients, saveClient, deleteClient,
  fetchSubscriptions, saveSubscription, deleteSubscription
} from '../pocketbase-service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  initLogout();
  initTabs();
  await loadDashboardData();
  initClientModal();
});

/* ================================================================
   TAB NAVIGATION
   ================================================================ */
function initTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('is-active'));
      tabContents.forEach(c => c.classList.remove('is-active'));

      btn.classList.add('is-active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) activeContent.classList.add('is-active');
    });
  });
}

/* ================================================================
   LOAD ALL DATA
   ================================================================ */
async function loadDashboardData() {
  try {
    const [projects, leads, clients, subs] = await Promise.all([
      fetchProjects(),
      fetchLeads(),
      fetchClients(),
      fetchSubscriptions()
    ]);

    renderProjects(projects);
    renderLeads(leads);
    renderClients(clients);
    renderSubscriptions(subs);
    updateStats(projects, leads, subs);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
}

/* ================================================================
   RENDER PROJECTS
   ================================================================ */
function renderProjects(projects) {
  const tbody = document.getElementById('projects-tbody');
  const empty = document.getElementById('projects-empty');

  if (!projects || !projects.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = projects.map(p => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">
        <a href="/admin/project-editor.html?id=${p.id}" style="color:var(--color-text);transition:color var(--duration-fast);" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text)'">${p.name}</a>
      </td>
      <td><span class="badge" style="background:rgba(255,255,255,0.06);color:var(--color-text-secondary);">${p.category || 'general'}</span></td>
      <td><span class="status-badge status-${p.status || 'published'}">${p.status || 'published'}</span></td>
      <td>${new Date(p.created || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>
        <div class="admin-actions">
          <a href="/admin/project-editor.html?id=${p.id}" class="admin-action-btn">Edit</a>
          ${p.live_url ? `<a href="${p.live_url}" target="_blank" rel="noopener" class="admin-action-btn">Live ↗</a>` : ''}
          <button class="admin-action-btn is-danger" data-delete-type="project" data-delete-id="${p.id}" aria-label="Delete ${p.name}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  attachDeleteListeners();
}

/* ================================================================
   RENDER LEADS
   ================================================================ */
function renderLeads(leads) {
  const tbody = document.getElementById('leads-tbody');
  const empty = document.getElementById('leads-empty');

  if (!leads || !leads.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = leads.map(l => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">${l.name}</td>
      <td>
        <div><a href="mailto:${l.email}" style="color:var(--color-accent);">${l.email}</a></div>
        ${l.phone ? `<div style="font-size:var(--text-xs);color:var(--color-text-muted);">${l.phone}</div>` : ''}
      </td>
      <td>${l.business_type || '—'}</td>
      <td><span class="badge badge-accent">${l.budget_range || '—'}</span></td>
      <td>
        <select class="input lead-status-select" data-lead-id="${l.id}" style="padding:2px 8px; font-size:var(--text-xs);">
          <option value="new" ${l.status === 'new' ? 'selected' : ''}>New</option>
          <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="archived" ${l.status === 'archived' ? 'selected' : ''}>Archived</option>
        </select>
      </td>
      <td>${new Date(l.created || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
      <td>
        <button class="admin-action-btn is-danger" data-delete-type="lead" data-delete-id="${l.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Status Change Listener
  document.querySelectorAll('.lead-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const leadId = e.target.dataset.leadId;
      const newStatus = e.target.value;
      await updateLeadStatus(leadId, newStatus);
      await loadDashboardData();
    });
  });

  attachDeleteListeners();
}

/* ================================================================
   RENDER CLIENTS
   ================================================================ */
function renderClients(clients) {
  const tbody = document.getElementById('clients-tbody');

  if (!clients || !clients.length) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);">No clients registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = clients.map(c => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">${c.company_name}</td>
      <td>${c.contact_person || '—'}</td>
      <td><a href="mailto:${c.email}" style="color:var(--color-accent);">${c.email}</a></td>
      <td>${c.phone || '—'}</td>
      <td>${c.city || '—'}</td>
      <td><span class="status-badge status-${c.status || 'active'}">${c.status || 'active'}</span></td>
      <td>
        <button class="admin-action-btn is-danger" data-delete-type="client" data-delete-id="${c.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  attachDeleteListeners();
}

/* ================================================================
   RENDER SUBSCRIPTIONS
   ================================================================ */
function renderSubscriptions(subs) {
  const tbody = document.getElementById('subs-tbody');

  if (!subs || !subs.length) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);">No active care plan subscriptions.</td></tr>';
    return;
  }

  tbody.innerHTML = subs.map(s => `
    <tr>
      <td style="font-weight:var(--weight-medium);color:var(--color-text);">${s.client_name || 'Client'}</td>
      <td><span class="badge badge-accent">${s.plan_name || 'Care Plan'}</span></td>
      <td style="font-weight:var(--weight-bold);color:var(--color-accent);">€${s.monthly_price || 0}/mo</td>
      <td><span class="status-badge status-${s.billing_status || 'active'}">${s.billing_status || 'active'}</span></td>
      <td>${s.next_billing_date || '2026-08-01'}</td>
      <td>
        <button class="admin-action-btn is-danger" data-delete-type="sub" data-delete-id="${s.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  attachDeleteListeners();
}

/* ================================================================
   UPDATE STATS
   ================================================================ */
function updateStats(projects, leads, subs) {
  const el = (id) => document.getElementById(id);
  if (el('stat-total')) el('stat-total').textContent = projects.length;
  if (el('stat-published')) el('stat-published').textContent = projects.filter(p => p.status === 'published' || !p.status).length;
  if (el('stat-leads')) el('stat-leads').textContent = leads.filter(l => l.status === 'new').length;
  if (el('stat-subs')) el('stat-subs').textContent = subs.length;
}

/* ================================================================
   MODALS & DELETE HANDLERS
   ================================================================ */
function attachDeleteListeners() {
  const modal = document.getElementById('delete-modal');
  const cancelBtn = document.getElementById('delete-cancel');
  const confirmBtn = document.getElementById('delete-confirm');
  let targetType = null;
  let targetId = null;

  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.onclick = () => {
      targetType = btn.dataset.deleteType;
      targetId = btn.dataset.deleteId;
      if (modal) modal.classList.add('is-open');
    };
  });

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (modal) modal.classList.remove('is-open');
      targetType = null;
      targetId = null;
    };
  }

  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      if (!targetId) return;
      confirmBtn.classList.add('is-loading');

      if (targetType === 'project') await deleteProject(targetId);
      if (targetType === 'lead') await deleteLead(targetId);
      if (targetType === 'client') await deleteClient(targetId);
      if (targetType === 'sub') await deleteSubscription(targetId);

      if (modal) modal.classList.remove('is-open');
      confirmBtn.classList.remove('is-loading');
      targetType = null;
      targetId = null;

      await loadDashboardData();
    };
  }
}

function initClientModal() {
  const modal = document.getElementById('client-modal');
  const addBtn = document.getElementById('btn-add-client');
  const cancelBtn = document.getElementById('client-cancel');
  const form = document.getElementById('client-form');

  if (addBtn && modal) {
    addBtn.onclick = () => modal.classList.add('is-open');
  }

  if (cancelBtn && modal) {
    cancelBtn.onclick = () => modal.classList.remove('is-open');
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const company_name = document.getElementById('client-company').value.trim();
      const contact_person = document.getElementById('client-contact').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      const city = document.getElementById('client-city').value.trim();

      if (!company_name || !email) return;

      await saveClient({ company_name, contact_person, email, phone, city, status: 'active' });
      form.reset();
      if (modal) modal.classList.remove('is-open');
      await loadDashboardData();
    };
  }
}
