'use client'
import { useState } from 'react'
import type { ScholarshipCard as IScholarshipCard } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { COVERAGE_LABELS } from '@/lib/constants'

interface Props {
  scholarship: IScholarshipCard
}

export default function ScholarshipCard({ scholarship: s }: Props) {
  const [expanded, setExpanded] = useState(false)

  const cd = s.coverage_details
  const coverageItems = cd
    ? [
        cd.tuition && 'Học phí',
        cd.living && 'Sinh hoạt phí',
        cd.flight && 'Vé máy bay',
        cd.health_insurance && 'Bảo hiểm y tế',
      ].filter(Boolean)
    : []

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{s.name_vi}</h3>
          {s.name_en !== s.name_vi && (
            <p className="text-xs text-gray-400 mt-0.5">{s.name_en}</p>
          )}
        </div>
        <Badge variant={s.coverage_type === 'full' ? 'green' : 'blue'} className="shrink-0">
          {COVERAGE_LABELS[s.coverage_type]}
        </Badge>
      </div>

      {s.provider && (
        <p className="text-xs text-gray-500 mb-3">🏛️ {s.provider}</p>
      )}

      {/* Coverage chips */}
      {coverageItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coverageItems.map((item) => (
            <span key={item as string} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
              ✓ {item}
            </span>
          ))}
        </div>
      )}

      {/* Key info row */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-3">
        {s.monthly_stipend_usd && (
          <div>💰 ~${s.monthly_stipend_usd.toLocaleString()}/tháng</div>
        )}
        {s.duration_years && (
          <div>⏱️ {s.duration_years} năm</div>
        )}
        {s.language_requirements?.english && (
          <div>🌐 {s.language_requirements.english}</div>
        )}
        {s.application_deadline && (
          <div>📅 {s.application_deadline}</div>
        )}
      </div>

      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        {expanded ? '▲ Thu gọn' : '▼ Xem chi tiết'}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700">
          {(s as any).description_vi && (
            <p>{(s as any).description_vi}</p>
          )}
          {(s as any).requirements_vi && (
            <div>
              <p className="font-semibold text-gray-800 mb-1">Yêu cầu:</p>
              <p className="whitespace-pre-line">{(s as any).requirements_vi}</p>
            </div>
          )}
          {(s as any).tips_vi && (
            <div className="bg-amber-50 rounded-lg p-2.5">
              <p className="font-semibold text-amber-800 mb-1">💡 Mẹo apply:</p>
              <p className="text-amber-700 whitespace-pre-line">{(s as any).tips_vi}</p>
            </div>
          )}
          {s.data_confidence === 'low' && (
            <p className="text-orange-600 bg-orange-50 rounded px-2 py-1">
              ⚠️ Thông tin có thể chưa cập nhật — vui lòng kiểm tra trang chính thức.
            </p>
          )}
          {s.application_url && (
            <a
              href={s.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
            >
              Xem thông tin chính thức →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
