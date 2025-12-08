"""
Simple FastAPI Starter - TODO API
==================================

This is a minimal FastAPI example, designed for beginners.
It shows the basic structure of a REST API with database access.

HOW IT WORKS:
1. Client (your React app) makes a request to a URL (e.g., /todos)
2. FastAPI finds the function decorated with @app.get("/todos")
3. That function uses the database connection to query data
4. The function returns data, which FastAPI converts to JSON
5. The JSON is sent back to the client
"""

# Step 1: Import what we need
import os
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from schemas import UserCreate, UserLogin, Comment, CommentBase, CommentCreate, CommentResponse, CommentType, CommentUpdate
# from utils import hash_password, verify_password
# from auth import jwt_exception_handler

from models import Base, Comment, CommentType, User
from fastapi_jwt import JwtAccessBearer, JwtAuthorizationCredentials
from passlib.context import CryptContext

# Step 2: Load environment variables from .env file
# Looks for .env file in current directory and parent directories
load_dotenv()

# Step 3: Connect to the database
# Get DATABASE_URL from environment variable, fallback to local development
# Format: postgresql+asyncpg://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine - this manages the connection pool
# Think of it as a "factory" that creates database connections
engine = create_async_engine(DATABASE_URL, echo=False)

# Create a session factory - this creates individual database sessions
# Each request will get its own session to query the database
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Step 4: Create a function to get database sessions
# This is called a "dependency" - FastAPI will automatically call this
# for each request and pass the result to your endpoint functions
async def get_db():
    """
    Generator function that yields a database session.

    The 'yield' keyword is special - it:
    1. Creates a session when the function is called
    2. Gives it to your endpoint function
    3. Closes the session when the endpoint finishes

    This ensures database connections are properly cleaned up.
    """
    async with AsyncSessionLocal() as session:
        yield session  # Give the session to the endpoint
        # After the endpoint finishes, the session is automatically closed


# Step 5: Define what our API requests and responses will look like
# These are called "Pydantic models" or "schemas"
# They define the structure of data that will be sent to and from the API


pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Step 6: Create the FastAPI app
# This is the main application object - it handles all incoming requests
app = FastAPI(title="Comment API", description="A Comment CRUD API replacing the old TODO CRUD API")
access_scheme = JwtAccessBearer(secret_key="Your_secret_key", auto_error=True)

# Step 7: Create database tables on startup
# This automatically creates all tables defined in your SQLAlchemy models
@app.on_event("startup")
async def create_tables():
    """
    Create all database tables on application startup.
    This uses SQLAlchemy to generate tables from your model definitions.
    Works for both Docker and Railway databases.

    Note: Docker Compose's depends_on: service_healthy ensures the database
    is ready before this code runs.
    """
    async with engine.begin() as conn:
        # Use run_sync to run the synchronous create_all method
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")


# Step 8: Add CORS middleware to allow frontend requests
# CORS (Cross-Origin Resource Sharing) is needed because your React app
# runs on a different port (5173) than your API (8000)
# Without this, browsers would block requests from your frontend
# Note: In production with combined deployment, CORS may not be needed
# but we keep it for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (in production, specify exact URLs)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Step 9: Create our API endpoints
# These are the URLs that clients can visit to interact with todos
# IMPORTANT: API routes must be defined BEFORE the SPA catch-all route


# READ: Get all comments
@app.get("/comments", response_model=List[CommentResponse])
async def get_all_comments(db: AsyncSession = Depends(get_db)):
    """
    Get all comments from the database.

    Returns: A list of all comments in the database
    """
    result = await db.execute(select(Comment))
    return result.scalars().all()


# Step 10:
# CREATE: Create a new comment
@app.post("/comments", response_model=CommentResponse, status_code=201)
async def create_comment(comment: CommentCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new comment item.

    Returns: The created comment
    """
    # Create a new comment object from the request data
    new_comment = Comment(
        commenter=comment.commenter,
        text=comment.text,
        comment_type=comment.comment_type,
    )

    # Add it to the database session
    db.add(new_comment)
    # Commit the transaction to save it
    await db.commit()
    # Refresh to get the updated data (like the generated ID)
    await db.refresh(new_comment)

    return new_comment


# Step 11:
# UPDATE: Update an existing todo (PATCH - partial update)
@app.patch("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int, data: CommentUpdate, db: AsyncSession = Depends(get_db)
):
    """
    Partially update an existing todo item (PATCH).
    Only the fields provided in the request will be updated.
    Returns: The updated todo, or a 404 error if not found
    """
    # Get the existing comment
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    db_comment = result.scalar_one_or_none()

    if db_comment is None:
        raise HTTPException(status_code=404, detail=f"Comment with ID {comment_id} not found")

    # Update only the fields that were provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_comment, field, value)

    # Update the updated_at timestamp
    db_comment.updated_at = datetime.utcnow()

    # Commit the changes
    await db.commit()
    await db.refresh(db_comment)

    return db_comment


# Step 12:
# DELETE: Delete a comment
@app.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a todo item.

    Returns: 204 No Content if successful, or a 404 error if not found
    """
    # Get the existing todo
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    db_comment = result.scalar_one_or_none()

    if db_comment is None:
        raise HTTPException(status_code=404, detail=f"Comment with ID {comment_id} not found")

    # Delete it from the database
    await db.delete(db_comment)
    await db.commit()

    return None


# Step 13: Serve static files (frontend) in production
# This must come AFTER all API routes so API routes are matched first
# Check if static directory exists (production build)
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    # Mount static files (CSS, JS, images, etc.)
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(static_dir, "assets")),
        name="assets",
    )

    # Serve index.html for all non-API routes (SPA routing)
    # This catch-all route must be last so API routes take precedence
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """
        Serve the React app for all non-API routes.
        This allows React Router to handle client-side routing.
        """
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend not found")
    
# Register 

@app.post("/register", response_model=UserCreate, status_code=201)
async def register(u: UserCreate, db = Depends(get_db)):
    existing = await db.execute(select(User).where(User.username == u.username))
    if existing.scalars().first():
        raise HTTPException(400, "User already exists")
    user = User(username=u.username,
                password=pwd.hash(u.password), email=u.email, first_name=u.first_name, last_name=u.last_name,)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


# -------------------------------
#             LOGIN
# -------------------------------
@app.post("/login")
# async def register(u: UserCreate, db = Depends(get_db)):
async def login(u: UserLogin, response: Response, db = Depends(get_db)):
    res = await db.execute(select(User).where(User.username == u.username))
    user = res.scalars().first()
    if not user or not pwd.verify(u.password, user.password):
        raise HTTPException(401, "Invalid credentials")
    token = access_scheme.create_access_token(subject={"user_id": str(user.id)})
    access_scheme.set_access_cookie(response, token)  # or return in body
    return {"access_token": token}


@app.get("/me")
def read_me(creds: JwtAuthorizationCredentials = Security(access_scheme)):
    return {"user": creds["user_id"]}


# Step 14: Run the server
# This code only runs if you execute the file directly (not if imported)
if __name__ == "__main__":
    import uvicorn

    # uvicorn is the web server that runs FastAPI
    # --reload means it will restart when you change the code
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Note: The server will be run in Docker (see Docker Configuration section)
# If you have Poetry installed locally, you can also run:
# poetry run uvicorn server:app --reload
