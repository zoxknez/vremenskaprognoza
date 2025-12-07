'use client';

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VremeVazduh",
    "applicationCategory": "WeatherApplication",
    "operatingSystem": "All",
    "description": "Pratite vremensku prognozu, kvalitet vazduha, UV index i mnogo više za gradove širom Balkana i sveta.",
    "url": "https://vremevazduh.space",
    "author": {
      "@type": "Person",
      "name": "o0o0o0o",
      "url": "https://mojportfolio.vercel.app/"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "Vremenska prognoza u realnom vremenu",
      "Kvalitet vazduha (AQI)",
      "7-dnevna prognoza",
      "UV indeks",
      "Interaktivna mapa",
      "Istorijski podaci",
      "Obaveštenja o vremenskim promenama"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VremeVazduh",
    "url": "https://vremevazduh.space",
    "logo": "https://vremevazduh.space/icons/icon.svg",
    "sameAs": [
      "https://github.com/zoxknez"
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VremeVazduh",
    "url": "https://vremevazduh.space",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://vremevazduh.space/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
