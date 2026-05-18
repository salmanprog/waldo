import BaseResource from "@/resources/BaseResource";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

// Extend Blog type to include relations
export type ExtendedGalleryItems = {
  id?: number;
  galleryId: number,
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  platoonNumber?: number;
  status: boolean;
  gallery?:{
    id: number;
    title: string;
    slug: string;
    is_coff_book?: boolean;
  }
};

export default class AdminGalleryItemsResource extends BaseResource<ExtendedGalleryItems> {
  
  // Transform a single record
  async toArray(gallery: ExtendedGalleryItems): Promise<Record<string, unknown>> {
    return {
      id: gallery.id,
      slug: gallery.slug,
      platoonNumber: gallery.platoonNumber,
      imageUrl: resolveMediaUrl(gallery.imageUrl),
      gallery: gallery.gallery
        ? {
            id: gallery.gallery.id,
            title: gallery.gallery.title,
            slug: gallery.gallery.slug,
            is_coff_book: gallery.gallery.is_coff_book ?? false,
          }
        : null,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedGalleryItems[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

