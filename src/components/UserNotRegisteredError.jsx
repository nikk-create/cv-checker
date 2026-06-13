import { useAuth } from '@/lib/AuthContext';
export default function UserNotRegisteredError() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center shadow-lg">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-xl font-heading font-bold mb-2">Compte non autorisé</h2>
        <p className="text-muted-foreground text-sm mb-6">Votre compte n'est pas encore activé. Contactez l'administrateur.</p>
        <button onClick={logout} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
