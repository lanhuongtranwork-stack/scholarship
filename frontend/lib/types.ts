export interface Country {
  code: string
  name_vi: string
  name_en: string
  region: string | null
  continent: string | null
  flag_emoji: string | null
  scholarship_count: number
  last_synced_at: string | null
}

export interface CoverageDetails {
  tuition: boolean
  living: boolean
  flight: boolean
  health_insurance: boolean
}

export interface LanguageRequirements {
  english: string
  local: string
}

export interface ScholarshipCard {
  id: string
  country_code: string
  name_vi: string
  name_en: string
  provider: string | null
  coverage_type: 'full' | 'full_tuition'
  coverage_details: CoverageDetails | null
  monthly_stipend_usd: number | null
  duration_years: number | null
  language_requirements: LanguageRequirements | null
  application_deadline: string | null
  application_url: string | null
  data_confidence: 'high' | 'medium' | 'low' | null
}

export interface ScholarshipDetail extends ScholarshipCard {
  academic_requirements: string | null
  age_limit: number | null
  nationality_eligible: string | null
  official_website: string | null
  description_vi: string | null
  requirements_vi: string | null
  tips_vi: string | null
  ai_generated_at: string | null
  updated_at: string | null
}

export interface ScholarshipListResponse {
  total: number
  items: ScholarshipCard[]
}

export interface CostBreakdown {
  rent_usd: number | null
  food_usd: number | null
  transport_usd: number | null
  utilities_usd: number | null
  entertainment_usd: number | null
}

export interface CountryInfo {
  country_code: string
  capital_city: string | null
  major_study_cities: string[] | null
  monthly_cost_usd_min: number | null
  monthly_cost_usd_max: number | null
  cost_breakdown: CostBreakdown | null
  climate_vi: string | null
  culture_vi: string | null
  safety_vi: string | null
  student_life_vi: string | null
  healthcare_vi: string | null
  visa_notes_vi: string | null
  post_grad_visa_vi: string | null
  job_search_duration_months: number | null
  work_permit_notes_vi: string | null
  pr_pathway_vi: string | null
  job_market_demand_vi: string | null
  competition_level: 'low' | 'medium' | 'high' | null
  competition_notes_vi: string | null
  avg_starting_salary_usd: number | null
  intl_student_success_vi: string | null
  pros_vi: string[] | null
  cons_vi: string[] | null
  data_confidence: 'high' | 'medium' | 'low' | null
  updated_at: string | null
}

export interface SyncStatus {
  log_id: number
  country_code: string
  status: 'running' | 'success' | 'failed'
  message: string
  scholarships_found: number | null
  scholarships_upserted: number | null
  error_message: string | null
  duration_seconds: number | null
}

export type Continent = 'Tất cả' | 'Châu Á' | 'Châu Âu' | 'Bắc Mỹ' | 'Nam Mỹ' | 'Châu Phi' | 'Châu Đại Dương'
