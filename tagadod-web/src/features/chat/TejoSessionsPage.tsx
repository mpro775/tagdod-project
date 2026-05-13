import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, Bot, Clock, MessageCircle, Plus, RefreshCw, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as supportService from '../../services/supportService'
import { useLanguageStore } from '../../stores/languageStore'
import type { TejoSession } from '../../types/support'

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getSessionTitle(session: TejoSession): string {
  return session.title?.trim() || 'محادثة تيجو'
}

function TejoSessionCard({ session, onClick }: { session: TejoSession; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-start rounded-2xl p-4 border border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bot size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
              {getSessionTitle(session)}
            </h3>
            {session.handoffTriggered && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <UserCheck size={11} />
                تذكرة مرتبطة
              </span>
            )}
          </div>
          <p className="text-xs text-tagadod-gray mt-1 line-clamp-2 min-h-4">
            {session.lastMessagePreview || 'لا توجد رسائل بعد'}
          </p>
          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-tagadod-gray">
              <Clock size={12} />
              <span>{formatDate(session.lastMessageAt || session.createdAt)}</span>
            </div>
            <span className="text-xs text-tagadod-gray">{session.messageCount} رسالة</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function TejoSessionsPage() {
  const navigate = useNavigate()
  const language = useLanguageStore((s) => s.language)

  const sessionsQuery = useQuery({
    queryKey: ['tejoSessions', 'web'],
    queryFn: () => supportService.getUserSessions({ channel: 'web', page: 1, limit: 20 }),
  })

  const createSessionMutation = useMutation({
    mutationFn: () =>
      supportService.createTejoSession({
        channel: 'web',
        locale: language === 'ar' ? 'ar-SA' : 'en-US',
      }),
    onSuccess: (session) => {
      navigate(`/tejo/${session.id}`)
    },
  })

  const sessions = sessionsQuery.data?.data ?? []

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
            aria-label="رجوع"
          >
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              محادثات تيجو
            </h1>
            <p className="text-xs text-tagadod-gray">محادثات المساعد الذكي من الويب فقط</p>
          </div>
        </div>
        <button
          onClick={() => createSessionMutation.mutate()}
          disabled={createSessionMutation.isPending}
          className="p-2 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          aria-label="محادثة جديدة"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="p-4">
        {sessionsQuery.isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-gray-100 dark:bg-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {sessionsQuery.isError && (
          <div className="py-12 text-center">
            <p className="text-sm text-tagadod-red mb-4">تعذر تحميل محادثات تيجو.</p>
            <button
              onClick={() => sessionsQuery.refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm"
            >
              <RefreshCw size={14} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {!sessionsQuery.isLoading && !sessionsQuery.isError && sessions.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              لا توجد محادثات تيجو
            </h2>
            <p className="text-sm text-tagadod-gray mt-2 mb-5">
              ابدأ محادثة جديدة مع المساعد الذكي واستكملها لاحقًا من هنا.
            </p>
            <button
              onClick={() => createSessionMutation.mutate()}
              disabled={createSessionMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              <Plus size={18} />
              محادثة جديدة
            </button>
          </div>
        )}

        {!sessionsQuery.isLoading && !sessionsQuery.isError && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <TejoSessionCard
                key={session.id}
                session={session}
                onClick={() => navigate(`/tejo/${session.id}`)}
              />
            ))}
          </div>
        )}

        {createSessionMutation.isError && (
          <p className="mt-4 text-xs text-center text-tagadod-red">
            تعذر إنشاء محادثة جديدة. يرجى المحاولة مرة أخرى.
          </p>
        )}
      </div>
    </div>
  )
}
