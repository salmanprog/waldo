import BaseResource from "@/resources/BaseResource";
import { CoffeeTableBook } from "@prisma/client";

type CoffeeTableBookImage = {
  id: number;
  slug: string | null;
  coffeTableBookId: number;
  imageUrl: string;
};

export type ExtendedCoffeeTableBook = CoffeeTableBook & {
  images?: CoffeeTableBookImage[];
};

export default class AdminCoffeeTableBookResource extends BaseResource<ExtendedCoffeeTableBook> {
  async toArray(record: ExtendedCoffeeTableBook): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      slug: (record as Record<string, unknown>).slug,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      address: record.address,
      images: record.images || [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
