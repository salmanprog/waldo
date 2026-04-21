import { notFound } from "next/navigation";
import GalleryClient from "../../../products/[slug]/gallery/GalleryClient";
import { findSampleGalleryProduct } from "../../data";

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string | string[]; pid?: string | string[] }>;
}

function resolveQueryParam(raw: string | string[] | undefined): string | null {
  if (raw === undefined) return null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string" || !s.trim()) return null;
  try {
    return decodeURIComponent(s.trim());
  } catch {
    return s.trim();
  }
}

export default async function SamplesGallerySlugGalleryPage({ params, searchParams }: GalleryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const categoryName = resolveQueryParam(sp.category);
  const pid = resolveQueryParam(sp.pid);

  const product = findSampleGalleryProduct(slug, categoryName, pid);

  if (!product) {
    notFound();
  }

  const images = product.gallery?.length ? product.gallery : [product.image];

  return <GalleryClient images={images} productTitle={product.title} />;
}
