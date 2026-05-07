'use client'
import { useEffect, useState } from 'react'
import type { CountryInfo } from '@/lib/types'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import { COMPETITION_LABELS } from '@/lib/constants'

interface Props {
  countryCode: string
}

export default function LivingInfoTab({ countryCode }: Props) {
  const [info, setInfo] = useState<CountryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    api.countries.livingInfo(countryCode)
      .then(setInfo)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [countryCode])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>
  if (error || !info) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-2">📭</p>
      <p>Chưa có thông tin sinh sống.</p>
      <p className="text-sm mt-1">Hãy đồng bộ dữ liệu từ trang Admin.</p>
    </div>
  )

  return (
    <div className="space-y-6 pb-6">
      {/* Chi phí sinh hoạt */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          💵 Chi phí sinh hoạt hàng tháng
        </h3>
        {(info.monthly_cost_usd_min || info.monthly_cost_usd_max) && (
          <div className="bg-blue-50 rounded-xl p-4 mb-3">
            <p className="text-2xl font-bold text-blue-700">
              ${info.monthly_cost_usd_min?.toLocaleString()} – ${info.monthly_cost_usd_max?.toLocaleString()}
              <span className="text-sm font-normal text-blue-500 ml-1">USD/tháng</span>
            </p>
          </div>
        )}
        {info.cost_breakdown && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'rent_usd', label: '🏠 Nhà ở' },
              { key: 'food_usd', label: '🍜 Ăn uống' },
              { key: 'transport_usd', label: '🚌 Đi lại' },
              { key: 'utilities_usd', label: '💡 Tiện ích' },
              { key: 'entertainment_usd', label: '🎭 Giải trí' },
            ].map(({ key, label }) => {
              const val = (info.cost_breakdown as any)?.[key]
              if (!val) return null
              return (
                <div key={key} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="float-right font-semibold text-gray-800">${val}/tháng</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Sinh sống */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">🌏 Đặc điểm sinh sống</h3>
        {info.capital_city && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Thủ đô:</span> {info.capital_city}
            {info.major_study_cities?.length ? ` · Thành phố học tập phổ biến: ${info.major_study_cities.join(', ')}` : ''}
          </p>
        )}
        {[
          { label: '🌤️ Khí hậu', val: info.climate_vi },
          { label: '🤝 Văn hóa & Con người', val: info.culture_vi },
          { label: '🛡️ An toàn', val: info.safety_vi },
          { label: '🎓 Đời sống sinh viên', val: info.student_life_vi },
          { label: '🏥 Y tế', val: info.healthcare_vi },
          { label: '✈️ Visa du học', val: info.visa_notes_vi },
        ].map(({ label, val }) => val ? (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">{label}</p>
            <p className="text-gray-600">{val}</p>
          </div>
        ) : null)}
      </section>

      {/* Cơ hội việc làm */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">💼 Cơ hội việc làm</h3>
        {info.competition_level && (
          <div className={`rounded-xl p-3 text-sm font-medium ${
            info.competition_level === 'low' ? 'bg-green-50 text-green-700' :
            info.competition_level === 'medium' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            Mức độ cạnh tranh với dân bản địa: {COMPETITION_LABELS[info.competition_level]}
          </div>
        )}
        {[
          { label: '📊 Phân tích cạnh tranh', val: info.competition_notes_vi },
          { label: '🔍 Ngành nghề cần nhân lực', val: info.job_market_demand_vi },
          { label: '⏳ Thời gian tìm việc trung bình', val: info.job_search_duration_months ? `~${info.job_search_duration_months} tháng` : null },
          { label: '💰 Lương khởi điểm sau thạc sĩ', val: info.avg_starting_salary_usd ? `~$${info.avg_starting_salary_usd.toLocaleString()}/năm` : null },
          { label: '🌍 Sinh viên quốc tế ở lại làm việc', val: info.intl_student_success_vi },
        ].map(({ label, val }) => val ? (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">{label}</p>
            <p className="text-gray-600">{val}</p>
          </div>
        ) : null)}
      </section>

      {/* Lộ trình ở lại */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">🛂 Lộ trình ở lại sau tốt nghiệp</h3>
        {[
          { label: '📋 Visa sau tốt nghiệp', val: info.post_grad_visa_vi },
          { label: '📝 Giấy phép lao động', val: info.work_permit_notes_vi },
          { label: '🏡 Lộ trình định cư / PR', val: info.pr_pathway_vi },
        ].map(({ label, val }) => val ? (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">{label}</p>
            <p className="text-gray-600">{val}</p>
          </div>
        ) : null)}
      </section>

      {/* Pros & Cons */}
      {(info.pros_vi?.length || info.cons_vi?.length) && (
        <section>
          <h3 className="font-semibold text-gray-800 mb-3">⚖️ Ưu & Nhược điểm</h3>
          <div className="grid grid-cols-2 gap-3">
            {info.pros_vi?.length ? (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="font-medium text-green-700 mb-2 text-sm">✅ Điểm cộng</p>
                <ul className="space-y-1">
                  {info.pros_vi.map((p, i) => (
                    <li key={i} className="text-xs text-green-700">• {p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {info.cons_vi?.length ? (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="font-medium text-red-700 mb-2 text-sm">⚠️ Thách thức</p>
                <ul className="space-y-1">
                  {info.cons_vi.map((c, i) => (
                    <li key={i} className="text-xs text-red-700">• {c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  )
}
