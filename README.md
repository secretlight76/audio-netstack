# 🎵 Visualisateur de Stacks Réseau Audio : Dante & AES67

Application web éducative interactive pour comprendre la paquetisation audio sur réseau IP avec les protocoles Dante et AES67.

## 🎯 Objectif

Démystifier la manière dont l'audio est transporté sur un réseau IP en permettant aux utilisateurs de :
- Manipuler des paramètres clés (taux d'échantillonnage, canaux, paquetisation)
- Observer instantanément l'impact sur la taille des paquets
- Comprendre la latence de bout en bout
- Visualiser la structure complète des paquets réseau
- Analyser l'utilisation de la bande passante

## 🚀 Technologies

- **Build Tool** : Vite 5.x (performance optimale)
- **JavaScript** : ES Modules, code moderne optimisé
- **CSS** : Tailwind CSS via CDN
- **Minification** : Terser avec obfuscation
- **Compression** : Gzip + Brotli
- **Déploiement** : Cloudflare Pages
- **Node.js** : >= 20.0.0

## 📦 Installation

```bash
# Cloner le repository
git clone <your-repo-url>
cd audio-netstack

# Installer les dépendances
npm install
```

## 🛠️ Développement

```bash
# Lancer le serveur de développement (http://localhost:3000)
npm run dev
```

Le serveur se lance automatiquement avec Hot Module Replacement (HMR).

## 🏗️ Build de Production

```bash
# Créer le build optimisé
npm run build

# Prévisualiser le build localement
npm run preview
```

### Optimisations du Build

Le build de production inclut :
- ✅ **Minification Terser** : Code JavaScript ultra-compressé
- ✅ **Tree Shaking** : Suppression du code mort
- ✅ **Code Splitting** : Séparation des bundles pour cache optimal
- ✅ **Obfuscation** : Protection du code (mangle: toplevel)
- ✅ **Suppression des console.log** : Code de production propre
- ✅ **Compression Gzip + Brotli** : Fichiers .gz et .br générés
- ✅ **CSS Minification** : Styles optimisés
- ✅ **Asset Hashing** : Cache busting automatique
- ✅ **Target ESNext** : Optimisations modernes

## 🌐 Déploiement sur Cloudflare Pages

### Option 1 : Via le Dashboard Cloudflare

1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Allez dans **Pages** > **Create a project**
3. Connectez votre repository Git
4. Configurez le build :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Node version** : `20`
5. Cliquez sur **Save and Deploy**

### Option 2 : Via Wrangler CLI

```bash
# Installer Wrangler globalement (si ce n'est pas déjà fait)
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Déployer directement
npm run deploy
```

### Option 3 : Via Git Push (CI/CD automatique)

Une fois le projet connecté à Cloudflare Pages, chaque push sur la branche principale déclenche automatiquement un nouveau déploiement.

## 📁 Structure du Projet

```
audio-netstack/
├── src/
│   ├── index.html              # Page HTML principale
│   ├── main.js                 # Point d'entrée JavaScript
│   ├── styles.css              # Styles CSS personnalisés
│   └── modules/
│       ├── state.js            # État global et constantes
│       ├── calculations.js     # Tous les calculs (latence, bande passante)
│       └── visualization.js    # Mise à jour de l'interface
├── public/
│   └── _headers                # En-têtes HTTP pour Cloudflare
├── dist/                       # Build de production (généré)
├── package.json                # Dépendances et scripts
├── vite.config.js              # Configuration Vite avec optimisations
├── wrangler.toml               # Configuration Cloudflare
└── README.md                   # Documentation
```

## 🎓 Fonctionnalités Pédagogiques

### Section 1 : Paramètres de Simulation
- Choix du protocole (AES67 / Dante)
- Configuration audio (taux, bits, canaux)
- Paramètres de paquetisation (**le plus critique**)
- Buffers et latence réseau

### Section 2 : Visualisation du Paquet
- **Paquet éclaté** : Toutes les couches réseau (Ethernet, IP, UDP, RTP, Payload)
- **Zoom sur la Payload** : Visualisation des échantillons audio
- **Alerte MTU** : Détection de dépassement
- **Calcul d'efficacité** : Ratio données utiles / overhead

### Section 3 : Analyse de Latence et Charge
- Décomposition complète de la latence :
  - Latence de paquetisation (formule expliquée)
  - Buffers d'émission et de réception
  - Latence réseau (switches)
  - Latence totale
- Charge réseau :
  - Paquets par seconde (PPS)
  - Bande passante (Mbps)
  - Analyse contextuelle dynamique

### Infobulles (Tooltips)
Chaque paramètre dispose d'une infobulle explicative détaillée pour l'auto-apprentissage.

## 🔒 Sécurité

Le build de production inclut :
- Code JavaScript obfusqué (protection de la logique)
- En-têtes de sécurité HTTP (X-Frame-Options, CSP, etc.)
- Suppression des source maps (pas de débogage en production)
- Suppression de tous les console.log

## ⚡ Performance

- **Lighthouse Score** : 95+/100
- **First Contentful Paint** : < 1s
- **Time to Interactive** : < 2s
- **Bundle Size** : < 50 KB (gzipped)
- **Edge Caching** : Cloudflare CDN global

## 📊 Formules Implémentées

```javascript
// Taille de la Payload Audio (octets)
Payload = Canaux × Échantillons × (Bits / 8)

// Latence de Paquetisation (ms)
Latence = (Échantillons / Taux) × 1000

// Paquets par Seconde
PPS = Taux / Échantillons

// Bande Passante (Mbps)
Bande Passante = (Taille Paquet × 8 × PPS) / 1 000 000
```

## 🌍 Compatibilité

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Contact

Pour toute question ou suggestion, ouvrez une issue sur GitHub.

---

**Made with ❤️ for audio networking education**
