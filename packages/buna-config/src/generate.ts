import fs from 'node:fs'
import path from 'node:path'

export async function ensureGeneratedViteConfig(rootDir: string = process.cwd()) {
  const bunaDir = path.join(rootDir, '.buna')
  const viteConfigPath = path.join(bunaDir, 'vite.config.ts')

  if (!fs.existsSync(bunaDir)) {
    fs.mkdirSync(bunaDir, { recursive: true })
  }

  if (!fs.existsSync(viteConfigPath)) {
    const content = `import { defineConfig } from 'vite';
import { createViteConfigFromBuna } from '@buna/config/vite';
import bunaConfig from '../buna.config';

export default defineConfig(createViteConfigFromBuna(bunaConfig));
`
    fs.writeFileSync(viteConfigPath, content, 'utf8')
  }
}
