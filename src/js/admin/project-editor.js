/* ================================================================
   DIGITALFRONT — Admin Project Editor Controller
   Create/edit projects, manage tech stack tags, features, timeline
   ================================================================ */

import { requireAuth, initLogout } from './auth.js';
import { fetchProjectById, saveProject } from '../pocketbase-service.js';

let projectId = null;
let techStackTags = [];
let featuresTags = [];
let timelineCounter = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  initLogout();

  // Check URL params for project ID
  const params = new URLSearchParams(window.location.search);
  projectId = params.get('id');

  initSlugGenerator();
  initTagInputs();
  initTimelineEditor();
  initSaveButtons();

  if (projectId) {
    document.getElementById('editor-page-title').textContent = 'Edit Project';
    await loadProjectData(projectId);
  }
});

/* ================================================================
   AUTO SLUG GENERATOR
   ================================================================ */
function initSlugGenerator() {
  const nameInput = document.getElementById('project-name');
  const slugInput = document.getElementById('project-slug');

  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!projectId) {
        slugInput.value = nameInput.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
      }
    });
  }
}

/* ================================================================
   LOAD EXISTING PROJECT
   ================================================================ */
async function loadProjectData(id) {
  const project = await fetchProjectById(id);
  if (!project) {
    alert('Project not found.');
    window.location.href = './index.html';
    return;
  }

  document.getElementById('project-name').value = project.name || '';
  document.getElementById('project-slug').value = project.slug || '';
  document.getElementById('project-short-desc').value = project.short_description || '';
  document.getElementById('project-description').value = project.description || '';
  document.getElementById('project-category').value = project.category || 'restaurant';
  document.getElementById('project-client').value = project.client_name || '';
  document.getElementById('project-live-url').value = project.live_url || '';

  // Tech stack & features tags
  techStackTags = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  featuresTags = Array.isArray(project.features) ? project.features : [];
  renderTags('tech-stack', techStackTags);
  renderTags('features', featuresTags);

  // Timeline steps
  if (Array.isArray(project.project_timeline) && project.project_timeline.length) {
    const list = document.getElementById('timeline-list');
    if (list) list.innerHTML = '';
    project.project_timeline.forEach(step => addTimelineEntry(step.step_title, step.step_description, step.step_date));
  }
}

/* ================================================================
   TAG MANAGEMENT
   ================================================================ */
function initTagInputs() {
  setupTagInput('tech-stack', techStackTags);
  setupTagInput('features', featuresTags);
}

function setupTagInput(type, tagsArray) {
  const input = document.getElementById(`${type}-input`);
  const addBtn = document.getElementById(`add-${type}-btn`);

  if (!input || !addBtn) return;

  const addTag = () => {
    const val = input.value.trim();
    if (val && !tagsArray.includes(val)) {
      tagsArray.push(val);
      renderTags(type, tagsArray);
      input.value = '';
    }
  };

  addBtn.onclick = addTag;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
}

function renderTags(type, tagsArray) {
  const container = document.getElementById(`${type}-tags`);
  if (!container) return;

  container.innerHTML = tagsArray.map((tag, i) => `
    <span class="badge badge-accent" style="display:inline-flex; align-items:center; gap:6px;">
      ${tag}
      <button type="button" data-tag-type="${type}" data-tag-index="${i}" style="background:none;border:none;color:inherit;cursor:pointer;font-weight:bold;">×</button>
    </span>
  `).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.tagIndex);
      tagsArray.splice(idx, 1);
      renderTags(type, tagsArray);
    };
  });
}

/* ================================================================
   TIMELINE EDITOR
   ================================================================ */
function initTimelineEditor() {
  const addBtn = document.getElementById('add-timeline-btn');
  if (addBtn) {
    addBtn.onclick = () => addTimelineEntry('', '', '');
  }
}

function addTimelineEntry(title = '', desc = '', date = '') {
  const list = document.getElementById('timeline-list');
  if (!list) return;

  timelineCounter++;
  const id = `timeline-step-${timelineCounter}`;

  const item = document.createElement('div');
  item.className = 'admin-timeline-entry';
  item.style.cssText = 'background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-4); border-radius:var(--radius-md); margin-bottom:var(--space-3);';
  item.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-2);">
      <strong style="font-size:var(--text-xs); text-transform:uppercase; color:var(--color-text-muted);">Step #${timelineCounter}</strong>
      <button type="button" class="admin-action-btn is-danger remove-timeline-btn" style="padding:2px 8px; font-size:var(--text-xs);">Remove</button>
    </div>
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:var(--space-3); margin-bottom:var(--space-2);">
      <input type="text" class="input timeline-title" placeholder="Step Title (e.g. Client Brief)" value="${title}">
      <input type="date" class="input timeline-date" value="${date}">
    </div>
    <textarea class="input timeline-desc" rows="2" placeholder="Step details and objectives...">${desc}</textarea>
  `;

  item.querySelector('.remove-timeline-btn').onclick = () => item.remove();
  list.appendChild(item);
}

/* ================================================================
   SAVE PROJECT
   ================================================================ */
function initSaveButtons() {
  const saveDraftBtn = document.getElementById('btn-save-draft');
  const publishBtn = document.getElementById('btn-publish');

  if (saveDraftBtn) saveDraftBtn.onclick = () => handleSave('draft');
  if (publishBtn) publishBtn.onclick = () => handleSave('published');
}

async function handleSave(status) {
  const name = document.getElementById('project-name').value.trim();
  const slug = document.getElementById('project-slug').value.trim();

  if (!name || !slug) {
    alert('Project Name and Slug are required.');
    return;
  }

  // Collect timeline entries
  const timelineData = [];
  document.querySelectorAll('.admin-timeline-entry').forEach((entry, idx) => {
    const title = entry.querySelector('.timeline-title')?.value.trim();
    if (title) {
      timelineData.push({
        step_title: title,
        step_description: entry.querySelector('.timeline-desc')?.value.trim() || '',
        step_date: entry.querySelector('.timeline-date')?.value || '',
        sort_order: idx
      });
    }
  });

  const projectPayload = {
    name,
    slug,
    short_description: document.getElementById('project-short-desc').value.trim(),
    description: document.getElementById('project-description').value.trim(),
    category: document.getElementById('project-category').value,
    client_name: document.getElementById('project-client').value.trim(),
    live_url: document.getElementById('project-live-url').value.trim(),
    thumbnail_url: `/images/portfolio/${slug}-thumbnail.png`,
    mobile_url: `/images/portfolio/${slug}-mobile.png`,
    tech_stack: techStackTags,
    features: featuresTags,
    project_timeline: timelineData,
    status
  };

  const publishBtn = document.getElementById('btn-publish');
  if (publishBtn) publishBtn.classList.add('is-loading');

  try {
    await saveProject(projectPayload, projectId);
    alert(status === 'published' ? 'Project published successfully!' : 'Draft saved!');
    window.location.href = './index.html';
  } catch (err) {
    console.error('Error saving project:', err);
    alert('Failed to save project: ' + err.message);
  } finally {
    if (publishBtn) publishBtn.classList.remove('is-loading');
  }
}
