'use client'

import { SiInstagram, SiX, SiYoutube } from 'react-icons/si'
import Link from 'next/link'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const externalLinks = [
  {
    name: 'X',
    href: 'https://x.com/morphic_ai',
    icon: <SiX className="mr-2 h-4 w-4" />
  },
  {
    name: 'Youtube',
    href: 'https://youtube.com',
    icon: <SiYoutube className="mr-2 h-4 w-4" />
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: <SiInstagram className="mr-2 h-4 w-4" />
  }
]

export function ExternalLinkItems() {
  return (
    <>
      {externalLinks.map(link => (
        <DropdownMenuItem key={link.name} asChild>
          <Link href={link.href} target="_blank" rel="noopener noreferrer">
            {link.icon}
            <span>{link.name}</span>
          </Link>
        </DropdownMenuItem>
      ))}
    </>
  )
}
