import { CodeXml, Globe } from 'lucide-react'

import cashAppDark from '@/assets/img/RGB_CashApp_Symbol_White.svg'
import cashAppLight from '@/assets/img/RGB_CashApp_Symbol.svg'
import venmoLight from '@/assets/img/Venmo_Logo_Blue.png'
import venmoDark from '@/assets/img/Venmo_Logo_White.png'
import credly from '@/assets/img/credly.png'
import githubLight from '@/assets/img/github-mark.png'
import githubDark from '@/assets/img/github-mark-white.png'
import linkedIn from '@/assets/img/InBug-White.png'
import microsoft from '@/assets/img/mslogo.png'

/**
 * Links shown on the home page and in the command menu.
 *  - `logo` holds an image per theme (`lightFilter` tints a logo that only ships in white).
 *  - `icon` is used instead of `logo` for sites without a brand mark.
 *  - `featured` cards span two columns in the bento grid.
 */
export const socialLinks = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@000Matvey000',
    description: 'Code, experiments and the OneCoolThing collection.',
    href: 'https://github.com/000Matvey000',
    group: 'Profile',
    featured: true,
    logo: { dark: githubDark, light: githubLight },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/matveyosipov',
    description: 'Experience, career updates and the professional side.',
    href: 'https://www.linkedin.com/in/matveyosipov/',
    group: 'Profile',
    featured: true,
    logo: { dark: linkedIn, light: linkedIn, lightFilter: 'brightness(0)' },
  },
  {
    id: 'mslearn',
    label: 'Microsoft Learn',
    handle: 'Learning profile',
    href: 'https://learn.microsoft.com/en-us/users/matveyosipov-0745/',
    group: 'Learning',
    logo: { dark: microsoft, light: microsoft },
  },
  {
    id: 'credly',
    label: 'Credly',
    handle: 'Certifications & badges',
    href: 'https://www.credly.com/users/matveyosipov/badges#credly',
    group: 'Learning',
    logo: { dark: credly, light: credly },
  },
  {
    id: 'cashapp',
    label: 'Cash App',
    handle: '$matveyosipov9308',
    href: 'https://cash.app/$matveyosipov9308',
    group: 'Tip jar',
    logo: { dark: cashAppDark, light: cashAppLight },
  },
  {
    id: 'venmo',
    label: 'Venmo',
    handle: '@Matvey-Osipov',
    href: 'https://account.venmo.com/u/Matvey-Osipov',
    group: 'Tip jar',
    logo: { dark: venmoDark, light: venmoLight },
  },
  {
    id: 'matvey-site',
    label: 'matveyosipov.com',
    handle: 'Personal website',
    description: 'My personal corner of the internet.',
    href: 'https://www.matveyosipov.com/',
    group: 'Website',
    featured: true,
    icon: Globe,
  },
  {
    id: 'motechs',
    label: 'Motechs.dev',
    handle: 'motechs.dev',
    description: 'Development projects and tech work.',
    href: 'https://www.motechs.dev/',
    group: 'Website',
    featured: true,
    icon: CodeXml,
  },
]
