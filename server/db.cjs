const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../digitalfront.db');

async function getDbConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

async function initDb() {
  console.log(`Initializing SQLite database at: ${dbPath}`);
  const db = await getDbConnection();

  // Enable foreign keys
  await db.get('PRAGMA foreign_keys = ON');

  // Create projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      short_description TEXT,
      category TEXT,
      client_name TEXT,
      live_url TEXT,
      thumbnail_url TEXT,
      mobile_url TEXT,
      status TEXT DEFAULT 'draft',
      tech_stack TEXT, -- JSON array
      features TEXT, -- JSON array
      created_at TEXT,
      published_at TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // Create project_timeline table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS project_timeline (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      step_title TEXT NOT NULL,
      step_description TEXT,
      step_date TEXT,
      screenshot_url TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create project_media table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS project_media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      media_type TEXT DEFAULT 'image',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create contact_submissions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      business_type TEXT,
      budget_range TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT
    )
  `);

  // Check if database is empty and seed if needed
  const projectCount = await db.get('SELECT COUNT(*) as count FROM projects');
  if (projectCount.count === 0) {
    console.log('Seeding initial database projects and timeline...');
    
    const DEMO_PROJECTS = [
      {
        id: '1',
        name: 'Trattoria della Nonna',
        slug: 'trattoria-della-nonna',
        short_description: 'Traditional Italian trattoria — landing page with menu and reservations.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/trattoria-thumbnail.png',
        mobile_url: '/images/portfolio/trattoria-mobile.png',
        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Schema.org']),
        features: JSON.stringify(['Interactive HTML menu', 'Direct phone reservation', 'Google Maps embed', 'Bilingual DE/EN']),
        description: 'Complete landing page for a traditional Italian trattoria in Rösrath, Germany. Includes HTML menu, reservation system, photo gallery, and bilingual Schema markup (DE/EN).',
        status: 'published',
        created_at: new Date('2026-06-05T02:30:00Z').toISOString(),
        published_at: new Date('2026-06-05T02:30:00Z').toISOString(),
        sort_order: 1
      },
      {
        id: '2',
        name: 'Sufrageria Urbană',
        slug: 'sufrageria-urbana',
        short_description: 'Premium urban bistro — editorial design, menu & reservations.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/sufrageria-thumbnail.png',
        mobile_url: '/images/portfolio/sufrageria-mobile.png',
        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Google Fonts']),
        features: JSON.stringify(['Premium editorial design', 'Immersive photo gallery', 'Group reservation form', 'Pet-friendly terrace']),
        description: 'Premium website for an urban bistro in Bucharest with reinterpreted Romanian cuisine. Editorial, airy design focused on weekend brunch and refined atmosphere.',
        status: 'published',
        created_at: new Date('2026-06-06T12:00:00Z').toISOString(),
        published_at: new Date('2026-06-06T12:00:00Z').toISOString(),
        sort_order: 2
      },
      {
        id: '3',
        name: 'CrunchBox Burger',
        slug: 'crunchbox-burger',
        short_description: 'Premium fast-food — online ordering & delivery platforms.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/crunchbox-thumbnail.png',
        mobile_url: '/images/portfolio/crunchbox-mobile.png',
        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Gloria Food']),
        features: JSON.stringify(['Integrated online ordering', 'Glovo/Bolt/Tazz integration', 'Visual menu with prices', 'Energetic mobile-first design']),
        description: 'Energetic and appetizing site for a premium fast-food in Bucharest. Bold yellow-black contrast, optimized for quick orders and delivery platform integration.',
        status: 'published',
        created_at: new Date('2026-06-08T15:00:00Z').toISOString(),
        published_at: new Date('2026-06-08T15:00:00Z').toISOString(),
        sort_order: 3
      },
      {
        id: '4',
        name: 'NordHaus Fenster & Türen',
        slug: 'nordhaus-fenster',
        short_description: 'Premium window installation — services & online quote.',
        category: 'business',
        thumbnail_url: '/images/portfolio/nordhaus-thumbnail.png',
        mobile_url: '/images/portfolio/nordhaus-mobile.png',
        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Schema.org']),
        features: JSON.stringify(['Quote request form', 'Before/after gallery', 'Local SEO Köln', 'Professional industrial design']),
        description: 'Professional website for a window and door installation company in Cologne, Germany. Service presentation, work gallery, quote form, and local SEO.',
        status: 'published',
        created_at: new Date('2026-06-16T23:00:00Z').toISOString(),
        published_at: new Date('2026-06-16T23:00:00Z').toISOString(),
        sort_order: 4
      },
      {
        id: '5',
        name: 'BioCake',
        slug: 'biocake',
        short_description: 'Artisanal bio/vegan bakery — orders & presentation.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/biocake-thumbnail.png',
        mobile_url: '/images/portfolio/biocake-mobile.png',
        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript']),
        features: JSON.stringify(['Allergen menu', 'Custom orders', 'Organic/natural design', 'Product gallery']),
        description: 'Landing page for an artisanal bio and vegan bakery in Bucharest. Warm, organic design focused on natural ingredients and custom orders.',
        status: 'published',
        created_at: new Date('2026-06-20T10:00:00Z').toISOString(),
        published_at: new Date('2026-06-20T10:00:00Z').toISOString(),
        sort_order: 5
      }
    ];

    const DEMO_TIMELINE = [
      { step_title: 'Client Brief', step_description: 'Aligning on goals, target audience, and site vision.', step_date: '2026-06-01' },
      { step_title: 'Design Concept', step_description: 'Creating styling, font choices, color scheme, and page layouts.', step_date: '2026-06-05' },
      { step_title: 'Development', step_description: 'Building custom CSS/HTML/JS structure, optimizing code, and implementing dynamic components.', step_date: '2026-06-10' },
      { step_title: 'Launch & QA', step_description: 'Testing responsivity, performance audit, SEO setup, and going live.', step_date: '2026-06-15' }
    ];

    const DEMO_LEADS = [
      { id: '1', name: 'Mihai Popescu', email: 'mihai.popescu@gmail.com', phone: '+40722111222', business_type: 'Restaurant', budget_range: 'Business €550', message: 'Doresc un site web cu rezervări pentru bistro-ul meu din Brașov. Meniul să fie simplu de editat.', status: 'new', created_at: new Date('2026-07-12T14:30:00Z').toISOString() },
      { id: '2', name: 'Elena Radu', email: 'elena@beautydecor.ro', phone: '+40733444555', business_type: 'Service Business', budget_range: 'Starter €350', message: 'Vreau un landing page de prezentare servicii cosmetică și tarife.', status: 'new', created_at: new Date('2026-07-12T10:15:00Z').toISOString() },
      { id: '3', name: 'Andrei Vasilescu', email: 'contact@nordicwood.de', phone: '+49176112233', business_type: 'Other', budget_range: 'Premium €850', message: 'Caut dezvoltarea unui site de tâmplărie premium tradus în germană și română.', status: 'contacted', created_at: new Date('2026-07-10T18:00:00Z').toISOString() }
    ];

    // Insert projects
    for (const p of DEMO_PROJECTS) {
      await db.run(
        `INSERT INTO projects (id, name, slug, description, short_description, category, thumbnail_url, mobile_url, status, tech_stack, features, created_at, published_at, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.slug, p.description, p.short_description, p.category, p.thumbnail_url, p.mobile_url, p.status, p.tech_stack, p.features, p.created_at, p.published_at, p.sort_order]
      );

      // Insert timeline steps for each project
      for (let i = 0; i < DEMO_TIMELINE.length; i++) {
        const step = DEMO_TIMELINE[i];
        const stepId = `${p.id}_t_${i}`;
        await db.run(
          `INSERT INTO project_timeline (id, project_id, step_title, step_description, step_date, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [stepId, p.id, step.step_title, step.step_description, step.step_date, i]
        );
      }

      // Insert gallery images (desktop + mobile as media entries)
      if (p.thumbnail_url) {
        await db.run(
          `INSERT INTO project_media (id, project_id, url, caption, media_type, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`${p.id}_m_1`, p.id, p.thumbnail_url, `${p.name} Desktop UI`, 'image', 1]
        );
      }
      if (p.mobile_url) {
        await db.run(
          `INSERT INTO project_media (id, project_id, url, caption, media_type, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`${p.id}_m_2`, p.id, p.mobile_url, `${p.name} Mobile UI`, 'image', 2]
        );
      }
    }

    // Insert leads
    for (const l of DEMO_LEADS) {
      await db.run(
        `INSERT INTO contact_submissions (id, name, email, phone, business_type, budget_range, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.id, l.name, l.email, l.phone, l.business_type, l.budget_range, l.message, l.status, l.created_at]
      );
    }

    console.log('Seeding complete.');
  }

  await db.close();
}

module.exports = {
  getDbConnection,
  initDb
};
