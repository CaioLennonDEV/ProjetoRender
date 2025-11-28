import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin para suprimir avisos específicos do Vite
function suppressWarnings(): Plugin {
  let originalWarn: typeof console.warn
  let originalError: typeof console.error
  
  return {
    name: 'suppress-warnings',
    configResolved() {
      // Interceptar avisos do Vite sobre módulos externalizados
      originalWarn = console.warn.bind(console)
      originalError = console.error.bind(console)
      
      console.warn = (...args: any[]) => {
        const message = String(args[0] || '')
        // Suprimir avisos sobre módulos Node.js sendo externalizados (esperado para sql.js)
        if (
          message.includes('has been externalized for browser compatibility') ||
          message.includes('Module "fs"') ||
          message.includes('Module "path"') ||
          message.includes('Module "crypto"') ||
          message.includes('[plugin:vite:resolve]')
        ) {
          return
        }
        originalWarn(...args)
      }
      
      // Também interceptar avisos de deprecação do Sass
      console.error = (...args: any[]) => {
        const message = String(args[0] || '')
        // Suprimir avisos de deprecação do Sass do frappe-gantt
        if (
          message.includes('DEPRECATION WARNING') ||
          message.includes('darken() is deprecated') ||
          message.includes('Global built-in functions are deprecated') ||
          message.includes('legacy-js-api') ||
          message.includes('color-functions')
        ) {
          return
        }
        originalError(...args)
      }
    },
    buildEnd() {
      // Restaurar console original ao finalizar
      if (originalWarn) console.warn = originalWarn
      if (originalError) console.error = originalError
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    suppressWarnings(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir avisos específicos do Rollup
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
          (warning.message && 
           typeof warning.message === 'string' && 
           (warning.message.includes('externalized') ||
            warning.message.includes('Module "fs"') ||
            warning.message.includes('Module "path"') ||
            warning.message.includes('Module "crypto"')))
        ) {
          return
        }
        warn(warning)
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suprimir avisos de deprecação do Sass (vindos do frappe-gantt)
        silenceDeprecations: ['legacy-js-api', 'global-builtin', 'color-functions'],
        quietDeps: true,
        api: 'modern-compiler', // Usar API moderna do Sass
      },
    },
  },
  // Configurar otimizações para sql.js
  optimizeDeps: {
    exclude: ['sql.js'], // Não otimizar sql.js (usa WASM)
  },
})

