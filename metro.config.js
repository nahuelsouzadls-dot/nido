const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Zustand v4.4+ distribuye dos builds: CJS (index.js) y ESM (esm/index.mjs).
// La versión ESM usa import.meta.env?.MODE (patrón Vite) para las advertencias
// de deprecación en desarrollo. Metro bundlea el archivo como CommonJS y no
// puede manejar import.meta, causando "SyntaxError: Cannot use 'import.meta'
// outside a module" en el navegador.
//
// Metro elige el ESM porque detecta que el import statement es ESM
// (isESMImport: true) y añade la condición "import" a la resolución del
// campo exports. Como zustand prioriza "import" sobre "default" en su exports,
// elige esm/index.mjs.
//
// Fix: para builds web, interceptar la resolución de zustand y forzar
// el uso de los archivos CJS que no tienen import.meta.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'zustand') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/zustand/index.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'zustand/vanilla') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/zustand/vanilla.js'),
        type: 'sourceFile',
      };
    }
  }
  // Para todo lo demás, usar el resolver por defecto de Metro.
  // Metro pasa resolveRequest: resolve (su función interna) en el contexto,
  // así que esta llamada no causa recursión infinita.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
