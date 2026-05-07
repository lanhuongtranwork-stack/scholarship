'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import type { SyncStatus } from '@/lib/types'

interface Props {
  countryCode: string
  onDone?: () => void
}

export default function SyncButton({ countryCode, onDone }: Props) {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const handleSync = async () => {
    setLoading(true)
    try {
      const s = await api.admin.triggerSync(countryCode)
      setStatus(s)
      pollRef.current = setInterval(async () => {
        const updated = await api.admin.getSyncStatus(countryCode)
        setStatus(updated)
        if (updated.status !== 'running') {
          stopPolling()
          setLoading(false)
          onDone?.()
        }
      }, 2000)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => () => stopPolling(), [])

  const isRunning = loading || status?.status === 'running'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={isRunning}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isRunning
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isRunning ? '⏳ Đang sync...' : '🔄 Đồng bộ'}
      </button>
      {status && status.status !== 'running' && (
        <span className={`text-xs ${status.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {status.status === 'success'
            ? `✓ ${status.scholarships_upserted} học bổng`
            : `✗ Lỗi`}
        </span>
      )}
    </div>
  )
}
