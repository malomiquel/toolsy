# Génération des icônes PWA

Ce dossier contient les icônes nécessaires pour la Progressive Web App (PWA) de Toolsy.

## Fichier source

- `icon.svg` - Icône vectorielle source avec le logo Toolsy

## Icônes requises à générer

Vous devez générer les fichiers PNG suivants à partir de `icon.svg` :

### Icônes PWA (obligatoires)
- `icon-192x192.png` - Icône standard pour Android et Chrome
- `icon-512x512.png` - Icône haute résolution pour splash screens

### Icônes iOS/Apple
- `apple-touch-icon.png` (180x180px) - Icône pour iOS Home Screen

### Favicons (optionnels mais recommandés)
- `favicon-32x32.png` - Favicon standard
- `favicon-16x16.png` - Favicon petit format
- `favicon.ico` - Favicon multiformat (peut contenir 16x16 et 32x32)

## Méthodes de génération

### Option 1 : Service en ligne (recommandé)

Utilisez **[RealFaviconGenerator.net](https://realfavicongenerator.net/)** :
1. Téléchargez `icon.svg`
2. Le site génère automatiquement toutes les tailles nécessaires
3. Téléchargez le package généré
4. Extrayez les fichiers dans ce dossier `/public/icons/`

### Option 2 : ImageMagick (ligne de commande)

Si ImageMagick est installé sur votre système :

```bash
# Depuis le dossier /public/icons/

# Icônes PWA
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 512x512 icon-512x512.png

# Apple touch icon
magick icon.svg -resize 180x180 apple-touch-icon.png

# Favicons
magick icon.svg -resize 32x32 favicon-32x32.png
magick icon.svg -resize 16x16 favicon-16x16.png
```

### Option 3 : Inkscape (ligne de commande)

Si Inkscape est installé :

```bash
inkscape icon.svg --export-filename=icon-192x192.png --export-width=192 --export-height=192
inkscape icon.svg --export-filename=icon-512x512.png --export-width=512 --export-height=512
inkscape icon.svg --export-filename=apple-touch-icon.png --export-width=180 --export-height=180
```

### Option 4 : Éditeur graphique

Ouvrez `icon.svg` dans :
- **Figma** (en ligne ou application)
- **Adobe Illustrator**
- **Sketch**
- **Affinity Designer**

Puis exportez aux tailles requises en PNG.

## Vérification

Une fois les icônes générées, vérifiez que vous avez :

```
/public/icons/
├── icon.svg (source)
├── icon-192x192.png ✓
├── icon-512x512.png ✓
├── apple-touch-icon.png ✓
├── favicon-32x32.png (optionnel)
├── favicon-16x16.png (optionnel)
└── README.md (ce fichier)
```

## Après génération

1. Commitez les nouvelles icônes PNG dans Git
2. Lancez `pnpm build` pour générer le service worker
3. Testez l'installation PWA avec `pnpm start` (mode production uniquement)
4. Vérifiez dans DevTools > Application > Manifest que les icônes s'affichent correctement

## Notes importantes

- Les icônes **doivent être en PNG** (le SVG n'est pas supporté par tous les navigateurs pour les PWA)
- Les icônes `maskable` (Android) doivent avoir une zone de sécurité de 20% sur les bords
- Pour iOS, privilégiez un fond opaque (pas de transparence)
- La couleur de thème actuelle est `#3b82f6` (bleu)
