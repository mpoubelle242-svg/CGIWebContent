import { useEffect, useState } from 'react';
import FeedCard from '../components/FeedCard';

export default function DashboardPage({ apiBase, token }) {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ url: '', title: '', description: '' });
  const [message, setMessage] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadFeeds = async () => {
    const res = await fetch(`${apiBase}/feeds`, { headers });
    const data = await res.json();
    if (res.ok) setFeeds(data.feeds);
  };

  const loadItems = async (feed) {
    setLoading(true);
    setSelectedFeed(feed);
    try {
      const res = await fetch(`${apiBase}/feeds/${feed.id}/items`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  const handleAddFeed = async (e) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch(`${apiBase}/feeds`, {
      method: 'POST',
      headers,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setForm({ url: '', title: '', description: '' });
    loadFeeds();
  };

  const handleFavorite = async (item) => {
    if (!selectedFeed) return;
    const res = await fetch(`${apiBase}/favorites`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        feed_id: selectedFeed.id,
        title: item.title,
        link: item.link,
        description: item.description,
        pub_date: item.pubDate,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Article ajouté aux favoris' : data.error);
  };

  return (
    <section className="grid gap-8 md:grid-cols-[280px_1fr]">
      <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Mes flux</h2>
          <ul className="space-y-2">
            {feeds.map((feed) => (
              <li key={feed.id}>
                <button
                  onClick={() => loadItems(feed)}
                  className={`w-full text-left px-3 py-2 rounded-xl ${
                    selectedFeed?.id === feed.id ? 'bg-brand-500/20 text-brand-100' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="font-medium">{feed.title}</p>
                  <p className="text-xs text-slate-400 truncate">{feed.url}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleAddFeed} className="space-y-3">
          <h3 className="text-sm uppercase tracking-wide text-slate-400">Ajouter un flux</h3>
          <input
            type="url"
            required
            placeholder="URL du flux"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Titre personnalisée"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2"
            rows={3}
          />
          <button className="w-full bg-brand-500 text-white rounded-xl py-2">Ajouter</button>
        </form>
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </aside>
      <div className="space-y-6">
        {loading && <p className="text-slate-400">Chargement des articles...</p>}
        {selectedFeed ? (
          items.length ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <FeedCard key={item.link} item={item} onFavorite={handleFavorite} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Aucun article pour ce flux.</p>
          )
        ) : (
          <div className="text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-12">
            <p>Sélectionne un flux dans la colonne de gauche pour afficher les articles.</p>
          </div>
        )}
      </div>
    </section>
  );
}
