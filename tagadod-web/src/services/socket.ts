import { io, Socket } from 'socket.io-client'
import { getToken } from '../stores/authStore'
import { API_BASE_URL } from '../config/env'

function getWebSocketUrl(namespace: string): string {
  const baseUrl = API_BASE_URL.replace('/api/v1', '')
  return `${baseUrl}${namespace}`
}

export function createSocket(
  namespace: string,
  options?: {
    transports?: ('websocket' | 'polling')[]
    onConnect?: () => void
    onDisconnect?: (reason: string) => void
    onConnectError?: (error: Error) => void
  }
): Socket {
  const token = getToken()
  const url = getWebSocketUrl(namespace)

  const socket = io(url, {
    transports: options?.transports ?? ['websocket', 'polling'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 999999,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })

  socket.on('connect', () => {
    console.log(`[Socket] Connected to ${namespace}`)
    options?.onConnect?.()
  })

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected from ${namespace}: ${reason}`)
    options?.onDisconnect?.(reason)
  })

  socket.on('connect_error', (error) => {
    console.error(`[Socket] Connection error for ${namespace}:`, error)
    options?.onConnectError?.(error)
  })

  return socket
}
