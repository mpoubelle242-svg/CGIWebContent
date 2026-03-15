import { useState } from 'react';
import AuthForm from '../components/AuthForm';

export default function AuthPage({ apiBase, onAuth }) {
  const [variant, setVariant] = useState('login');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = variant === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <p className="text-brand-200 uppercase tracking-[0.3em] text-xs">Veille intelligente</p>
        <h1 className="text-4xl font-bold mt-4">Centralise tes flux RSS</h1>
        <p className="text-slate-400 mt-2">
          Un cockpit moderne pour sélectionner, lire et enregistrer tes sources favorites.
        </p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <AuthForm variant={variant} loading={loading} onSubmit={handleSubmit} />
        {error && <p className="text-red-400">{error}</p>}
        <button
          className="text-sm text-slate-400 hover:text-slate-200"
          onClick={() => setVariant(variant === 'login' ? 'register' : 'login')}
        >
          {variant === 'login' ? "Pas encore de compte ? Inscris-toi." : 'Déjà un compte ? Connecte-toi.'}
        </button>
      </div>
    </section>
  );
}
