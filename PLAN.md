# Bản Đồ Học Bổng Thế Giới — Implementation Plan

## Context
Người dùng muốn tạo web app tổng hợp học bổng thạc sĩ toàn phần trên thế giới theo dạng bản đồ tương tác. Vấn đề cần giải quyết: thông tin học bổng hiện nay rải rác, thiếu nhất quán. Mục tiêu: một nơi duy nhất, tiếng Việt, click vào nước nào là thấy học bổng toàn phần của nước đó.

**Phạm vi học bổng:** Chỉ hiển thị **học bổng 100% học phí** và **học bổng toàn phần** (full scholarship — bao gồm học phí + sinh hoạt phí). Không liệt kê học bổng một phần (50%, 30%, v.v.).

**Tổ chức bản đồ:** Các nước được nhóm theo **châu lục** — người dùng có thể lọc/điều hướng theo châu lục thay vì phải tìm từng nước trên bản đồ toàn cầu.

**Thông tin sinh sống:** Ngoài học bổng, mỗi nước còn có tab riêng về đặc điểm sinh sống — chi phí sinh hoạt hàng tháng, văn hóa, an toàn, đời sống sinh viên.

**Constraints:**
- Tech stack: Next.js 16 + Python FastAPI + PostgreSQL
- Ngôn ngữ UI: Tiếng Việt
- Không cần tài khoản người dùng (public read-only)
- Dữ liệu: AI (Claude API) tự động tổng hợp, admin trigger sync

---

## Kiến trúc tổng quan

```
scholarship-map/
├── frontend/          # Next.js 16, TypeScript, Tailwind CSS
├── backend/           # Python FastAPI, SQLAlchemy async, Alembic
└── docker-compose.yml # PostgreSQL local dev
```

Map library: `react-simple-maps` (SVG, nhẹ, tốt với Next.js)
AI: `claude-sonnet-4-6` với cached system prompt (tiết kiệm token)

---

## Cấu trúc file

### Frontend (`frontend/`)
```
app/
  layout.tsx              # Root layout
  page.tsx                # Trang chính (bản đồ)
  globals.css
  admin/page.tsx          # Trang admin sync dữ liệu

components/
  map/
    WorldMap.tsx           # Bản đồ thế giới, click handler, màu sắc theo số học bổng
    ContinentTabs.tsx      # Tab lọc theo châu lục
    MapLegend.tsx          # Chú thích màu
  panel/
    CountryPanel.tsx       # Panel trượt từ phải, có 2 tab: Học Bổng + Sinh Sống
    ScholarshipTab.tsx     # Tab danh sách học bổng
    ScholarshipCard.tsx    # Card từng học bổng (có expand/collapse)
    LivingInfoTab.tsx      # Tab thông tin sinh sống
  search/
    SearchBar.tsx          # Tìm kiếm text (debounced)
    FilterBar.tsx          # Filter loại học bổng
  admin/
    SyncButton.tsx         # Nút trigger AI sync + polling status
  ui/
    Badge.tsx / Spinner.tsx

lib/
  api.ts                   # Tất cả fetch calls tới FastAPI
  types.ts                 # TypeScript interfaces
  constants.ts             # Danh sách khu vực, labels tiếng Việt, ISO numeric → alpha-2 map
```

### Backend (`backend/`)
```
main.py                    # FastAPI app, CORS, mount routers
database.py                # Async SQLAlchemy engine + session
models.py                  # ORM models (Country, Scholarship, CountryInfo, SyncLog)
schemas.py                 # Pydantic request/response models
routes/
  countries.py             # GET /api/countries, GET /api/countries/{code}
  scholarships.py          # GET /api/scholarships (filter + search)
  admin.py                 # POST sync, GET status, GET stats, GET api-key-status
services/
  ai_service.py            # Claude API call + JSON parsing (run_in_executor)
  sync_service.py          # Orchestrate: AI → upsert DB → update SyncLog
alembic/                   # DB migrations
seed_countries.py          # Seed 197 countries (idempotent, ON CONFLICT DO UPDATE)
run.py                     # Startup script (SelectorEventLoop patch cho Windows)
Procfile                   # Railway start command
.python-version            # Python 3.12 cho Railway
requirements.txt
.env.example
```

---

## Database Schema

### `countries`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | SERIAL PK | |
| code | VARCHAR(3) UNIQUE | ISO 3166-1 alpha-2 (VD: "DE", "JP") |
| name_vi | VARCHAR(200) | Tên tiếng Việt |
| name_en | VARCHAR(200) | Tên tiếng Anh |
| region | VARCHAR(100) | "Nam Á", "Đông Á", v.v. |
| continent | VARCHAR(50) | "Châu Á", "Châu Âu", v.v. |
| flag_emoji | VARCHAR(10) | Unicode emoji cờ |
| scholarship_count | INTEGER | Denormalized, cập nhật sau mỗi sync |
| last_synced_at | TIMESTAMP | NULL = chưa sync |

### `scholarships`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | UUID PK | |
| country_code | VARCHAR(3) FK | |
| coverage_type | VARCHAR(20) | `"full_tuition"` hoặc `"full"` |
| coverage_details | JSONB | {tuition, living, flight, health_insurance} |
| monthly_stipend_usd | INTEGER | Nullable |
| data_confidence | VARCHAR(20) | "high"/"medium"/"low" |
| ... | | (xem models.py để biết đầy đủ) |

### `country_info`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| country_code | VARCHAR(3) UNIQUE FK | |
| monthly_cost_usd_min/max | INTEGER | Chi phí sinh hoạt |
| cost_breakdown | JSONB | {rent, food, transport, utilities, entertainment} |
| competition_level | VARCHAR(20) | "low"/"medium"/"high" |
| pr_pathway_vi | TEXT | Lộ trình từ visa → work permit → PR |
| ... | | (xem models.py để biết đầy đủ) |

### `sync_logs`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| status | VARCHAR(20) | "running"/"success"/"failed" |
| scholarships_found/upserted | INTEGER | |
| claude_model | VARCHAR(50) | |
| duration_seconds | NUMERIC | |

---

## API Endpoints

```
# Public
GET  /api/countries                          → list countries + counts (cho map)
GET  /api/countries?continent={name}         → filter theo châu lục
GET  /api/countries/{code}                   → chi tiết một nước
GET  /api/countries/{code}/living-info       → thông tin sinh sống tại nước đó
GET  /api/scholarships?country=&coverage_type=&search=&limit=&offset=
GET  /api/scholarships/{id}                  → chi tiết học bổng

# Admin
POST /api/admin/sync/{country_code}          → trigger AI sync (background task)
GET  /api/admin/sync/{country_code}/status   → polling sync status
GET  /api/admin/sync-logs                    → lịch sử sync
POST /api/admin/sync-all                     → sync tất cả hoặc theo continent
GET  /api/admin/stats                        → tổng số nước, học bổng, lần sync cuối
GET  /api/admin/api-key-status               → kiểm tra ANTHROPIC_API_KEY đã cấu hình chưa
```

---

## AI Sync Strategy

```python
# System prompt cache với cache_control: ephemeral → tiết kiệm ~80% token
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
    messages=[{"role": "user", "content": user_prompt}]
)
```

Claude trả về 2 objects trong 1 lần gọi:
1. `scholarships`: chỉ `full_tuition` hoặc `full`, không có học bổng dưới 100%
2. `living_info`: thông tin sinh sống, việc làm, lộ trình định cư

`fetch_country_data()` chạy synchronous API call trong thread pool (`run_in_executor`) để không block event loop.

---

## Environment Variables

### `backend/.env`
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/scholarship_map
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deploy (Railway)

3 services:
1. **PostgreSQL** — Railway managed database
2. **Backend** — Root dir: `backend/`, dùng `Procfile`: `alembic upgrade head && python seed_countries.py && uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Frontend** — Root dir: `frontend/`, build: `npm run build`, start: `npm start`

**Lưu ý Railway:**
- `DATABASE_URL` từ Railway có dạng `postgresql://...` → code tự convert sang `postgresql+psycopg://...`
- `NEXT_PUBLIC_API_URL` phải set trước khi build frontend
- `ENVIRONMENT=production` để tắt reload mode

---

## Chạy local

```bash
# Backend (Terminal 1)
cd backend
python run.py
# → http://localhost:8000

# Frontend (Terminal 2)
cd frontend
npm run dev
# → http://localhost:3000

# Admin sync
# → http://localhost:3000/admin
```

**Yêu cầu:** PostgreSQL service đang chạy, `backend/.env` đã điền `ANTHROPIC_API_KEY`.
