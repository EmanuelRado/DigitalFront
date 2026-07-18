/* ================================================================
   DIGITALFRONT — Portfolio Item Page JS
   Load single project by slug, populate page content
   ================================================================ */

import { getProjectBySlug } from './supabase.js';

// Same demo data as portfolio.js
const DEMO_PROJECTS = [
  { id: '1', name: 'Trattoria della Nonna', slug: 'trattoria-della-nonna', short_description: 'Traditional Italian trattoria — landing page with menu and reservations.', category: 'restaurant', thumbnail_url: '/images/portfolio/trattoria-thumbnail.png', mobile_url: '/images/portfolio/trattoria-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'], features: ['Interactive HTML menu', 'Direct phone reservation', 'Google Maps embed', 'Bilingual DE/EN'], description: 'Complete landing page for a traditional Italian trattoria in Rösrath, Germany. Includes HTML menu, reservation system, photo gallery, and bilingual Schema markup (DE/EN).', client_name: 'Trattoria della Nonna' },
  { id: '2', name: 'Sufrageria Urbană', slug: 'sufrageria-urbana', short_description: 'Premium urban bistro — editorial design, menu & reservations.', category: 'restaurant', thumbnail_url: '/images/portfolio/sufrageria-thumbnail.png', mobile_url: '/images/portfolio/sufrageria-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Google Fonts'], features: ['Premium editorial design', 'Immersive photo gallery', 'Group reservation form', 'Pet-friendly terrace'], description: 'Premium website for an urban bistro in Bucharest with reinterpreted Romanian cuisine. Editorial, airy design focused on weekend brunch and refined atmosphere.', client_name: 'Sufrageria Urbană' },
  { id: '3', name: 'CrunchBox Burger', slug: 'crunchbox-burger', short_description: 'Premium fast-food — online ordering & delivery platforms.', category: 'restaurant', thumbnail_url: '/images/portfolio/crunchbox-thumbnail.png', mobile_url: '/images/portfolio/crunchbox-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Gloria Food'], features: ['Integrated online ordering', 'Glovo/Bolt/Tazz integration', 'Visual menu with prices', 'Energetic mobile-first design'], description: 'Energetic and appetizing site for a premium fast-food in Bucharest. Bold yellow-black contrast, optimized for quick orders and delivery platform integration.', client_name: 'CrunchBox Burger' },
  { id: '4', name: 'NordHaus Fenster & Türen', slug: 'nordhaus-fenster', short_description: 'Premium window installation — services & online quote.', category: 'business', thumbnail_url: '/images/portfolio/nordhaus-thumbnail.png', mobile_url: '/images/portfolio/nordhaus-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'], features: ['Quote request form', 'Before/after gallery', 'Local SEO Köln', 'Professional industrial design'], description: 'Professional website for a window and door installation company in Cologne, Germany. Service presentation, work gallery, quote form, and local SEO.', client_name: 'NordHaus Fenster & Türen' },
  { id: '5', name: 'BioCake', slug: 'biocake', short_description: 'Artisanal bio/vegan bakery — orders & presentation.', category: 'restaurant', thumbnail_url: '/images/portfolio/biocake-thumbnail.png', mobile_url: '/images/portfolio/biocake-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript'], features: ['Allergen menu', 'Custom orders', 'Organic/natural design', 'Product gallery'], description: 'Landing page for an artisanal bio and vegan bakery in Bucharest. Warm, organic design focused on natural ingredients and custom orders.', client_name: 'BioCake' }
];

// Demo timeline steps (generic for all projects)
const DEMO_TIMELINE = [
  { step_title: 'Client Brief', step_description: 'Collected business details, brand materials, and goals through our intake form. Identified target audience and key conversion actions.', step_date: '2026-01-05' },
  { step_title: 'Design Concept', step_description: 'Created wireframes and visual mockups based on the brief. Selected color palette, typography, and layout direction for client review.', step_date: '2026-01-08' },
  { step_title: 'Development', step_description: 'Built the site with semantic HTML, custom CSS, and optimized JavaScript. Implemented responsive design, forms, and integrations.', step_date: '2026-01-12' },
  { step_title: 'Launch & QA', step_description: 'Cross-browser testing, performance optimization, SEO setup, and final client review before going live.', step_date: '2026-01-15' },
];

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    showNotFound();
    return;
  }

  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    project = null;
  }
  // Fallback to demo
  if (!project) {
    const demoProj = DEMO_PROJECTS.find(p => p.slug === slug);
    if (demoProj) {
      project = {
        ...demoProj,
        project_timeline: DEMO_TIMELINE,
        project_media: [
          ...(demoProj.thumbnail_url ? [{ id: 'm1', url: demoProj.thumbnail_url, caption: `${demoProj.name} Desktop UI` }] : []),
          ...(demoProj.mobile_url ? [{ id: 'm2', url: demoProj.mobile_url, caption: `${demoProj.name} Mobile UI` }] : [])
        ]
      };
    }
  }

  if (!project) {
    showNotFound();
    return;
  }

  renderProject(project);
  initLightbox();
});

/* ================================================================
   RENDER PROJECT
   ================================================================ */
function renderProject(project) {
  // Page title
  document.title = `${project.name} — DigitalFront`;

  // Category
  const categoryEl = document.getElementById('project-category');
  if (categoryEl) categoryEl.textContent = (project.category || 'project').toUpperCase();

  // Title
  const titleEl = document.getElementById('project-title');
  if (titleEl) titleEl.textContent = project.name;

  // Description
  const descEl = document.getElementById('project-description');
  if (descEl) descEl.textContent = project.description || '';

  // Hero Image (Desktop + Mobile)
  const heroImageEl = document.getElementById('project-hero-image');
  const mobileImageEl = document.getElementById('project-mobile-image');
  const heroImageSection = document.getElementById('project-hero-image-section');
  const browserUrlEl = document.getElementById('project-browser-url');
  const viewToggleEl = document.getElementById('project-view-toggle');

  if (heroImageEl && project.thumbnail_url) {
    heroImageEl.src = project.thumbnail_url;
    heroImageEl.alt = `${project.name} desktop screenshot`;
    if (browserUrlEl) browserUrlEl.textContent = `${project.slug}.digitalfront.dev`;
    
    if (mobileImageEl && project.mobile_url) {
      mobileImageEl.src = project.mobile_url;
      mobileImageEl.alt = `${project.name} mobile screenshot`;
      if (viewToggleEl) {
        viewToggleEl.style.display = 'flex';
        
        const toggleBtns = viewToggleEl.querySelectorAll('.view-toggle-btn');
        const desktopPreview = document.getElementById('project-desktop-preview');
        const mobilePreview = document.getElementById('project-mobile-preview');
        
        toggleBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            toggleBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            
            if (view === 'desktop') {
              if (desktopPreview) desktopPreview.style.display = 'block';
              if (mobilePreview) mobilePreview.style.display = 'none';
            } else {
              if (desktopPreview) desktopPreview.style.display = 'none';
              if (mobilePreview) mobilePreview.style.display = 'block';
            }
          });
        });
      }
    }
    
    if (heroImageSection) heroImageSection.style.display = 'block';
  }

  // Meta
  const metaEl = document.getElementById('project-meta');
  if (metaEl) {
    let metaHTML = '';
    if (project.client_name) {
      metaHTML += `<div class="project-meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg><span>Client: ${project.client_name}</span></div>`;
    }
    if (project.category) {
      metaHTML += `<div class="project-meta-item"><span class="badge badge-accent">${project.category}</span></div>`;
    }
    if (project.live_url) {
      metaHTML += `<div class="project-meta-item"><a href="${project.live_url}" target="_blank" rel="noopener" style="color:var(--color-accent);">Visit Live Site ↗</a></div>`;
    }
    metaEl.innerHTML = metaHTML;
  }

  // Timeline
  const timeline = project.project_timeline || DEMO_TIMELINE;
  if (timeline.length > 0) {
    const timelineSection = document.getElementById('project-timeline-section');
    const timelineEl = document.getElementById('project-timeline');
    if (timelineSection) timelineSection.style.display = 'block';
    if (timelineEl) {
      timelineEl.innerHTML = timeline.map(step => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          ${step.step_date ? `<div class="timeline-date">${new Date(step.step_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>` : ''}
          <h4 class="timeline-title">${step.step_title}</h4>
          <p class="timeline-description">${step.step_description || ''}</p>
          ${step.screenshot_url ? `<img class="timeline-image" src="${step.screenshot_url}" alt="${step.step_title}" loading="lazy" width="500" height="300">` : ''}
        </div>
      `).join('');
    }
  }

  // Gallery
  const media = project.project_media || [];
  if (media.length > 0) {
    const gallerySection = document.getElementById('project-gallery-section');
    const galleryEl = document.getElementById('project-gallery');
    if (gallerySection) gallerySection.style.display = 'block';
    if (galleryEl) {
      galleryEl.innerHTML = media.map(m => `
        <img class="project-gallery-image" src="${m.url}" alt="${m.caption || project.name}" loading="lazy" data-full="${m.url}" width="550" height="344">
      `).join('');
    }
  }

  // Tech stack
  const techStack = project.tech_stack || [];
  if (techStack.length > 0) {
    const techSection = document.getElementById('project-tech-stack-section');
    const techEl = document.getElementById('project-tech-stack');
    if (techSection) techSection.style.display = 'block';
    if (techEl) {
      techEl.innerHTML = techStack.map(t => `<span class="badge badge-accent">${t}</span>`).join('');
    }
  }

  // Features
  const features = project.features || [];
  if (features.length > 0) {
    const featSection = document.getElementById('project-features-section');
    const featEl = document.getElementById('project-features');
    if (featSection) featSection.style.display = 'block';
    if (featEl) {
      featEl.innerHTML = features.map(f => `<div class="pricing-feature"><span class="check">✓</span>${f}</div>`).join('');
    }
  }
}

/* ================================================================
   LIGHTBOX
   ================================================================ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.project-gallery-image, .timeline-image');
    if (img) {
      const src = img.dataset.full || img.src;
      lightboxImg.src = src;
      lightboxImg.alt = img.alt;
      
      // Detect if this is the mobile view screenshot
      if (src.includes('-mobile.png') || src.includes('mobil.png') || src.includes('mobile.')) {
        lightboxImg.classList.add('is-mobile-img');
      } else {
        lightboxImg.classList.remove('is-mobile-img');
      }
      
      lightbox.classList.add('is-open');
    }
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('is-open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('is-open');
  });
}

/* ================================================================
   NOT FOUND
   ================================================================ */
function showNotFound() {
  document.title = 'Project Not Found — DigitalFront';
  const titleEl = document.getElementById('project-title');
  const descEl = document.getElementById('project-description');
  const categoryEl = document.getElementById('project-category');

  if (categoryEl) categoryEl.textContent = '404';
  if (titleEl) titleEl.textContent = 'Project not found';
  if (descEl) {
    descEl.innerHTML = 'The project you\'re looking for doesn\'t exist. <a href="./portfolio.html" style="color:var(--color-accent);">Browse our portfolio →</a>';
  }
}
