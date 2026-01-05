import BaseResource from "@/resources/BaseResource";
import { Event, EventCategory, User } from "@prisma/client";

// Extend EventCategory type to include relations
export type ExtendedEvent = Event & {
  user?: User | null;
  category?: EventCategory | null;
  is_manual?: boolean;
  is_face?: boolean;
};

export default class AdminEventResource extends BaseResource<ExtendedEvent> {
  
  // Transform a single record
  async toArray(event: ExtendedEvent): Promise<Record<string, unknown>> {
    return {
      id: event.id,
      name: event.title,
      slug: event.slug,
      categoryId: event.categoryId,
      price: event.price,
      imageUrl: event.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${event.imageUrl}`
        : null,
      description: event.description,
      is_manual: event.is_manual,
      is_face: event.is_face,
      category: event.category
        ? {
            id: event.category.id,
            title: event.category.name,
            slug: event.category.slug,
          }
        : null,
      status: event.status,
      createdAt: event.createdAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedEvent[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}
