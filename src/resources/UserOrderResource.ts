import BaseResource from "@/resources/BaseResource";
import { Order, OrderItem, User } from "@prisma/client";
import { title } from "process";

// Extend Order type with relations
export type ExtendedOrder = Order & {
  user?: User | null;
  items?: OrderItem[];
};

export default class UserOrderResource extends BaseResource<ExtendedOrder> {

  // Transform single order
  async toArray(order: ExtendedOrder): Promise<Record<string, unknown>> {
    return {
      id: order.id,
      userId: order.userId,
      purchase_date: new Date(order.purchaseDate).toISOString().split("T")[0],
      total: order.total,
      status: order.status,
      stripeSessionId: order.stripeSessionId,

      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : null,

      items: order.items?.map(item => ({
        id: item.id,
        slug: item.itemslug,
        productId: item.itemId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })) ?? [],

      createdAt: order.createdAt,
    };
  }

  // Transform collection
  async collection(
    records: ExtendedOrder[]
  ): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}
