import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { CVTemplate, CVSubmission } from '@/api';
import { FileText, FileCheck, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import ScoreBadge from '@/components/shared/ScoreBadge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export function StatusBadge({ status }) {
  const map = {
    en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    analyse_en_cours: { label: 'Analyse...', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    conforme: { label: 'Conforme', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    non_conforme: { label: 'À corriger', cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const info = map[status] || map.en_attente;
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${info.cls}`}>{info.label}</span>
  );
}

function formatDate(d) {
  if (!d) return '–';
  try { return format(new Date(d), 'dd MMM yyyy, HH:mm', { locale: fr }); }
  catch { return d; }
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: templates = [] } = useQuery({ queryKey: ['templates'], queryFn: () => CVTemplate.list() });
  const { data: submissions = [] } = useQuery({ queryKey: ['all-submissions'], queryFn: () => CVSubmission.list() });

  const activeTemplates = templates.filter(t => t.is_active).length;
  const conformes = submissions.filter(s => s.status === 'conforme').length;
  const avgScore = submissions.length
    ? Math.round(submissions.filter(s => s.score != null).reduce((a, b) => a + b.score, 0) / submissions.filter(s => s.score != null).length)
    : 0;

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Canevas actifs" value={activeTemplates} icon={FileText} color="primary" delay={0} />
        <StatCard title="CV soumis" value={submissions.length} icon={FileCheck} color="accent" delay={0.05} />
        <StatCard title="Conformes" value={conformes} icon={CheckCircle2} color="accent" delay={0.1} />
        <StatCard title="Score moyen" value={`${avgScore}%`} icon={TrendingUp} color="amber" delay={0.15} />
      </div>

      {/* Recent submissions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-semibold text-base">Dernières soumissions</h2>
          <Link to="/all-submissions">
            <Button variant="outline" size="sm">Voir tout</Button>
          </Link>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Aucune soumission pour le moment.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Étudiant</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canevas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 8).map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{s.student_name}</p>
                        <p className="text-xs text-muted-foreground">{s.student_email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{s.template_name || '–'}</td>
                      <td className="px-5 py-3.5"><ScoreBadge score={s.score ?? 0} size="sm" /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {submissions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <ScoreBadge score={s.score ?? 0} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.student_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.template_name}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const { data: templates = [] } = useQuery({ queryKey: ['templates-active'], queryFn: () => CVTemplate.list({ is_active: true }) });
  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions', user?.email],
    queryFn: () => CVSubmission.list({ student_email: user?.email }),
    enabled: !!user?.email,
  });

  const lastScore = submissions[0]?.score ?? null;
  const conformes = submissions.filter(s => s.status === 'conforme').length;

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.full_name?.split(' ')[0] || 'Étudiant'} 👋`}
        subtitle="Voici l'état de vos soumissions de CV"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="CV soumis" value={submissions.length} icon={FileCheck} color="primary" delay={0} />
        <StatCard title="Dernier score" value={lastScore != null ? `${lastScore}%` : '–'} icon={TrendingUp} color="amber" delay={0.05} />
        <StatCard title="Conformes" value={conformes} icon={CheckCircle2} color="accent" delay={0.1} />
      </div>

      {/* Recent submissions */}
      {submissions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-base">Mes soumissions récentes</h2>
            <Link to="/submissions"><Button variant="outline" size="sm">Voir tout</Button></Link>
          </div>
          <div className="divide-y divide-border">
            {submissions.slice(0, 4).map(s => (
              <Link key={s.id} to={`/submissions/${s.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                <ScoreBadge score={s.score ?? 0} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{s.template_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available templates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-heading font-semibold text-base mb-4">Canevas disponibles</h2>
        {templates.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
            Aucun canevas disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{t.title}</h3>
                {t.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(t.required_sections || []).slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {(t.required_sections || []).length > 4 && (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">+{t.required_sections.length - 4}</span>
                  )}
                </div>
                <Link to="/submit" state={{ templateId: t.id }}>
                  <Button size="sm" className="w-full">Soumettre mon CV</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}
