import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, MessageCircle, Clock } from 'lucide-react'
import {
  GlobalButton,
  GlobalTextField,
  EmptyState,
  BottomSheet,
  ListShimmer,
} from '../../components/shared'
import * as supportService from '../../services/supportService'
import type { SupportTicket } from '../../types/support'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: {
    label: 'مفتوحة',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  inProgress: {
    label: 'قيد المعالجة',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  waitingForUser: {
    label: 'بانتظار ردك',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  resolved: {
    label: 'تم الحل',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  closed: {
    label: 'مغلقة',
    color: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  },
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: SupportTicket
  onClick: () => void
}) {
  const statusInfo = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.open

  return (
    <button
      onClick={onClick}
      className="w-full text-start rounded-xl p-4 border border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
            {ticket.title}
          </h4>
          {ticket.lastMessage && (
            <p className="text-xs text-tagadod-gray mt-1 line-clamp-2">
              {ticket.lastMessage}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Clock size={12} className="text-tagadod-gray" />
            <span className="text-xs text-tagadod-gray">
              {formatDate(ticket.lastMessageAt || ticket.createdAt)}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>
      {ticket.unreadCount != null && ticket.unreadCount > 0 && (
        <div className="mt-2 flex justify-end">
          <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            {ticket.unreadCount}
          </span>
        </div>
      )}
    </button>
  )
}

export function ChatPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showNewTicket, setShowNewTicket] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const {
    data: ticketsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => supportService.getMyTickets(),
  })

  const tickets = ticketsData?.data ?? []

  const createMutation = useMutation({
    mutationFn: () =>
      supportService.createTicket({
        title: title.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] })
      setShowNewTicket(false)
      setTitle('')
      setMessage('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
            aria-label={t('common.back')}
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            الدردشة
          </h1>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
          aria-label="تذكرة جديدة"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="p-4">
        {/* Loading */}
        {isLoading && <ListShimmer count={4} />}

        {/* Error */}
        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm">
              {(error as Error)?.message || t('common.error', 'حدث خطأ')}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && tickets.length === 0 && (
          <EmptyState
            icon={<MessageCircle size={56} strokeWidth={1.5} />}
            title="لا توجد تذاكر"
            subtitle="أنشئ تذكرة جديدة للتواصل مع فريق الدعم"
            action={
              <GlobalButton
                onClick={() => setShowNewTicket(true)}
                fullWidth={false}
                className="px-6"
              >
                تذكرة جديدة
              </GlobalButton>
            }
          />
        )}

        {/* Tickets list */}
        {!isLoading && !isError && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => navigate(`/chat/${ticket.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Ticket BottomSheet */}
      <BottomSheet
        open={showNewTicket}
        onClose={() => {
          setShowNewTicket(false)
          createMutation.reset()
        }}
        title="تذكرة جديدة"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlobalTextField
            label="عنوان التذكرة"
            placeholder="أدخل عنوان الموضوع..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <GlobalTextField
            label="الرسالة"
            placeholder="اكتب رسالتك..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            required
          />

          {createMutation.isError && (
            <p className="text-xs text-tagadod-red">
              {(createMutation.error as Error)?.message ||
                'حدث خطأ أثناء الإنشاء'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <GlobalButton
              type="button"
              variant="ghost"
              onClick={() => setShowNewTicket(false)}
              className="border border-gray-300 dark:border-white/20"
            >
              {t('common.cancel', 'إلغاء')}
            </GlobalButton>
            <GlobalButton
              type="submit"
              loading={createMutation.isPending}
              disabled={!title.trim() || !message.trim()}
            >
              إرسال
            </GlobalButton>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
