#!/usr/bin/env node

/**
 * Script para generar el archivo swagger.json estático
 * Uso: node generate-swagger.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const swaggerSpec = require('./src/config/swagger');

const outputPath = path.join(__dirname, 'swagger.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`✅ Archivo swagger.json generado en: ${outputPath}`);
console.log(`\n📄 Puedes compartir este archivo con tu compañero del frontend.`);
console.log(`\n🌐 Para verlo, entra en: https://editor.swagger.io`);
console.log(`   Y carga el archivo swagger.json`);
