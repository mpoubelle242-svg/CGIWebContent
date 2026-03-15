import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout, theme, onToggleTheme }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold text-brand-300">
          CGIWebContent
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link to="/dashboard" className="text-sm text-slate-200 hover:text-brand-200">
                Dashboard
              </Link>
              <Link to="/favorites" className="text-sm text-slate-200 hover:text-brand-200">
                Favoris
              </Link>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded-md text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                Déconnexion
              </button>
            </>
          )}
          <button onClick={onToggleTheme} className="w-10 h-10 rounded-full bg-slate-800 text-slate-100">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
