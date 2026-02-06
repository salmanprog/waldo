import BaseResource from "@/resources/BaseResource";

export type ExtendedGalleryPlatoon = {
  id?: number;
  galleryId: number;
  platoonNumber: number;
  gallery?: {
    id: number;
    title: string | null;
    slug: string;
  } | null;
};

export default class AdminGalleryPlatoonResource extends BaseResource<ExtendedGalleryPlatoon> {
  async toArray(
    record: ExtendedGalleryPlatoon
  ): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      galleryId: record.galleryId,
      platoonNumber: record.platoonNumber,
      gallery: record.gallery
        ? {
            id: record.gallery.id,
            title: record.gallery.title,
            slug: record.gallery.slug,
          }
        : null,
    };
  }

  async collection(
    records: ExtendedGalleryPlatoon[]
  ): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
