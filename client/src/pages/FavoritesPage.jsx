import { useEffect, useState } from 'react';

export default function FavoritesPage({ apiBase, token }) {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const loadFavorites = async () => {
    const res = await fetch(`${apiBase}/favorites`, { headers });
    const data = await res.json();
    if (res.ok) setFavorites(data.favorites);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (favorite) => {
    const res = await fetch(`${apiBase}/favorites/${favorite.id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    setMessage(res.ok ? 'Favori supprimé' : data.error);
    loadFavorites();
  };

  return (
    <section>
      <header className="mb-6">
        <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">Collection</p>
        <h1 className="text-3xl font-bold">Mes favoris</h1>
        <p className="text-slate-400">Retrouve rapidement les articles sauvegardés.</p>
      </header>
      {message && <p className="text-sm text-slate-400 mb-4">{message}</p>}
      <div className="grid gap-4">
        {favorites.length ? (
          favorites.map((fav) => (
            <article key={fav.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between">
              <div>
                <a href={fav.link} target="_blank" rel="noreferrer" className="text-xl font-semibold text-brand-200 hover:underline">
                  {fav.title}
                </a>
                <p className="text-sm text-slate-400 mt-1">{new Date(fav.pub_date || fav.created_at).toLocaleString()}</p>
                <p className="text-slate-300 mt-2 line-clamp-2">{fav.description}</p>
              </div>
              <button
                onClick={() => handleRemove(fav)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Retirer
              </button>
            </article>
          ))
        ) : (
          <div className="text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-12">
            <p>Aucun favori pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
