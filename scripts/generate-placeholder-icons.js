#!/usr/bin/env node

/**
 * Script pour générer des icônes placeholder PNG basiques
 * À remplacer par de vraies icônes générées depuis icon.svg
 *
 * Usage: node scripts/generate-placeholder-icons.js
 */

const fs = require('fs');
const path = require('path');

// Dimensions requises pour les icônes
const sizes = [
  { width: 192, height: 192, name: 'icon-192x192.png' },
  { width: 512, height: 512, name: 'icon-512x512.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' },
  { width: 32, height: 32, name: 'favicon-32x32.png' },
  { width: 16, height: 16, name: 'favicon-16x16.png' },
];

const iconsDir = path.join(__dirname, '../public/icons');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// PNG 1x1 transparent minimal en base64
// Il s'agit d'un PNG valide de 1x1 pixel transparent
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

console.log('🎨 Génération des icônes placeholder...\n');

sizes.forEach(({ width, height, name }) => {
  const filepath = path.join(iconsDir, name);

  // Ne pas écraser si le fichier existe déjà
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  ${name} existe déjà, ignoré`);
    return;
  }

  // Écrire le PNG transparent
  fs.writeFileSync(filepath, transparentPNG);
  console.log(`✅ ${name} créé (${width}x${height}px)`);
});

console.log('\n⚠️  IMPORTANT:');
console.log('Ces icônes sont des placeholders transparents 1x1.');
console.log('Pour une vraie PWA, générez les icônes depuis /public/icons/icon.svg');
console.log('Consultez /public/icons/README.md pour les instructions.\n');
