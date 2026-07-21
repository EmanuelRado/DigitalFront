/* ================================================================
   DIGITALFRONT — Admin Project Editor JS
   Create/edit projects, manage tags, upload images, timeline
   ================================================================ */

import { requireAuth, initLogout } from './auth.js';
import { getPocketBase, getProjectById } from '../supabase.js';

let projectId = null;
let techStackTags = [];
let featuresTags = [];
let timelineEntries = [];
let timelineCounter = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  // Check if editing existing project
  const params = new URLSearchParams(window.location.search);
  projectId = params.get('id');

  if (projectId) {
    document.getElementById('editor-title').textContent = 'Edit Project';
    document.title = 'Edit Project — DigitalFront Admin';
    await loadProject(projectId);
  }

  initSlugGeneration();
  initTagInputs();
  initTimeline();
  initImageUploads();
  initSaveButtons();
});

/* ================================================================
   LOAD EXISTING PROJECT
   ================================================================ */
async function loadProject(id) {
  const project = await getProjectById(id);
  if (!project) return;

  // Basic fields
  document.getElementById('project-name').value = project.name || '';
  document.getElementById('project-slug').value = project.slug || '';
  document.getElementById('project-category').value = project.category || '';
  document.getElementById('project-client').value = project.client_name || '';
  document.getElementById('project-short-desc').value = project.short_description || '';
  document.getElementById('project-description').value = project.description || '';
  document.getElementById('project-live-url').value = project.live_url || '';

  // Tech stack tags
  techStackTags = project.tech_stack || [];
  renderTags('tech-stack-tags', techStackTags);

  // Features tags
  featuresTags = project.features || [];
  renderTags('features-tags', featuresTags);

  // Thumbnail
  if (project.thumbnail_url) {
    const preview = document.getElementById('thumbnail-preview');
    const placeholder = document.getElementById('thumbnail-placeholder');
    if (preview) {
      preview.src = project.thumbnail_url;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
  }

  // Gallery
  if (project.project_media?.length) {
    renderGallery(project.project_media);
  }

  // Timeline
  if (project.project_timeline?.length) {
    project.project_timeline.forEach(step => addTimelineEntry(step));
  }
}

/* ================================================================
   SLUG GENERATION
   ================================================================ */
function initSlugGeneration() {
  const nameInput = document.getElementById('project-name');
  const slugInput = document.getElementById('project-slug');

  if (!nameInput || !slugInput) return;

  nameInput.addEventListener('input', () => {
    if (!projectId) { // Only auto-generate for new projects
      slugInput.value = generateSlug(nameInput.value);
    }
  });
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ================================================================
   TAG INPUTS
   ================================================================ */
function initTagInputs() {
  setupTagInput('tech-stack-input', 'tech-stack-tags', techStackTags);
  setupTagInput('features-input', 'features-tags', featuresTags);
}

function setupTagInput(inputId, containerId, tagsArray) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim();
      if (value && !tagsArray.includes(value)) {
        tagsArray.push(value);
        renderTags(containerId, tagsArray);
        input.value = '';
      }
    }
  });
}

function renderTags(containerId, tagsArray) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = tagsArray.map((tag, i) => `
    <span class="admin-tag">
      ${tag}
      <button class="admin-tag-remove" data-index="${i}" aria-label="Remove ${tag}">×</button>
    </span>
  `).join('');

  // Remove handler
  container.querySelectorAll('.admin-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      tagsArray.splice(idx, 1);
      renderTags(containerId, tagsArray);
    });
  });
}

/* ================================================================
   TIMELINE
   ================================================================ */
function initTimeline() {
  const addBtn = document.getElementById('btn-add-timeline');
  if (addBtn) {
    addBtn.addEventListener('click', () => addTimelineEntry());
  }
}

function addTimelineEntry(data = null) {
  timelineCounter++;
  const id = timelineCounter;
  const container = document.getElementById('timeline-entries');
  if (!container) return;

  const entry = document.createElement('div');
  entry.className = 'admin-timeline-entry';
  entry.id = `timeline-entry-${id}`;
  entry.innerHTML = `
    <div class="admin-timeline-entry-header">
      <h4>Step ${id}</h4>
      <button class="admin-action-btn is-danger" data-remove-timeline="${id}" aria-label="Remove step">Remove</button>
    </div>
    <div class="form-group">
      <label class="form-label">Step Title</label>
      <input type="text" class="form-input timeline-title" value="${data?.step_title || ''}" placeholder="e.g. Design Concept…">
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-textarea timeline-desc" rows="2" placeholder="What happened in this step…">${data?.step_description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <input type="date" class="form-input timeline-date" value="${data?.step_date || ''}">
    </div>
  `;

  container.appendChild(entry);

  // Remove handler
  entry.querySelector(`[data-remove-timeline="${id}"]`).addEventListener('click', () => {
    entry.remove();
  });

  timelineEntries.push({ id, data });
}

/* ================================================================
   IMAGE UPLOADS
   ================================================================ */
function initImageUploads() {
  // Thumbnail
  const thumbnailUpload = document.getElementById('thumbnail-upload');
  const thumbnailFile = document.getElementById('thumbnail-file');

  if (thumbnailUpload && thumbnailFile) {
    thumbnailUpload.addEventListener('click', () => thumbnailFile.click());
    thumbnailFile.addEventListener('change', handleThumbnailChange);
    initDragDrop(thumbnailUpload, thumbnailFile);
  }

  // Gallery
  const galleryUpload = document.getElementById('gallery-upload');
  const galleryFiles = document.getElementById('gallery-files');

  if (galleryUpload && galleryFiles) {
    galleryUpload.addEventListener('click', () => galleryFiles.click());
    galleryFiles.addEventListener('change', handleGalleryChange);
    initDragDrop(galleryUpload, galleryFiles);
  }
}

function initDragDrop(dropArea, fileInput) {
  ['dragenter', 'dragover'].forEach(event => {
    dropArea.addEventListener(event, (e) => {
      e.preventDefault();
      dropArea.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(event => {
    dropArea.addEventListener(event, (e) => {
      e.preventDefault();
      dropArea.classList.remove('is-dragover');
    });
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change'));
  });
}

function handleThumbnailChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById('thumbnail-preview');
  const placeholder = document.getElementById('thumbnail-placeholder');

  const reader = new FileReader();
  reader.onload = (ev) => {
    if (preview) {
      preview.src = ev.target.result;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function handleGalleryChange(e) {
  const files = Array.from(e.target.files);
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const item = document.createElement('div');
      item.className = 'admin-gallery-item';
      item.innerHTML = `
        <img src="${ev.target.result}" alt="Gallery image" width="150" height="94">
        <button class="admin-gallery-remove" aria-label="Remove image">×</button>
      `;
      item.querySelector('.admin-gallery-remove').addEventListener('click', () => item.remove());
      grid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

function renderGallery(media) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.innerHTML = media.map(m => `
    <div class="admin-gallery-item" data-media-id="${m.id}">
      <img src="${m.url}" alt="${m.caption || ''}" width="150" height="94">
      <button class="admin-gallery-remove" aria-label="Remove image">×</button>
    </div>
  `).join('');

  grid.querySelectorAll('.admin-gallery-remove').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.admin-gallery-item').remove());
  });
}

/* ================================================================
   SAVE / PUBLISH
   ================================================================ */
function initSaveButtons() {
  const saveDraftBtn = document.getElementById('btn-save-draft');
  const publishBtn = document.getElementById('btn-publish');

  if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => saveProject('draft'));
  if (publishBtn) publishBtn.addEventListener('click', () => saveProject('published'));
}

async function saveProject(status) {
  const name = document.getElementById('project-name').value.trim();
  const slug = document.getElementById('project-slug').value.trim();

  if (!name || !slug) {
    alert('Project name and slug are required.');
    return;
  }

  const pb = getPocketBase();

  const projectData = {
    name,
    slug,
    description: document.getElementById('project-description').value.trim(),
    short_description: document.getElementById('project-short-desc').value.trim(),
    category: document.getElementById('project-category').value,
    client_name: document.getElementById('project-client').value.trim(),
    live_url: document.getElementById('project-live-url').value.trim(),
    tech_stack: techStackTags,
    features: featuresTags,
    thumbnail_url: `/images/portfolio/${slug}-thumbnail.png`,
    mobile_url: `/images/portfolio/${slug}-mobile.png`,
    status
  };

  try {
    let savedRecord;
    if (projectId) {
      savedRecord = await pb.collection('projects').update(projectId, projectData);
    } else {
      savedRecord = await pb.collection('projects').create(projectData);
      projectId = savedRecord.id;
      window.history.replaceState({}, '', `?id=${projectId}`);
    }

    // Replace timeline items
    const existingTimeline = await pb.collection('project_timeline').getFullList({ filter: `project = "${projectId}"` });
    for (const item of existingTimeline) {
      await pb.collection('project_timeline').delete(item.id);
    }

    const entries = document.querySelectorAll('.admin-timeline-entry');
    let order = 0;
    for (const entry of entries) {
      const title = entry.querySelector('.timeline-title')?.value.trim();
      if (!title) continue;
      await pb.collection('project_timeline').create({
        project: projectId,
        step_title: title,
        step_description: entry.querySelector('.timeline-desc')?.value.trim() || '',
        step_date: entry.querySelector('.timeline-date')?.value || '',
        sort_order: order++
      });
    }

    alert(status === 'published' ? 'Project published!' : 'Draft saved!');
  } catch (err) {
    console.error('Error saving project to PocketBase:', err);
    alert('Error saving: ' + err.message);
  }
}
