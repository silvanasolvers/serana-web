export const SUPABASE_STORAGE_ORIGIN = 'https://tjjrnpwwfvmsukfrfchr.supabase.co';

const PUBLIC_STORAGE = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/productos`;

export const CATALOG_IMAGE_MANIFEST_URL = '/catalog-image-manifest.json';

export const SITE_IMAGES = {
  heroMobile: `${PUBLIC_STORAGE}/cdn/site/serana-banner-mobile.webp`,
  heroDesktop: `${PUBLIC_STORAGE}/cdn/site/serana-banner-desktop.webp`,
  social: `${PUBLIC_STORAGE}/cdn/site/serana-banner-og.webp`,
  experience: `${PUBLIC_STORAGE}/cdn/site/serana-experience.webp`,
} as const;

export type CatalogImageManifestEntry = {
  source: string;
  mobile: string;
  desktop: string;
  hero: string;
  gallerySources: string[];
  gallery: string[];
};

export type CatalogImageManifest = {
  version: number;
  generatedAt: string;
  products: Record<string, CatalogImageManifestEntry>;
};
