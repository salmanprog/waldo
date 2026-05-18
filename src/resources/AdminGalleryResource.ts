import BaseResource from "@/resources/BaseResource";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

// Extend Blog type to include relations
export type ExtendedGallery = {
  id?: number;
  is_face_recognition?: boolean;
  face_recognition_heading?: string | null;
  is_coff_book?: boolean;
  eventCategoryId?: number | null;
  eventId?: number | null;

  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  galleryPath?: string | null;
  numberOfDownlaod?: string | null;

  status: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  eventCategory?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  event?: {
    id: number;
    title: string;
    slug: string;
  } | null;

  companies?: { companyId: number }[];

  items?: {
    id: number;
    title?: string | null;
    imageUrl: string;
    description?: string | null;
    sortOrder: number;
  }[];
};

export default class AdminGalleryResource extends BaseResource<ExtendedGallery> {
  
  // Transform a single record
  async toArray(gallery: ExtendedGallery): Promise<Record<string, unknown>> {
    return {
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      description: gallery.description,
      is_face_recognition: gallery.is_face_recognition,
      face_recognition_heading: gallery.face_recognition_heading ?? null,
      is_coff_book: gallery.is_coff_book ?? false,
      imageUrl: resolveMediaUrl(gallery.imageUrl),

      galleryPath: gallery.galleryPath,
      numberOfDownlaod: gallery.numberOfDownlaod ?? null,
      status: gallery.status,

      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      eventCategory: gallery.eventCategory
        ? {
            id: gallery.eventCategory.id,
            name: gallery.eventCategory.name,
            slug: gallery.eventCategory.slug,
          }
        : null,
      event: gallery.event
        ? {
            id: gallery.event.id,
            title: gallery.event.title,
            slug: gallery.event.slug,
          }
        : null,
      companyIds: gallery.companies?.map((c) => c.companyId) ?? [],
      items: gallery.items
        ? gallery.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: resolveMediaUrl(item.imageUrl),
            sortOrder: item.sortOrder,
          }))
        : [],
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedGallery[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

