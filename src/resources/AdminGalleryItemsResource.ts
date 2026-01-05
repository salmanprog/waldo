import BaseResource from "@/resources/BaseResource";

// Extend Blog type to include relations
export type ExtendedGalleryItems = {
  id?: number;
  galleryId: number,
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status: boolean;
  gallery?:{
    id: number;
    title: string;
    slug: string;
  }
};

export default class AdminGalleryItemsResource extends BaseResource<ExtendedGalleryItems> {
  
  // Transform a single record
  async toArray(gallery: ExtendedGalleryItems): Promise<Record<string, unknown>> {
    return {
      id: gallery.id,
      slug: gallery.slug,
      imageUrl: gallery.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${gallery.imageUrl}`
        : null,
      gallery: gallery.gallery
        ? {
            id: gallery.gallery.id,
            title: gallery.gallery.title,
            slug: gallery.gallery.slug,
          }
        : null,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedGalleryItems[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

