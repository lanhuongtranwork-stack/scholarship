from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncio
import logging
import os

load_dotenv()

logger = logging.getLogger(__name__)


async def _run_migrations():
    try:
        import selectors
        from alembic.config import Config
        from alembic import command

        def _migrate():
            cfg = Config("alembic.ini")
            command.upgrade(cfg, "head")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _migrate)
        logger.info("Migrations completed.")
    except Exception as e:
        logger.error(f"Migration error (non-fatal): {e}")


async def _seed():
    try:
        from seed_countries import seed
        await seed()
        logger.info("Seed completed.")
    except Exception as e:
        logger.error(f"Seed error (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _run_migrations()
    await _seed()
    yield


from routes import countries, scholarships, admin

app = FastAPI(title="Bản Đồ Học Bổng Thế Giới API", version="1.0.0", lifespan=lifespan)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(countries.router, prefix="/api")
app.include_router(scholarships.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Bản Đồ Học Bổng API đang chạy"}
