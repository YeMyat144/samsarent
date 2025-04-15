import { Suspense } from "react"
import ChatPage from "@/components/chat-page"
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPage />
    </Suspense>
  )
}
