import BaseResource from "@/resources/BaseResource";
import { BlogCategory } from "@prisma/client";

export type ExtendedBlogCategory = BlogCategory & {
  imageUrl?: string | null;
};

export default class AdminBlogCategoryResource extends BaseResource<ExtendedBlogCategory> {
  async toArray(blogCategory: ExtendedBlogCategory): Promise<Record<string, unknown>> {
    return {
      id: blogCategory.id,
      title: blogCategory.title,
      slug: blogCategory.slug,
      description: blogCategory.description,
      imageUrl: blogCategory.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${blogCategory.imageUrl}`
        : null,
      createdAt: blogCategory.createdAt,
      updatedAt: blogCategory.updatedAt,
    };
  }

  async collection(records: ExtendedBlogCategory[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
