import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: [
            'localhost',
            'cs4241-final-project-a25-41s7.onrender.com',
            '.onrender.com' // Allow all Render.com subdomains
        ],
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        emptyOutDir: true
    },
})