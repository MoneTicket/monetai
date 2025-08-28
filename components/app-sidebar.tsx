import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'

import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'

export default function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleInteraction = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-2 px-2 py-3" onClick={handleInteraction}>
          <Image
            src="/images/logocoin.png"
            alt="Sabiduria Logo"
            width={40}
            height={40}
            className={cn('size-10')}
          />
          <Image
            src="/images/monetai.png"
            alt="Monetai"
            width={100}
            height={40}
            className="invert dark:invert-0"
          />
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-2 py-4 h-full">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2" onClick={handleInteraction}>
                <Plus className="size-4" />
                <span>Nuevo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<ChatHistorySkeleton />}>
            <ChatHistorySection />
          </Suspense>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
