import BaseResource from "@/resources/BaseResource";
import type { Pages } from "@prisma/client";

export type ExtendedPages = Pages;

export default class AdminPagesResource extends BaseResource<ExtendedPages> {
  async toArray(page: ExtendedPages): Promise<Record<string, unknown>> {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.description,
      imageUrl: page.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${page.imageUrl}`
        : null,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      status: page.status,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  async collection(records: ExtendedPages[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
