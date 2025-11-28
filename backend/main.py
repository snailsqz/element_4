from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# --- Config CORS (เพื่อให้ Frontend เรียก API ได้) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database จำลอง (เก็บใน Ram) ---
users_db = []

# --- Data Models (โครงสร้างข้อมูล) ---

# 1. โครงสร้างคำตอบแต่ละข้อ
class Answer(BaseModel):
    question_id: int
    value: str  # ค่าต้องเป็น "D", "I", "S", หรือ "C"

# 2. สิ่งที่ Frontend จะส่งมา (ชื่อ + รายการคำตอบ)
class UserSubmission(BaseModel):
    name: str
    answers: List[Answer]

# 3. สิ่งที่ Backend จะตอบกลับไป (ผลลัพธ์)
class UserResult(BaseModel):
    id: int
    name: str
    dominant_type: str # D, I, S, C
    animal: str        # กระทิง, อินทรี, หนู, หมี
    scores: Dict[str, int] # ส่งคะแนนดิบกลับไปให้ดูด้วย (เช่น {"D": 10, "I": 2...})
    
class MatchRequest(BaseModel):
    user1_id: int
    user2_id: int

# --- Logic Helper Functions ---

def calculate_disc_score(answers: List[Answer]):
    # 1. ตั้งค่าเริ่มต้นคะแนน
    scores = {'D': 0, 'I': 0, 'S': 0, 'C': 0}
    
    # 2. วนลูปนับคะแนนจาก Array
    for ans in answers:
        # แปลงเป็นตัวใหญ่กันเหนียว และเช็คว่าอยู่ใน D,I,S,C ไหม
        val = ans.value.upper()
        if val in scores:
            scores[val] += 1
            
    # 3. หา Type ที่คะแนนเยอะที่สุด (Winner)
    max_type = max(scores, key=scores.get)
    
    # 4. แปลงเป็นสัตว์
    animals = {
        'D': 'กระทิง (Dominance)',
        'I': 'อินทรี (Influence)',
        'S': 'หนู (Steadiness)',
        'C': 'หมี (Compliance)'
    }
    
    return max_type, animals[max_type], scores

def get_compatibility_text(type1, type2):
    # เรียงตัวอักษรเพื่อเช็คคู่ (เช่น CD หรือ DC ให้ค่าเท่ากัน)
    pair = "".join(sorted([type1, type2])) 
    
    compatibility_map = {
        "DD": "🔥 ไฟแลบ: ต่างคนต่างแรง งานเดินไวมากแต่อาจจะทะเลาะกันบ่อย",
        "DI": "🚀 พุ่งทะยาน: คนนึงสั่ง คนนึงนำเสนอ เข้าขากันดีในเรื่องความเร็ว",
        "DS": "✅ สั่ง-ทำ: D สั่ง S ทำ เป็นคู่ที่งานเดินราบรื่นที่สุด",
        "DC": "⚡ ขั้วตรงข้าม: D เร็ว C ละเอียด อาจหงุดหงิดกัน แต่ผลงานจะสมบูรณ์แบบ",
        "II": "🎉 ปาร์ตี้: สนุกสนาน ไอเดียกระฉูด แต่อาจจะงานไม่เสร็จตามดีล",
        "IS": "🤝 เพื่อนรัก: บรรยากาศดีมาก ช่วยเหลือกัน แต่การตัดสินใจอาจช้า",
        "IC": "🧩 เติมเต็ม: I คิดนอกกรอบ C ตบเข้ากรอบ เป็น Dream Team ด้านความคิดสร้างสรรค์",
        "SS": "🕊️ สงบสุข: เข้าใจกันดีมาก แต่งานอาจจะเอื่อยๆ ขาดคนกระตุ้น",
        "SC": "📋 มั่นคง: S คอยซัพพอร์ต C วางระบบ งานจะเรียบร้อยและเป็นระเบียบมาก",
        "CC": "🔍 ตรวจยับ: ละเอียดขั้นสุด หาข้อผิดพลาดเก่ง แต่อาจจะใช้เวลานานเกินไป",
    }
    return compatibility_map.get(pair, "ความสัมพันธ์ปกติ")

# --- API Endpoints ---

@app.post("/submit-assessment", response_model=UserResult)
def submit_assessment(submission: UserSubmission):
    # เรียกฟังก์ชันคำนวณ
    dom_type, animal, raw_scores = calculate_disc_score(submission.answers)
    
    new_user = {
        "id": len(users_db) + 1,
        "name": submission.name,
        "dominant_type": dom_type,
        "animal": animal,
        "scores": raw_scores
    }
    
    users_db.append(new_user)
    return new_user

@app.get("/users", response_model=List[UserResult])
def get_users():
    return users_db

@app.post("/match")
def match_users(req: MatchRequest):
    # ดึง ID จาก req.user1_id แทน
    u1 = next((u for u in users_db if u["id"] == req.user1_id), None)
    u2 = next((u for u in users_db if u["id"] == req.user2_id), None)
    
    if not u1 or not u2:
        raise HTTPException(status_code=404, detail="User not found")
        
    result_text = get_compatibility_text(u1['dominant_type'], u2['dominant_type'])
    
    return {
        "user1": {
            "name": u1['name'],
            "type": u1['dominant_type'],
            "animal": u1['animal']
        },
        "user2": {
            "name": u2['name'],
            "type": u2['dominant_type'],
            "animal": u2['animal']
        },
        "compatibility_result": result_text
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)