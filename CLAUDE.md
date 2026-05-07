# CLAUDE.md — Bản Đồ Học Bổng Thế Giới

## Tổng quan dự án
Web app bản đồ học bổng thạc sĩ toàn phần thế giới, giao diện tiếng Việt. Người dùng click vào nước trên bản đồ để xem danh sách học bổng toàn phần (full/full_tuition) và thông tin sinh sống tại nước đó. Dữ liệu được tổng hợp tự động qua Claude API.

**Phạm vi học bổng:** Chỉ `full` (toàn phần: học phí + sinh hoạt) hoặc `full_tuition` (100% học phí). Không lưu học bổng một phần.

## Tech stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4, react-simple-maps
- **Backend:** Python FastAPI, SQLAlchemy async, Alembic, psycopg3
- **Database:** PostgreSQL
- **AI:** Anthropic Claude (`claude-sonnet-4-6`) với prompt cache
- **Deploy:** Railway (frontend + backend + PostgreSQL addon)

## Cấu trúc thư mục
```
scholarship-map/
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── page.tsx        # Trang chính (bản đồ)
│   │   └── admin/page.tsx  # Trang admin sync dữ liệu
│   ├── components/
│   │   ├── map/            # WorldMap, ContinentTabs, MapLegend, CountryTooltip
│   │   ├── panel/          # CountryPanel, ScholarshipCard, LivingInfoTab
│   │   ├── search/         # SearchBar, FilterBar
│   │   └── admin/          # SyncButton
│   ├── lib/
│   │   ├── api.ts          # Tất cả fetch calls → FastAPI
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── constants.ts    # Danh sách châu lục, labels
│   └── hooks/
│       ├── useMapData.ts   # Fetch country counts cho map
│       └── useScholarships.ts
│
└── backend/
    ├── main.py             # FastAPI app, CORS, lifespan
    ├── models.py           # ORM: Country, Scholarship, CountryInfo, SyncLog
    ├── schemas.py          # Pydantic request/response models
    ├── database.py         # Async SQLAlchemy engine + session
    ├── seed_countries.py   # Seed 197 nước ISO 3166
    ├── routes/
    │   ├── countries.py    # GET /api/countries, /api/countries/{code}
    │   ├── scholarships.py # GET /api/scholarships
    │   └── admin.py        # POST /api/admin/sync/{code}, sync-all, logs
    ├── services/
    │   ├── ai_service.py   # Claude API call + JSON parsing
    │   └── sync_service.py # Orchestrate: AI → upsert DB → update SyncLog
    ├── alembic/            # DB migrations
    ├── railway.toml        # Railway deploy config (releaseCommand + startCommand)
    └── requirements.txt
```

## Chạy local

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Backend
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                            # điền DATABASE_URL + ANTHROPIC_API_KEY
python run.py                                   # http://localhost:8000

# 3. Frontend
cd frontend
npm install --legacy-peer-deps
cp .env.local.example .env.local               # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                                     # http://localhost:3000
```

## Environment variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/scholarship_map
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Railway deploy
- **Backend service:** root dir = `backend/`, `railway.toml` có `releaseCommand` chạy migrations + seed trước khi start
- **Frontend service:** root dir = `frontend/`, env var `NEXT_PUBLIC_API_URL` = backend Railway URL (không có trailing slash)
- **Database:** Railway PostgreSQL addon, URL inject tự động qua `DATABASE_URL`
- Backend tự convert `postgresql://` → `postgresql+psycopg://` trong `database.py` và `alembic/env.py`

## API endpoints chính
```
GET  /api/countries                      # list + scholarship_count
GET  /api/countries/{code}               # chi tiết 1 nước
GET  /api/countries/{code}/living-info   # thông tin sinh sống
GET  /api/scholarships?country=&search=  # danh sách học bổng (filter)
POST /api/admin/sync/{code}              # trigger AI sync 1 nước
GET  /api/admin/sync/{code}/status       # polling sync status
GET  /api/admin/sync-logs                # lịch sử sync + error_message
POST /api/admin/sync-all                 # sync tất cả (hoặc theo châu lục)
GET  /api/admin/api-key-status           # kiểm tra ANTHROPIC_API_KEY
GET  /api/health                         # health check
```

## Lưu ý quan trọng

- `NEXT_PUBLIC_API_URL` là build-time env var trong Next.js — sau khi thay đổi phải **redeploy** frontend để có hiệu lực
- Sync lỗi `"credit balance too low"` → nạp credits tại console.anthropic.com (Billing)
- `coverage_type` chỉ nhận 2 giá trị: `"full"` hoặc `"full_tuition"` — filter enforce trong `sync_service.py`
- `legacy-peer-deps=true` trong `frontend/.npmrc` vì `react-simple-maps@3` chưa hỗ trợ React 19
- Railway backend port được inject qua `$PORT` env var (thường 8080) — cần set đúng Target Port trong Railway Networking settings
