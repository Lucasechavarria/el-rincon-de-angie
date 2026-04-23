import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
import { Lock, Loader2, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReaderToolbar from './reader/ReaderToolbar';
import BookmarkButton from './reader/BookmarkButton';
import ProgressBar from './reader/ProgressBar';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useGlobalStore } from '../stores/useGlobalStore';

const AnimatePresence = AnimatePresenceOriginal as any;

// Configure PDF.js worker - using local static file from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const EnhancedBookReader = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [direction, setDirection] = useState(0);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [previewPages, setPreviewPages] = useState<number>(5);
    const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
    const [bookId, setBookId] = useState<number>(0);
    const [bookmarks, setBookmarks] = useState<number[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string>('');

    const token = localStorage.getItem('access_token');
    const userId = token ? 1 : null;
    const { settings, updateZoom, updateLastPage } = useReaderSettings(bookId, userId);
    const { theme, toggleTheme } = useGlobalStore();

    useEffect(() => {
        if (id) {
            fetchBook();
            if (token) {
                fetchBookmarks();
                fetchProgress();
            }
        }
    }, [id, token]);

    const fetchBook = async () => {
        setIsLoading(true);
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`http://localhost:8000/books/${id}`, config);
            const bookData = response.data;
            
            setBookId(bookData.id);
            setPreviewPages(bookData.preview_pages || 5);
            setIsUnlocked(bookData.is_purchased);
            
            // Use the reader_url provided by backend (either signed or public preview)
            if (bookData.reader_url) {
                setFileUrl(bookData.reader_url);
            } else {
                setError('No se pudo obtener la URL de lectura.');
            }
            
        } catch (error: any) {
            console.error("Error fetching book:", error);
            setError('Error al cargar la información del libro.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        if (!token || !id) return;
        try {
            const response = await axios.get(`http://localhost:8000/bookmarks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data.map((b: any) => b.page_number));
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

    const fetchProgress = async () => {
        if (!token || !id) return;
        try {
            const response = await axios.get(`http://localhost:8000/books/${id}/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.current_page) {
                setPageNumber(response.data.current_page);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
        }
    };

    const saveProgress = useCallback(async (page: number) => {
        if (!token || !bookId || !numPages) return;
        try {
            const formData = new FormData();
            formData.append('current_page', page.toString());
            formData.append('total_pages', numPages.toString());

            await axios.post(`http://localhost:8000/books/${bookId}/progress`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    }, [token, bookId, numPages]);

    const toggleBookmark = async () => {
        if (!token) {
            alert('Debes iniciar sesión para usar marcadores');
            return;
        }

        const isBookmarked = bookmarks.includes(pageNumber);

        if (isBookmarked) {
            setBookmarks(bookmarks.filter(p => p !== pageNumber));
        } else {
            try {
                const formData = new FormData();
                formData.append('book_id', bookId.toString());
                formData.append('page_number', pageNumber.toString());

                await axios.post('http://localhost:8000/bookmarks', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookmarks([...bookmarks, pageNumber]);
            } catch (error) {
                console.error("Error creating bookmark:", error);
            }
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const isPageLocked = (page: number) => !isUnlocked && page > previewPages;

    const changePage = (newDirection: number) => {
        const newPage = pageNumber + newDirection;
        if (newPage >= 1 && newPage <= numPages) {
            setDirection(newDirection);
            setPageNumber(newPage);
            updateLastPage(newPage);
            saveProgress(newPage);
        }
    };

    const handleUnlock = async () => {
        const authToken = localStorage.getItem('token') || localStorage.getItem('access_token');
        console.log("[CHECKOUT] Starting checkout for bookId:", bookId);
        
        try {
            if (!authToken) {
                console.warn("[CHECKOUT] No token found, redirecting to login");
                alert("Por favor inicia sesión para comprar");
                navigate('/login');
                return;
            }

            if (!bookId) {
                console.error("[CHECKOUT] Book ID is missing or invalid:", bookId);
                alert("Error: No se pudo identificar el libro. Por favor recarga la página.");
                return;
            }

            setIsLoading(true);
            setError('');

            const response = await axios.post(`http://localhost:8000/payments/checkout/${bookId}`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            console.log("[CHECKOUT] Preference response:", response.data);

            if (response.data && response.data.init_point) {
                window.location.href = response.data.init_point;
            } else {
                console.error("[CHECKOUT] No init_point in response:", response.data);
                throw new Error("No se recibió el punto de inicio de pago");
            }
        } catch (error: any) {
            console.error("[CHECKOUT] Error detail:", error.response?.data || error.message);
            setError('Hubo un error al conectar con la pasarela de pagos. Verifica tu conexión.');
            alert(`Error de pago: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleThemeToggle = () => {
        toggleTheme();
    };

    const handleZoomIn = () => updateZoom(settings.zoom + 0.1);
    const handleZoomOut = () => updateZoom(settings.zoom - 0.1);

    const handlePageRestore = (page: number) => {
        if (page >= 1 && page <= numPages && !isPageLocked(page)) {
            setPageNumber(page);
            updateLastPage(page);
        }
    };

    const pageVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            transition: { duration: 0.3 }
        })
    };

    if (!fileUrl) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5DC]">
                <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]'
            }`}>
            {/* Toolbar with Bookmark Button */}
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[#1B4D3E]/20">
                <ReaderToolbar
                    theme={theme}
                    zoom={settings.zoom}
                    isFullscreen={isFullscreen}
                    onThemeToggle={handleThemeToggle}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                    onBookmarkToggle={toggleBookmark}
                    isBookmarked={bookmarks.includes(pageNumber)}
                />

                <BookmarkButton
                    bookId={bookId}
                    currentPage={pageNumber}
                    theme={theme}
                />
            </div>

            {/* Reader Area */}
            <div className={`flex-1 relative overflow-auto flex items-center justify-center p-4 md:p-8 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]'
            }`}>
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                        <Loader2 className="animate-spin text-[#1B4D3E] mb-4" size={64} />
                        <p className={`font-serif text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-[#1B4D3E]'
                            }`}>
                            Abriendo libro...
                        </p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <button
                    disabled={pageNumber <= 1}
                    onClick={() => changePage(-1)}
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#1B4D3E]/80 text-white hover:bg-[#1B4D3E] disabled:opacity-0 transition-all shadow-lg"
                >
                    <ChevronLeft size={32} />
                </button>
                <button
                    disabled={pageNumber >= numPages}
                    onClick={() => changePage(1)}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#1B4D3E]/80 text-white hover:bg-[#1B4D3E] disabled:opacity-0 transition-all shadow-lg"
                >
                    <ChevronRight size={32} />
                </button>

                {/* PDF Document */}
                <Document 
                    file={fileUrl} 
                    onLoadSuccess={onDocumentLoadSuccess} 
                    className={`flex justify-center transition-all duration-500 ${
                        theme === 'dark' ? 'filter grayscale invert brightness-90 contrast-125' : ''
                    }`}
                >
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={pageNumber}
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="shadow-2xl my-4 origin-top relative overflow-hidden rounded-sm"
                            style={{ 
                                transform: `scale(${settings.zoom})`,
                                padding: '1rem 2rem' // Añadimos sangría/margen interno
                            }}
                        >
                            <Page
                                pageNumber={pageNumber}
                                className={isPageLocked(pageNumber) ? 'filter blur-sm' : ''}
                                renderTextLayer={!isPageLocked(pageNumber)}
                                renderAnnotationLayer={!isPageLocked(pageNumber)}
                                scale={1}
                                loading={null}
                            />

                            {isPageLocked(pageNumber) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#1B4D3E]/95 backdrop-blur-md z-10 p-6">
                                    <div className="bg-[#1B4D3E] border-4 border-[#D4AF37] p-10 rounded-xl max-w-md text-center shadow-[0_0_50px_rgba(212,175,55,0.3)] transform transition-transform hover:scale-105">
                                        <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/50">
                                            <Lock size={40} className="text-[#D4AF37]" />
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-[#D4AF37] mb-4">
                                            Contenido Exclusivo
                                        </h3>
                                        <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                                            Esta es una vista previa limitada. Adquiere la obra completa para desbloquear todas las páginas y apoyar a la autora.
                                        </p>
                                        <button
                                            onClick={handleUnlock}
                                            className="w-full px-8 py-4 bg-[#D4AF37] text-[#1B4D3E] font-bold rounded-full hover:bg-[#b5952f] transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                        >
                                            <ShoppingBag size={24} />
                                            <span>Comprar Obra Completa</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Document>
            </div>

            {/* Progress Bar */}
            <ProgressBar
                currentPage={pageNumber}
                totalPages={numPages}
                theme={theme}
            />

            {/* Close Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-30"
            >
                <X size={24} />
            </button>
        </div>
    );
};
