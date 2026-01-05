import BaseResource from "@/resources/BaseResource";
import { EventCategoryFaq } from "@prisma/client";

export type ExtendedEventCategoryFaq = EventCategoryFaq & {
  eventCategory?: { id: number; name: string; slug: string } | null;
};

export default class AdminEventCategoryFaqResource extends BaseResource<ExtendedEventCategoryFaq> {
  
  // Transform a single record
  async toArray(eventCategoryFaq: ExtendedEventCategoryFaq): Promise<Record<string, unknown>> {
    return {
      id: eventCategoryFaq.id,
      eventCategoryId: eventCategoryFaq.eventCategoryId,
      slug: eventCategoryFaq.slug,
      question: eventCategoryFaq.question,
      answer: eventCategoryFaq.answer,
      status: eventCategoryFaq.status,
      createdAt: eventCategoryFaq.createdAt,
      updatedAt: eventCategoryFaq.updatedAt,
      ...(eventCategoryFaq.eventCategory ? { eventCategory: eventCategoryFaq.eventCategory } : {}),
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedEventCategoryFaq[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

