'use client'

import { useState, useTransition } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { toast } from 'sonner'
import { Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroupAction
} from '@/components/ui/sidebar'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

interface ClearHistoryActionProps {
  empty: boolean
}

export function ClearHistoryAction({ empty }: ClearHistoryActionProps) {
  const user = useCurrentUser()
  const [isPending, start] = useTransition()
  const [open, setOpen] = useState(false)

  const onClear = () =>
    start(async () => {
      if (!user) {
        localStorage.setItem('anon_chats', '[]')
        window.dispatchEvent(new CustomEvent('chat-history-updated'))
        toast.success('History cleared')
        setOpen(false)
        return
      }
      // Usuario autenticado: llamada a API
      const res = await fetch('/api/chats', { method: 'DELETE' })
      const result = await res.json()
      result?.error ? toast.error(result.error) : toast.success('History cleared')
      setOpen(false)
      window.dispatchEvent(new CustomEvent('chat-history-updated'))
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarGroupAction disabled={empty || !user} className="static size-7 p-1">
          <MoreHorizontal size={16} />
          <span className="sr-only">History Actions</span>
        </SidebarGroupAction>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              disabled={empty || isPending || !user}
              className="gap-2 text-destructive focus:text-destructive"
              onSelect={event => event.preventDefault()}
            >
              <Trash2 size={14} /> Clear History
            </DropdownMenuItem>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. It will permanently delete your
                history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={isPending || !user} onClick={onClear}>
                {isPending ? <Spinner /> : 'Clear'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}