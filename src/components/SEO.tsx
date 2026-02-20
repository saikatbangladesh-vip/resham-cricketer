import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogType?: string;
    ogImage?: string;
    twitterHandle?: string;
}

export default function SEO({
    title = "Resham Cricketer - Official Cricket Highlights Hub",
    description = "Watch and share the best cricket highlights, shots, and moments from the community. Join now to share your brilliance!",
    canonical,
    ogType = "website",
    ogImage = "/og-image.jpg",
    twitterHandle = "@ReshamCricketer"
}: SEOProps) {
    const siteTitle = title === "Resham Cricketer - Official Cricket Highlights Hub"
        ? title
        : `${title} | Resham Cricketer`;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical || window.location.href} />

            {/* Open Graph metadata */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={window.location.href} />

            {/* Twitter metadata */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:site" content={twitterHandle} />
        </Helmet>
    );
}
