import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { CVTemplate, CVSubmission, uploadFile, analyzeCV } from '@/api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/forms';
import { useToast } from '@/components/ui/toaster';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  'Envoi du fichier CV...',
  'Enregistrement de la soumission...',
  'Analyse IA en cours — comparaison avec le canevas...',
  'Sauvegarde du rapport...',
];

export default function SubmitCV() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const defaultTemplateId = location.state?.templateId || '';

  const [form, setForm] = useState({
    student_name: user?.full_name || '',
    student_email: user?.email || '',
    template_id: defaultTemplateId,
  });
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(-1); // -1 = idle
  const [done, setDone] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates-active'],
    queryFn: () => CVTemplate.list({ is_active: true }),
  });

  const selectedTemplate = templates.find(t => t.id === form.template_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast({ title: 'Fichier manquant', description: 'Veuillez déposer votre CV.', variant: 'destructive' }); return; }
    if (!form.template_id) { toast({ title: 'Canevas manquant', description: 'Veuillez sélectionner un canevas.', variant: 'destructive' }); return; }

    try {
      // Step 1 — upload file
      setStep(0);
      const cvFileUrl = await uploadFile(file, 'cvs');

      // Step 2 — create submission
      setStep(1);
      const submission = await CVSubmission.create({
        student_name: form.student_name,
        student_email: form.student_email,
        cv_file_url: cvFileUrl,
        template_id: form.template_id,
        template_name: selectedTemplate?.title || '',
        status: 'analyse_en_cours',
        score: null,
      });

      // Step 3 — AI analysis
      setStep(2);
      const analysis = await analyzeCV({ cvFileUrl, template: selectedTemplate });

      // Step 4 — save report
      setStep(3);
      const finalScore = Math.min(100, Math.max(0, Math.round(analysis.score)));
      await CVSubmission.update(submission.id, {
        score: finalScore,
        status: finalScore >= 80 ? 'conforme' : 'non_conforme',
        analysis_report: {
          summary: analysis.summary || '',
          missing_sections: analysis.missing_sections || [],
          errors: analysis.errors || [],
          suggestions: analysis.suggestions || [],
        },
      });

      setSubmissionId(submission.id);
      setDone(true);
      setStep(-1);
    } catch (err) {
      setStep(-1);
      toast({ title: 'Erreur lors de l\'analyse', description: err.message, variant: 'destructive' });
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-10 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">Analyse terminée !</h2>
          <p className="text-sm text-muted-foreground mb-6">Votre CV a été analysé avec succès. Consultez votre rapport détaillé.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate(`/submissions/${submissionId}`)}>Voir mon rapport</Button>
            <Button variant="outline" onClick={() => { setDone(false); setFile(null); setStep(-1); }}>
              Soumettre un autre CV
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Soumettre un CV" subtitle="Votre CV sera analysé et comparé au canevas de référence" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Infos étudiant */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Vos informations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1.5">Nom complet *</Label>
              <Input placeholder="Prénom Nom" value={form.student_name}
                onChange={e => setForm(f => ({...f, student_name: e.target.value}))} required />
            </div>
            <div>
              <Label className="block mb-1.5">Adresse e-mail *</Label>
              <Input type="email" placeholder="vous@universite.bj" value={form.student_email}
                onChange={e => setForm(f => ({...f, student_email: e.target.value}))} required />
            </div>
          </div>
        </div>

        {/* Template selector */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Canevas de référence</h2>
          <div>
            <Label className="block mb-1.5">Choisir un canevas *</Label>
            <Select value={form.template_id} onChange={e => setForm(f => ({...f, template_id: e.target.value}))} required>
              <option value="">Sélectionnez un canevas...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </Select>
          </div>

          {selectedTemplate && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-secondary/50 rounded-xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rubriques attendues</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(selectedTemplate.required_sections || []).map(s => (
                  <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
              {selectedTemplate.template_file_url && (
                <a href={selectedTemplate.template_file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Voir le CV exemplaire
                </a>
              )}
            </motion.div>
          )}
        </div>

        {/* File upload */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Votre CV</h2>
          <label className={`flex flex-col items-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-border hover:border-primary hover:bg-primary/5'}`}>
            <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            {file ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-sm text-emerald-700">{file.name}</p>
                <p className="text-xs text-emerald-600">Cliquez pour changer de fichier</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="font-semibold text-sm">Glisser votre CV ici</p>
                <p className="text-xs text-muted-foreground">PDF ou DOCX · Max 5 Mo</p>
              </>
            )}
          </label>
        </div>

        {/* Submit */}
        {step >= 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="font-semibold text-sm">Veuillez patienter</p>
              <div className="w-full space-y-2">
                {STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < step ? 'text-emerald-600' : i === step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {i < step ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : i === step ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-current flex-shrink-0" />}
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Button type="submit" className="w-full py-3 text-base gap-2">
            <FileText className="w-5 h-5" /> Analyser mon CV
          </Button>
        )}
      </form>
    </div>
  );
}
