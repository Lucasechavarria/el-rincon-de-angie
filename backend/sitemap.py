from datetime import datetime
from typing import List


def generate_sitemap(books: List) -> str:
    """Generate XML sitemap dynamically"""
    base_url = "http://localhost:3000"  # TODO: Change to production URL
    
    # Start XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml += '  <url>\n'
    xml += f'    <loc>{base_url}/</loc>\n'
    xml += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>1.0</priority>\n'
    xml += '  </url>\n'
    
    # Books page
    xml += '  <url>\n'
    xml += f'    <loc>{base_url}/libros</loc>\n'
    xml += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>0.9</priority>\n'
    xml += '  </url>\n'
    
    # Author page
    xml += '  <url>\n'
    xml += f'    <loc>{base_url}/autora</loc>\n'
    xml += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
    xml += '    <changefreq>monthly</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
    
    # Individual book pages
    for book in books:
        xml += '  <url>\n'
        xml += f'    <loc>{base_url}/read/{book.id}</loc>\n'
        xml += f'    <lastmod>{book.created_at.strftime("%Y-%m-%d")}</lastmod>\n'
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += '    <priority>0.7</priority>\n'
        xml += '  </url>\n'
    
    # Close XML
    xml += '</urlset>'
    
    return xml
