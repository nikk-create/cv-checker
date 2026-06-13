import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/forms';
import { useToast } from '@/components/ui/toaster';

// ─── Register ─────────────────────────────────────────────────────────────────
export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName, form.role);
      toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre compte.' });
      navigate('/login');
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl">CV Analyzer</span>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <h2 className="font-heading font-bold text-2xl mb-1">Créer un compte</h2>
          <p className="text-sm text-muted-foreground mb-6">Rejoignez la plateforme</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block mb-1.5">Nom complet</Label>
              <Input placeholder="Prénom Nom" value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} required />
            </div>
            <div>
              <Label className="block mb-1.5">Adresse e-mail</Label>
              <Input type="email" placeholder="vous@universite.bj" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div>
              <Label className="block mb-1.5">Mot de passe</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <div>
              <Label className="block mb-1.5">Je suis</Label>
              <Select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                <option value="user">Étudiant</option>
                <option value="admin">Enseignant / Admin</option>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-5">
            Déjà un compte ? <Link to="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ForgotPassword ────────────────────────────────────────────────────────────
export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8">
        <h2 className="font-heading font-bold text-2xl mb-1">Mot de passe oublié</h2>
        <p className="text-sm text-muted-foreground mb-6">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-3">📧</p>
            <p className="font-semibold">Email envoyé !</p>
            <p className="text-sm text-muted-foreground mt-1">Vérifiez votre boîte mail.</p>
            <Link to="/login" className="text-primary text-sm font-medium hover:underline mt-4 block">Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block mb-1.5">Adresse e-mail</Label>
              <Input type="email" placeholder="vous@universite.bj" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le lien'}</Button>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:underline">Retour à la connexion</Link>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── ResetPassword ─────────────────────────────────────────────────────────────
export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(password);
      toast({ title: 'Mot de passe mis à jour' });
      navigate('/login');
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8">
        <h2 className="font-heading font-bold text-2xl mb-1">Nouveau mot de passe</h2>
        <p className="text-sm text-muted-foreground mb-6">Choisissez un nouveau mot de passe sécurisé.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1.5">Nouveau mot de passe</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Mise à jour...' : 'Réinitialiser'}</Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
