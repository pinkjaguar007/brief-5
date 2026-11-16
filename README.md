# DevScope

Application web pour les recruteurs de DevScope : chercher un développeur sur GitHub, voir son profil et ses dépôts, puis garder une shortlist de candidats dans une API REST.

Projet individuel réalisé pendant la formation web de **YouCode Safi**.

## Liens

- Démo : https://pinkjaguar007.github.io/brief-5/
- Jira : lien à ajouter

## Fonctionnalités

### Recherche (`index.html`)

- Champ « Nom d'utilisateur » et bouton « Analyser ».
- Validation avant la requête : lettres, chiffres et tirets, 1 à 39 caractères, sans tiret au début ni à la fin.
- Message d'erreur sous le champ si le nom est invalide.
- Redirection vers `profil.html?username=...`.

### Profil (`profil.html?username=...`)

- Photo, nom, login, bio, ville, date d'inscription, dépôts, abonnés et abonnements.
- Texte par défaut quand une information est vide dans l'API GitHub.
- Lien vers le profil GitHub.
- Dépôts affichés en cartes : nom, description, langage, étoiles, forks et date de mise à jour (ordre renvoyé par GitHub, du plus récemment mis à jour au plus ancien).
- Ajout à la shortlist sans doublon, avec un message de confirmation.
- Chargement, erreur 404, limite GitHub et erreur réseau avec bouton « Réessayer ».

### Shortlist (`shortlist.html`)

- Chargement des candidats depuis MockAPI (ou `localStorage` en mode démo).
- Nombre total de candidats.
- Recherche par nom ou login.
- Tri par nom ou par date d'ajout.
- Message quand la shortlist est vide ou quand la recherche ne donne rien.

## Structure

```
brief-5/
├── index.html          # page Recherche
├── profil.html         # page Profil
├── shortlist.html      # page Shortlist
├── js/
│   ├── api.js          # fetch, GET / POST et gestion des erreurs
│   ├── utils.js        # validation, dates et textes par défaut
│   ├── search.js       # page Recherche
│   ├── profil.js       # page Profil
│   └── shortlist.js    # page Shortlist
└── README.md
```

## Lancer le projet

Le projet utilise des modules ES6 (`import` / `export`), donc il faut le servir avec un serveur local. Ouvrir `index.html` directement avec `file://` ne fonctionne pas.

1. Ouvrir le dossier dans VS Code.
2. Clic droit sur `index.html` puis **Open with Live Server**.
3. Ou utiliser un serveur simple :

```bash
npx serve
```

## Configurer MockAPI

L'application fonctionne en mode démo tant que l'adresse MockAPI n'est pas configurée. Dans ce mode, la shortlist est enregistrée dans le `localStorage` du navigateur.

Pour utiliser la vraie API :

1. Créer un compte sur [mockapi.io](https://mockapi.io).
2. Créer un projet, puis une ressource nommée `candidates`.
3. Ajouter les champs : `login`, `name`, `avatar_url`, `html_url`, `location`, `public_repos`, `followers`, `added_at`.
4. Copier l'adresse de la collection, par exemple `https://xxxxx.mockapi.io/api/v1/candidates`.
5. Remplacer `MOCKAPI_URL` dans `js/api.js` :

```js
const MOCKAPI_URL = "https://xxxxx.mockapi.io/api/v1/candidates"
```

Dès que l'adresse ne contient plus `VOTRE-ID`, les candidats sont lus avec un `GET` et ajoutés avec un `POST`.

## Les appels API

Tous les appels passent par `request()` dans `js/api.js` :

- `fetch` avec `async` / `await` ;
- `try` / `catch` pour les erreurs réseau ;
- `response.ok` vérifié avant d'utiliser les données ;
- les codes 404, 403 et 429 sont transformés en messages clairs ;
- le `POST` envoie `JSON.stringify(candidate)` avec l'en-tête `Content-Type: application/json`.

Les données affichées sont créées avec `createElement` et `textContent`, jamais avec `innerHTML`.

## Déploiement

Le site est statique et peut être publié sur GitHub Pages :

1. Pousser le projet sur GitHub.
2. Aller dans **Settings → Pages**.
3. Choisir la branche `main` (ou `dev` si c'est celle qui est publiée) et le dossier `/ (root)`.
4. Le site est disponible sur `https://pinkjaguar007.github.io/brief-5/`.

## Auteur

**Younes Wardi** — YouCode Safi

GitHub : [@pinkjaguar007](https://github.com/pinkjaguar007)
