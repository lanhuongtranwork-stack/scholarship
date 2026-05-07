import os
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import Country, Scholarship, SyncLog
from schemas import SyncStatusResponse, SyncLogResponse
from services.sync_service import run_sync

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/sync/{country_code}", response_model=SyncStatusResponse)
async def trigger_sync(
    country_code: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    code = country_code.upper()
    result = await db.execute(select(Country).where(Country.code == code))
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Không tìm thấy quốc gia")

    log = SyncLog(country_code=code, status="running", triggered_by="admin_manual")
    db.add(log)
    await db.commit()
    await db.refresh(log)

    background_tasks.add_task(run_sync, log.id, code, country.name_en, country.name_vi)

    return SyncStatusResponse(
        log_id=log.id,
        country_code=code,
        status="running",
        message=f"Đang đồng bộ {country.name_vi}...",
    )


@router.get("/sync/{country_code}/status", response_model=SyncStatusResponse)
async def get_sync_status(country_code: str, db: AsyncSession = Depends(get_db)):
    code = country_code.upper()
    result = await db.execute(
        select(SyncLog)
        .where(SyncLog.country_code == code)
        .order_by(SyncLog.started_at.desc())
        .limit(1)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Chưa có lịch sử đồng bộ")

    return SyncStatusResponse(
        log_id=log.id,
        country_code=code,
        status=log.status,
        message=f"Trạng thái: {log.status}",
        scholarships_found=log.scholarships_found,
        scholarships_upserted=log.scholarships_upserted,
        error_message=log.error_message,
        duration_seconds=float(log.duration_seconds) if log.duration_seconds else None,
    )


@router.get("/sync-logs", response_model=list[SyncLogResponse])
async def list_sync_logs(
    country: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(SyncLog).order_by(SyncLog.started_at.desc()).limit(limit)
    if country:
        query = query.where(SyncLog.country_code == country.upper())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/sync-all")
async def sync_all(
    background_tasks: BackgroundTasks,
    continent: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Country)
    if continent:
        query = query.where(Country.continent == continent)
    result = await db.execute(query)
    countries = result.scalars().all()

    for c in countries:
        log = SyncLog(country_code=c.code, status="running", triggered_by="admin_bulk")
        db.add(log)
        await db.flush()
        background_tasks.add_task(run_sync, log.id, c.code, c.name_en, c.name_vi)

    await db.commit()
    label = continent or "toàn thế giới"
    return {"message": f"Đã lên lịch đồng bộ {len(countries)} quốc gia ({label})", "total_countries": len(countries)}


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_countries = (await db.execute(select(func.count(Country.id)))).scalar_one()
    synced_countries = (
        await db.execute(select(func.count(Country.id)).where(Country.last_synced_at.isnot(None)))
    ).scalar_one()
    total_scholarships = (await db.execute(select(func.count(Scholarship.id)))).scalar_one()

    last_log = (
        await db.execute(
            select(SyncLog.completed_at)
            .where(SyncLog.status == "success")
            .order_by(SyncLog.completed_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    return {
        "total_countries": total_countries,
        "synced_countries": synced_countries,
        "total_scholarships": total_scholarships,
        "last_sync_at": last_log,
    }


@router.get("/api-key-status")
async def get_api_key_status():
    key = os.getenv("GEMINI_API_KEY", "")
    return {"configured": bool(key), "prefix": key[:10] + "..." if len(key) > 10 else ""}
