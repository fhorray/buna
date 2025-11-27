import { ensureGeneratedViteConfig } from '@buna/config'
import { spawn } from 'node:child_process'

export async function build() {
  await ensureGeneratedViteConfig()

  const child = spawn('vite', ['build', '--config', '.buna/vite.config.ts'], {
    stdio: 'inherit',
    shell: true,
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
