/* ================================================================
   DIGITALFRONT — Portfolio Page JS
   Grid rendering, filtering, modal preview (desktop)
   ================================================================ */

import { getProjects, getCategories, getProjectBySlug } from './supabase.js';

// Demo fallback data (when Supabase isn't configured)
const DEMO_PROJECTS = [
  { id: '1', name: 'Trattoria della Nonna', slug: 'trattoria-della-nonna', short_description: 'Traditional Italian trattoria — landing page with menu and reservations.', category: 'restaurant', thumbnail_url: '/images/portfolio/trattoria-thumbnail.png', mobile_url: '/images/portfolio/trattoria-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'], features: ['Interactive HTML menu', 'Direct phone reservation', 'Google Maps embed', 'Bilingual DE/EN'], description: 'Complete landing page for a traditional Italian trattoria in Rösrath, Germany. Includes HTML menu, reservation system, photo gallery, and bilingual Schema markup (DE/EN).' },
  { id: '2', name: 'Sufrageria Urbană', slug: 'sufrageria-urbana', short_description: 'Premium urban bistro — editorial design, menu & reservations.', category: 'restaurant', thumbnail_url: '/images/portfolio/sufrageria-thumbnail.png', mobile_url: '/images/portfolio/sufrageria-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Google Fonts'], features: ['Premium editorial design', 'Immersive photo gallery', 'Group reservation form', 'Pet-friendly terrace'], description: 'Premium website for an urban bistro in Bucharest with reinterpreted Romanian cuisine. Editorial, airy design focused on weekend brunch and refined atmosphere.' },
  { id: '3', name: 'CrunchBox Burger', slug: 'crunchbox-burger', short_description: 'Premium fast-food — online ordering & delivery platforms.', category: 'restaurant', thumbnail_url: '/images/portfolio/crunchbox-thumbnail.png', mobile_url: '/images/portfolio/crunchbox-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Gloria Food'], features: ['Integrated online ordering', 'Glovo/Bolt/Tazz integration', 'Visual menu with prices', 'Energetic mobile-first design'], description: 'Energetic and appetizing site for a premium fast-food in Bucharest. Bold yellow-black contrast, optimized for quick orders and delivery platform integration.' },
  { id: '4', name: 'NordHaus Fenster & Türen', slug: 'nordhaus-fenster', short_description: 'Premium window installation — services & online quote.', category: 'business', thumbnail_url: '/images/portfolio/nordhaus-thumbnail.png', mobile_url: '/images/portfolio/nordhaus-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'], features: ['Quote request form', 'Before/after gallery', 'Local SEO Köln', 'Professional industrial design'], description: 'Professional website for a window and door installation company in Cologne, Germany. Service presentation, work gallery, quote form, and local SEO.' },
  { id: '5', name: 'BioCake', slug: 'biocake', short_description: 'Artisanal bio/vegan bakery — orders & presentation.', category: 'restaurant', thumbnail_url: '/images/portfolio/biocake-thumbnail.png', mobile_url: '/images/portfolio/biocake-mobile.png', tech_stack: ['HTML', 'CSS', 'JavaScript'], features: ['Allergen menu', 'Custom orders', 'Organic/natural design', 'Product gallery'], description: 'Landing page for an artisanal bio and vegan bakery in Bucharest. Warm, organic design focused on natural ingredients and custom orders.' }
];

let allProjects = [];
let activeFilter = 'all';

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  initFilters();
  initModal();
});

/* ================================================================
   LOAD PROJECTS
   ================================================================ */
async function loadProjects() {
  try {
    const projects = await getProjects();
    allProjects = projects && projects.length > 0 ? projects : DEMO_PROJECTS;
  } catch {
    allProjects = DEMO_PROJECTS;
  }
  renderGrid(allProjects);
}

/* ================================================================
   RENDER GRID
   ================================================================ */
function renderGrid(projects) {
  const grid = document.getElementById('portfolio-grid');
  const empty = document.getElementById('portfolio-empty');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  // Color palette for gradient placeholders
  const gradients = [
    'linear-gradient(135deg, #1a3a2f 0%, #0d1f1a 100%)',
    'linear-gradient(135deg, #2a1a3a 0%, #1a0d2f 100%)',
    'linear-gradient(135deg, #3a2a1a 0%, #2f1a0d 100%)',
    'linear-gradient(135deg, #1a2a3a 0%, #0d1a2f 100%)',
    'linear-gradient(135deg, #3a1a2a 0%, #2f0d1a 100%)',
  ];

  grid.innerHTML = projects.map((project, i) => {
    const thumbnailStyle = project.thumbnail_url
      ? `background-image: url('${project.thumbnail_url}'); background-size: cover; background-position: top;`
      : `background: ${gradients[i % gradients.length]}; display: flex; align-items: center; justify-content: center;`;

    const thumbnailContent = project.thumbnail_url
      ? ''
      : `<span style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); opacity: 0.3;">${project.name.charAt(0)}</span>`;

    return `
      <article class="portfolio-card reveal" data-slug="${project.slug}" data-category="${project.category}" id="project-card-${project.slug}">
        <div class="portfolio-card-image" style="aspect-ratio: 16/10; ${thumbnailStyle}" role="img" aria-label="${project.name} preview">
          ${thumbnailContent}
        </div>
        <div class="portfolio-card-body">
          <h3 class="portfolio-card-title">${project.name}</h3>
          <p class="portfolio-card-category">${project.category}</p>
          <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">${project.short_description || project.description?.substring(0, 100) + '…' || ''}</p>
        </div>
      </article>
    `;
  }).join('');

  // Re-init scroll reveal for new elements
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ================================================================
   FILTERS
   ================================================================ */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      activeFilter = filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Filter projects
      const filtered = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === filter);

      renderGrid(filtered);
    });
  });
}

/* ================================================================
   MODAL (Desktop ≥ 992px)
   ================================================================ */
function initModal() {
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = modal?.querySelector('.modal-close');
  const grid = document.getElementById('portfolio-grid');

  if (!modal || !grid) return;

  // Delegate click on portfolio cards
  grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.portfolio-card');
    if (!card) return;

    const slug = card.dataset.slug;

    // Mobile → navigate to full page
    if (window.innerWidth < 992) {
      window.location.href = `./portfolio-item.html?slug=${slug}`;
      return;
    }

    // Desktop → open modal
    openModal(slug);
  });

  // Close handlers
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  async function openModal(slug) {
    // Show modal immediately with loading state
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modalContent.innerHTML = '<div style="padding:var(--space-16);text-align:center;"><div class="skeleton skeleton-image" style="margin-bottom:var(--space-6);"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>';

    // Fetch project data
    let project;
    try {
      project = await getProjectBySlug(slug);
    } catch {
      project = null;
    }

    // Fallback to demo data
    if (!project) {
      project = DEMO_PROJECTS.find(p => p.slug === slug);
    }

    if (!project) {
      modalContent.innerHTML = '<div style="padding:var(--space-12);text-align:center;"><h3>Project not found</h3></div>';
      return;
    }

    // Render project in modal
    const techBadges = (project.tech_stack || []).map(t => `<span class="badge badge-accent">${t}</span>`).join('');
    const featuresList = (project.features || []).map(f => `<div class="pricing-feature"><span class="check">✓</span>${f}</div>`).join('');

    modalContent.innerHTML = `
      <div style="padding-top: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
          <span class="badge badge-accent">${project.category || 'Project'}</span>
          ${project.client_name ? `<span style="font-size:var(--text-sm);color:var(--color-text-muted);">Client: ${project.client_name}</span>` : ''}
        </div>
        <h2 style="margin-bottom: var(--space-4);">${project.name}</h2>

        ${project.mobile_url ? `
        <div class="view-toggle-bar">
          <button class="view-toggle-btn is-active" data-view="desktop" aria-label="Show desktop preview">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12 1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/><path d="M13 14H3a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2z"/></svg>
            Desktop
          </button>
          <button class="view-toggle-btn" data-view="mobile" aria-label="Show mobile preview">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/><path d="M8 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
            Mobile
          </button>
        </div>
        ` : ''}

        ${project.thumbnail_url ? `
        <div class="browser-mockup" id="modal-desktop-preview">
          <div class="browser-header">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-address-bar">${project.slug}.digitalfront.dev</div>
          </div>
          <div class="browser-viewport">
            <img src="${project.thumbnail_url}" alt="${project.name} desktop full screenshot" loading="lazy">
          </div>
        </div>
        ` : ''}

        ${project.mobile_url ? `
        <div class="phone-mockup" id="modal-mobile-preview" style="display: none;">
          <div class="phone-viewport">
            <img src="${project.mobile_url}" alt="${project.name} mobile full screenshot" loading="lazy">
          </div>
        </div>
        ` : ''}

        <p style="font-size: var(--text-lg); margin-bottom: var(--space-6);">${project.description || ''}</p>

        ${techBadges ? `
        <div style="margin-bottom: var(--space-6);">
          <h4 style="margin-bottom: var(--space-3);">Tech Stack</h4>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">${techBadges}</div>
        </div>` : ''}

        ${featuresList ? `
        <div style="margin-bottom: var(--space-6);">
          <h4 style="margin-bottom: var(--space-3);">Key Features</h4>
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">${featuresList}</div>
        </div>` : ''}

        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6);">
          <a href="./portfolio-item.html?slug=${project.slug}" class="btn btn-primary">View Full Project →</a>
          ${project.live_url ? `<a href="${project.live_url}" target="_blank" rel="noopener" class="btn btn-secondary">Visit Live Site ↗</a>` : ''}
        </div>
      </div>
    `;

    // Add view toggle event listeners
    if (project.mobile_url) {
      const toggleBtns = modalContent.querySelectorAll('.view-toggle-btn');
      const desktopPreview = modalContent.querySelector('#modal-desktop-preview');
      const mobilePreview = modalContent.querySelector('#modal-mobile-preview');

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

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }
}
