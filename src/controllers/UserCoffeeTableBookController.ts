import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import UserCoffeeTableBookHook from "@/hooks/UserCoffeeTableBookHook";
import UserCoffeeTableBookResource from "@/resources/UserCoffeeTableBookResource";
import { storeCoffeeTableBook, updateCoffeeTableBook } from "@/validators/coffeeTableBook.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedCoffeeTableBook } from "@/resources/UserCoffeeTableBookResource";
import * as fs from "fs/promises";
import * as path from "path";

export default class UserCoffeeTableBookController extends RestController<
  Prisma.CoffeeTableBookDelegate<DefaultArgs>,
  ExtendedCoffeeTableBook
> {
  constructor(req?: Request, data?: Partial<ExtendedCoffeeTableBook>) {
    super(
      prisma.coffeeTableBook as unknown as Prisma.CoffeeTableBookDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = UserCoffeeTableBookResource;
    this.hook = UserCoffeeTableBookHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeCoffeeTableBook, this.data ?? {});
      case "update":
        return await this.__validate(updateCoffeeTableBook, this.data ?? {});
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const d = this.data as Record<string, unknown> | null;
    if (d && !d.slug) {
      const base = `${d.firstName ?? ""}-${d.lastName ?? ""}-${Date.now()}`;
      d.slug = await generateSlug("coffeeTableBook" as any, base);
    }
  }

  async store(data?: Partial<ExtendedCoffeeTableBook>): Promise<NextResponse> {
    try {
      const d = (data || this.data) as Record<string, unknown>;
      
      // Validate images
      const images = d.images as File[];
      if (!images || images.length === 0) {
        return this.sendError("At least one image is required", {}, 422);
      }

      // Generate slug if not exists
      if (!d.slug) {
        const base = `${d.firstName ?? ""}-${d.lastName ?? ""}-${Date.now()}`;
        d.slug = await generateSlug("coffeeTableBook" as any, base);
      }

      // Create coffee table book entry
      const coffeeTableBook = await prisma.coffeeTableBook.create({
        data: {
          slug: d.slug as string,
          firstName: d.firstName as string,
          lastName: d.lastName as string,
          email: d.email as string,
          phone: (d.phone as string) || null,
          address: (d.address as string) || null,
        },
      });

      // Upload directory
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "coffee-table-book",
        String(coffeeTableBook.id)
      );
      await fs.mkdir(uploadDir, { recursive: true });

      // Save images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (!(file instanceof Blob)) continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${i}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);

        // Save to database
        await prisma.coffeeTableBookImage.create({
          data: {
            slug: await generateSlug("coffeeTableBookImage" as any, `image-${coffeeTableBook.id}-${Date.now()}-${i}`),
            coffeTableBookId: coffeeTableBook.id,
            imageUrl: `/uploads/coffee-table-book/${coffeeTableBook.id}/${fileName}`,
          },
        });
      }

      return this.__sendResponse(
        200,
        "Coffee table book request submitted successfully",
        { id: coffeeTableBook.id }
      );
    } catch (err) {
      console.error("Coffee table book creation error:", err);
      return this.sendError((err as Error).message, {}, 500);
    }
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Optional
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    // Optional
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    // Optional
  }
}
