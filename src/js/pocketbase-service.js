/* ================================================================
   DIGITALFRONT — PocketBase Unified Service SDK
   Projects, Leads, Clients & Care Plan Subscriptions
   ================================================================ */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = typeof window !== 'undefined' && window.env?.POCKETBASE_URL
  ? window.env.POCKETBASE_URL
  : 'http://127.0.0.1:8090';

const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation for concurrent requests per PocketBase best practices
pb.autoCancellation(false);

const LOCAL_STORAGE_KEY_PROJECTS = 'df_cache_projects';
const LOCAL_STORAGE_KEY_LEADS = 'df_cache_leads';
const LOCAL_STORAGE_KEY_CLIENTS = 'df_cache_clients';
const LOCAL_STORAGE_KEY_SUBSCRIPTIONS = 'df_cache_subscriptions';

// Initial Seed Fallback Data
const INITIAL_PROJECTS = [
  {
    id: 'p-1',
    name: 'Trattoria della Nonna',
    slug: 'trattoria-della-nonna',
    short_description: 'Traditional Italian trattoria — landing page with menu and reservations.',
    category: 'restaurant',
    client_name: 'Trattoria della Nonna SRL',
    live_url: 'https://trattoria.de',
    thumbnail_url: '/images/portfolio/trattoria-thumbnail.png',
    mobile_url: '/images/portfolio/trattoria-mobile.png',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'],
    features: ['Interactive HTML menu', 'Direct phone reservation', 'Google Maps embed', 'Bilingual DE/EN'],
    description: 'Complete landing page for a traditional Italian trattoria in Rösrath, Germany. Includes HTML menu, reservation system, photo gallery, and bilingual Schema markup (DE/EN).',
    status: 'published',
    sort_order: 1,
    created: '2026-06-01'
  },
  {
    id: 'p-2',
    name: 'Sufrageria Urbană',
    slug: 'sufrageria-urbana',
    short_description: 'Premium urban bistro — editorial design, menu & reservations.',
    category: 'restaurant',
    client_name: 'Sufrageria SRL',
    live_url: 'https://sufrageria.ro',
    thumbnail_url: '/images/portfolio/sufrageria-thumbnail.png',
    mobile_url: '/images/portfolio/sufrageria-mobile.png',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Google Fonts'],
    features: ['Premium editorial design', 'Immersive photo gallery', 'Group reservation form', 'Pet-friendly terrace'],
    description: 'Premium website for an urban bistro in Bucharest with reinterpreted Romanian cuisine. Editorial, airy design focused on weekend brunch and refined atmosphere.',
    status: 'published',
    sort_order: 2,
    created: '2026-06-05'
  },
  {
    id: 'p-3',
    name: 'CrunchBox Burger',
    slug: 'crunchbox-burger',
    short_description: 'Premium fast-food — online ordering & delivery platforms.',
    category: 'restaurant',
    client_name: 'CrunchBox SRL',
    live_url: 'https://crunchbox.ro',
    thumbnail_url: '/images/portfolio/crunchbox-thumbnail.png',
    mobile_url: '/images/portfolio/crunchbox-mobile.png',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Gloria Food'],
    features: ['Integrated online ordering', 'Glovo/Bolt/Tazz integration', 'Visual menu with prices', 'Energetic mobile-first design'],
    description: 'Energetic and appetizing site for a premium fast-food in Bucharest. Bold yellow-black contrast, optimized for quick orders and delivery platform integration.',
    status: 'published',
    sort_order: 3,
    created: '2026-06-10'
  },
  {
    id: 'p-4',
    name: 'NordHaus Fenster & Türen',
    slug: 'nordhaus-fenster',
    short_description: 'Premium window installation — services & online quote.',
    category: 'business',
    client_name: 'NordHaus GmbH',
    live_url: 'https://nordhaus-fenster.de',
    thumbnail_url: '/images/portfolio/nordhaus-thumbnail.png',
    mobile_url: '/images/portfolio/nordhaus-mobile.png',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'],
    features: ['Quote request form', 'Before/after gallery', 'Local SEO Köln', 'Professional industrial design'],
    description: 'Professional website for a window and door installation company in Cologne, Germany. Service presentation, work gallery, quote form, and local SEO.',
    status: 'published',
    sort_order: 4,
    created: '2026-06-15'
  },
  {
    id: 'p-5',
    name: 'BioCake',
    slug: 'biocake',
    short_description: 'Artisanal bio/vegan bakery — orders & presentation.',
    category: 'restaurant',
    client_name: 'BioCake SRL',
    live_url: 'https://biocake.ro',
    thumbnail_url: '/images/portfolio/biocake-thumbnail.png',
    mobile_url: '/images/portfolio/biocake-mobile.png',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    features: ['Allergen menu', 'Custom orders', 'Organic/natural design', 'Product gallery'],
    description: 'Landing page for an artisanal bio and vegan bakery in Bucharest. Warm, organic design focused on natural ingredients and custom orders.',
    status: 'published',
    sort_order: 5,
    created: '2026-06-20'
  }
];

const INITIAL_LEADS = [
  { id: 'l-1', name: 'Mihai Popescu', email: 'mihai.popescu@gmail.com', phone: '+40722111222', business_type: 'Restaurant', budget_range: 'Business €550', message: 'Doresc un site web cu rezervări pentru bistro-ul meu din Brașov.', status: 'new', created: '2026-07-01' },
  { id: 'l-2', name: 'Elena Radu', email: 'elena@beautydecor.ro', phone: '+40733444555', business_type: 'Service Business', budget_range: 'Starter €350', message: 'Vreau un landing page de prezentare servicii cosmetică.', status: 'new', created: '2026-07-05' },
  { id: 'l-3', name: 'Andrei Vasilescu', email: 'contact@nordicwood.de', phone: '+49176112233', business_type: 'Other', budget_range: 'Premium €850', message: 'Caut dezvoltarea unui site de tâmplărie premium.', status: 'contacted', created: '2026-07-10' }
];

const INITIAL_CLIENTS = [
  { id: 'c-1', company_name: 'Trattoria della Nonna SRL', contact_person: 'Giovanni Rossi', email: 'contact@trattorianonna.ro', phone: '+40 722 111 222', city: 'București', status: 'active', created: '2026-06-01' },
  { id: 'c-2', company_name: 'Sufrageria Urbană SRL', contact_person: 'Matei Ionescu', email: 'contact@sufrageria.ro', phone: '+40 721 999 888', city: 'București', status: 'active', created: '2026-06-05' },
  { id: 'c-3', company_name: 'NordHaus Fenster GmbH', contact_person: 'Hans Weber', email: 'info@nordhaus-fenster.de', phone: '+49 30 123456', city: 'Berlin', status: 'active', created: '2026-06-15' }
];

const INITIAL_SUBSCRIPTIONS = [
  { id: 's-1', client: 'c-1', client_name: 'Trattoria della Nonna SRL', plan_name: 'Active €55/mo', monthly_price: 55, billing_status: 'active', next_billing_date: '2026-08-01', notes: 'Hosting + lunar update 2h + SEO check' },
  { id: 's-2', client: 'c-2', client_name: 'Sufrageria Urbană SRL', plan_name: 'Growth €120/mo', monthly_price: 120, billing_status: 'active', next_billing_date: '2026-08-05', notes: 'Priority support & monthly SEO report.' },
  { id: 's-3', client: 'c-3', client_name: 'NordHaus Fenster GmbH', plan_name: 'Growth €120/mo', monthly_price: 120, billing_status: 'active', next_billing_date: '2026-08-01', notes: 'Care plan premium: redesign modular, mentenanță zilnică' }
];

function getStored(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export { pb };

/* ================================================================
   PROJECTS CRUD
   ================================================================ */

export async function fetchProjects() {
  try {
    const records = await pb.collection('projects').getFullList({ sort: 'sort_order,-created' });
    if (records.length) {
      setStored(LOCAL_STORAGE_KEY_PROJECTS, records);
      return records;
    }
  } catch (err) {
    console.warn('PocketBase projects fetch notice, using fallback cache:', err);
  }
  return getStored(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
}

export async function fetchProjectBySlug(slug) {
  try {
    const record = await pb.collection('projects').getFirstListItem(`slug="${slug}"`);
    if (record) {
      try {
        const timeline = await pb.collection('project_timeline').getFullList({ filter: `project="${record.id}"`, sort: 'sort_order' });
        record.project_timeline = timeline;
      } catch (e) {}
      try {
        const media = await pb.collection('project_media').getFullList({ filter: `project="${record.id}"`, sort: 'sort_order' });
        record.project_media = media;
      } catch (e) {}
      return record;
    }
  } catch (err) {
    console.warn('PocketBase fetchProjectBySlug notice, using fallback cache:', err);
  }
  const projects = getStored(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  return projects.find(p => p.slug === slug) || null;
}

export async function fetchProjectById(id) {
  try {
    const record = await pb.collection('projects').getOne(id);
    if (record) {
      try {
        const timeline = await pb.collection('project_timeline').getFullList({ filter: `project="${id}"`, sort: 'sort_order' });
        record.project_timeline = timeline;
      } catch (e) {}
      try {
        const media = await pb.collection('project_media').getFullList({ filter: `project="${id}"`, sort: 'sort_order' });
        record.project_media = media;
      } catch (e) {}
      return record;
    }
  } catch (err) {
    console.warn('PocketBase fetchProjectById notice, using fallback cache:', err);
  }
  const projects = getStored(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  const found = projects.find(p => p.id === id || p.slug === id);
  if (found) {
    found.project_timeline = found.project_timeline || [
      { step_title: 'Client Brief', step_description: 'Aligning on goals and vision.', step_date: '2026-06-01' },
      { step_title: 'Design Concept', step_description: 'Creating typography and layout.', step_date: '2026-06-05' },
      { step_title: 'Development', step_description: 'Building responsive HTML/CSS/JS.', step_date: '2026-06-10' },
      { step_title: 'Launch & QA', step_description: 'Testing responsivity and performance.', step_date: '2026-06-15' }
    ];
  }
  return found || null;
}

export async function saveProject(projectData, id = null) {
  const targetId = projectData.id || id;
  try {
    let record;
    if (targetId) {
      record = await pb.collection('projects').update(targetId, projectData);
    } else {
      record = await pb.collection('projects').create(projectData);
    }
    await fetchProjects();
    return record;
  } catch (err) {
    console.warn('PocketBase save project fallback:', err);
    let projects = getStored(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
    if (targetId) {
      projects = projects.map(p => p.id === targetId ? { ...p, ...projectData } : p);
    } else {
      const newProj = { id: 'p-' + Date.now(), ...projectData, created: new Date().toISOString() };
      projects.unshift(newProj);
    }
    setStored(LOCAL_STORAGE_KEY_PROJECTS, projects);
    return { id: targetId || 'p-' + Date.now(), ...projectData };
  }
}

export async function deleteProject(id) {
  try {
    await pb.collection('projects').delete(id);
  } catch (err) {
    console.warn('PocketBase delete project fallback:', err);
  }
  let projects = getStored(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  projects = projects.filter(p => p.id !== id);
  setStored(LOCAL_STORAGE_KEY_PROJECTS, projects);
}

/* ================================================================
   LEADS CRUD
   ================================================================ */

export async function fetchLeads() {
  try {
    const records = await pb.collection('contact_submissions').getFullList({ sort: '-created' });
    if (records.length) {
      setStored(LOCAL_STORAGE_KEY_LEADS, records);
      return records;
    }
  } catch (err) {
    console.warn('PocketBase leads fetch notice, using fallback cache:', err);
  }
  return getStored(LOCAL_STORAGE_KEY_LEADS, INITIAL_LEADS);
}

export async function updateLeadStatus(id, status) {
  try {
    await pb.collection('contact_submissions').update(id, { status });
  } catch (err) {
    console.warn('PocketBase lead update fallback:', err);
  }
  let leads = getStored(LOCAL_STORAGE_KEY_LEADS, INITIAL_LEADS);
  leads = leads.map(l => l.id === id ? { ...l, status } : l);
  setStored(LOCAL_STORAGE_KEY_LEADS, leads);
}

export async function deleteLead(id) {
  try {
    await pb.collection('contact_submissions').delete(id);
  } catch (err) {
    console.warn('PocketBase lead delete fallback:', err);
  }
  let leads = getStored(LOCAL_STORAGE_KEY_LEADS, INITIAL_LEADS);
  leads = leads.filter(l => l.id !== id);
  setStored(LOCAL_STORAGE_KEY_LEADS, leads);
}

/* ================================================================
   CLIENTS CRUD
   ================================================================ */

export async function fetchClients() {
  try {
    const records = await pb.collection('clients').getFullList({ sort: '-created' });
    if (records.length) {
      setStored(LOCAL_STORAGE_KEY_CLIENTS, records);
      return records;
    }
  } catch (err) {
    console.warn('PocketBase clients fetch notice, using fallback cache:', err);
  }
  return getStored(LOCAL_STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
}

export async function saveClient(clientData, id = null) {
  const targetId = clientData.id || id;
  try {
    let record;
    if (targetId) {
      record = await pb.collection('clients').update(targetId, clientData);
    } else {
      record = await pb.collection('clients').create(clientData);
    }
    await fetchClients();
    return record;
  } catch (err) {
    console.warn('PocketBase save client fallback:', err);
    let clients = getStored(LOCAL_STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
    if (targetId) {
      clients = clients.map(c => c.id === targetId ? { ...c, ...clientData } : c);
    } else {
      const newClient = { id: 'c-' + Date.now(), ...clientData, created: new Date().toISOString() };
      clients.unshift(newClient);
    }
    setStored(LOCAL_STORAGE_KEY_CLIENTS, clients);
    return { id: targetId || 'c-' + Date.now(), ...clientData };
  }
}

export async function deleteClient(id) {
  try {
    await pb.collection('clients').delete(id);
  } catch (err) {
    console.warn('PocketBase delete client fallback:', err);
  }
  let clients = getStored(LOCAL_STORAGE_KEY_CLIENTS, INITIAL_CLIENTS);
  clients = clients.filter(c => c.id !== id);
  setStored(LOCAL_STORAGE_KEY_CLIENTS, clients);
}

/* ================================================================
   SUBSCRIPTIONS CRUD
   ================================================================ */

export async function fetchSubscriptions() {
  try {
    const records = await pb.collection('subscriptions').getFullList({ sort: '-created', expand: 'client' });
    if (records.length) {
      setStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, records);
      return records;
    }
  } catch (err) {
    console.warn('PocketBase subscriptions fetch notice, using fallback cache:', err);
  }
  return getStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
}

export async function saveSubscription(subData, id = null) {
  const targetId = subData.id || id;
  try {
    let record;
    if (targetId) {
      record = await pb.collection('subscriptions').update(targetId, subData);
    } else {
      record = await pb.collection('subscriptions').create(subData);
    }
    await fetchSubscriptions();
    return record;
  } catch (err) {
    console.warn('PocketBase save subscription fallback:', err);
    let subs = getStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    if (targetId) {
      subs = subs.map(s => s.id === targetId ? { ...s, ...subData } : s);
    } else {
      const newSub = { id: 's-' + Date.now(), ...subData, created: new Date().toISOString() };
      subs.unshift(newSub);
    }
    setStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, subs);
    return { id: targetId || 's-' + Date.now(), ...subData };
  }
}

export async function deleteSubscription(id) {
  try {
    await pb.collection('subscriptions').delete(id);
  } catch (err) {
    console.warn('PocketBase delete subscription fallback:', err);
  }
  let subs = getStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  subs = subs.filter(s => s.id !== id);
  setStored(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, subs);
}
