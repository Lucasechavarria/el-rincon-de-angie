# ===== READING PROGRESS AND BOOKMARK ENDPOINTS =====
# Add these endpoints to main.py after the newsletter endpoints

# Reading Progress Endpoints
@app.post("/books/{book_id}/progress")
async def save_reading_progress(
    book_id: int,
    current_page: int = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Save reading progress for a book"""
    # Verify book exists
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    progress = update_reading_progress(session, current_user.id, book_id, current_page)
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

@app.get("/books/{book_id}/progress")
async def get_reading_progress_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get reading progress for a book"""
    progress = get_reading_progress(session, current_user.id, book_id)
    
    if not progress:
        return {
            "book_id": book_id,
            "current_page": 1,
            "last_read": None
        }
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

# Bookmark Endpoints
@app.get("/bookmarks/{book_id}")
async def get_bookmarks_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all bookmarks for a book"""
    bookmarks = get_bookmarks(session, current_user.id, book_id)
    
    return [
        {
            "id": bookmark.id,
            "page_number": bookmark.page_number,
            "note": bookmark.note,
            "created_at": bookmark.created_at
        }
        for bookmark in bookmarks
    ]

@app.post("/bookmarks")
async def create_bookmark_endpoint(
    book_id: int = Form(...),
    page_number: int = Form(...),
    note: str = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Create a new bookmark"""
    # Verify book exists
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    bookmark = create_bookmark(session, current_user.id, book_id, page_number, note)
    
    return {
        "id": bookmark.id,
        "book_id": book_id,
        "page_number": bookmark.page_number,
        "note": bookmark.note,
        "created_at": bookmark.created_at
    }

@app.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark_endpoint(
    bookmark_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a bookmark"""
    success = delete_bookmark(session, bookmark_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark deleted successfully"}
