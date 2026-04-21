const getPackage = (price: string, afterPrice: string) => ({
  id: 1,
  price,
  afterPrice,
  priceDescription: `${price} After Mag 8, price is ${afterPrice}`,
  description: `
  You are purchasing access to the photographs we will take of the Herndon Monument
    Climb and Sea Trials. Purchase includes unlimited downloads of your midshipman
    for personal use. We are not able to photograph every midshipman during Herndon,
    but we are during Sea Trials. During Sea Trials we photograph each company as they complete
    one of the events —the Mud Crawl.
  `,
});

export type SampleGalleryProduct = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  limit: string;
  description: string;
  highlight: string;
  infoLink: string;
  contact: { name: string; phone: string; email: string };
  details: string[];
  packages: ReturnType<typeof getPackage>;
  image: string;
  eventDate: string;
  gallery?: string[];
  categoryNames: string[];
};

export const sampleGalleryProducts: SampleGalleryProduct[] = [
  {
    id: 1,
    slug: "sea-trials-herndon",
    title: "Sea Trials / Herndon Sample Gallery",
    subtitle: "A LA CARTE: Manual and Facial Recognition $339.95",
    price: "$339.95",
    limit: "Limit one per customer",
    description:
      "Sample gallery of photographs from Sea Trials and Herndon.",
    highlight: "$59.99 of the $299.95 supports your son/daughter through NABSD.",
    infoLink: "https://example.com/details",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Manual and Facial Recognition Search",
      "Unlimited photo downloads for personal use",
      "Access to all photographs within 48 hours",
      "Supports your mid through NABSD",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/01.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
    ],  
    categoryNames: ["Sea Trials / Herndon", "SeaTrials / Herndon", "Sea Trials", "Herndon"],
  },

  {
    id: 2,
    slug: "sea-trials-herndon",
    title: "Sea Trials / Herndon Original Gallery",
    subtitle: "A LA CARTE: Manual and Facial Recognition $339.95",
    price: "$339.95",
    limit: "Limit one per customer",
    description:
      "Sample gallery of photographs from Sea Trials and Herndon.",
    highlight: "$59.99 of the $299.95 supports your son/daughter through NABSD.",
    infoLink: "https://example.com/details",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Manual and Facial Recognition Search",
      "Unlimited photo downloads for personal use",
      "Access to all photographs within 48 hours",
      "Supports your mid through NABSD",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/Sea Trials-HerndonX (2)_1_1.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/Sea Trials-HerndonX (2)_1_1.jpg",
      "/images/home/hero/Sea Trials-HerndonX (3)_1_1.jpg",
      "/images/home/hero/Sea Trials-HerndonX (4)_1_1.jpg",
      "/images/home/hero/Sea Trials-HerndonX (5)_1_1.jpg",
      "/images/home/hero/Sea Trials-HerndonX (8)_1_1.jpg",
    ],  
    categoryNames: ["Sea Trials / Herndon", "SeaTrials / Herndon", "Sea Trials", "Herndon"],
  },

  {
    id: 3,
    slug: "plebe-summer-photo-access",
    title: "Plebe Summer Sample Gallery",
    subtitle: "Full Access: Manual + Facial Recognition $299.95",
    price: "$299.95",
    limit: "One account per family",
    description:
      "Enjoy full photo access during Plebe Summer. Our advanced facial recognition helps you find your midshipman’s moments quickly. Receive unlimited downloads and access to all galleries directly through your account within 24–48 hours.",
    highlight: "$49.99 of your purchase supports the Plebe Summer Activity Fund.",
    infoLink: "https://example.com/plebe-summer",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Complete gallery access for Plebe Summer",
      "Manual and AI-based facial recognition",
      "Unlimited downloads in high resolution",
      "Direct support for Plebe Summer events",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/02.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
    ],  
    categoryNames: ["Plebe Summer", "Plebe"],
  },
  {
    id: 4,
    slug: "plebe-summer-photo-access",
    title: "Plebe Summer Original Gallery",
    subtitle: "Full Access: Manual + Facial Recognition $299.95",
    price: "$299.95",
    limit: "One account per family",
    description:
      "Enjoy full photo access during Plebe Summer. Our advanced facial recognition helps you find your midshipman’s moments quickly. Receive unlimited downloads and access to all galleries directly through your account within 24–48 hours.",
    highlight: "$49.99 of your purchase supports the Plebe Summer Activity Fund.",
    infoLink: "https://example.com/plebe-summer",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Complete gallery access for Plebe Summer",
      "Manual and AI-based facial recognition",
      "Unlimited downloads in high resolution",
      "Direct support for Plebe Summer events",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/PlebeSummer (5)_1_1.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/PlebeSummer (5)_1_1.jpg",
      "/images/home/hero/PlebeSummer (24)_1_1.jpg",
      "/images/home/hero/PlebeSummer (27)_1_1.jpg",
      "/images/home/hero/PlebeSummer (42)_1_1.jpg",
      "/images/home/hero/PlebeSummer (46)_1_1.jpg",
    ],  
    categoryNames: ["Plebe Summer", "Plebe"],
  },
  {
    id: 5,
    slug: "graduation-photo-package",
    title: "Graduation Day Sample Gallery",
    subtitle: "Premium Package: Ceremony + Candids $349.95",
    price: "$349.95",
    limit: "Limit one package per graduating mid",
    description:
      "Capture every moment of your midshipman’s graduation day. Includes high-resolution photos from the ceremony, family interactions, and candid shots throughout the day. Delivered within 72 hours post-event.",
    highlight: "$69.99 of this purchase supports midshipmen graduation activities.",
    infoLink: "https://example.com/graduation",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Full ceremony and candid coverage",
      "High-resolution downloadable gallery",
      "Delivery within 72 hours",
      "Supports graduation programs",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/03.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
    ],  
    categoryNames: ["Graduations / Commissioning", "Graduation", "Commissioning"],
  },
  {
    id: 6,
    slug: "graduation-photo-package",
    title: "Graduation Day Original Gallery",
    subtitle: "Premium Package: Ceremony + Candids $349.95",
    price: "$349.95",
    limit: "Limit one package per graduating mid",
    description:
      "Capture every moment of your midshipman’s graduation day. Includes high-resolution photos from the ceremony, family interactions, and candid shots throughout the day. Delivered within 72 hours post-event.",
    highlight: "$69.99 of this purchase supports midshipmen graduation activities.",
    infoLink: "https://example.com/graduation",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Full ceremony and candid coverage",
      "High-resolution downloadable gallery",
      "Delivery within 72 hours",
      "Supports graduation programs",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/Comm-Grad (1)_1_1.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/Comm-Grad (1)_1_1.jpg",
      "/images/home/hero/Comm-Grad (4)_1_1.jpg",
      "/images/home/hero/Comm-Grad (11)_1_1.jpg",
      "/images/home/hero/Comm-Grad (12)_1_1.jpg",
      "/images/home/hero/Comm-Grad (22)_1_1.jpg",
    ],  
    categoryNames: ["Graduations / Commissioning", "Graduation", "Commissioning"],
  },
];

/**
 * Resolve a sample row by slug. Uses `pid` (product id) when present for exact row (same slug
 * Sample vs Original). Otherwise uses `categoryName` (`?category=`) to match `categoryNames`.
 */
export function findSampleGalleryProduct(
  slug: string,
  categoryName: string | null | undefined,
  productId: string | null | undefined
): SampleGalleryProduct | undefined {
  const rows = sampleGalleryProducts.filter((p) => p.slug === slug);
  if (rows.length === 0) return undefined;

  if (productId?.trim()) {
    const id = parseInt(productId.trim(), 10);
    if (!Number.isNaN(id)) {
      const byId = sampleGalleryProducts.find((p) => p.id === id && p.slug === slug);
      if (byId) return byId;
    }
  }

  if (!categoryName?.trim()) {
    return rows[0];
  }
  const needle = categoryName.trim().toLowerCase();
  return rows.find((p) => p.categoryNames.some((c) => c.trim().toLowerCase() === needle));
}

export function sampleProductsForCategory(categoryName: string | null): SampleGalleryProduct[] {
  if (!categoryName?.trim()) {
    return sampleGalleryProducts;
  }
  const needle = categoryName.trim().toLowerCase();
  const matched = sampleGalleryProducts.filter((p) =>
    p.categoryNames.some((c) => c.trim().toLowerCase() === needle)
  );
  return matched;
}
