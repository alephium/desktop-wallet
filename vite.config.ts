/*
Copyright 2018 - 2023 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 3000
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    },
    include: ['@alephium/sdk'] // To allow for using npm link https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js', '@vitest/web-worker'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js']
    }
  },
  build: {
    target: 'es2020',
    outDir: 'build'
  },
  base: ''
})
