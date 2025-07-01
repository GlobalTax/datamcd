
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🎨 Formateando código con Prettier...');

try {
  // Formatear todos los archivos TypeScript y JavaScript
  execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx}"', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Formateo completado exitosamente');
  console.log('📋 Los archivos han sido formateados con:');
  console.log('   - Semicolons: enabled');
  console.log('   - Single quotes: enabled'); 
  console.log('   - Tailwind classes: ordenadas automáticamente');
  console.log('   - Print width: 80 caracteres');
  
} catch (error) {
  console.error('❌ Error durante el formateo:', error.message);
  process.exit(1);
}
