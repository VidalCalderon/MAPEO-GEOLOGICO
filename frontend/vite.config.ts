import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  // @ts-ignore
  plugins: [react(), typeof cesium === 'function' ? cesium() : cesium.default()],
})
