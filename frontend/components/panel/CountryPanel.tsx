'use client'
import { useState } from 'react'
import type { Country } from '@/lib/types'
import ScholarshipTab from './ScholarshipTab'
import LivingInfoTab from './LivingInfoTab'

interface Props {
  country: Country | null
  search: string
  coverageFilter: string
  onClose: () => void
}

type Tab = 'scholarships' | 'living'

export default function CountryPanel({ country, search, coverageFilter, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('scholarships')

  if (!country) return null

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{country.flag_emoji}</span>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{country.name_vi}</h2>
              <p className="text-xs text-gray-400">{country.continent} · {country.region}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {country.scholarship_count > 0
              ? `${country.scholarship_count} học bổng toàn phần`
              : 'Chưa có dữ liệu học bổng'}
            {country.last_synced_at && (
              <span className="ml-2 text-gray-400">
                · Cập nhật {new Date(country.last_synced_at).toLocaleDateString('vi-VN')}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none p-1"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 shrink-0">
        <button
          onClick={() => setTab('scholarships')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'scholarships'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎓 Học Bổng
        </button>
        <button
          onClick={() => setTab('living')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'living'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏙️ Sinh Sống
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'scholarships' ? (
          <ScholarshipTab
            countryCode={country.code}
            search={search}
            coverageFilter={coverageFilter}
          />
        ) : (
          <LivingInfoTab countryCode={country.code} />
        )}
      </div>
    </div>
  )
}
