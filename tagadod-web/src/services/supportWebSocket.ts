import { Socket } from 'socket.io-client'
import { createSocket } from './socket'

type MessageCallback = (message: unknown) => void
type TypingCallback = (data: { ticketId: string; userId: string; isTyping: boolean }) => void
type TicketEventCallback = (data: { ticketId: string; userId?: string }) => void

const listeners: {
  onMessage: MessageCallback[]
  onTyping: TypingCallback[]
  onJoined: TicketEventCallback[]
  onLeft: TicketEventCallback[]
} = {
  onMessage: [],
  onTyping: [],
  onJoined: [],
  onLeft: [],
}

let socket: Socket | null = null

export function connectSupportWebSocket(): void {
  if (socket?.connected) return

  socket = createSocket('/support', {
    transports: ['websocket'],
    onConnect: () => {
      console.log('[SupportWS] Connected')
    },
    onDisconnect: (reason) => {
      console.log('[SupportWS] Disconnected:', reason)
    },
    onConnectError: (error) => {
      console.error('[SupportWS] Connection error:', error)
    },
  })

  socket.on('message:new', (message) => {
    console.log('[SupportWS] New message:', message)
    listeners.onMessage.forEach((cb) => cb(message))
  })

  socket.on('support:new-message', (message) => {
    console.log('[SupportWS] New message (alt):', message)
    listeners.onMessage.forEach((cb) => cb(message))
  })

  socket.on('user-typing', (data) => {
    console.log('[SupportWS] User typing:', data)
    listeners.onTyping.forEach((cb) => cb(data as { ticketId: string; userId: string; isTyping: boolean }))
  })

  socket.on('joined-ticket', (data) => {
    console.log('[SupportWS] Joined ticket:', data)
    listeners.onJoined.forEach((cb) => cb(data as { ticketId: string; userId?: string }))
  })

  socket.on('left-ticket', (data) => {
    console.log('[SupportWS] Left ticket:', data)
    listeners.onLeft.forEach((cb) => cb(data as { ticketId: string; userId?: string }))
  })
}

export function disconnectSupportWebSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinTicket(ticketId: string): void {
  if (socket?.connected) {
    socket.emit('join-ticket', { ticketId })
    console.log(`[SupportWS] Joined ticket: ${ticketId}`)
  }
}

export function leaveTicket(ticketId: string): void {
  if (socket?.connected) {
    socket.emit('leave-ticket', { ticketId })
    console.log(`[SupportWS] Left ticket: ${ticketId}`)
  }
}

export function sendTypingIndicator(ticketId: string, isTyping: boolean): void {
  if (socket?.connected) {
    socket.emit('typing', { ticketId, isTyping })
  }
}

export function onNewMessage(callback: MessageCallback): () => void {
  listeners.onMessage.push(callback)
  return () => {
    const idx = listeners.onMessage.indexOf(callback)
    if (idx > -1) listeners.onMessage.splice(idx, 1)
  }
}

export function onUserTyping(callback: TypingCallback): () => void {
  listeners.onTyping.push(callback)
  return () => {
    const idx = listeners.onTyping.indexOf(callback)
    if (idx > -1) listeners.onTyping.splice(idx, 1)
  }
}

export function onJoinedTicket(callback: TicketEventCallback): () => void {
  listeners.onJoined.push(callback)
  return () => {
    const idx = listeners.onJoined.indexOf(callback)
    if (idx > -1) listeners.onJoined.splice(idx, 1)
  }
}

export function onLeftTicket(callback: TicketEventCallback): () => void {
  listeners.onLeft.push(callback)
  return () => {
    const idx = listeners.onLeft.indexOf(callback)
    if (idx > -1) listeners.onLeft.splice(idx, 1)
  }
}

export function isSupportSocketConnected(): boolean {
  return socket?.connected ?? false
}
