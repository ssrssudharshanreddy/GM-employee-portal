import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME = { CEO: '/ceo', CRE: '/cre', CREM: '/crem', AE: '/ae', WE: '/we', WS: '/ws' };

export default function NotFound() {
  const { user } = useAuth();
  const home = user ? (ROLE_HOME[user.role] || '/') : '/login';

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-surface-200">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mt-4">Page not found</h2>
        <p className="text-text-secondary mt-2 mb-8">The page you're looking for doesn't exist or you don't have access.</p>
        <Link href={home}>
          <a className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-md hover:bg-brand-700">
            Go to Dashboard
          </a>
        </Link>
      </div>
    </div>
  );
}
