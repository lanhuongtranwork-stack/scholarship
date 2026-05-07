import time
from datetime import datetime, timezone
from sqlalchemy import select, update, delete
from database import AsyncSessionLocal
from models import Scholarship, CountryInfo, Country, SyncLog
from services.ai_service import fetch_country_data
import uuid


async def run_sync(log_id: int, country_code: str, name_en: str, name_vi: str):
    start = time.time()
    async with AsyncSessionLocal() as db:
        try:
            scholarships_raw, living_raw, usage = await fetch_country_data(
                country_code, name_en, name_vi
            )

            # Upsert scholarships — delete old AI-generated ones, insert new
            await db.execute(
                delete(Scholarship).where(Scholarship.country_code == country_code)
            )

            upserted = 0
            for s in scholarships_raw:
                coverage = s.get("coverage_type", "full")
                if coverage not in ("full", "full_tuition"):
                    continue  # enforce: only full scholarships
                scholarship = Scholarship(
                    id=uuid.uuid4(),
                    country_code=country_code,
                    name_vi=s.get("name_vi", s.get("name_en", "")),
                    name_en=s.get("name_en", ""),
                    provider=s.get("provider"),
                    coverage_type=coverage,
                    coverage_details=s.get("coverage_details"),
                    monthly_stipend_usd=s.get("monthly_stipend_usd"),
                    duration_years=s.get("duration_years"),
                    language_requirements=s.get("language_requirements"),
                    academic_requirements=s.get("academic_requirements"),
                    age_limit=s.get("age_limit"),
                    nationality_eligible=s.get("nationality_eligible"),
                    application_deadline=s.get("application_deadline"),
                    application_url=s.get("application_url"),
                    official_website=s.get("official_website"),
                    description_vi=s.get("description_vi"),
                    requirements_vi=s.get("requirements_vi"),
                    tips_vi=s.get("tips_vi"),
                    data_confidence=s.get("data_confidence", "medium"),
                    ai_generated_at=datetime.now(timezone.utc),
                )
                db.add(scholarship)
                upserted += 1

            # Upsert country_info
            existing = await db.execute(
                select(CountryInfo).where(CountryInfo.country_code == country_code)
            )
            info = existing.scalar_one_or_none()
            li = living_raw

            if info:
                for field, val in {
                    "capital_city": li.get("capital_city"),
                    "major_study_cities": li.get("major_study_cities"),
                    "monthly_cost_usd_min": li.get("monthly_cost_usd_min"),
                    "monthly_cost_usd_max": li.get("monthly_cost_usd_max"),
                    "cost_breakdown": li.get("cost_breakdown"),
                    "climate_vi": li.get("climate_vi"),
                    "culture_vi": li.get("culture_vi"),
                    "safety_vi": li.get("safety_vi"),
                    "student_life_vi": li.get("student_life_vi"),
                    "healthcare_vi": li.get("healthcare_vi"),
                    "visa_notes_vi": li.get("visa_notes_vi"),
                    "post_grad_visa_vi": li.get("post_grad_visa_vi"),
                    "job_search_duration_months": li.get("job_search_duration_months"),
                    "work_permit_notes_vi": li.get("work_permit_notes_vi"),
                    "pr_pathway_vi": li.get("pr_pathway_vi"),
                    "job_market_demand_vi": li.get("job_market_demand_vi"),
                    "competition_level": li.get("competition_level"),
                    "competition_notes_vi": li.get("competition_notes_vi"),
                    "avg_starting_salary_usd": li.get("avg_starting_salary_usd"),
                    "intl_student_success_vi": li.get("intl_student_success_vi"),
                    "pros_vi": li.get("pros_vi"),
                    "cons_vi": li.get("cons_vi"),
                    "data_confidence": li.get("data_confidence", "medium"),
                    "ai_generated_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }.items():
                    setattr(info, field, val)
            else:
                info = CountryInfo(
                    country_code=country_code,
                    capital_city=li.get("capital_city"),
                    major_study_cities=li.get("major_study_cities"),
                    monthly_cost_usd_min=li.get("monthly_cost_usd_min"),
                    monthly_cost_usd_max=li.get("monthly_cost_usd_max"),
                    cost_breakdown=li.get("cost_breakdown"),
                    climate_vi=li.get("climate_vi"),
                    culture_vi=li.get("culture_vi"),
                    safety_vi=li.get("safety_vi"),
                    student_life_vi=li.get("student_life_vi"),
                    healthcare_vi=li.get("healthcare_vi"),
                    visa_notes_vi=li.get("visa_notes_vi"),
                    post_grad_visa_vi=li.get("post_grad_visa_vi"),
                    job_search_duration_months=li.get("job_search_duration_months"),
                    work_permit_notes_vi=li.get("work_permit_notes_vi"),
                    pr_pathway_vi=li.get("pr_pathway_vi"),
                    job_market_demand_vi=li.get("job_market_demand_vi"),
                    competition_level=li.get("competition_level"),
                    competition_notes_vi=li.get("competition_notes_vi"),
                    avg_starting_salary_usd=li.get("avg_starting_salary_usd"),
                    intl_student_success_vi=li.get("intl_student_success_vi"),
                    pros_vi=li.get("pros_vi"),
                    cons_vi=li.get("cons_vi"),
                    data_confidence=li.get("data_confidence", "medium"),
                    ai_generated_at=datetime.now(timezone.utc),
                )
                db.add(info)

            # Update country scholarship_count + last_synced_at
            await db.execute(
                update(Country)
                .where(Country.code == country_code)
                .values(scholarship_count=upserted, last_synced_at=datetime.now(timezone.utc))
            )

            duration = round(time.time() - start, 2)
            await db.execute(
                update(SyncLog)
                .where(SyncLog.id == log_id)
                .values(
                    status="success",
                    scholarships_found=len(scholarships_raw),
                    scholarships_upserted=upserted,
                    claude_model="llama-3.3-70b-versatile",
                    prompt_tokens=usage.input_tokens,
                    completion_tokens=usage.output_tokens,
                    duration_seconds=duration,
                    completed_at=datetime.now(timezone.utc),
                )
            )
            await db.commit()

        except Exception as e:
            duration = round(time.time() - start, 2)
            await db.execute(
                update(SyncLog)
                .where(SyncLog.id == log_id)
                .values(
                    status="failed",
                    error_message=str(e)[:2000],
                    duration_seconds=duration,
                    completed_at=datetime.now(timezone.utc),
                )
            )
            await db.commit()
