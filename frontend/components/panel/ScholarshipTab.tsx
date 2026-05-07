'use client'
import { useEffect, useState } from 'react'
import type { ScholarshipCard as IScholarshipCard } from '@/lib/types'
import { api } from '@/lib/api'
import ScholarshipCard from './ScholarshipCard'
import Spinner from '@/components/ui/Spinner'

interface Props {
  countryCode: string
  search: string
  coverageFilter: string
}

export default function ScholarshipTab({ countryCode, search, coverageFilter }: Props) {
  const [items, setItems] = useState<IScholarshipCard[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.scholarships
      .list({
        country: countryCode,
        coverage_type: coverageFilter || undefined,
        search: search || undefined,
        limit: 50,
      })
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
  }, [countryCode, search, coverageFilter])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>

  if (items.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-2">🔍</p>
      <p>Chưa có học bổng nào.</p>
      <p className="text-sm mt-1">Hãy đồng bộ dữ liệu từ trang Admin.</p>
    </div>
  )

  return (
    <div className="space-y-3 pb-6">
      <p className="text-xs text-gray-400">{total} học bổng được tìm thấy</p>
      {items.map((s) => (
        <ScholarshipCard key={s.id} scholarship={s} />
      ))}
    </div>
  )
}
