import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect fill="%23F5F5DC" width="400" height="600"/%3E%3C/svg%3E'
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let observer: IntersectionObserver;

        if (imgRef.current) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Load the actual image
                            const img = new Image();
                            img.src = src;
                            img.onload = () => {
                                setImageSrc(src);
                                setIsLoading(false);
                            };
                            img.onerror = () => {
                                setIsLoading(false);
                            };

                            // Stop observing after loading
                            if (imgRef.current) {
                                observer.unobserve(imgRef.current);
                            }
                        }
                    });
                },
                {
                    rootMargin: '50px', // Start loading 50px before entering viewport
                    threshold: 0.01
                }
            );

            observer.observe(imgRef.current);
        }

        return () => {
            if (observer && imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [src]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
            loading="lazy"
        />
    );
};

export default LazyImage;
