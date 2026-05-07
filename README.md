# Bản Đồ Học Bổng Thế Giới 🌍

Web app tổng hợp học bổng thạc sĩ toàn phần theo bản đồ thế giới — tiếng Việt, dữ liệu được tổng hợp bởi AI (Claude).

## Tính năng

- **Bản đồ thế giới tương tác** — click vào nước để xem học bổng
- **Chỉ học bổng 100%** — full tuition hoặc toàn phần (học phí + sinh hoạt), không có học bổng một phần
- **Tab Sinh Sống** — chi phí sinh hoạt, văn hóa, cơ hội việc làm, lộ trình định cư/PR
- **Filter theo châu lục** — Châu Á, Châu Âu, Bắc Mỹ, Nam Mỹ, Châu Phi, Châu Đại Dương
- **Search & filter** — tìm theo tên học bổng, lọc loại học bổng
- **Admin sync** — trang `/admin` để trigger AI tổng hợp dữ liệu từng nước

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, react-simple-maps |
| Backend | Python FastAPI, SQLAlchemy async, Alembic |
| Database | PostgreSQL 17 |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Deploy | Railway |

## Chạy local

### Yêu cầu
- Python 3.11+
- Node.js 18+
- PostgreSQL đang chạy

### Backend

```bash
cd backend

# Tạo file .env từ example
cp .env.example .env
# Điền ANTHROPIC_API_KEY vào .env

# Cài dependencies
pip install -r requirements.txt

# Chạy migration + seed
alembic upgrade head
python seed_countries.py

# Khởi động server
python run.py
# → http://localhost:8000
```

### Frontend

```bash
cd frontend

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Cài dependencies
npm install

# Khởi động
npm run dev
# → http://localhost:3000
```

### Admin

Vào `http://localhost:3000/admin` → chọn nước → nhấn **Đồng bộ** để AI tổng hợp dữ liệu.

## Cấu trúc project

```
scholarship-map/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # ORM models
│   ├── schemas.py           # Pydantic schemas
│   ├── routes/              # API endpoints
│   ├── services/            # AI sync logic
│   ├── alembic/             # DB migrations
│   ├── seed_countries.py    # Seed 197 countries
│   ├── run.py               # Startup script
│   └── Procfile             # Railway deploy
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # API client, types, constants
└── PLAN.md                  # Chi tiết kiến trúc và thiết kế
```

## API

```
GET  /api/countries                    # Danh sách nước + số học bổng
GET  /api/countries/{code}/living-info # Thông tin sinh sống
GET  /api/scholarships?country=&search= # Danh sách học bổng
POST /api/admin/sync/{code}            # Trigger AI sync
GET  /api/admin/stats                  # Thống kê tổng quan
```

Xem đầy đủ tại `http://localhost:8000/docs` (Swagger UI).

## Deploy

Xem hướng dẫn chi tiết trong [PLAN.md](./PLAN.md#deploy-railway).
