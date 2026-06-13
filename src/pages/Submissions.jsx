import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { CVSubmission } from '@/api';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import ScoreBadge from '@/components/shared/ScoreBadge';
import { StatusBadge } from './Dashboard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, Lightbulb, ChevronRight } from 'lucide-react';

function formatDate(d) {
  if (!d) return '–';
  try { return format(new Date(d), 'dd MMM yyyy, HH:mm', { locale: fr }); }
  catch { return d; }
}

// ─── Mes soumissions (étudiant) ────────────────────────────────────────────────
export function Submissions() {
  const { user } = useAuth();
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['my-submissions', user?.email],
    queryFn: () => CVSubmission.list({ student_email: user?.email }),
    enabled: !!user?.email,
  });

  return (
    <div>
      <PageHeader title="Mes soumissions" subtitle="Historique de tous vos CV soumis" />
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl border border-border h-20 animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Aucune soumission</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Soumettez votre premier CV pour recevoir une analyse.</p>
          <Link to="/submit"><Button>Soumettre un CV</Button></Link>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {submissions.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/submissions/${s.id}`}
                className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <ScoreBadge score={s.score ?? 0} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.template_name || 'CV soumis'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                </div>
                <StatusBadge status={s.status} />
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rapport détaillé ──────────────────────────────────────────────────────────
export function SubmissionDetail() {
  const { id } = useParams();
  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => CVSubmission.get(id),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!submission) return (
    <div className="text-center py-20 text-muted-foreground">Soumission introuvable.</div>
  );

  const report = submission.analysis_report || {};

  return (
    <div>
      <div className="mb-6">
        <Link to="/submissions" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <PageHeader title="Rapport d'analyse" subtitle={`Soumis le ${formatDate(submission.created_at)}`} />
      </div>

      {/* Score card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 mb-5 flex flex-col sm:flex-row items-center gap-6">
        <ScoreBadge score={submission.score ?? 0} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-heading font-bold text-xl mb-1">
            {submission.score >= 80 ? '✅ CV conforme' : submission.score >= 50 ? '⚠️ Corrections nécessaires' : '❌ Révision complète requise'}
          </p>
          <p className="text-sm text-muted-foreground">{report.summary || 'Analyse complète disponible ci-dessous.'}</p>
          <div className="mt-3">
            <StatusBadge status={submission.status} />
          </div>
        </div>
        {submission.cv_file_url && (
          <a href={submission.cv_file_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1"><FileText className="w-4 h-4" /> Voir mon CV</Button>
          </a>
        )}
      </motion.div>

      {/* Missing sections */}
      {(report.missing_sections || []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-heading font-semibold text-sm text-red-700">Rubriques manquantes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.missing_sections.map(s => (
              <span key={s} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium border border-red-200">{s}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Errors */}
      {(report.errors || []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold text-sm">Points à corriger</h3>
          </div>
          <div className="divide-y divide-border">
            {report.errors.map((err, i) => (
              <div key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded mb-1 inline-block">{err.type}</span>
                    <p className="text-sm font-medium text-foreground">{err.description}</p>
                    {err.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <span className="text-primary flex-shrink-0">→</span> {err.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      {(report.suggestions || []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Conseils d'amélioration
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {report.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Link to="/submit" state={{ templateId: submission.template_id }}>
          <Button variant="outline">↺ Soumettre une nouvelle version</Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Toutes les soumissions (admin) ────────────────────────────────────────────
export function AllSubmissions() {
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: () => CVSubmission.list(),
  });

  return (
    <div>
      <PageHeader title="Toutes les soumissions" subtitle={`${submissions.length} soumission${submissions.length > 1 ? 's' : ''} au total`} />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="bg-card rounded-2xl border border-border h-16 animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucune soumission pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  {['Étudiant', 'Canevas', 'Score', 'Statut', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{s.student_name}</p>
                      <p className="text-xs text-muted-foreground">{s.student_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{s.template_name || '–'}</td>
                    <td className="px-5 py-3.5"><ScoreBadge score={s.score ?? 0} size="sm" /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(s.created_at)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {submissions.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3">
                <ScoreBadge score={s.score ?? 0} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.student_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.template_name} · {formatDate(s.created_at)}</p>
                </div>
                <StatusBadge status={s.status} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Submissions;
