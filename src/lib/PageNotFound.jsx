import { Link } from 'react-router-dom';
export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-6xl font-heading font-bold text-primary mb-4">404</p>
        <p className="text-muted-foreground mb-6">Page introuvable</p>
        <Link to="/" className="text-primary font-medium hover:underline">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
