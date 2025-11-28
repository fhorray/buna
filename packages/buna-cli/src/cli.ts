#!/usr/bin/env bun
import { dev } from './commands/dev'
import { build } from './commands/build'

async function main() {
  const [, , command] = process.argv

  if (command === 'dev') {
    await dev()
  } else if (command === 'build') {
    await build()
  } else {
    console.log('Usage: buna dev | buna build')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
