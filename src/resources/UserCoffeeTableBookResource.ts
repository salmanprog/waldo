import BaseResource from "@/resources/BaseResource";
import { CoffeeTableBook, CoffeeTableBookImage } from "@prisma/client";

export type ExtendedCoffeeTableBook = CoffeeTableBook & {
  images?: CoffeeTableBookImage[];
};

export default class UserCoffeeTableBookResource extends BaseResource<ExtendedCoffeeTableBook> {
  async toArray(record: ExtendedCoffeeTableBook): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      slug: record.slug,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      address: record.address,
      images: record.images?.map((img) => ({
        id: img.id,
        coffeTableBookId: img.coffeTableBookId,
        imageUrl: img.imageUrl,
      })) ?? [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async collection(records: ExtendedCoffeeTableBook[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
