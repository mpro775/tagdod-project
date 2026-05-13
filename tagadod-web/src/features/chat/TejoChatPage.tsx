import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Send, Bot, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react'
import * as supportService from '../../services/supportService'
import { useLanguageStore } from '../../stores/languageStore'
import type { TejoAction } from '../../types/support'
import { isAxiosError } from 'axios'

interface TejoMessage {
  id: string
  content: string
  type: 'user' | 'tejo' | 'system'
  suggestions?: string[]
  actions?: TejoAction[]
  cards?: Array<Record<string, unknown>>
  handoffSuggested?: boolean
  createdAt: string
}

const WELCOME_MESSAGE: TejoMessage = {
  id: 'tejo-welcome',
  content:
    'مرحبًا، أنا تيجو مساعد تجدد الذكي. أقدر أساعدك في المنتجات، الطلبات، الدفع، التوصيل، وخدمات الصيانة.',
  type: 'tejo',
  suggestions: [
    'ما هي منصة تجدد؟',
    'كيف أشتري منتج؟',
    'كيف أطلب صيانة؟',
    'أريد دعم بشري',
  ],
  createdAt: new Date().toISOString(),
}

const INITIAL_SUGGESTIONS = [
  'ما هي منصة تجدد؟',
  'كيف أشتري منتج؟',
  'كيف أطلب صيانة؟',
  'أريد دعم بشري',
]

type TejoError = 'none' | 'unauthorized' | 'forbidden' | 'server' | 'network'

function getTejoError(err: unknown): TejoError {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 401) return 'unauthorized'
    if (status === 403) return 'forbidden'
    if (status === 500) return 'server'
    return 'network'
  }
  return 'network'
}

function getErrorContent(errorType: TejoError): string {
  switch (errorType) {
    case 'unauthorized':
      return 'يرجى تسجيل الدخول للمتابعة.'
    case 'forbidden':
      return 'تيجو غير مفعل حاليًا. يرجى المحاولة لاحقًا.'
    case 'server':
      return 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.'
    case 'network':
      return 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
    default:
      return 'حدث خطأ غير متوقع.'
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function TejoChatPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const language = useLanguageStore((s) => s.language)
  const [messages, setMessages] = useState<TejoMessage[]>([WELCOME_MESSAGE])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS)
  const [activeActions, setActiveActions] = useState<TejoAction[]>([])
  const [handoffSuggested, setHandoffSuggested] = useState(false)
  const [handoffConfirmed, setHandoffConfirmed] = useState(false)
  const [escalatedTicketId, setEscalatedTicketId] = useState<string | null>(null)
  const [_sessionStatus, setSessionStatus] = useState<string>('active')
  const [errorType, setErrorType] = useState<TejoError>('none')
  const [failedMessage, setFailedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const loadSessionHistory = useCallback(async (currentSessionId: string) => {
    try {
      const response = await supportService.getSessionMessages(currentSessionId)
      if (response.data && response.data.length > 0) {
        const historyMessages: TejoMessage[] = response.data.map((msg) => ({
          id: msg.id || `hist-${msg.createdAt}`,
          content: msg.content,
          type: msg.role === 'user' ? 'user' : 'tejo',
          handoffSuggested: (msg.metadata as { handoffSuggested?: boolean })?.handoffSuggested || false,
          createdAt: msg.createdAt,
        }))

        setMessages([WELCOME_MESSAGE, ...historyMessages])

        const lastMsg = response.data[response.data.length - 1]
        if (lastMsg?.metadata?.handoffSuggested) {
          setHandoffSuggested(true)
        }
      }
    } catch (err) {
      console.error('Failed to load session history:', err)
    }
  }, [])

  useEffect(() => {
    setMessages([WELCOME_MESSAGE])
    setActiveSuggestions(INITIAL_SUGGESTIONS)
    setActiveActions([])
    setHandoffSuggested(false)
    setHandoffConfirmed(false)
    setEscalatedTicketId(null)
    setSessionStatus('active')

    if (sessionId) {
      loadSessionHistory(sessionId)
    }
  }, [loadSessionHistory, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendToTejo = useCallback(
    async (text: string) => {
      const userMsg: TejoMessage = {
        id: `user-${Date.now()}`,
        content: text,
        type: 'user',
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setActiveSuggestions([])
      setActiveActions([])
      setErrorType('none')
      setFailedMessage(null)
      setIsLoading(true)

      try {
        if (!sessionId) {
          throw new Error('Missing Tejo session id')
        }

        const response = await supportService.queryTejo({
          message: text,
          channel: 'web',
          locale: language === 'ar' ? 'ar-SA' : 'en-US',
          sessionId,
        })

        if (!response.sessionId) {
          throw new Error('Tejo API did not return a session id')
        }

        if (response.sessionId !== sessionId) {
          navigate(`/tejo/${response.sessionId}`, { replace: true })
        }

        if (response.status) {
          setSessionStatus(response.status)
        }

        const tejoMsg: TejoMessage = {
          id: response.messageId || `tejo-${Date.now()}`,
          content: response.reply,
          type: 'tejo',
          suggestions: response.suggestions?.length ? response.suggestions : undefined,
          actions: response.actions?.length ? response.actions : undefined,
          cards: response.cards?.length ? response.cards : undefined,
          handoffSuggested: response.handoffSuggested,
          createdAt: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, tejoMsg])

        if (response.suggestions?.length) {
          setActiveSuggestions(response.suggestions)
        }
        if (response.actions?.length) {
          setActiveActions(response.actions)
        }
        if (response.handoffSuggested) {
          setHandoffSuggested(true)
        }
        if (response.status === 'escalated') {
          setHandoffConfirmed(true)
          setEscalatedTicketId(response.ticketId || null)
        }
      } catch (err) {
        const te = getTejoError(err)
        setErrorType(te)
        setFailedMessage(text)

        if (te === 'unauthorized') {
          const sysMsg: TejoMessage = {
            id: `sys-auth-${Date.now()}`,
            content: getErrorContent(te),
            type: 'system',
            createdAt: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, sysMsg])
          setTimeout(() => navigate('/login'), 2000)
        } else {
          const sysMsg: TejoMessage = {
            id: `sys-err-${Date.now()}`,
            content: getErrorContent(te),
            type: 'system',
            createdAt: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, sysMsg])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, language, navigate],
  )

  const handleSend = () => {
    const text = messageText.trim()
    if (!text || isLoading) return
    setMessageText('')
    sendToTejo(text)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return
    sendToTejo(suggestion)
  }

  const handleActionClick = (action: TejoAction) => {
    if (isLoading) return
    if (action.type === 'request_handoff') {
      handleHandoffConfirm()
      return
    }
    sendToTejo(action.label)
  }

  const handleRetry = () => {
    if (failedMessage) {
      setErrorType('none')
      setFailedMessage(null)
      sendToTejo(failedMessage)
    }
  }

  const handleHandoffConfirm = async () => {
    if (!sessionId) return
    setIsLoading(true)
    try {
      const result = await supportService.triggerTejoHandoff(sessionId)
      setHandoffConfirmed(true)
      setEscalatedTicketId(result.ticketId)
      setSessionStatus(result.status)

      const sysMsg: TejoMessage = {
        id: `sys-handoff-${Date.now()}`,
        content:
          'تم إنشاء تذكرة دعم مرتبطة بهذه المحادثة. يمكنك متابعة الدعم البشري من صفحة التذاكر، وستبقى محادثة تيجو متاحة هنا.',
        type: 'system',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, sysMsg])
    } catch (err) {
      const sysMsg: TejoMessage = {
        id: `sys-handoff-err-${Date.now()}`,
        content: 'فشل في التحويل. يرجى المحاولة مرة أخرى.',
        type: 'system',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, sysMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleHandoffDecline = () => {
    setHandoffSuggested(false)
    const sysMsg: TejoMessage = {
      id: `sys-decline-${Date.now()}`,
      content: 'تمام، يمكنك إعادة صياغة سؤالك وسأحاول مساعدتك.',
      type: 'system',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, sysMsg])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label="رجوع"
        >
          <ArrowRight size={24} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              تيجو - المساعد الذكي
            </h1>
            <p className="text-xs text-primary">متصل</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'system' ? (
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-xs text-tagadod-red text-center max-w-[85%]">
                  {msg.content}
                </span>
              </div>
            ) : (
              <div
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.type === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles rounded-bl-md'
                  }`}
                >
                  {msg.type === 'tejo' && (
                    <p className="text-xs font-medium text-primary mb-1">تيجو</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.cards
                        .slice(0, 3)
                        .map((card, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white/10 dark:bg-black/20 px-2 py-1"
                          >
                            <p className="text-xs font-semibold">
                              {(card as { title?: string }).title || 'منتج'}
                            </p>
                            {(card as { subtitle?: string }).subtitle && (
                              <p className="text-[10px] opacity-80">
                                {(card as { subtitle?: string }).subtitle}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  <p
                    className={`text-[10px] mt-1 ${
                      msg.type === 'user' ? 'text-white/70' : 'text-tagadod-gray'
                    } text-end`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {msg.handoffSuggested && !handoffConfirmed && (
              <div className="flex justify-center my-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-xs text-yellow-700 dark:text-yellow-300 max-w-[85%]">
                  <AlertTriangle size={14} />
                  <span>لم أجد إجابة مؤكدة. هل تريد تحويلك لموظف دعم؟</span>
                </div>
              </div>
            )}

            {msg.type === 'tejo' && msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 justify-start">
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={`${msg.id}-sug-${idx}`}
                    onClick={() => handleSuggestionClick(s)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {msg.type === 'tejo' && msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 justify-start">
                {msg.actions.map((action, idx) => (
                  <button
                    key={`${msg.id}-act-${idx}`}
                    onClick={() => handleActionClick(action)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-100 dark:bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 max-w-[60%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-xs text-tagadod-gray">تيجو يكتب...</p>
              </div>
            </div>
          </div>
        )}

        {handoffSuggested && !handoffConfirmed && (
          <div className="flex justify-center gap-3 my-3">
            <button
              onClick={handleHandoffConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <UserCheck size={16} />
              نعم، حولني لموظف
            </button>
            <button
              onClick={handleHandoffDecline}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              لا، أريد متابعة مع تيجو
            </button>
          </div>
        )}

        {handoffConfirmed && escalatedTicketId && (
          <div className="flex justify-center my-3">
            <button
              onClick={() => navigate(`/chat/${escalatedTicketId}`)}
              className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <UserCheck size={16} />
              عرض التذكرة ومتابعة مع الموظف
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {errorType !== 'none' && errorType !== 'unauthorized' && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <p className="flex-1 text-xs text-tagadod-red">{getErrorContent(errorType)}</p>
            <button
              onClick={handleRetry}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tagadod-red text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={12} />
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 border-t border-gray-200 dark:border-white/10 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 py-3">
        {(activeSuggestions.length > 0 || activeActions.length > 0) && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-2">
            {activeSuggestions.map((s, idx) => (
              <button
                key={`active-sug-${idx}`}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                {s}
              </button>
            ))}
            {activeActions.map((action, idx) => (
              <button
                key={`active-act-${idx}`}
                onClick={() => handleActionClick(action)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                {action.label}
              </button>
            ))}
          </div>
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
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isLoading}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  )
}
