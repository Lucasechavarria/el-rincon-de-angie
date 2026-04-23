import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
    type: 'Organization' | 'Book' | 'Person' | 'BreadcrumbList';
    data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
    const generateSchema = () => {
        const baseContext = 'https://schema.org';

        switch (type) {
            case 'Organization':
                return {
                    '@context': baseContext,
                    '@type': 'Organization',
                    name: data.name || 'El Rincón de Angie',
                    url: data.url || 'http://localhost:3000',
                    logo: data.logo || 'http://localhost:3000/logo-512.png',
                    description: data.description || 'Historias que tocan el corazón',
                    founder: {
                        '@type': 'Person',
                        name: data.founderName || 'Angie'
                    },
                    sameAs: data.socialLinks || []
                };

            case 'Book':
                return {
                    '@context': baseContext,
                    '@type': 'Book',
                    name: data.title,
                    author: {
                        '@type': 'Person',
                        name: data.author || 'Angie'
                    },
                    description: data.description,
                    image: data.image,
                    offers: {
                        '@type': 'Offer',
                        price: data.price,
                        priceCurrency: 'ARS',
                        availability: 'https://schema.org/InStock'
                    },
                    genre: data.genre || 'Romance',
                    inLanguage: 'es'
                };

            case 'Person':
                return {
                    '@context': baseContext,
                    '@type': 'Person',
                    name: data.name,
                    description: data.bio,
                    image: data.image,
                    jobTitle: data.jobTitle || 'Autora',
                    url: data.url,
                    sameAs: data.socialLinks || []
                };

            case 'BreadcrumbList':
                return {
                    '@context': baseContext,
                    '@type': 'BreadcrumbList',
                    itemListElement: data.items.map((item: any, index: number) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: item.url
                    }))
                };

            default:
                return null;
        }
    };

    const schema = generateSchema();

    if (!schema) return null;

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default StructuredData;
