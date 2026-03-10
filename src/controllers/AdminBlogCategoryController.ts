import type { Prisma, BlogCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminBlogCategoryHook from "@/hooks/AdminBlogCategoryHook";
import AdminBlogCategoryResource from "@/resources/AdminBlogCategoryResource";
import { storeBlogCategory, updateBlogCategory } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedBlogCategory = BlogCategory & { imageUrl?: string };

export default class AdminBlogCategoryController extends RestController<
  Prisma.BlogCategoryDelegate<DefaultArgs>,
  ExtendedBlogCategory
> {
  constructor(req?: Request, data?: Partial<ExtendedBlogCategory>) {
    super(
      prisma.blogCategory as unknown as Prisma.BlogCategoryDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = AdminBlogCategoryResource;
    this.hook = AdminBlogCategoryHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeBlogCategory, this.data ?? {});
      case "update":
        return await this.__validate(updateBlogCategory, this.data ?? {});
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.title) {
      this.data.slug = await generateSlug("blogCategory", this.data.title);
    }
  }

  protected async afterStore(record: ExtendedBlogCategory): Promise<ExtendedBlogCategory> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    // Slug is not updated on edit to preserve URLs
  }

  protected async afterUpdate(record: ExtendedBlogCategory): Promise<ExtendedBlogCategory> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
