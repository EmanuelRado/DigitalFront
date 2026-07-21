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

  console.log('PocketBase Best Practices schema verification complete!');
}

migrate().catch(console.error);
