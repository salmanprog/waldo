import BaseResource from "@/resources/BaseResource";
import { Company } from "@prisma/client";

export type ExtendedCompany = Company & {
  imageUrl?: string | null;
};

export default class AdminCompanyResource extends BaseResource<ExtendedCompany> {
  async toArray(company: ExtendedCompany): Promise<Record<string, unknown>> {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      imageUrl: company.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${company.imageUrl}`
        : null,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  async collection(records: ExtendedCompany[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
