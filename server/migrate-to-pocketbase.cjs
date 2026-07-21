const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function migrate() {
  console.log('Logging in as PocketBase admin...');
  await pb.collection('_superusers').authWithPassword('admin@digitalfront.dev', 'admin123123');

  console.log('Creating collections...');

  // 1. Projects Collection
  try {
    await pb.collections.create({
      name: 'projects',
      type: 'base',
      listRule: '', // public read
      viewRule: '', // public read
      createRule: '@request.auth.id != ""', // admin create
      updateRule: '@request.auth.id != ""', // admin update
      deleteRule: '@request.auth.id != ""', // admin delete
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'client_name', type: 'text' },
        { name: 'live_url', type: 'text' },
        { name: 'thumbnail_url', type: 'text' },
        { name: 'mobile_url', type: 'text' },
        { name: 'status', type: 'select', values: ['draft', 'published'], maxSelect: 1 },
        { name: 'tech_stack', type: 'json' },
        { name: 'features', type: 'json' },
        { name: 'sort_order', type: 'number' }
      ]
    });
    console.log('Collection "projects" created.');
  } catch (err) {
    console.log('Collection "projects" error:', JSON.stringify(err.response || err.message));
  }

  // 2. Project Timeline Collection
  try {
    const projectsCol = await pb.collections.getOne('projects');
    await pb.collections.create({
      name: 'project_timeline',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'project', type: 'relation', required: true, collectionId: projectsCol.id, cascadeDelete: true, maxSelect: 1 },
        { name: 'step_title', type: 'text', required: true },
        { name: 'step_description', type: 'text' },
        { name: 'step_date', type: 'text' },
        { name: 'screenshot_url', type: 'text' },
        { name: 'sort_order', type: 'number' }
      ]
    });
    console.log('Collection "project_timeline" created.');
  } catch (err) {
    console.log('Collection "project_timeline" error:', JSON.stringify(err.response || err.message));
  }

  // 3. Project Media Collection
  try {
    const projectsCol = await pb.collections.getOne('projects');
    await pb.collections.create({
      name: 'project_media',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'project', type: 'relation', required: true, collectionId: projectsCol.id, cascadeDelete: true, maxSelect: 1 },
        { name: 'url', type: 'text', required: true },
        { name: 'caption', type: 'text' },
        { name: 'media_type', type: 'text' },
        { name: 'sort_order', type: 'number' }
      ]
    });
    console.log('Collection "project_media" created.');
  } catch (err) {
    console.log('Collection "project_media" error:', JSON.stringify(err.response || err.message));
  }

  // 4. Contact Submissions Collection
  try {
    await pb.collections.create({
      name: 'contact_submissions',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'business_type', type: 'text' },
        { name: 'budget_range', type: 'text' },
        { name: 'message', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['new', 'contacted', 'archived'], maxSelect: 1 }
      ]
    });
    console.log('Collection "contact_submissions" created.');
  } catch (err) {
    console.log('Collection "contact_submissions" error:', JSON.stringify(err.response || err.message));
  }

  // Populate Seed Data if projects is empty
  const existingProjects = await pb.collection('projects').getList(1, 1);
  if (existingProjects.totalItems === 0) {
    console.log('Seeding initial projects to PocketBase...');
    
    const DEMO_PROJECTS = [
      {
        name: 'Trattoria della Nonna',
        slug: 'trattoria-della-nonna',
        short_description: 'Traditional Italian trattoria — landing page with menu and reservations.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/trattoria-thumbnail.png',
        mobile_url: '/images/portfolio/trattoria-mobile.png',
        tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'],
        features: ['Interactive HTML menu', 'Direct phone reservation', 'Google Maps embed', 'Bilingual DE/EN'],
        description: 'Complete landing page for a traditional Italian trattoria in Rösrath, Germany. Includes HTML menu, reservation system, photo gallery, and bilingual Schema markup (DE/EN).',
        status: 'published',
        sort_order: 1
      },
      {
        name: 'Sufrageria Urbană',
        slug: 'sufrageria-urbana',
        short_description: 'Premium urban bistro — editorial design, menu & reservations.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/sufrageria-thumbnail.png',
        mobile_url: '/images/portfolio/sufrageria-mobile.png',
        tech_stack: ['HTML', 'CSS', 'JavaScript', 'Google Fonts'],
        features: ['Premium editorial design', 'Immersive photo gallery', 'Group reservation form', 'Pet-friendly terrace'],
        description: 'Premium website for an urban bistro in Bucharest with reinterpreted Romanian cuisine. Editorial, airy design focused on weekend brunch and refined atmosphere.',
        status: 'published',
        sort_order: 2
      },
      {
        name: 'CrunchBox Burger',
        slug: 'crunchbox-burger',
        short_description: 'Premium fast-food — online ordering & delivery platforms.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/crunchbox-thumbnail.png',
        mobile_url: '/images/portfolio/crunchbox-mobile.png',
        tech_stack: ['HTML', 'CSS', 'JavaScript', 'Gloria Food'],
        features: ['Integrated online ordering', 'Glovo/Bolt/Tazz integration', 'Visual menu with prices', 'Energetic mobile-first design'],
        description: 'Energetic and appetizing site for a premium fast-food in Bucharest. Bold yellow-black contrast, optimized for quick orders and delivery platform integration.',
        status: 'published',
        sort_order: 3
      },
      {
        name: 'NordHaus Fenster & Türen',
        slug: 'nordhaus-fenster',
        short_description: 'Premium window installation — services & online quote.',
        category: 'business',
        thumbnail_url: '/images/portfolio/nordhaus-thumbnail.png',
        mobile_url: '/images/portfolio/nordhaus-mobile.png',
        tech_stack: ['HTML', 'CSS', 'JavaScript', 'Schema.org'],
        features: ['Quote request form', 'Before/after gallery', 'Local SEO Köln', 'Professional industrial design'],
        description: 'Professional website for a window and door installation company in Cologne, Germany. Service presentation, work gallery, quote form, and local SEO.',
        status: 'published',
        sort_order: 4
      },
      {
        name: 'BioCake',
        slug: 'biocake',
        short_description: 'Artisanal bio/vegan bakery — orders & presentation.',
        category: 'restaurant',
        thumbnail_url: '/images/portfolio/biocake-thumbnail.png',
        mobile_url: '/images/portfolio/biocake-mobile.png',
        tech_stack: ['HTML', 'CSS', 'JavaScript'],
        features: ['Allergen menu', 'Custom orders', 'Organic/natural design', 'Product gallery'],
        description: 'Landing page for an artisanal bio and vegan bakery in Bucharest. Warm, organic design focused on natural ingredients and custom orders.',
        status: 'published',
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
      { name: 'Mihai Popescu', email: 'mihai.popescu@gmail.com', phone: '+40722111222', business_type: 'Restaurant', budget_range: 'Business €550', message: 'Doresc un site web cu rezervări pentru bistro-ul meu din Brașov. Meniul să fie simplu de editat.', status: 'new' },
      { name: 'Elena Radu', email: 'elena@beautydecor.ro', phone: '+40733444555', business_type: 'Service Business', budget_range: 'Starter €350', message: 'Vreau un landing page de prezentare servicii cosmetică și tarife.', status: 'new' },
      { name: 'Andrei Vasilescu', email: 'contact@nordicwood.de', phone: '+49176112233', business_type: 'Other', budget_range: 'Premium €850', message: 'Caut dezvoltarea unui site de tâmplărie premium tradus în germană și română.', status: 'contacted' }
    ];

    for (const p of DEMO_PROJECTS) {
      const createdRecord = await pb.collection('projects').create(p);
      
      // Add timeline items for project
      for (let i = 0; i < DEMO_TIMELINE.length; i++) {
        const step = DEMO_TIMELINE[i];
        await pb.collection('project_timeline').create({
          project: createdRecord.id,
          step_title: step.step_title,
          step_description: step.step_description,
          step_date: step.step_date,
          sort_order: i
        });
      }

      // Add media gallery items
      if (p.thumbnail_url) {
        await pb.collection('project_media').create({
          project: createdRecord.id,
          url: p.thumbnail_url,
          caption: `${p.name} Desktop UI`,
          media_type: 'image',
          sort_order: 1
        });
      }
      if (p.mobile_url) {
        await pb.collection('project_media').create({
          project: createdRecord.id,
          url: p.mobile_url,
          caption: `${p.name} Mobile UI`,
          media_type: 'image',
          sort_order: 2
        });
      }
    }

    for (const l of DEMO_LEADS) {
      await pb.collection('contact_submissions').create(l);
    }

    console.log('Seeding to PocketBase complete!');
  } else {
    console.log('PocketBase projects collection already contains records.');
  }
}

migrate().catch(console.error);
