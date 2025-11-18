import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,

    // Optimisations avancées
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Supprimer les console.log en production
        drop_debugger: true,      // Supprimer les debugger
        pure_funcs: ['console.log', 'console.info'], // Fonctions à supprimer
        passes: 2                 // Deux passes de minification
      },
      mangle: {
        toplevel: true,          // Obfusquer les noms de variables au niveau global
        properties: false         // Ne pas obfusquer les propriétés d'objets
      },
      format: {
        comments: false          // Supprimer tous les commentaires
      }
    },

    // Code splitting pour optimisation du cache
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vite/modulepreload-polyfill']
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(-1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },

    // Taille maximale des chunks (en Ko)
    chunkSizeWarningLimit: 1000,

    // Target moderne pour meilleure optimisation
    target: 'esnext',

    // Source maps désactivées en production pour la sécurité
    sourcemap: false,

    // Optimisations CSS
    cssCodeSplit: true,
    cssMinify: true,
  },

  // Plugins
  plugins: [
    // Compression Gzip et Brotli
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,        // Compresser les fichiers > 1KB
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    })
  ],

  // Serveur de développement
  server: {
    port: 3000,
    host: true,
    open: true
  },

  // Preview (pour tester le build)
  preview: {
    port: 4173,
    host: true
  }
});
