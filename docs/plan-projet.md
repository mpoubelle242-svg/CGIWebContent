# Plan de Projet — CGIWebContent

## 1. User Stories

### US-01 : Authentification
- **En tant qu'** utilisateur, je veux créer un compte et me connecter afin d'accéder à mon espace personnel.
- **En tant qu'** utilisateur, je veux réinitialiser mon mot de passe si je l'ai oublié.
- **En tant qu'** administrateur, je veux gérer les comptes utilisateurs (création, suppression, rôles).

### US-02 : Veille RSS
- **En tant qu'** utilisateur, je veux ajouter des flux RSS pour centraliser mes sources d'information.
- **En tant qu'** utilisateur, je veux voir les derniers articles agrégés dans un fil chronologique.
- **En tant qu'** utilisateur, je veux filtrer et rechercher les articles par mot-clé ou source.

### US-03 : Favoris
- **En tant qu'** utilisateur, je veux marquer des articles comme favoris pour les retrouver facilement.
- **En tant qu'** utilisateur, je veux organiser mes favoris par catégories/étiquettes.
- **En tant qu'** utilisateur, je veux exporter mes favoris (JSON/CSV).

### US-04 : Design & UX
- **En tant qu'** utilisateur, je veux une interface responsive (desktop, tablette, mobile).
- **En tant qu'** utilisateur, je veux un thème clair/sombre.
- **En tant qu'** utilisateur, je veux une navigation intuitive et rapide.

---

## 2. Découpage en Sprints

### Sprint 1 — Backend + Auth (Semaines 1–2)
| Tâche | Description | Agent |
|---|---|---|
| Mise en place projet | Initialisation repo, CI/CD, Docker, BDD | DevOps |
| API Auth | Endpoints register/login/logout/reset-password | Backend |
| Base de données | Modèles User, Session, Token | Backend |
| Sécurité | Hashage mots de passe, JWT, CORS, rate limiting | Backend |
| Tests unitaires Auth | Couverture des endpoints d'authentification | QA |

### Sprint 2 — Frontend + RSS (Semaines 3–4)
| Tâche | Description | Agent |
|---|---|---|
| Pages frontend | Login, register, dashboard, profil | Frontend |
| API RSS | CRUD flux, parsing, stockage articles | Backend |
| Intégration RSS | Affichage fil d'actualités, détails article | Frontend |
| Recherche/filtre | Recherche full-text sur les articles | Backend + Frontend |
| Tests intégration | Tests E2E flux RSS | QA |

### Sprint 3 — Favoris + Design (Semaines 5–6)
| Tâche | Description | Agent |
|---|---|---|
| API Favoris | CRUD favoris, catégories, export | Backend |
| UI Favoris | Marquage, listes, catégories | Frontend |
| Design system | Thème clair/sombre, composants réutilisables | Frontend |
| Responsive | Adaptation mobile/tablette | Frontend |
| Tests finaux | Tests E2E, performance, accessibilité | QA |
| Documentation | README, API docs, guide utilisateur | Tous |

---

## 3. Matrice des Responsabilités (RACI)

| Domaine | Backend Dev | Frontend Dev | DevOps | QA | Chef de Projet |
|---|:---:|:---:|:---:|:---:|:---:|
| Architecture technique | R | C | C | I | A |
| API Auth | R | I | C | C | A |
| Base de données | R | I | C | I | A |
| Pages frontend | I | R | C | C | A |
| Flux RSS (backend) | R | I | C | C | A |
| Flux RSS (frontend) | I | R | I | C | A |
| Favoris | R | R | I | C | A |
| Design system | C | R | I | I | A |
| Déploiement | C | I | R | C | A |
| Tests | C | C | I | R | A |
| Documentation | R | R | I | C | A |

> **R** = Réalise | **A** = Approuve | **C** = Consulté | **I** = Informé

---

## 4. Critères d'Acceptation

### Authentification (US-01)
- ✅ Un utilisateur peut créer un compte avec email + mot de passe
- ✅ Un utilisateur peut se connecter et reçoit un JWT valide
- ✅ Un utilisateur peut réinitialiser son mot de passe par email
- ✅ Les mots de passe sont hashés (bcrypt, min 12 rounds)
- ✅ Rate limiting actif sur les endpoints d'auth (max 10 tentatives/min)
- ✅ Un admin peut lister/supprimer des comptes

### Veille RSS (US-02)
- ✅ Un utilisateur peut ajouter/supprimer des flux RSS par URL
- ✅ Les articles sont parsés et stockés automatiquement (toutes les 30 min)
- ✅ Le fil d'actualités affiche les articles triés par date (plus récent d'abord)
- ✅ La recherche renvoie des résultats en < 500ms
- ✅ Les flux invalides sont détectés et signalés à l'utilisateur

### Favoris (US-03)
- ✅ Un utilisateur peut ajouter/retirer un article de ses favoris en 1 clic
- ✅ Les favoris sont accessibles depuis une page dédiée
- ✅ Un utilisateur peut créer des catégories et y assigner des favoris
- ✅ L'export JSON/CSV fonctionne et contient toutes les données
- ✅ Les favoris persistent après déconnexion/reconnexion

### Design & UX (US-04)
- ✅ L'interface est responsive sur desktop (≥1024px), tablette (768–1023px), mobile (<768px)
- ✅ Le thème clair/sombre est basculable et sauvegardé
- ✅ Lighthouse score ≥ 90 (performance, accessibilité, SEO)
- ✅ Navigation possible en 3 clics maximum vers toute section
- ✅ Compatible navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)

---

## 5. Risques Identifiés et Mitigations

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|:---:|:---:|---|
| R1 | Parsing RSS échoue sur des flux non standards | Élevée | Moyen | Utiliser une lib robuste (feedparser/rss-parser), fallback HTML scraping, validation stricte des flux |
| R2 | Scalabilité du parsing en cas de nombreux flux | Moyenne | Élevé | Mise en queue (Bull/BullMQ + Redis), workers dédiés, backoff exponentiel |
| R3 | Sécurité : injection XSS via contenu RSS | Moyenne | Critique | Sanitisation systématique du HTML (DOMPurify côté front, sanitize-html côté back), CSP headers |
| R4 | Dérive des délais (sprints dépassés) | Moyenne | Élevé | Daily standups, burndown chart, priorisation stricte MoSCoW, MVP livrable à chaque sprint |
| R5 | Conflits Git entre agents devs | Faible | Moyen | Branches par feature, pull requests obligatoires, code review, conventions de commit (Conventional Commits) |
| R6 | Dépendance API externe (emails reset password) | Faible | Moyen | Fallback : token de reset stocké en BDD, file d'attente email, retry automatique |
| R7 | Performance dégradée avec beaucoup d'articles | Moyenne | Moyen | Pagination, indexation BDD, cache Redis, lazy loading côté front |
| R8 | Incompatibilité navigateurs (design responsive) | Faible | Faible | Tests cross-browser automatisés (Playwright), CSS Grid/Flexbox, polyfills si nécessaire |

---

## 6. Métriques de Suivi

- **Vélocité** : story points livrés par sprint
- **Burndown** : progression quotidienne vs objectif sprint
- **Qualité** : taux de couverture tests, bugs ouverts/fermés
- **Satisfaction** : feedback utilisateur après chaque sprint (si applicable)

---

*Dernière mise à jour : 2026-03-15 — Chef de Projet CGIWebContent*
