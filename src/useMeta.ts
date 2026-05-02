import { useEffect } from 'react';

type MetaOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
};

const BASE_URL = 'https://akakika.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function useMeta({ title, description, path, image, type = 'website' }: MetaOptions) {
  useEffect(() => {
    const url = `${BASE_URL}${path}`;
    const ogImage = image || DEFAULT_IMAGE;

    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      const sel = `meta[${attr}="${key}"]`;
      let el = document.head.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard
    setMeta('name', 'description', description);
    setMeta('name', 'robots', 'index, follow');

    // Canonical
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // OG
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);
  }, [title, description, path, image, type]);
}
