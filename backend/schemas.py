from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import datetime


class CountryBase(BaseModel):
    code: str
    name_vi: str
    name_en: str
    region: Optional[str] = None
    continent: Optional[str] = None
    flag_emoji: Optional[str] = None
    scholarship_count: int = 0
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CountryList(CountryBase):
    pass


class CountryDetail(CountryBase):
    created_at: Optional[datetime] = None


class ScholarshipCard(BaseModel):
    id: str
    country_code: str

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v: Any) -> str:
        return str(v)
    name_vi: str
    name_en: str
    provider: Optional[str] = None
    coverage_type: str
    coverage_details: Optional[dict] = None
    monthly_stipend_usd: Optional[int] = None
    duration_years: Optional[float] = None
    language_requirements: Optional[dict] = None
    application_deadline: Optional[str] = None
    application_url: Optional[str] = None
    data_confidence: Optional[str] = None

    class Config:
        from_attributes = True


class ScholarshipDetail(ScholarshipCard):
    academic_requirements: Optional[str] = None
    age_limit: Optional[int] = None
    nationality_eligible: Optional[str] = None
    official_website: Optional[str] = None
    description_vi: Optional[str] = None
    requirements_vi: Optional[str] = None
    tips_vi: Optional[str] = None
    ai_generated_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ScholarshipListResponse(BaseModel):
    total: int
    items: list[ScholarshipCard]


class CostBreakdown(BaseModel):
    rent_usd: Optional[int] = None
    food_usd: Optional[int] = None
    transport_usd: Optional[int] = None
    utilities_usd: Optional[int] = None
    entertainment_usd: Optional[int] = None


class CountryInfoResponse(BaseModel):
    country_code: str
    capital_city: Optional[str] = None
    major_study_cities: Optional[list[str]] = None
    monthly_cost_usd_min: Optional[int] = None
    monthly_cost_usd_max: Optional[int] = None
    cost_breakdown: Optional[Any] = None
    climate_vi: Optional[str] = None
    culture_vi: Optional[str] = None
    safety_vi: Optional[str] = None
    student_life_vi: Optional[str] = None
    healthcare_vi: Optional[str] = None
    visa_notes_vi: Optional[str] = None
    post_grad_visa_vi: Optional[str] = None
    job_search_duration_months: Optional[int] = None
    work_permit_notes_vi: Optional[str] = None
    pr_pathway_vi: Optional[str] = None
    job_market_demand_vi: Optional[str] = None
    competition_level: Optional[str] = None
    competition_notes_vi: Optional[str] = None
    avg_starting_salary_usd: Optional[int] = None
    intl_student_success_vi: Optional[str] = None
    pros_vi: Optional[list[str]] = None
    cons_vi: Optional[list[str]] = None
    data_confidence: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SyncLogResponse(BaseModel):
    id: int
    country_code: str
    triggered_by: Optional[str] = None
    status: str
    scholarships_found: Optional[int] = None
    scholarships_upserted: Optional[int] = None
    error_message: Optional[str] = None
    claude_model: Optional[str] = None
    duration_seconds: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SyncStatusResponse(BaseModel):
    log_id: int
    country_code: str
    status: str
    message: str
    scholarships_found: Optional[int] = None
    scholarships_upserted: Optional[int] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None
