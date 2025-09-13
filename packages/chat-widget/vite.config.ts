import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'ChatWidget',
      fileName: (format) => `chat-widget.${format}.js`,
      formats: ['iife', 'es'],
    },
    rollupOptions: {
      output: {
        globals: {
          preact: 'preact',
        },
      },
    },
  },
})
