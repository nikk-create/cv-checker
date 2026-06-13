-- ============================================================
-- CV CHECKER — Supabase Schema
-- Exécuter dans l'éditeur SQL de Supabase (Settings > SQL Editor)
-- ============================================================

-- 1. TABLE: cv_templates
-- ============================================================
create table if not exists public.cv_templates (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  title         text not null,
  description   text,
  template_file_url text,
  required_sections text[] default '{}',
  criteria      jsonb default '[]',
  is_active     boolean default true
);

-- RLS: tout le monde lit les templates actifs, seuls les admins créent/modifient
alter table public.cv_templates enable row level security;

create policy "Public read active templates"
  on public.cv_templates for select
  using (is_active = true);

create policy "Admins full access on templates"
  on public.cv_templates for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- 2. TABLE: cv_submissions
-- ============================================================
create table if not exists public.cv_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  student_name    text not null,
  student_email   text not null,
  cv_file_url     text not null,
  template_id     uuid references public.cv_templates(id) on delete set null,
  template_name   text,
  score           integer,
  status          text default 'en_attente'
                  check (status in ('en_attente','analyse_en_cours','conforme','non_conforme')),
  analysis_report jsonb default '{}'
);

-- RLS: étudiants voient leurs propres soumissions, admins voient tout
alter table public.cv_submissions enable row level security;

create policy "Students see own submissions"
  on public.cv_submissions for select
  using (student_email = (auth.jwt()->>'email'));

create policy "Students insert submissions"
  on public.cv_submissions for insert
  with check (student_email = (auth.jwt()->>'email'));

create policy "Students update own submissions"
  on public.cv_submissions for update
  using (student_email = (auth.jwt()->>'email'));

create policy "Admins full access on submissions"
  on public.cv_submissions for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- 3. STORAGE BUCKETS
-- ============================================================
-- Créer dans Supabase Dashboard > Storage > New bucket:
--   Bucket "cvs"       : public = true
--   Bucket "templates" : public = true

-- Policies storage (exécuter après création des buckets):
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('templates', 'templates', true) on conflict do nothing;

create policy "Anyone can upload CVs"
  on storage.objects for insert
  with check (bucket_id = 'cvs');

create policy "CVs are publicly readable"
  on storage.objects for select
  using (bucket_id = 'cvs');

create policy "Admins upload templates"
  on storage.objects for insert
  with check (bucket_id = 'templates');

create policy "Templates are publicly readable"
  on storage.objects for select
  using (bucket_id = 'templates');

-- ============================================================
-- 4. DONNÉES DE TEST (optionnel)
-- ============================================================
insert into public.cv_templates (title, description, required_sections, is_active) values
  ('CV Licence 3 Informatique', 'Canevas officiel pour les étudiants de L3 Info', 
   array['Photo d''identité','Informations personnelles','Objectif professionnel','Formation','Expériences','Compétences','Langues','Références'], true),
  ('CV Master Gestion', 'Canevas pour étudiants en Master Gestion',
   array['Photo','Informations personnelles','Formation','Expériences professionnelles','Compétences','Certifications'], true),
  ('CV BTS Commerce', 'Canevas BTS Commerce et Administration',
   array['Photo','Informations personnelles','Objectif','Formation','Stages','Compétences'], false)
on conflict do nothing;
