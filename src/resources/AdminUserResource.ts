import BaseResource from "@/resources/BaseResource";
import { User, UserRole, UserApiToken } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Extend User type to include relations
export type ExtendedUser = User & {
  userRole?: UserRole | null;
  apiTokens?: UserApiToken[];
  categoryId?: string | null;
};

export default class AdminUserResource extends BaseResource<ExtendedUser> {
  async toArray(user: ExtendedUser): Promise<Record<string, unknown>> {
    let categoryName: string | null = null;
    if (user.categoryId) {
      const categoryIdNum = parseInt(String(user.categoryId), 10);
      if (!isNaN(categoryIdNum)) {
        const category = await prisma.eventCategory.findUnique({
          where: { id: categoryIdNum },
          select: { name: true },
        });
        categoryName = category?.name ?? null;
      }
    }
    return {
      id: user.id,
      slug: user.slug,
      username: user.username,
      name: user.name,
      lname: user.lname,
      email: user.email,
      mobileNumber: user.mobileNumber,
      address: user.address ?? null,
      categoryId: user.categoryId,
      categoryName: categoryName,
      dob: user.dob,
      age: user.age,
      gender: user.gender,
      profileType: user.profileType,
      status: user.status,
      isEmailVerify: user.isEmailVerify,
      emailVerifyAt: user.emailVerifyAt,
      platformType: user.platformType,
      platformId: user.platformId,
      imageUrl: user.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${user.imageUrl}`
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.userRole
        ? {
            id: user.userRole.id,
            title: user.userRole.title,
            slug: user.userRole.slug,
          }
        : null,
    };
  }
}
