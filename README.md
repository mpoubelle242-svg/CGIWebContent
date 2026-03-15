# CGIWebContent

Portail de veille technologique sur l'IA — agrégation de flux RSS, authentification, favoris.

## Stack technique

- **Frontend** : React + TailwindCSS (design moderne type blog)
- **Backend** : Node.js + Express
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Auth** : JWT + bcrypt
- **RSS** : Parser RSS/Atom (feedparser ou rss-parser)

## Fonctionnalités

1. **Portail d'authentification** — inscription / connexion / mot de passe oublié
2. **Page de veille technologique** — agrégation flux RSS IA (TechCrunch AI, MIT Tech Review, ArXiv, etc.)
3. **Favoris** — utilisateurs peuvent sauvegarder des articles
4. **Design moderne** — interface type blog, responsive, dark mode

## Structure du projet

```
CGIWebContent/
├── client/          # Frontend React
├── server/          # Backend Express
├── docs/            # Documentation
└── README.md
```

## Équipe

| Agent | Rôle |
|-------|------|
| developpeur | Développement frontend + backend |
| testeur | Tests unitaires, intégration, E2E |
| data-scientist | Sélection et scoring des sources IA |
| chef-de-projet | Coordination, suivi des tâches |
| directeur-de-projet | Validation, revue, livraison |

## Statut

🚧 En cours de développement
