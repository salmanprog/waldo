import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminPagesHook from "@/hooks/AdminPagesHook";
import AdminPagesResource from "@/resources/AdminPagesResource";
import { storePage, updatePage } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedPages } from "@/resources/AdminPagesResource";

/** `prisma.pages` — matches RestController Prisma-compatible model shape. */
type PagesPrismaModel = {
  findMany: (...args: unknown[]) => Promise<unknown>;
  findUnique?: (...args: unknown[]) => Promise<unknown>;
  create?: (...args: unknown[]) => Promise<unknown>;
  update?: (...args: unknown[]) => Promise<unknown>;
  delete?: (...args: unknown[]) => Promise<unknown>;
};

export default class AdminPagesController extends RestController<PagesPrismaModel, ExtendedPages> {
  constructor(req?: Request, data?: Partial<ExtendedPages>) {
    super((prisma as unknown as { pages: PagesPrismaModel }).pages, req);

    this.data = data ?? {};
    this.resource = AdminPagesResource;
    this.hook = AdminPagesHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storePage, this.data ?? {});
      case "update":
        return await this.__validate(updatePage, this.data ?? {});
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeShow(): Promise<void | NextResponse> {}

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.title) {
      this.data.slug = await generateSlug("pages" as keyof typeof prisma, this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedPages): Promise<ExtendedPages> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedPages): Promise<ExtendedPages> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
