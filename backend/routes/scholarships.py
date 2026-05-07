from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from database import get_db
from models import Scholarship, Country
from schemas import ScholarshipCard, ScholarshipDetail, ScholarshipListResponse
import uuid

router = APIRouter(tags=["scholarships"])


@router.get("/scholarships", response_model=ScholarshipListResponse)
async def list_scholarships(
    country: str | None = None,
    continent: str | None = None,
    coverage_type: str | None = Query(None, pattern="^(full|full_tuition)$"),
    search: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(Scholarship).where(Scholarship.is_active == True)

    if country:
        query = query.where(Scholarship.country_code == country.upper())

    if continent:
        query = query.join(Country, Scholarship.country_code == Country.code).where(
            Country.continent == continent
        )

    if coverage_type:
        query = query.where(Scholarship.coverage_type == coverage_type)

    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Scholarship.name_vi.ilike(term),
                Scholarship.name_en.ilike(term),
                Scholarship.provider.ilike(term),
                Scholarship.description_vi.ilike(term),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Scholarship.coverage_type, Scholarship.name_vi).offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    return ScholarshipListResponse(total=total, items=items)


@router.get("/scholarships/{scholarship_id}", response_model=ScholarshipDetail)
async def get_scholarship(scholarship_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = uuid.UUID(scholarship_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = await db.execute(select(Scholarship).where(Scholarship.id == uid))
    scholarship = result.scalar_one_or_none()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Không tìm thấy học bổng")
    return scholarship
