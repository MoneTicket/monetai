import { createClient } from '@/lib/supabase/server'

import { ChatHistoryClient } from './chat-history-client'

export async function ChatHistorySection() {
  const enableSaveChatHistory = process.env.ENABLE_SAVE_CHAT_HISTORY === 'true'
  if (!enableSaveChatHistory) {
    return null
  }

  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return <ChatHistoryClient />
}
