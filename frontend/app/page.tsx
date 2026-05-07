'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Country, Continent } from '@/lib/types'
import { api } from '@/lib/api'
import ContinentTabs from '@/components/map/ContinentTabs'
import MapLegend from '@/components/map/MapLegend'
import CountryPanel from '@/components/panel/CountryPanel'
import SearchBar from '@/components/search/SearchBar'
import FilterBar from '@/components/search/FilterBar'

const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false })

export default function Home() {
  const [allCountries, setAllCountries] = useState<Country[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [continent, setContinent] = useState<Continent>('Tất cả')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [coverageFilter, setCoverageFilter] = useState('')

  useEffect(() => {
    api.countries.list().then(setAllCountries)
  }, [])

  useEffect(() => {
    if (continent === 'Tất cả') {
      setFilteredCountries(allCountries)
    } else {
      setFilteredCountries(allCountries.filter((c) => c.continent === continent))
    }
  }, [continent, allCountries])

  const selectedCountry = allCountries.find((c) => c.code === selectedCode) ?? null

  const handleSelect = useCallback((code: string) => {
    setSelectedCode(code)
    setSearch('')
    setCoverageFilter('')
  }, [])

  const handleContinentChange = useCallback((c: Continent) => {
    setContinent(c)
    setSelectedCode(null)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Bản Đồ Học Bổng Thế Giới</h1>
              <p className="text-xs text-gray-400">Học bổng thạc sĩ 100% học phí &amp; toàn phần</p>
            </div>
          </div>
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600 underline">
            Admin
          </a>
        </div>
      </header>

      {/* Continent tabs */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5 shrink-0">
        <ContinentTabs active={continent} onChange={handleContinentChange} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 flex flex-col min-w-0 p-4 gap-3">
          <MapLegend />
          <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <WorldMap
              countries={filteredCountries}
              selectedCode={selectedCode}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Side panel */}
        <div
          className={`shrink-0 transition-all duration-300 ${
            selectedCode ? 'w-[420px]' : 'w-0 overflow-hidden'
          }`}
        >
          {selectedCode && (
            <div className="flex flex-col h-full">
              {selectedCountry && (
                <div className="bg-white border-b border-gray-100 px-4 py-2 space-y-2 shrink-0">
                  <SearchBar value={search} onChange={setSearch} placeholder="Tìm học bổng trong nước này..." />
                  <FilterBar coverageFilter={coverageFilter} onCoverageChange={setCoverageFilter} />
                </div>
              )}
              <div className="flex-1 min-h-0">
                <CountryPanel
                  country={selectedCountry}
                  search={search}
                  coverageFilter={coverageFilter}
                  onClose={() => setSelectedCode(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
