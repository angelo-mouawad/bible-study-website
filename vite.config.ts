import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// A relative base means the build works on any GitHub Pages path
// (https://user.github.io/repo-name/) without editing this file.
// All app navigation uses the URL hash, so no server routes are needed.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
