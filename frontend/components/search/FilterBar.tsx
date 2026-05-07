'use client'

interface Props {
  coverageFilter: string
  onCoverageChange: (v: string) => void
}

const options = [
  { value: '', label: 'Tất cả loại' },
  { value: 'full', label: 'Học bổng toàn phần' },
  { value: 'full_tuition', label: '100% học phí' },
]

export default function FilterBar({ coverageFilter, onCoverageChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 shrink-0">Loại:</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onCoverageChange(o.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              coverageFilter === o.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
