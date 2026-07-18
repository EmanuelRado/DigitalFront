-- ================================================================
-- DIGITALFRONT — Supabase Database Schema
-- PostgreSQL schema for portfolio CMS, contact forms, and 
-- future scalability (subscriptions, client accounts)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. PROJECTS (Portfolio)
-- ================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,  -- For card previews
  category TEXT,           -- 'restaurant', 'business', 'fitness', 'medical', etc.
  client_name TEXT,
  live_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tech_stack TEXT[],       -- Array of technologies used
  features TEXT[],         -- Key features/highlights
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 2. PROJECT MEDIA (Screenshots, images)
-- ================================================================
CREATE TABLE IF NOT EXISTS project_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  media_type TEXT DEFAULT 'screenshot' CHECK (media_type IN ('screenshot', 'before', 'after', 'process', 'hero', 'gallery')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_media_project_id ON project_media(project_id);

-- ================================================================
-- 3. PROJECT TIMELINE (Creation process documentation)
-- ================================================================
CREATE TABLE IF NOT EXISTS project_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_title TEXT NOT NULL,
  step_description TEXT,
  step_date DATE,
  screenshot_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_timeline_project_id ON project_timeline(project_id);

-- ================================================================
-- 4. CONTACT SUBMISSIONS (Lead capture)
-- ================================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  message TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  notes TEXT,             -- Internal notes by admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 5. SUBSCRIPTIONS (Future scalability — Website Care Plans)
-- ================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,          -- Will reference auth.users or a clients table
  client_name TEXT,
  client_email TEXT,
  plan_type TEXT CHECK (plan_type IN ('essential', 'active', 'growth')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date DATE,
  next_billing_date DATE,
  amount_eur DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 6. CLIENT REPORTS (Future — monthly performance reports)
-- ================================================================
CREATE TABLE IF NOT EXISTS client_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  client_name TEXT,
  report_month DATE,
  visitors INT,
  page_views INT,
  bounce_rate DECIMAL(5,2),
  top_source TEXT,
  recommendations TEXT,
  report_url TEXT,         -- Link to generated PDF/HTML report
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Published projects and their media/timeline
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read media of published projects"
  ON project_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_media.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can read timeline of published projects"
  ON project_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_timeline.project_id
      AND projects.status = 'published'
    )
  );

-- PUBLIC WRITE: Anyone can submit a contact form
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- ADMIN: Full access for authenticated users
CREATE POLICY "Admin full access on projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on project_media"
  ON project_media FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on project_timeline"
  ON project_timeline FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on contact_submissions"
  ON contact_submissions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on client_reports"
  ON client_reports FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- 8. STORAGE BUCKET (for project images)
-- ================================================================
-- Run this in Supabase Dashboard > Storage > Create Bucket:
-- Bucket name: project-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/svg+xml

-- ================================================================
-- 9. SEED DATA (Sample projects for demo)
-- ================================================================
INSERT INTO projects (name, slug, description, short_description, category, client_name, status, tech_stack, features, sort_order) VALUES
(
  'Trattoria della Nonna',
  'trattoria-della-nonna',
  'Landing page complet pentru o trattoria italiană tradițională din Rösrath, Germania. Include meniu în HTML, sistem de rezervare, galerie foto și Schema markup bilingv (DE/EN).',
  'Trattoria italiană tradițională — landing page cu meniu și rezervare.',
  'restaurant',
  'Trattoria della Nonna',
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Google Fonts', 'Schema.org'],
  ARRAY['Meniu HTML interactiv', 'Rezervare telefonică directă', 'Google Maps embed', 'Bilingv DE/EN'],
  1
),
(
  'Sufrageria Urbană',
  'sufrageria-urbana',
  'Website premium pentru un bistro urban din București cu bucătărie românească reinterpretată. Design editorial, aerisit, cu accent pe brunch-ul de weekend și atmosfera rafinată.',
  'Bistro urban premium — design editorial, meniu și rezervări.',
  'restaurant',
  'Sufrageria Urbană',
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Google Fonts'],
  ARRAY['Design editorial premium', 'Galerie foto imersivă', 'Formular rezervare grupuri', 'Pet-friendly terasă'],
  2
),
(
  'CrunchBox Burger',
  'crunchbox-burger',
  'Site energic și apetisant pentru un fast-food premium din București. Contrast puternic galben-negru, optimizat pentru comenzi rapide și integrare cu platforme de delivery.',
  'Fast-food premium — comenzi online și delivery platforms.',
  'restaurant',
  'CrunchBox Burger',
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Gloria Food'],
  ARRAY['Comandă online integrată', 'Integrare Glovo/Bolt/Tazz', 'Meniu vizual cu prețuri', 'Design energic mobile-first'],
  3
),
(
  'NordHaus Fenster & Türen',
  'nordhaus-fenster',
  'Website profesional pentru o firmă de montaj ferestre și uși din Köln, Germania. Prezentare servicii, galerie lucrări, formular de ofertă și SEO local.',
  'Montaj ferestre premium — prezentare servicii și ofertă online.',
  'business',
  'NordHaus Fenster & Türen',
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Schema.org'],
  ARRAY['Formular cerere ofertă', 'Galerie lucrări before/after', 'SEO local Köln', 'Design profesional industrial'],
  4
),
(
  'BioCake',
  'biocake',
  'Landing page pentru o cofetărie artizanală bio și vegană din București. Design cald, organic, cu accent pe ingrediente naturale și comenzi personalizate.',
  'Cofetărie artizanală bio/vegană — comenzi și prezentare.',
  'restaurant',
  'BioCake',
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript'],
  ARRAY['Meniu cu alergeni', 'Comenzi personalizate', 'Design organic/natural', 'Galerie produse'],
  5
);
