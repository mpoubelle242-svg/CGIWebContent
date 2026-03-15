export default function FavoriteButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
        active ? 'border-brand-300 text-brand-200 bg-brand-300/10' : 'border-slate-700 text-slate-300'
      }`}
    >
      {active ? '★' : '☆'}
      <span className="text-sm font-medium">Favori</span>
    </button>
  );
}
