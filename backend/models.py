from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric,
    TIMESTAMP, ARRAY, ForeignKey, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from database import Base


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True)
    code = Column(String(3), unique=True, nullable=False, index=True)
    name_vi = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=False)
    region = Column(String(100))
    continent = Column(String(50), index=True)
    flag_emoji = Column(String(10))
    scholarship_count = Column(Integer, default=0)
    last_synced_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code = Column(String(3), ForeignKey("countries.code"), nullable=False, index=True)
    name_vi = Column(String(300), nullable=False)
    name_en = Column(String(300), nullable=False)
    provider = Column(String(200))
    # Only "full_tuition" (100% tuition) or "full" (full scholarship incl. living)
    coverage_type = Column(String(20), nullable=False, index=True)
    coverage_details = Column(JSONB)
    monthly_stipend_usd = Column(Integer, nullable=True)
    duration_years = Column(Numeric(3, 1))
    language_requirements = Column(JSONB)
    academic_requirements = Column(Text)
    age_limit = Column(Integer, nullable=True)
    nationality_eligible = Column(Text)
    application_deadline = Column(String(100))
    application_url = Column(Text, nullable=True)
    official_website = Column(Text, nullable=True)
    description_vi = Column(Text)
    requirements_vi = Column(Text)
    tips_vi = Column(Text)
    is_active = Column(Boolean, default=True)
    data_confidence = Column(String(20), default="medium")
    ai_generated_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class CountryInfo(Base):
    __tablename__ = "country_info"

    id = Column(Integer, primary_key=True)
    country_code = Column(String(3), ForeignKey("countries.code"), unique=True, nullable=False, index=True)
    capital_city = Column(String(100))
    major_study_cities = Column(ARRAY(Text))
    monthly_cost_usd_min = Column(Integer, nullable=True)
    monthly_cost_usd_max = Column(Integer, nullable=True)
    cost_breakdown = Column(JSONB)
    climate_vi = Column(Text)
    culture_vi = Column(Text)
    safety_vi = Column(Text)
    student_life_vi = Column(Text)
    healthcare_vi = Column(Text)
    visa_notes_vi = Column(Text)
    # Post-graduation & career
    post_grad_visa_vi = Column(Text)
    job_search_duration_months = Column(Integer, nullable=True)
    work_permit_notes_vi = Column(Text)
    pr_pathway_vi = Column(Text)
    job_market_demand_vi = Column(Text)
    competition_level = Column(String(20))
    competition_notes_vi = Column(Text)
    avg_starting_salary_usd = Column(Integer, nullable=True)
    intl_student_success_vi = Column(Text)
    pros_vi = Column(ARRAY(Text))
    cons_vi = Column(ARRAY(Text))
    data_confidence = Column(String(20), default="medium")
    ai_generated_at = Column(TIMESTAMP(timezone=True), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True)
    country_code = Column(String(3), ForeignKey("countries.code"), nullable=False, index=True)
    triggered_by = Column(String(50), default="admin_manual")
    status = Column(String(20), default="running")
    scholarships_found = Column(Integer, nullable=True)
    scholarships_upserted = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    claude_model = Column(String(50), nullable=True)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    duration_seconds = Column(Numeric(6, 2), nullable=True)
    started_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
