import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, BookmarkCheck, Trash2, Loader2 } from 'lucide-react';

interface BookmarkData {
    id: number;
    page_number: number;
    note: string | null;
    created_at: string;
}

interface BookmarkButtonProps {
    bookId: number;
    currentPage: number;
    theme: 'light' | 'dark';
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ bookId, currentPage, theme }) => {
    const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
    const [showList, setShowList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId]);

    useEffect(() => {
        setIsBookmarked(bookmarks.some(b => b.page_number === currentPage));
    }, [bookmarks, currentPage]);

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`http://localhost:8000/bookmarks/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data);
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
        }
    };

    const toggleBookmark = async () => {
        if (isBookmarked) {
            // Remove bookmark
            const bookmark = bookmarks.find(b => b.page_number === currentPage);
            if (bookmark) {
                await removeBookmark(bookmark.id);
            }
        } else {
            // Add bookmark
            await addBookmark();
        }
    };

    const addBookmark = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('book_id', bookId.toString());
            formData.append('page_number', currentPage.toString());

            await axios.post('http://localhost:8000/bookmarks', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchBookmarks();
        } catch (err) {
            console.error('Error adding bookmark:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (bookmarkId: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/bookmarks/${bookmarkId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchBookmarks();
        } catch (err) {
            console.error('Error removing bookmark:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmarkClick = (pageNumber: number) => {
        // This would trigger page navigation in the parent component
        // For now, just close the list
        setShowList(false);
        // Parent component should handle navigation
    };

    return (
        <div className="relative">
            {/* Main Bookmark Button */}
            <button
                onClick={toggleBookmark}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${theme === 'dark'
                        ? isBookmarked
                            ? 'bg-[#D4AF37] text-[#1B4D3E]'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        : isBookmarked
                            ? 'bg-[#D4AF37] text-[#1B4D3E]'
                            : 'bg-[#F5F5DC] text-[#1B4D3E] hover:bg-[#D4AF37]/20'
                    }`}
                title={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : isBookmarked ? (
                    <BookmarkCheck size={20} />
                ) : (
                    <Bookmark size={20} />
                )}
            </button>

            {/* Bookmark List Toggle */}
            {bookmarks.length > 0 && (
                <button
                    onClick={() => setShowList(!showList)}
                    className={`ml-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${theme === 'dark'
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-[#F5F5DC] text-[#1B4D3E] hover:bg-[#D4AF37]/20'
                        }`}
                >
                    {bookmarks.length} {bookmarks.length === 1 ? 'Marcador' : 'Marcadores'}
                </button>
            )}

            {/* Bookmark List Dropdown */}
            {showList && bookmarks.length > 0 && (
                <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl border-2 z-50 ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-white border-[#1B4D3E]/20'
                    }`}>
                    <div className={`px-4 py-3 border-b-2 ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/20'
                        }`}>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]'}`}>
                            Marcadores
                        </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {bookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className={`px-4 py-3 border-b ${theme === 'dark'
                                        ? 'border-gray-800 hover:bg-gray-800'
                                        : 'border-gray-100 hover:bg-gray-50'
                                    } transition-colors cursor-pointer flex items-center justify-between`}
                            >
                                <div
                                    onClick={() => handleBookmarkClick(bookmark.page_number)}
                                    className="flex-1"
                                >
                                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]'}`}>
                                        Página {bookmark.page_number}
                                    </div>
                                    {bookmark.note && (
                                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {bookmark.note}
                                        </div>
                                    )}
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {new Date(bookmark.created_at).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeBookmark(bookmark.id);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                                            ? 'text-red-400 hover:bg-red-900/20'
                                            : 'text-red-600 hover:bg-red-50'
                                        }`}
                                    title="Eliminar marcador"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarkButton;
