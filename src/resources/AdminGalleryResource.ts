import BaseResource from "@/resources/BaseResource";

// Extend Blog type to include relations
export type ExtendedGallery = {
  id?: number;

  eventCategoryId?: number | null;
  eventId?: number | null;

  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  galleryPath?: string | null;

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

      imageUrl: gallery.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${gallery.imageUrl}`
        : null,

      galleryPath: gallery.galleryPath,
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
      items: gallery.items
        ? gallery.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}${item.imageUrl}`,
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

