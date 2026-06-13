import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CVTemplate, uploadFile } from '@/api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Label, Switch } from '@/components/ui/forms';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Plus, FileText, Pencil, Trash2, Upload, X, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  const remove = (tag) => onChange(value.filter(t => t !== tag));
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg min-h-[42px] bg-card mb-2"
        onClick={() => document.getElementById('tag-inp')?.focus()}>
        {value.map(t => (
          <span key={t} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
            {t}
            <button type="button" onClick={() => remove(t)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
          </span>
        ))}
        <input id="tag-inp" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={value.length === 0 ? 'Taper et Entrée pour ajouter...' : ''}
          className="flex-1 min-w-[120px] text-xs outline-none bg-transparent text-foreground placeholder:text-muted-foreground" />
      </div>
      <p className="text-[11px] text-muted-foreground">Appuyez sur Entrée pour valider chaque rubrique</p>
    </div>
  );
}

const emptyForm = { title: '', description: '', required_sections: [], criteria: [], is_active: true, template_file_url: '' };

export default function Templates() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: templates = [], isLoading } = useQuery({ queryKey: ['templates'], queryFn: () => CVTemplate.list() });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? CVTemplate.update(editing.id, data) : CVTemplate.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: editing ? 'Canevas mis à jour' : 'Canevas créé' });
      setDialogOpen(false);
    },
    onError: (e) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CVTemplate.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Canevas supprimé' });
      setDeleteConfirm(null);
    },
    onError: (e) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ title: t.title, description: t.description || '', required_sections: t.required_sections || [], criteria: t.criteria || [], is_active: t.is_active, template_file_url: t.template_file_url || '' }); setDialogOpen(true); };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'templates');
      setForm(f => ({ ...f, template_file_url: url }));
      toast({ title: 'Fichier uploadé' });
    } catch (err) {
      toast({ title: 'Erreur upload', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div>
      <PageHeader title="Canevas de CV" subtitle="Gérez vos modèles et partagez-les aux étudiants">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Nouveau canevas
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl border border-border h-56 animate-pulse" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Aucun canevas</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Créez votre premier canevas pour commencer.</p>
          <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Créer un canevas</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all">
              <div className="h-28 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                <FileText className="w-10 h-10 text-primary/40" />
                <span className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${t.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {t.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-sm mb-1 truncate">{t.title}</h3>
                {t.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(t.required_sections || []).slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {(t.required_sections || []).length > 4 && (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">+{(t.required_sections.length - 4)}</span>
                  )}
                </div>
                {t.template_file_url && (
                  <a href={t.template_file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline mb-3">
                    <LinkIcon className="w-3 h-3" /> Voir l'exemplaire
                  </a>
                )}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(t)}>
                    <Pencil className="w-3 h-3" /> Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    onClick={() => setDeleteConfirm(t)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="relative">
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le canevas' : 'Nouveau canevas'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <Label className="block mb-1.5">Titre du canevas *</Label>
                <Input placeholder="ex: CV Licence 3 Informatique" value={form.title}
                  onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
              </div>
              <div>
                <Label className="block mb-1.5">Description</Label>
                <Input placeholder="ex: L3 Info – Session Juin 2025" value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div>
                <Label className="block mb-1.5">Rubriques requises</Label>
                <TagInput value={form.required_sections} onChange={v => setForm(f => ({...f, required_sections: v}))} />
              </div>
              <div>
                <Label className="block mb-2">CV exemplaire (fichier de référence)</Label>
                {form.template_file_url ? (
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="flex-1 truncate text-xs text-muted-foreground">Fichier uploadé</span>
                    <button type="button" onClick={() => setForm(f => ({...f, template_file_url: ''}))}
                      className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-sm font-medium">{uploading ? 'Upload en cours...' : 'Glisser le CV exemplaire'}</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX</p>
                  </label>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({...f, is_active: v}))} />
                <Label className="normal-case text-sm font-normal tracking-normal text-foreground cursor-pointer">
                  Canevas actif (visible par les étudiants)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le canevas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="relative">
          <DialogClose onClose={() => setDeleteConfirm(null)} />
          <DialogHeader><DialogTitle>Supprimer le canevas</DialogTitle></DialogHeader>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Êtes-vous sûr de vouloir supprimer <strong>"{deleteConfirm?.title}"</strong> ? Cette action est irréversible.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
