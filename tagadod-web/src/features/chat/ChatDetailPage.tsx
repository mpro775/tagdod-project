import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Send } from 'lucide-react'
import { ListShimmer } from '../../components/shared'
import * as supportService from '../../services/supportService'
import {
  connectSupportWebSocket,
  joinTicket,
  leaveTicket,
  onNewMessage,
} from '../../services/supportWebSocket'
import type { SupportMessage } from '../../types/support'

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDay(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function MessageBubble({ msg }: { msg: SupportMessage }) {
  const isUser = msg.type === 'userMessage'
  const isSystem = msg.type === 'systemMessage'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs text-tagadod-gray">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles rounded-bl-md'
        }`}
      >
        {!isUser && msg.senderName && (
          <p className="text-xs font-medium text-primary mb-1">{msg.senderName}</p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser ? 'text-white/70' : 'text-tagadod-gray'
          } text-end`}
        >
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

function groupMessagesByDay(messages: SupportMessage[]) {
  const groups: { date: string; messages: SupportMessage[] }[] = []
  let currentDate = ''
  for (const msg of messages) {
    const day = formatDay(msg.createdAt)
    if (day !== currentDate) {
      currentDate = day
      groups.push({ date: day, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }
  return groups
}

export function ChatDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { ticketId } = useParams<{ ticketId: string }>()
  const queryClient = useQueryClient()
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasJoinedRef = useRef(false)

  // Fetch ticket info
  const { data: ticket } = useQuery({
    queryKey: ['supportTicket', ticketId],
    queryFn: () => supportService.getTicket(ticketId!),
    enabled: !!ticketId,
  })

  // Fetch messages without polling (WebSocket will handle real-time updates)
  const {
    data: messagesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['ticketMessages', ticketId],
    queryFn: () => supportService.getTicketMessages(ticketId!),
    enabled: !!ticketId,
  })

  const messages = messagesData?.data ?? []

  // Connect to WebSocket and handle incoming messages
  useEffect(() => {
    if (!ticketId) return

    connectSupportWebSocket()

    const unsubscribe = onNewMessage((msg) => {
      const newMsg = msg as { ticketId?: string }
      if (newMsg.ticketId === ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticketMessages', ticketId] })
        queryClient.invalidateQueries({ queryKey: ['supportTickets'] })
      }
    })

    joinTicket(ticketId)
    hasJoinedRef.current = true

    return () => {
      unsubscribe()
      if (hasJoinedRef.current && ticketId) {
        leaveTicket(ticketId)
      }
    }
  }, [ticketId, queryClient])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      supportService.sendMessage(ticketId!, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketMessages', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] })
      setMessageText('')
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    const text = messageText.trim()
    if (!text || sendMutation.isPending) return
    sendMutation.mutate(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const messageGroups = groupMessagesByDay(messages)

  const statusLabels: Record<string, string> = {
    open: 'مفتوحة',
    inProgress: 'قيد المعالجة',
    waitingForUser: 'بانتظار ردك',
    resolved: 'تم الحل',
    closed: 'مغلقة',
  }

  return (
    <div className="flex flex-col h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label={t('common.back')}
        >
          <ArrowRight size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
            {ticket?.title || 'محادثة'}
          </h1>
          {ticket?.status && (
            <p className="text-xs text-tagadod-gray">
              {statusLabels[ticket.status] || ticket.status}
            </p>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading && <ListShimmer count={5} />}

        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm">
              {(error as Error)?.message || t('common.error', 'حدث خطأ')}
            </p>
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-tagadod-gray">لا توجد رسائل بعد</p>
            <p className="text-xs text-tagadod-gray mt-1">ابدأ المحادثة بإرسال رسالة</p>
          </div>
        )}

        {!isLoading &&
          messageGroups.map((group, gi) => (
            <div key={gi}>
              {/* Day separator */}
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs text-tagadod-gray">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="sticky bottom-0 border-t border-gray-200 dark:border-white/10 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 py-3">
        {sendMutation.isError && (
          <p className="text-xs text-tagadod-red mb-2">
            {(sendMutation.error as Error)?.message || 'فشل إرسال الرسالة'}
          </p>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك..."
              rows={1}
              className="w-full resize-none rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-primary outline-none max-h-32 placeholder:text-tagadod-gray"
              style={{ minHeight: '44px', height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {sendMutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} className="rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
