# CV Checker — Setup complet hors Base44

## Stack
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Auth + BDD** : Supabase (remplace base44.auth + base44.entities)
- **Stockage fichiers** : Supabase Storage (remplace base44.integrations.Core.UploadFile)
- **IA** : API Anthropic Claude (remplace base44.integrations.Core.InvokeLLM)
- **Déploiement** : Netlify

---

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → New project
2. Copier l'URL et la clé `anon` depuis **Settings > API**
3. Ouvrir **SQL Editor** → coller et exécuter `supabase-schema.sql`
4. Aller dans **Authentication > Providers** → activer Google si besoin

---

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir dans `.env` :
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## 3. Installer et lancer

```bash
npm install
npm run dev
```

---

## 4. Créer le premier compte admin

1. S'inscrire via `/register`
2. Choisir le rôle **Enseignant / Admin**
3. Le rôle est stocké dans `user_metadata.role = 'admin'`

---

## 5. Déployer sur Netlify

```bash
npm run build
```

Ou connecter le repo GitHub à Netlify — le `netlify.toml` gère tout automatiquement.

Dans Netlify > Site settings > Environment variables, ajouter les 3 variables du `.env`.

---

## Ce qui a changé vs Base44

| Base44 | Hors Base44 |
|--------|-------------|
| `base44.auth.login()` | `supabase.auth.signInWithPassword()` |
| `base44.auth.logout()` | `supabase.auth.signOut()` |
| `base44.entities.CVTemplate.list()` | `supabase.from('cv_templates').select()` |
| `base44.entities.CVSubmission.create()` | `supabase.from('cv_submissions').insert()` |
| `base44.integrations.Core.UploadFile()` | `supabase.storage.from('cvs').upload()` |
| `base44.integrations.Core.InvokeLLM()` | `fetch('https://api.anthropic.com/v1/messages')` |

---

## Structure du projet

```
src/
  api/index.js          ← CVTemplate, CVSubmission, uploadFile, analyzeCV
  lib/
    supabase.js         ← Client Supabase
    AuthContext.jsx     ← Auth provider
    query-client.js     ← React Query
    utils.js            ← cn()
  components/
    layout/
      AppLayout.jsx     ← Wrapper + burger mobile
      Sidebar.jsx       ← Navigation latérale
    shared/
      StatCard.jsx
      ScoreBadge.jsx
      PageHeader.jsx
    ui/
      button.jsx
      forms.jsx         ← Input, Label, Select, Switch, Textarea
      dialog.jsx
      toaster.jsx
  pages/
    Login.jsx
    Auth.jsx            ← Register, ForgotPassword, ResetPassword
    Dashboard.jsx       ← Admin + Étudiant
    Templates.jsx       ← Gestion canevas
    SubmitCV.jsx        ← Soumission + analyse IA
    Submissions.jsx     ← Mes soumissions + SubmissionDetail + AllSubmissions
```
