'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Country } from '@/lib/types'
import { api } from '@/lib/api'
import SyncButton from '@/components/admin/SyncButton'
import { CONTINENTS } from '@/lib/constants'
import type { Continent } from '@/lib/types'

export default function AdminPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [continent, setContinent] = useState<Continent>('Tất cả')
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncAllMsg, setSyncAllMsg] = useState('')

  const loadCountries = useCallback(() => {
    api.countries.list(continent !== 'Tất cả' ? continent : undefined).then(setCountries)
  }, [continent])

  useEffect(() => { loadCountries() }, [loadCountries])

  const handleSyncAll = async () => {
    setSyncingAll(true)
    setSyncAllMsg('')
    try {
      const res = await api.admin.syncAll(continent !== 'Tất cả' ? continent : undefined)
      setSyncAllMsg(res.message)
    } finally {
      setSyncingAll(false)
    }
  }

  const synced = countries.filter((c) => c.last_synced_at).length
  const total = countries.length
  const totalScholarships = countries.reduce((s, c) => s + c.scholarship_count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Bản đồ</a>
            <span className="text-gray-300">|</span>
            <h1 className="font-bold text-gray-900">Admin — Đồng bộ dữ liệu</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {synced}/{total} nước đã sync · {totalScholarships} học bổng
            </span>
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {syncingAll ? '⏳ Đang sync tất cả...' : '🔄 Sync tất cả'}
            </button>
          </div>
        </div>
        {syncAllMsg && (
          <p className="mt-2 text-sm text-green-600">{syncAllMsg}</p>
        )}
      </header>

      {/* Continent filter */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5">
        <div className="flex gap-2 flex-wrap">
          {CONTINENTS.map((c) => (
            <button
              key={c}
              onClick={() => setContinent(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                continent === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Quốc gia</th>
                <th className="text-left px-4 py-3">Khu vực</th>
                <th className="text-center px-4 py-3">Học bổng</th>
                <th className="text-left px-4 py-3">Lần sync cuối</th>
                <th className="text-right px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {countries.map((c) => (
                <tr key={c.code} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="mr-2">{c.flag_emoji}</span>
                    <span className="font-medium text-gray-800">{c.name_vi}</span>
                    <span className="ml-2 text-xs text-gray-400">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.region}</td>
                  <td className="px-4 py-3 text-center">
                    {c.scholarship_count > 0 ? (
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {c.scholarship_count}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.last_synced_at
                      ? new Date(c.last_synced_at).toLocaleString('vi-VN')
                      : <span className="text-gray-300">Chưa sync</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SyncButton countryCode={c.code} onDone={loadCountries} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
