import FavoriteButton from './FavoriteButton';

export default function FeedCard({ item, onFavorite, isFavorite }) {
  return (
    <article className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
      <header className="flex items-start justify-between">
        <div>
          <a href={item.link} target="_blank" rel="noreferrer" className="text-xl font-semibold text-brand-200 hover:underline">
            {item.title}
          </a>
          <p className="text-sm text-slate-400 mt-1">{new Date(item.pubDate || Date.now()).toLocaleString()}</p>
        </div>
        <FavoriteButton active={isFavorite} onClick={() => onFavorite(item)} />
      </header>
      <p className="text-slate-300 mt-4 line-clamp-3">{item.description || 'Aucun résumé disponible.'}</p>
    </article>
  );
}
