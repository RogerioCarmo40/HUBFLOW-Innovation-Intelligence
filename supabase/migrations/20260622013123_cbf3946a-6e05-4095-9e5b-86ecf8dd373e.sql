-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Innovation Manager',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================================================================
-- PROJECTS
-- =========================================================================
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT 'Other',
  maturity TEXT NOT NULL DEFAULT 'Ideation',
  status TEXT NOT NULL DEFAULT 'InProgress',
  owner TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- IDEAS
-- =========================================================================
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Incremental',
  status TEXT NOT NULL DEFAULT 'Draft',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  author TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT 'Other',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ideas" ON public.ideas
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- INSIGHTS
-- =========================================================================
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  input_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary TEXT NOT NULL DEFAULT '',
  result_structured JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own insights" ON public.insights
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- NEW USER: create profile + seed demo data
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_company TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company', ''), 'HUBFLOW Labs');
  p1 UUID; p2 UUID; p3 UUID; p4 UUID;
BEGIN
  INSERT INTO public.profiles (id, name, company, email, role)
  VALUES (NEW.id, v_name, v_company, NEW.email, 'Innovation Manager');

  INSERT INTO public.projects (user_id, name, description, sector, maturity, status, owner)
  VALUES (NEW.id, 'Smart Onboarding AI', 'AI-guided onboarding that cuts time-to-value for new SaaS customers.', 'Fintech', 'MVP', 'InProgress', v_name)
  RETURNING id INTO p1;
  INSERT INTO public.projects (user_id, name, description, sector, maturity, status, owner)
  VALUES (NEW.id, 'Green Logistics Platform', 'Route optimization that reduces emissions for last-mile delivery.', 'Logistics', 'Validation', 'Approved', v_name)
  RETURNING id INTO p2;
  INSERT INTO public.projects (user_id, name, description, sector, maturity, status, owner)
  VALUES (NEW.id, 'Tele-Triage Assistant', 'Conversational triage for clinics to prioritize patients faster.', 'Healthtech', 'Ideation', 'InProgress', v_name)
  RETURNING id INTO p3;
  INSERT INTO public.projects (user_id, name, description, sector, maturity, status, owner)
  VALUES (NEW.id, 'Retail Demand Sensing', 'Predictive restocking using local trend and weather signals.', 'Retail', 'Scale', 'Archived', v_name)
  RETURNING id INTO p4;

  INSERT INTO public.ideas (user_id, title, description, type, status, project_id, author, sector, tags) VALUES
    (NEW.id, 'Transparent usage-based pricing', 'Let customers pay only for what they use, with a live cost dashboard.', 'BusinessModel', 'InReview', p1, v_name, 'Fintech', ARRAY['pricing','transparency']),
    (NEW.id, 'Carbon score per delivery', 'Show end-customers the carbon footprint of each delivery option.', 'Product', 'Approved', p2, v_name, 'Logistics', ARRAY['sustainability','esg']),
    (NEW.id, 'Voice intake for clinics', 'Patients describe symptoms by voice; AI structures the triage form.', 'Service', 'Draft', p3, v_name, 'Healthtech', ARRAY['voice','ai','triage']),
    (NEW.id, 'Auto-restock micro-bundles', 'Bundle slow + fast movers to optimize shelf space automatically.', 'Process', 'Rejected', p4, v_name, 'Retail', ARRAY['inventory']),
    (NEW.id, 'Community-led feature voting', 'Let power users vote and fund the next features to be built.', 'Incremental', 'Draft', NULL, v_name, 'Fintech', ARRAY['community','roadmap']);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()