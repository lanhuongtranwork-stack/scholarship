'use client'
import { CONTINENTS } from '@/lib/constants'
import type { Continent } from '@/lib/types'

interface Props {
  active: Continent
  onChange: (c: Continent) => void
}

export default function ContinentTabs({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTINENTS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === c
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
