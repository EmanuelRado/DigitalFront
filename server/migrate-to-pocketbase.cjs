const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function migrate() {
  console.log('Logging in as PocketBase admin...');
  await pb.collection('_superusers').authWithPassword('admin@digitalfront.dev', 'admin123123');

  console.log('Verifying & updating collections with PocketBase Best Practices (indexes, rules, field types)...');

  // 1. Projects Collection
  try {
    const projectsCol = await pb.collections.getOne('projects');
    projectsCol.indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug)',
      'CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category)',
      'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status)'
    ];
    await pb.collections.update(projectsCol.id, projectsCol);
    console.log('Collection "projects" updated with indexes.');
  } catch (err) {
    console.log('Collection "projects" notice:', err.message);
  }

  // 2. Project Timeline Collection
  try {
    const timelineCol = await pb.collections.getOne('project_timeline');
    timelineCol.indexes = [
      'CREATE INDEX IF NOT EXISTS idx_project_timeline_project ON project_timeline (project)'
    ];
    await pb.collections.update(timelineCol.id, timelineCol);
    console.log('Collection "project_timeline" updated with index.');
  } catch (err) {
    console.log('Collection "project_timeline" notice:', err.message);
  }

  // 3. Project Media Collection
  try {
    const mediaCol = await pb.collections.getOne('project_media');
    mediaCol.indexes = [
      'CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media (project)'
    ];
    await pb.collections.update(mediaCol.id, mediaCol);
    console.log('Collection "project_media" updated with index.');
  } catch (err) {
    console.log('Collection "project_media" notice:', err.message);
  }

  // 4. Contact Submissions Collection
  try {
    const contactCol = await pb.collections.getOne('contact_submissions');
    contactCol.indexes = [
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions (status)'
    ];
    await pb.collections.update(contactCol.id, contactCol);
    console.log('Collection "contact_submissions" updated with index.');
  } catch (err) {
    console.log('Collection "contact_submissions" notice:', err.message);
  }

  // 5. Clients Collection
  let clientsCol;
  try {
    clientsCol = await pb.collections.getOne('clients');
    console.log('Collection "clients" already exists, ensuring schema...');
  } catch (err) {
    console.log('Creating collection "clients"...');
    clientsCol = await pb.collections.create({
      name: 'clients',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'company_name', type: 'text', required: true },
        { name: 'contact_person', type: 'text', required: false },
        { name: 'email', type: 'text', required: true },
        { name: 'phone', type: 'text', required: false },
        { name: 'city', type: 'text', required: false },
        { name: 'status', type: 'select', required: false, values: ['active', 'inactive'], maxSelect: 1 }
      ],
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status)',
        'CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email)'
      ]
    });
    console.log('Collection "clients" created successfully.');
  }

  // 6. Subscriptions Collection
  let subsCol;
  try {
    subsCol = await pb.collections.getOne('subscriptions');
    console.log('Collection "subscriptions" already exists, ensuring schema...');
  } catch (err) {
    console.log('Creating collection "subscriptions"...');
    subsCol = await pb.collections.create({
      name: 'subscriptions',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'client', type: 'relation', required: false, collectionId: clientsCol.id, maxSelect: 1, cascadeDelete: false },
        { name: 'plan_name', type: 'select', required: false, values: ['Essential €25/mo', 'Active €55/mo', 'Growth €120/mo'], maxSelect: 1 },
        { name: 'monthly_price', type: 'number', required: false },
        { name: 'billing_status', type: 'select', required: false, values: ['active', 'overdue', 'cancelled'], maxSelect: 1 },
        { name: 'next_billing_date', type: 'text', required: false },
        { name: 'notes', type: 'text', required: false }
      ],
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions (client)',
        'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (billing_status)'
      ]
    });
    console.log('Collection "subscriptions" created successfully.');
  }

  // Seeding Sample Clients & Subscriptions
  console.log('Seeding sample clients and subscriptions if missing...');
  const sampleClients = [
    {
      company_name: 'Trattoria della Nonna SRL',
      contact_person: 'Giovanni Rossi',
      email: 'contact@trattorianonna.ro',
      phone: '+40 722 111 222',
      city: 'București',
      status: 'active'
    },
    {
      company_name: 'NordHaus Fenster GmbH',
      contact_person: 'Hans Weber',
      email: 'info@nordhaus-fenster.de',
      phone: '+49 30 123456',
      city: 'Berlin',
      status: 'active'
    }
  ];

  const createdClients = [];
  for (const clientData of sampleClients) {
    let existing = null;
    try {
      existing = await pb.collection('clients').getFirstListItem(`email="${clientData.email}"`);
    } catch (e) {}

    if (!existing) {
      const created = await pb.collection('clients').create(clientData);
      console.log(`Created sample client: ${created.company_name} (${created.id})`);
      createdClients.push(created);
    } else {
      console.log(`Sample client already exists: ${existing.company_name} (${existing.id})`);
      createdClients.push(existing);
    }
  }

  const sampleSubs = [
    {
      client: createdClients[0].id,
      plan_name: 'Active €55/mo',
      monthly_price: 55,
      billing_status: 'active',
      next_billing_date: '2026-08-01',
      notes: 'Hosting + lunar update 2h + SEO check'
    },
    {
      client: createdClients[1].id,
      plan_name: 'Growth €120/mo',
      monthly_price: 120,
      billing_status: 'active',
      next_billing_date: '2026-08-01',
      notes: 'Care plan premium: redesign modular, mentenanță zilnică'
    }
  ];

  for (const subData of sampleSubs) {
    let existing = null;
    try {
      existing = await pb.collection('subscriptions').getFirstListItem(`client="${subData.client}"`);
    } catch (e) {}

    if (!existing) {
      const created = await pb.collection('subscriptions').create(subData);
      console.log(`Created sample subscription for client ${subData.client}: ${created.plan_name}`);
    } else {
      console.log(`Subscription already exists for client ${subData.client}: ${existing.plan_name}`);
    }
  }

  console.log('PocketBase Best Practices schema verification & seeding complete!');
}

migrate().catch(console.error);
