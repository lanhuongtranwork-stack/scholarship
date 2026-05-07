'use client'
import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleThreshold } from 'd3-scale'
import type { Country } from '@/lib/types'
import { NUMERIC_TO_ALPHA2 } from '@/lib/constants'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const colorScale = scaleThreshold<number, string>()
  .domain([1, 3, 6])
  .range(['#d1d5db', '#bfdbfe', '#3b82f6', '#1d4ed8'])

interface Props {
  countries: Country[]
  selectedCode: string | null
  onSelect: (code: string) => void
}

export default function WorldMap({ countries, selectedCode, onSelect }: Props) {
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null)

  const countMap = new Map(countries.map((c) => [c.code, c]))

  const getColor = useCallback(
    (geoNumeric: string) => {
      const alpha2 = NUMERIC_TO_ALPHA2[geoNumeric]
      if (!alpha2) return '#e5e7eb'
      const country = countMap.get(alpha2)
      if (!country) return '#e5e7eb'
      return colorScale(country.scholarship_count)
    },
    [countMap]
  )

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const numericId = String(geo.id).padStart(3, '0')
                const alpha2 = NUMERIC_TO_ALPHA2[numericId]
                const country = alpha2 ? countMap.get(alpha2) : undefined
                const isSelected = alpha2 === selectedCode

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isSelected ? '#f59e0b' : getColor(numericId)}
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#f59e0b', cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => alpha2 && onSelect(alpha2)}
                    onMouseEnter={(e: any) => {
                      if (country) {
                        setTooltip({
                          name: country.name_vi,
                          count: country.scholarship_count,
                          x: e.clientX,
                          y: e.clientY,
                        })
                      }
                    }}
                    onMouseMove={(e: any) => {
                      if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          <div className="text-gray-300">
            {tooltip.count > 0 ? `${tooltip.count} học bổng` : 'Chưa có dữ liệu'}
          </div>
        </div>
      )}
    </div>
  )
}
