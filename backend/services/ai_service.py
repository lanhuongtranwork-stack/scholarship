import httpx
import asyncio
import json
import os
import re
from functools import partial

GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

SYSTEM_PROMPT = """Bạn là chuyên gia học bổng quốc tế và tư vấn du học, chuyên tổng hợp thông tin học bổng toàn phần bậc thạc sĩ trên toàn thế giới.

QUY TẮC BẮT BUỘC:
1. Chỉ liệt kê học bổng 100% học phí (full tuition) HOẶC học bổng toàn phần (full scholarship = học phí + sinh hoạt phí). TUYỆT ĐỐI không liệt kê học bổng dưới 100% như 50%, 30% hay bất kỳ mức thấp hơn.
2. Mô tả bằng tiếng Việt, tên học bổng giữ nguyên tiếng Anh.
3. Nếu không chắc về thông tin, đánh data_confidence = "low" và ghi rõ "Vui lòng kiểm tra trang chính thức".
4. Không bịa thông tin — nếu không biết deadline cụ thể ghi "Thường vào tháng X hàng năm".
5. Trả về JSON thuần túy, không thêm text ngoài JSON."""


class _Usage:
    def __init__(self, input_tokens: int, output_tokens: int):
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens


def _parse_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())


def _call_api(country_name_en: str, country_name_vi: str) -> tuple[list[dict], dict, _Usage]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY chưa được cấu hình trong biến môi trường")

    user_prompt = f"""Tổng hợp thông tin cho {country_name_en} ({country_name_vi}). Trả về JSON object với 2 key:

1. "scholarships": array các học bổng. Mỗi item:
{{
  "name_en": "string",
  "name_vi": "string",
  "provider": "string",
  "coverage_type": "full" | "full_tuition",
  "coverage_details": {{"tuition": bool, "living": bool, "flight": bool, "health_insurance": bool}},
  "monthly_stipend_usd": number | null,
  "duration_years": number,
  "language_requirements": {{"english": "string", "local": "string"}},
  "academic_requirements": "string (tiếng Việt)",
  "age_limit": number | null,
  "nationality_eligible": "string (tiếng Việt)",
  "application_deadline": "string (tiếng Việt)",
  "application_url": "string" | null,
  "official_website": "string" | null,
  "description_vi": "string (3-5 câu tiếng Việt)",
  "requirements_vi": "string (bullet points tiếng Việt)",
  "tips_vi": "string (2-3 mẹo apply tiếng Việt)",
  "data_confidence": "high" | "medium" | "low"
}}

2. "living_info": object thông tin sinh sống:
{{
  "capital_city": "string",
  "major_study_cities": ["string"],
  "monthly_cost_usd_min": number,
  "monthly_cost_usd_max": number,
  "cost_breakdown": {{"rent_usd": number, "food_usd": number, "transport_usd": number, "utilities_usd": number, "entertainment_usd": number}},
  "climate_vi": "string",
  "culture_vi": "string (2-3 câu về văn hóa, con người)",
  "safety_vi": "string",
  "student_life_vi": "string (cộng đồng sinh viên, tiện ích)",
  "healthcare_vi": "string",
  "visa_notes_vi": "string (visa du học, được làm thêm không)",
  "post_grad_visa_vi": "string (visa ở lại sau tốt nghiệp, thời hạn, điều kiện)",
  "job_search_duration_months": number | null,
  "work_permit_notes_vi": "string",
  "pr_pathway_vi": "string (lộ trình từ visa → work permit → định cư/PR)",
  "job_market_demand_vi": "string (ngành nghề thiếu nhân lực, cơ hội cho người nước ngoài)",
  "competition_level": "low" | "medium" | "high",
  "competition_notes_vi": "string (lý do: ngôn ngữ, tỷ lệ thất nghiệp, ưu đãi doanh nghiệp địa phương)",
  "avg_starting_salary_usd": number | null,
  "intl_student_success_vi": "string (tỷ lệ/ví dụ sinh viên quốc tế ở lại)",
  "pros_vi": ["string"],
  "cons_vi": ["string"],
  "data_confidence": "high" | "medium" | "low"
}}"""

    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"maxOutputTokens": 8192, "temperature": 0.3},
    }

    with httpx.Client(timeout=120) as client:
        resp = client.post(f"{GEMINI_URL}?key={api_key}", json=payload)
        resp.raise_for_status()
        result = resp.json()

    raw = result["candidates"][0]["content"]["parts"][0]["text"]
    meta = result.get("usageMetadata", {})
    usage = _Usage(
        input_tokens=meta.get("promptTokenCount", 0),
        output_tokens=meta.get("candidatesTokenCount", 0),
    )
    data = _parse_json(raw)
    return data.get("scholarships", []), data.get("living_info", {}), usage


async def fetch_country_data(
    country_code: str,
    country_name_en: str,
    country_name_vi: str,
) -> tuple[list[dict], dict, _Usage]:
    loop = asyncio.get_event_loop()
    fn = partial(_call_api, country_name_en, country_name_vi)
    return await loop.run_in_executor(None, fn)
