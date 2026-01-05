import BaseResource from "@/resources/BaseResource";
import { EventCategory, User } from "@prisma/client";

// Extend EventCategory type to include relations
export type ExtendedEventCategory = EventCategory & {
  user?: User | null;
};

export default class AdminEventCategoryResource extends BaseResource<ExtendedEventCategory> {
  
  // Transform a single record
  async toArray(eventCategory: ExtendedEventCategory): Promise<Record<string, unknown>> {
    return {
      id: eventCategory.id,
      name: eventCategory.name,
      slug: eventCategory.slug,
      imageUrl: eventCategory.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${eventCategory.imageUrl}`
        : null,
      description: eventCategory.description,
      status: eventCategory.status,
      createdAt: eventCategory.createdAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedEventCategory[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}
