import { ensureGeneratedViteConfig } from '@buna/config'
import { spawn } from 'node:child_process'

export async function dev() {
  await ensureGeneratedViteConfig()

  const child = spawn('vite', ['--config', '.buna/vite.config.ts'], {
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
