import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/forms';
import { useToast } from '@/components/ui/toaster';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast({ title: 'Erreur de connexion', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl">CV Analyzer</h1>
            <p className="text-xs text-muted-foreground">Vérification intelligente</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-1">Bon retour !</h2>
          <p className="text-sm text-muted-foreground mb-6">Connectez-vous à votre espace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block mb-1.5">Adresse e-mail</Label>
              <Input
                id="email" type="email" placeholder="vous@universite.bj"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</Link>
              </div>
              <Input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-card px-3">ou</div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={loginWithGoogle}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
