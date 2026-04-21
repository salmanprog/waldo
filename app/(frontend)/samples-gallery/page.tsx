import InnerBanner from "@/components/common/InnerBanner";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sampleProductsForCategory } from "./data";

type PageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function resolveCategoryName(raw: string | string[] | undefined): string | null {
  if (raw === undefined) return null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string" || !s.trim()) return null;
  try {
    return decodeURIComponent(s.trim());
  } catch {
    return s.trim();
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const categoryName = resolveCategoryName(sp.category);
  const titlePart = categoryName || "Samples Gallery";
  return {
    title: `My Waldo | ${titlePart}`,
    description: "Samples gallery",
  };
}

export default async function SamplesGalleryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const categoryName = resolveCategoryName(sp.category);
  const bannerTitle = categoryName || "Samples Gallery";
  const products = sampleProductsForCategory(categoryName);

  return (
    <>
      <InnerBanner bannerClass="products-banner" title={bannerTitle} />
      {categoryName ? (
        <section className="bg-white py-6">
          <div className="container">
            <p className="para text-center text-[#000000] font-semibold text-xl">{categoryName}</p>
          </div>
        </section>
      ) : null}
      <section className="products-section sec-gap">
        <div className="container">
          {products.length === 0 ? (
            <p className="para text-center text-gray-600 py-12">
              No sample items are linked to this category yet. Add a matching name in{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">samples-gallery/data.ts</code>{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">categoryNames</code> for{" "}
              <span className="font-medium">{categoryName}</span>.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div className="product-card group" key={product.id}>
                  <div className="product-card-image">
                    <Image src={product.image} className="w-full" alt={product.title} width={400} height={400} />
                  </div>
                  <div className="product-card-content">
                    {/* {product.eventDate && (
                      <span className="event-date">Event Held: {product.eventDate}</span>
                    )} */}
                    <h3 className="product-card-title line-clamp-2">{product.title}</h3>
                  </div>
                  <div className="product-hidden-content">
                    <Link
                      href={`/samples-gallery/${product.slug}/gallery?${new URLSearchParams({
                        pid: String(product.id),
                        ...(categoryName ? { category: categoryName } : {}),
                      }).toString()}`}
                      className="btn btn-primary w-full flex justify-center items-center gap-2"
                    >
                      <span>View Gallery</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
