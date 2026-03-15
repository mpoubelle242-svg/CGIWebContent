import { useState } from 'react';

export default function AuthForm({ onSubmit, variant = 'login', loading }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isRegister = variant === 'register';

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center text-brand-200 mb-6">
        {isRegister ? 'Crée ton compte' : 'Bon retour !'}
      </h2>
      {isRegister && (
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1" htmlFor="username">
            Nom d'utilisateur
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-1" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-500 hover:bg-brand-400 transition text-white font-semibold py-2"
      >
        {loading ? 'Chargement...' : isRegister ? 'Créer un compte' : 'Connexion'}
      </button>
    </form>
  );
}
