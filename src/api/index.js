import { supabase } from '@/lib/supabase';

// ─── CVTemplate ───────────────────────────────────────────────────────────────
export const CVTemplate = {
  async list(filters = {}) {
    let q = supabase.from('cv_templates').select('*').order('created_at', { ascending: false });
    if (filters.is_active !== undefined) q = q.eq('is_active', filters.is_active);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase.from('cv_templates').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from('cv_templates').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('cv_templates').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('cv_templates').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── CVSubmission ─────────────────────────────────────────────────────────────
export const CVSubmission = {
  async list(filters = {}) {
    let q = supabase.from('cv_submissions').select('*').order('created_at', { ascending: false });
    if (filters.student_email) q = q.eq('student_email', filters.student_email);
    if (filters.template_id) q = q.eq('template_id', filters.template_id);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase.from('cv_submissions').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from('cv_submissions').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('cv_submissions').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── File Upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file, bucket = 'cvs') {
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filename, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

// ─── AI Analysis (Anthropic) ──────────────────────────────────────────────────
export async function analyzeCV({ cvFileUrl, template }) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const prompt = `Tu es un expert en analyse de CV universitaires.

Contexte : Canevas de référence "${template.title}" (${template.description || ''})
Rubriques requises : ${(template.required_sections || []).join(', ')}
Critères : ${(template.criteria || []).map(c => c.name + (c.description ? ': ' + c.description : '')).join(', ')}
URL du CV soumis : ${cvFileUrl}

Analyse ce CV et produis un rapport complet. Sois précis, concret et bienveillant.

Réponds UNIQUEMENT avec du JSON valide (sans markdown, sans backticks) :
{
  "score": <entier 0-100>,
  "summary": "<résumé court>",
  "missing_sections": ["<rubrique manquante>"],
  "errors": [{"type": "structure|contenu|format", "description": "<problème>", "suggestion": "<correction>"}],
  "suggestions": ["<conseil>"]
}`;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/swift-function`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const raw = await res.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
