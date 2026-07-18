const express = require('express');
const cors = require('cors');
const { getDbConnection, initDb } = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDb().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Helper to generate UUID-like strings
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/* ================================================================
   1. PROJECT ENDPOINTS
   ================================================================ */

// GET all published projects
app.get('/api/projects', async (req, res) => {
  try {
    const { category } = req.query;
    const db = await getDbConnection();
    
    let query = "SELECT id, name, slug, description, short_description, category, thumbnail_url, mobile_url, status, tech_stack, features, created_at, published_at, sort_order FROM projects WHERE status = 'published'";
    const params = [];
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    query += " ORDER BY sort_order ASC, published_at DESC";
    
    const projects = await db.all(query, params);
    
    // Parse JSON strings
    projects.forEach(p => {
      p.tech_stack = p.tech_stack ? JSON.parse(p.tech_stack) : [];
      p.features = p.features ? JSON.parse(p.features) : [];
    });
    
    await db.close();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all projects (including drafts for Admin dashboard)
app.get('/api/admin/projects', async (req, res) => {
  try {
    const db = await getDbConnection();
    const projects = await db.all("SELECT id, name, slug, category, status, created_at FROM projects ORDER BY created_at DESC");
    await db.close();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching admin projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single project by slug (public detail page)
app.get('/api/projects/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = await getDbConnection();
    
    const project = await db.get("SELECT * FROM projects WHERE slug = ?", [slug]);
    
    if (!project) {
      await db.close();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Parse arrays
    project.tech_stack = project.tech_stack ? JSON.parse(project.tech_stack) : [];
    project.features = project.features ? JSON.parse(project.features) : [];
    
    // Load timeline
    project.project_timeline = await db.all(
      "SELECT id, step_title, step_description, step_date, screenshot_url, sort_order FROM project_timeline WHERE project_id = ? ORDER BY sort_order ASC",
      [project.id]
    );
    
    // Load media gallery
    project.project_media = await db.all(
      "SELECT id, url, caption, media_type, sort_order FROM project_media WHERE project_id = ? ORDER BY sort_order ASC",
      [project.id]
    );
    
    await db.close();
    res.json(project);
  } catch (err) {
    console.error('Error fetching project by slug:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single project by ID (admin editor load)
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
    
    if (!project) {
      await db.close();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Parse arrays
    project.tech_stack = project.tech_stack ? JSON.parse(project.tech_stack) : [];
    project.features = project.features ? JSON.parse(project.features) : [];
    
    // Load timeline
    project.project_timeline = await db.all(
      "SELECT id, step_title, step_description, step_date, screenshot_url, sort_order FROM project_timeline WHERE project_id = ? ORDER BY sort_order ASC",
      [project.id]
    );
    
    // Load media gallery
    project.project_media = await db.all(
      "SELECT id, url, caption, media_type, sort_order FROM project_media WHERE project_id = ? ORDER BY sort_order ASC",
      [project.id]
    );
    
    await db.close();
    res.json(project);
  } catch (err) {
    console.error('Error fetching project by ID:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET distinct categories
app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDbConnection();
    const rows = await db.all("SELECT DISTINCT category FROM projects WHERE status = 'published' AND category IS NOT NULL");
    await db.close();
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   2. WRITE / EDIT PROJECT ENDPOINTS (Admin Auth checked locally)
   ================================================================ */

// POST (Create) a project
app.post('/api/projects', async (req, res) => {
  try {
    const db = await getDbConnection();
    const { name, slug, description, short_description, category, client_name, live_url, status, tech_stack, features, project_timeline, project_media } = req.body;
    
    const id = generateId();
    const created_at = new Date().toISOString();
    const published_at = status === 'published' ? created_at : null;
    
    // Insert base project
    await db.run(
      `INSERT INTO projects (id, name, slug, description, short_description, category, client_name, live_url, thumbnail_url, mobile_url, status, tech_stack, features, created_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        name, 
        slug, 
        description || '', 
        short_description || '', 
        category || '', 
        client_name || '', 
        live_url || '',
        thumbnail_url || `/images/portfolio/${slug}-thumbnail.png`, // fallback convention
        mobile_url || `/images/portfolio/${slug}-mobile.png`,
        status || 'draft',
        JSON.stringify(tech_stack || []),
        JSON.stringify(features || []),
        created_at,
        published_at
      ]
    );

    // Insert timeline steps
    if (project_timeline && project_timeline.length > 0) {
      for (let i = 0; i < project_timeline.length; i++) {
        const step = project_timeline[i];
        await db.run(
          `INSERT INTO project_timeline (id, project_id, step_title, step_description, step_date, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), id, step.step_title, step.step_description || null, step.step_date || null, i]
        );
      }
    }

    // Insert media gallery items
    if (project_media && project_media.length > 0) {
      for (let i = 0; i < project_media.length; i++) {
        const media = project_media[i];
        await db.run(
          `INSERT INTO project_media (id, project_id, url, caption, media_type, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), id, media.url, media.caption || null, media.media_type || 'image', i]
        );
      }
    }

    await db.close();
    res.status(201).json({ id, name, slug, status });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) a project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    const { name, slug, description, short_description, category, client_name, live_url, status, tech_stack, features, project_timeline } = req.body;
    
    // Check if project exists
    const exists = await db.get("SELECT id, status, created_at FROM projects WHERE id = ?", [id]);
    if (!exists) {
      await db.close();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const published_at = status === 'published' ? (exists.published_at || new Date().toISOString()) : null;
    
    // Update base project
    await db.run(
      `UPDATE projects 
       SET name = ?, slug = ?, description = ?, short_description = ?, category = ?, client_name = ?, live_url = ?, status = ?, tech_stack = ?, features = ?, published_at = ?
       WHERE id = ?`,
      [
        name,
        slug,
        description || '',
        short_description || '',
        category || '',
        client_name || '',
        live_url || '',
        status,
        JSON.stringify(tech_stack || []),
        JSON.stringify(features || []),
        published_at,
        id
      ]
    );

    // Handle timeline replacement
    await db.run("DELETE FROM project_timeline WHERE project_id = ?", [id]);
    if (project_timeline && project_timeline.length > 0) {
      for (let i = 0; i < project_timeline.length; i++) {
        const step = project_timeline[i];
        await db.run(
          `INSERT INTO project_timeline (id, project_id, step_title, step_description, step_date, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), id, step.step_title, step.step_description || null, step.step_date || null, i]
        );
      }
    }

    await db.close();
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    
    // Due to ON DELETE CASCADE on timelines and media, SQLite cleans up children automatically
    await db.run("DELETE FROM projects WHERE id = ?", [id]);
    
    await db.close();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   3. CONTACT FORM / LEADS
   ================================================================ */

// POST a contact submission
app.post('/api/contact', async (req, res) => {
  try {
    const db = await getDbConnection();
    const { name, email, phone, business_type, budget_range, message } = req.body;
    
    if (!name || !email || !message) {
      await db.close();
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    const id = generateId();
    const created_at = new Date().toISOString();
    
    await db.run(
      `INSERT INTO contact_submissions (id, name, email, phone, business_type, budget_range, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, phone || null, business_type || null, budget_range || null, message, 'new', created_at]
    );
    
    await db.close();
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Error saving contact form:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all submissions for Admin
app.get('/api/admin/submissions', async (req, res) => {
  try {
    const db = await getDbConnection();
    const submissions = await db.all("SELECT * FROM contact_submissions ORDER BY created_at DESC");
    await db.close();
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   4. AUTHENTICATION ENDPOINTS
   ================================================================ */

// POST Admin Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic credential verification
  if (email === 'admin@digitalfront.dev' && password === 'admin123') {
    res.json({
      user: {
        email: 'admin@digitalfront.dev',
        role: 'admin',
        token: 'DF_ADMIN_LOCAL_TOKEN_SECRET_98765'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// POST Admin Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Start Express listening locally
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running at: http://localhost:${PORT}`);
  console.log(`🔗 Vite Proxy maps /api/* -> http://localhost:${PORT}/api/*\n`);
});
