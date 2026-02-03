import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, canonical, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, schema }) => {
  return (
    <Helmet>
      {/* Basic SEO */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      
      {/* Dynamic meta tags */}
      <title>{title || 'PDFHero - Advanced PDF Tools'}</title>
      <meta name="description" content={description || 'Free online PDF tools - Merge, split, compress, convert, and edit PDFs'} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph (Social) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PDFHero" />
      <meta property="og:title" content={ogTitle || title || 'PDFHero - Advanced PDF Tools'} />
      <meta property="og:description" content={ogDescription || description || 'Free online PDF tools - Merge, split, compress, convert, and edit PDFs'} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={canonical || window.location.href} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || title || 'PDFHero - Advanced PDF Tools'} />
      <meta name="twitter:description" content={twitterDescription || description || 'Free online PDF tools - Merge, split, compress, convert, and edit PDFs'} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Schema markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;