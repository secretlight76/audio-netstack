# 🚀 Guide de Déploiement Cloudflare Pages

## ⚠️ Problème Courant

Si vous obtenez l'erreur `ENOENT: no such file or directory, open '/opt/buildhome/repo/package.json'`, c'est que Cloudflare Pages déploie depuis le **mauvais commit**.

### Diagnostic

Vérifiez dans les logs de build :
```
HEAD is now at 448c87f Ajout du Visualisateur de Stacks Réseau Audio : Dante & AES67
```

Si vous voyez le commit `448c87f`, c'est le **premier commit** qui contenait uniquement un fichier `index.html` unique, SANS la structure npm.

## ✅ Solution

### 1. Vérifier la Branche de Déploiement

Dans Cloudflare Pages Dashboard :
1. Allez dans votre projet Pages
2. **Settings** > **Builds & deployments**
3. Vérifiez **Production branch**

**Branches valides** :
- `claude/audio-network-visualizer-019F6xgvPPLa5nKc1h587Wws` (branche feature actuelle)
- `main` (après merge de la feature branch)

**❌ NE PAS utiliser** :
- Commit `448c87f` directement
- Tags obsolètes

### 2. Configuration Build Cloudflare Pages

Dans **Settings** > **Build configuration** :

```
Framework preset: None (ou Vite)
Build command: npm run build
Build output directory: dist
Root directory: / (racine)
Node.js version: 23 (ou latest)
```

### 3. Variables d'Environnement (Optionnel)

Ajoutez si nécessaire :
```
NODE_VERSION=23
```

### 4. Fichiers de Configuration Présents

Le projet contient déjà tous les fichiers nécessaires :

- `.node-version` → Spécifie Node.js 23
- `.nvmrc` → Compatible avec nvm
- `.cloudflare/pages.json` → Config spécifique Cloudflare
- `wrangler.toml` → Config Wrangler
- `package.json` → Engines Node >=23.0.0

## 🔄 Redéploiement

### Option A : Via Dashboard

1. Allez dans **Deployments**
2. Cliquez sur **...** > **Retry deployment** sur le dernier commit valide
3. Ou cliquez sur **Create deployment** et sélectionnez la bonne branche

### Option B : Via Git Push

```bash
# Forcer un nouveau déploiement
git commit --allow-empty -m "Trigger Cloudflare Pages rebuild"
git push origin claude/audio-network-visualizer-019F6xgvPPLa5nKc1h587Wws
```

### Option C : Via Wrangler CLI

```bash
# Installer Wrangler
npm install -g wrangler

# Login
wrangler login

# Build et déployer
npm run build
wrangler pages deploy dist --project-name=audio-network-visualizer
```

## 📋 Checklist de Vérification

Avant de déployer, assurez-vous que :

- ✅ Vous êtes sur la **bonne branche** (pas sur le commit 448c87f)
- ✅ Le fichier `package.json` **existe** à la racine
- ✅ Les dossiers `src/` et `public/` **existent**
- ✅ Node.js version **23** est spécifiée
- ✅ Build command est `npm run build`
- ✅ Output directory est `dist`

## 🐛 Debugging

### Vérifier localement avant de déployer

```bash
# Simuler le build Cloudflare
rm -rf node_modules dist
npm install
npm run build

# Vérifier que dist/ existe et contient les fichiers
ls -la dist/
```

Vous devriez voir :
```
dist/
├── index.html
├── assets/
│   ├── css/
│   │   └── index-[hash].css
│   └── js/
│       ├── index-[hash].js
│       └── vendor-[hash].js
└── (fichiers .gz et .br)
```

### Logs Cloudflare

Si le déploiement échoue encore :
1. Copiez les logs complets
2. Vérifiez la ligne `HEAD is now at [commit]`
3. Assurez-vous que ce n'est PAS `448c87f`

## 📞 Support

En cas de problème persistant :
1. Supprimez le projet Cloudflare Pages
2. Recréez-le depuis zéro
3. Sélectionnez la branche `claude/audio-network-visualizer-019F6xgvPPLa5nKc1h587Wws`
4. Utilisez les paramètres ci-dessus

---

**Version du projet** : 2.0.0
**Dernière mise à jour** : 2025-11-18
