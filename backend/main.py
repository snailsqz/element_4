import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
from dotenv import load_dotenv

# --- AI Library ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI()

# --- Config CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup (SQLite) ---
DB_NAME = "zoologic.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # สร้างตาราง users ถ้ายังไม่มี
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dominant_type TEXT NOT NULL,
            animal TEXT NOT NULL,
            score_d INTEGER,
            score_i INTEGER,
            score_s INTEGER,
            score_c INTEGER
        )
    ''')
    conn.commit()
    conn.close()

# รันสร้าง DB ทันทีเมื่อเปิดโปรแกรม
init_db()

# --- AI Setup ---
if not os.getenv("GOOGLE_API_KEY"):
    print("⚠️ Warning: GOOGLE_API_KEY not found")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)

# --- Models ---
class Answer(BaseModel):
    question_id: int
    value: str 

class UserSubmission(BaseModel):
    name: str
    answers: List[Answer]

class UserResult(BaseModel):
    id: int
    name: str
    dominant_type: str
    animal: str
    scores: Dict[str, int]

class MatchRequest(BaseModel):
    user1_id: int
    user2_id: int

# --- Logic Helper ---
def calculate_disc_score(answers: List[Answer]):
    scores = {'D': 0, 'I': 0, 'S': 0, 'C': 0}
    for ans in answers:
        val = ans.value.upper()
        if val in scores:
            scores[val] += 1
    
    max_type = max(scores, key=scores.get)
    animals = {'D': 'กระทิง', 'I': 'อินทรี', 'S': 'หนู', 'C': 'หมี'}
    return max_type, animals[max_type], scores

# --- API Endpoints ---

# 1. ส่งผลประเมิน (Save to DB)
@app.post("/submit-assessment", response_model=UserResult)
def submit_assessment(submission: UserSubmission):
    dom_type, animal, raw_scores = calculate_disc_score(submission.answers)
    
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        INSERT INTO users (name, dominant_type, animal, score_d, score_i, score_s, score_c)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (submission.name, dom_type, animal, raw_scores['D'], raw_scores['I'], raw_scores['S'], raw_scores['C']))
    
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": new_id,
        "name": submission.name,
        "dominant_type": dom_type,
        "animal": animal,
        "scores": raw_scores
    }

# 2. ดูรายชื่อทั้งหมด (Read from DB)
@app.get("/users", response_model=List[UserResult])
def get_users():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # เพื่อให้ดึงข้อมูลเป็น dict ได้
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    rows = c.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "name": row["name"],
            "dominant_type": row["dominant_type"],
            "animal": row["animal"],
            "scores": {"D": row["score_d"], "I": row["score_i"], "S": row["score_s"], "C": row["score_c"]}
        })
    return results

# 3. ลบคน (Delete)
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    deleted = c.rowcount
    conn.close()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# 4. จับคู่ 1-on-1 (AI Match)
@app.post("/match-ai")
async def match_users_ai(req: MatchRequest):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id IN (?, ?)", (req.user1_id, req.user2_id))
    rows = c.fetchall()
    conn.close()
    
    if len(rows) != 2:
        raise HTTPException(status_code=404, detail="Users not found")
        
    u1, u2 = rows[0], rows[1]
    # สลับให้ถูก id ตาม request (เพราะ sql อาจ return สลับกัน)
    if u1['id'] != req.user1_id: u1, u2 = u2, u1

    # Prompt จับคู่
    match_prompt = ChatPromptTemplate.from_template("""
    Role: You are "ZooLogic AI", a team compatibility expert.
    Analyze: {name1} ({type1}) vs {name2} ({type2})
    Scores 1: D={d1}, I={i1}, S={s1}, C={c1}
    Scores 2: D={d2}, I={i2}, S={s2}, C={c2}
    
    Output in Thai (Fun & Insightful):
    1. Metaphor: Describe them as a duo (e.g. Driver & Navigator).
    2. Dynamic: How they work together.
    3. Warning: Potential conflict.
    4. Advice: 1 tip for each.
    """)
    
    chain = match_prompt | llm | StrOutputParser()
    analysis = await chain.ainvoke({
        "name1": u1['name'], "type1": u1['animal'], "d1": u1['score_d'], "i1": u1['score_i'], "s1": u1['score_s'], "c1": u1['score_c'],
        "name2": u2['name'], "type2": u2['animal'], "d2": u2['score_d'], "i2": u2['score_i'], "s2": u2['score_s'], "c2": u2['score_c']
    })
    
    return {
        "user1": u1['name'], "user2": u2['name'],
        "ai_analysis": analysis
    }

# 5. วิเคราะห์ภาพรวมทั้งทีม (Team Analysis - ฟีเจอร์ใหม่!)
@app.get("/analyze-team")
async def analyze_team_structure():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    users = c.fetchall()
    conn.close()
    
    if not users:
        return {"analysis": "ยังไม่มีสมาชิกในทีมครับ เพิ่มคนเข้ามาก่อนนะ!"}

    # เตรียม Data ส่งให้ AI
    team_summary = f"Total Members: {len(users)}\n"
    type_counts = {"D": 0, "I": 0, "S": 0, "C": 0}
    
    members_list = []
    for u in users:
        type_counts[u['dominant_type']] += 1
        members_list.append(f"- {u['name']}: {u['dominant_type']} ({u['animal']})")
    
    # Prompt วิเคราะห์ทีมฟุตบอล
    team_prompt = ChatPromptTemplate.from_template("""
    Role: You are "ZooLogic Coach", a strategic team manager expert.
    
    Context: I am building a project team. Here is my current roster:
    {team_list}
    
    Stats:
    - Bulls (D - Driver/Forward): {cnt_d}
    - Eagles (I - Influencer/Midfielder): {cnt_i}
    - Rats (S - Supporter/Defender): {cnt_s}
    - Bears (C - Analyst/Tactician): {cnt_c}
    
    Task: Analyze this team structure in THAI.
    1. **Team Formation:** If this were a football team, is it balanced? (e.g., "Too many strikers, no defense" or "Perfect balance").
    2. **Strengths:** What will this team be good at? (e.g., Fast execution? High creativity?).
    3. **Weaknesses:** What is missing? What risk should I watch out for?
    4. **Hiring Advice:** Who should I recruit next to balance the team?
    
    Keep it professional but use football metaphors.
    """)
    
    chain = team_prompt | llm | StrOutputParser()
    analysis = await chain.ainvoke({
        "team_list": "\n".join(members_list),
        "cnt_d": type_counts['D'],
        "cnt_i": type_counts['I'],
        "cnt_s": type_counts['S'],
        "cnt_c": type_counts['C']
    })
    
    return {
        "total_members": len(users),
        "distribution": type_counts,
        "ai_analysis": analysis
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)