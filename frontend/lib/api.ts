import type { Country, ScholarshipListResponse, ScholarshipDetail, CountryInfo, SyncStatus } from './types'

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function post<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  countries: {
    list: (continent?: string) =>
      get<Country[]>(`/api/countries${continent && continent !== 'Tất cả' ? `?continent=${encodeURIComponent(continent)}` : ''}`),
    get: (code: string) => get<Country>(`/api/countries/${code}`),
    livingInfo: (code: string) => get<CountryInfo>(`/api/countries/${code}/living-info`),
  },
  scholarships: {
    list: (params: {
      country?: string
      continent?: string
      coverage_type?: string
      search?: string
      limit?: number
      offset?: number
    }) => {
      const q = new URLSearchParams()
      if (params.country) q.set('country', params.country)
      if (params.continent && params.continent !== 'Tất cả') q.set('continent', params.continent)
      if (params.coverage_type) q.set('coverage_type', params.coverage_type)
      if (params.search) q.set('search', params.search)
      if (params.limit) q.set('limit', String(params.limit))
      if (params.offset) q.set('offset', String(params.offset))
      return get<ScholarshipListResponse>(`/api/scholarships?${q}`)
    },
    get: (id: string) => get<ScholarshipDetail>(`/api/scholarships/${id}`),
  },
  admin: {
    triggerSync: (code: string) => post<SyncStatus>(`/api/admin/sync/${code}`),
    getSyncStatus: (code: string) => get<SyncStatus>(`/api/admin/sync/${code}/status`),
    syncAll: (continent?: string) =>
      post<{ message: string; total_countries: number }>('/api/admin/sync-all', continent ? { continent } : {}),
    logs: (country?: string) =>
      get<SyncStatus[]>(`/api/admin/sync-logs${country ? `?country=${country}` : ''}`),
  },
}
