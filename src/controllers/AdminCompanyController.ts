import type { Prisma, Company } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminCompanyHook from "@/hooks/AdminCompanyHook";
import AdminCompanyResource from "@/resources/AdminCompanyResource";
import { storeCompany, updateCompany } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedCompany = Company & { imageUrl?: string };

export default class AdminCompanyController extends RestController<
  Prisma.CompanyDelegate<DefaultArgs>,
  ExtendedCompany
> {
  constructor(req?: Request, data?: Partial<ExtendedCompany>) {
    super(
      prisma.company as unknown as Prisma.CompanyDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = AdminCompanyResource;
    this.hook = AdminCompanyHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeCompany, this.data ?? {});
      case "update":
        return await this.__validate(updateCompany, this.data ?? {});
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
    if (this.data?.name) {
      this.data.slug = await generateSlug("company", this.data.name);
    }
  }

  protected async afterStore(record: ExtendedCompany): Promise<ExtendedCompany> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    // Slug is not updated on edit to preserve URLs
  }

  protected async afterUpdate(record: ExtendedCompany): Promise<ExtendedCompany> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
