import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'book';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title = 'El Rincón de Angie - Historias que Tocan el Corazón',
    description = 'Descubre historias cautivadoras de romance, drama y emociones. Lee las obras de Angie y sumérgete en mundos llenos de pasión y sentimientos.',
    image = '/logo-og.png',
    url = 'http://localhost:3000',
    type = 'website',
    author = 'Angie',
    publishedTime,
    modifiedTime
}) => {
    const siteName = 'El Rincón de Angie';
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="author" content={author} />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Open Graph Tags */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image.startsWith('http') ? image : `http://localhost:3000${image}`} />
            <meta property="og:image:alt" content={title} />
            <meta property="og:locale" content="es_ES" />

            {/* Article specific tags */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image.startsWith('http') ? image : `http://localhost:3000${image}`} />

            {/* Additional SEO Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="language" content="Spanish" />
            <meta name="revisit-after" content="7 days" />
        </Helmet>
    );
};

export default SEOHead;
