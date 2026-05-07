from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Country, CountryInfo
from schemas import CountryList, CountryDetail, CountryInfoResponse

router = APIRouter(tags=["countries"])


@router.get("/countries", response_model=list[CountryList])
async def list_countries(
    continent: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Country).order_by(Country.continent, Country.name_vi)
    if continent:
        query = query.where(Country.continent == continent)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/countries/{code}", response_model=CountryDetail)
async def get_country(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Country).where(Country.code == code.upper()))
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Không tìm thấy quốc gia")
    return country


@router.get("/countries/{code}/living-info", response_model=CountryInfoResponse)
async def get_living_info(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CountryInfo).where(CountryInfo.country_code == code.upper())
    )
    info = result.scalar_one_or_none()
    if not info:
        raise HTTPException(status_code=404, detail="Chưa có thông tin sinh sống cho quốc gia này")
    return info
