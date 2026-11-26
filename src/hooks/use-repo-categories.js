import { useEffect, useState } from 'react'

import { site } from '@/data/site'

const CACHE_KEY = 'oct-repo-categories'
const { owner, name, contentPath, branch, url } = site.repo

// Shown when the GitHub API is unreachable or rate-limited.
const FALLBACK = ['DotNet', 'EDI', 'GitHub', 'Linux', 'Networking', 'PowerShell', 'SqlServer']

const toCategory = (folder) => ({ name: folder, url: `${url}/tree/${branch}/${contentPath}/${folder}` })

/** Lists the top-level category folders of the OneCoolThing collection, live from GitHub. */
export function useRepoCategories() {
  const [state, setState] = useState(() => {
    try {
      const cached = JSON.parse(window.sessionStorage.getItem(CACHE_KEY))
      if (Array.isArray(cached) && cached.length) return { status: 'live', categories: cached.map(toCategory) }
    } catch {
      // ignore unreadable cache
    }
    return { status: 'loading', categories: [] }
  })

  useEffect(() => {
    if (state.status !== 'loading') return undefined
    const controller = new AbortController()

    fetch(`https://api.github.com/repos/${owner}/${name}/contents/${contentPath}?ref=${branch}`, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((entries) => {
        const folders = entries.filter((entry) => entry.type === 'dir').map((entry) => entry.name)
        if (!folders.length) throw new Error('empty')
        try {
          window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(folders))
        } catch {
          // ignore storage errors
        }
        setState({ status: 'live', categories: folders.map(toCategory) })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState({ status: 'offline', categories: FALLBACK.map(toCategory) })
      })

    return () => controller.abort()
  }, [state.status])

  return state
}
