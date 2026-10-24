import { cp, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(scriptDir, '..')
const docsDir = resolve(root, 'docs')
const mirrorDir = resolve(root, 'Coolthings/GitHub/GithubPages')

await rm(mirrorDir, { recursive: true, force: true })
await cp(docsDir, mirrorDir, { recursive: true })
