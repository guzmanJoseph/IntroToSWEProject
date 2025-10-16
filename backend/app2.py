import os, sqlite3
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.hash import bcrypt
from jose import jwt, JWTError

SECRET = os.getenv("SECRET_KEY", "change-me")
ALGO = "HS256"
DB_PATH = os.getenv("DB_PATH", "gatorkeys.db")

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

// temporary DB until I work with the main DB
def init_db():
    conn = db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      user_a INTEGER NOT NULL,
      user_b INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(listing_id, user_a, user_b)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()

def is_uf_email(email: str) -> bool:
    return email.lower().endswith("@ufl.edu")

def create_token(sub: str, hours: int = 2) -> str:
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(hours=hours)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        user_id = int(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = db()
    row = conn.execute("SELECT id, email, is_verified FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": row["id"], "email": row["email"], "is_verified": bool(row["is_verified"])}

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_verified: bool

class ThreadIn(BaseModel):
    listing_id: int
    other_user_id: int

class ThreadOut(BaseModel):
    id: int
    listing_id: int
    user_a: int
    user_b: int
    created_at: str

class MessageIn(BaseModel):
    thread_id: int
    body: str = Field(min_length=1, max_length=4000)

class MessageOut(BaseModel):
    id: int
    thread_id: int
    sender_id: int
    body: str
    created_at: str

app = FastAPI(title="GatorKeys API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

@app.on_event("startup")
def _startup():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

//accepts email and password. rejects non uf emails. hashes the password and stores in DB
@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(body: RegisterIn):
    if not is_uf_email(body.email):
        raise HTTPException(status_code=400, detail="Must use a @ufl.edu email")
    conn = db()
    try:
        conn.execute(
            "INSERT INTO users(email, password_hash, is_verified) VALUES(?,?,?)",
            (body.email.lower(), bcrypt.hash(body.password), 1)
        )
        conn.commit()
        row = conn.execute("SELECT id, email, is_verified FROM users WHERE email=?", (body.email.lower(),)).fetchone()
        return {"id": row["id"], "email": row["email"], "is_verified": bool(row["is_verified"])}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="User already exists")
    finally:
        conn.close()

// checks the hash, creates a JWT token to allow you to be active for 2 hours
@app.post("/auth/login")
def login(body: LoginIn):
    conn = db()
    row = conn.execute("SELECT id, email, password_hash, is_verified FROM users WHERE email=?", (body.email.lower(),)).fetchone()
    conn.close()
    if not row or not bcrypt.verify(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not row["is_verified"]:
        raise HTTPException(status_code=403, detail="Please verify your UF email")
    token = create_token(sub=str(row["id"]), hours=2)
    return {"token": token, "user": {"id": row["id"], "email": row["email"], "is_verified": bool(row["is_verified"])}}

// reads the JWT from authorization and returns the current user
@app.get("/auth/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    return current

def normalize_pair(a: int, b: int) -> Tuple[int, int]:
    return (a, b) if a < b else (b, a)

//checks if there is a thread between the user and another user. if there is, it returns the existing one, otherwise, it creates one
@app.post("/threads", response_model=ThreadOut, status_code=201)
def create_thread(body: ThreadIn, current=Depends(get_current_user)):
    if body.other_user_id == current["id"]:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    a, b = normalize_pair(current["id"], body.other_user_id)
    conn = db()
    row = conn.execute(
        "SELECT * FROM threads WHERE listing_id=? AND user_a=? AND user_b=?",
        (body.listing_id, a, b)
    ).fetchone()
    if row:
        conn.close()
        return dict(row)
    conn.execute(
        "INSERT INTO threads(listing_id, user_a, user_b) VALUES(?,?,?)",
        (body.listing_id, a, b)
    )
    conn.commit()
    t = conn.execute("SELECT * FROM threads WHERE listing_id=? AND user_a=? AND user_b=?",
                     (body.listing_id, a, b)).fetchone()
    conn.close()
    return dict(t)

//returns all threads with the current user
@app.get("/threads", response_model=List[ThreadOut])
def my_threads(current=Depends(get_current_user)):
    conn = db()
    rows = conn.execute(
        "SELECT * FROM threads WHERE user_a=? OR user_b=? ORDER BY created_at DESC",
        (current["id"], current["id"])
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

//confirms that the user is one of the people in the thread, if so, it inserts the message and returns it

@app.post("/messages", response_model=MessageOut, status_code=201)
def send_message(body: MessageIn, current=Depends(get_current_user)):
    conn = db()
    t = conn.execute("SELECT * FROM threads WHERE id=?", (body.thread_id,)).fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Thread not found")
    if current["id"] not in (t["user_a"], t["user_b"]):
        conn.close()
        raise HTTPException(status_code=403, detail="Not a participant")
    conn.execute(
        "INSERT INTO messages(thread_id, sender_id, body) VALUES(?,?,?)",
        (body.thread_id, current["id"], body.body)
    )
    conn.commit()
    m = conn.execute("SELECT * FROM messages WHERE rowid=last_insert_rowid()").fetchone()
    conn.close()
    return dict(m)

// returns the messages in the thred in the order in which it came
@app.get("/threads/{thread_id}/messages", response_model=List[MessageOut])
def get_messages(thread_id: int, current=Depends(get_current_user)):
    conn = db()
    t = conn.execute("SELECT * FROM threads WHERE id=?", (thread_id,)).fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Thread not found")
    if current["id"] not in (t["user_a"], t["user_b"]):
        conn.close()
        raise HTTPException(status_code=403, detail="Not a participant")
    rows = conn.execute(
        "SELECT * FROM messages WHERE thread_id=? ORDER BY created_at ASC",
        (thread_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

