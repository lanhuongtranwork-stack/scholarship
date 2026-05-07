from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncio
import logging
import os

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _run_migrations():
    from alembic.config import Config
    from alembic import command
    cfg = Config("alembic.ini")
    command.upgrade(cfg, "head")


async def _seed():
    from seed_countries import seed
    await seed()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _run_migrations)
        logger.info("Migrations done.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")

    try:
        await _seed()
        logger.info("Seed done.")
    except Exception as e:
        logger.error(f"Seed failed: {e}")

    logger.info("Startup complete — ready to serve.")
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
