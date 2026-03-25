import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function parsePrice(value: any): number {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  if (isNaN(parsed)) throw new Error(`Invalid price value: ${value}`);
  return parsed;
}

/** Stripe cart metadata often omits download fields; use Event as source of truth. */
async function resolveDownloadAllowance(item: {
  id?: unknown;
  numberOfDownloads?: unknown;
  numberOfDownlaod?: unknown;
}): Promise<string> {
  if (
    item.numberOfDownloads != null &&
    String(item.numberOfDownloads).trim() !== ""
  ) {
    return String(item.numberOfDownloads);
  }
  if (
    item.numberOfDownlaod != null &&
    String(item.numberOfDownlaod).trim() !== ""
  ) {
    return String(item.numberOfDownlaod);
  }
  const ev = await prisma.event.findUnique({
    where: { id: Number(item.id) },
    select: { numberOfDownlaod: true },
  });
  if (ev?.numberOfDownlaod != null && String(ev.numberOfDownlaod).trim() !== "") {
    return String(ev.numberOfDownlaod);
  }
  return "0";
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Only handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("session------------------------------", session);
    try {
      if (session.metadata?.checkoutType === "coffee_table_extra_package") {
        const uid = Number(session.metadata?.userId);
        if (uid) {
          await prisma.favouriteImagesCoffeBook.updateMany({
            where: { userId: uid },
            data: { purchase_package: true } as { purchase_package: boolean },
          });
        }
        return NextResponse.json({ received: true });
      }

      const userId = Number(session.metadata?.userId);
      const cart = JSON.parse(session.metadata?.cart || "[]");
      if (!userId || !Array.isArray(cart) || cart.length === 0) {
        console.warn("Invalid session metadata", session.metadata);
        return NextResponse.json({ received: true });
      }

      const orderItems = await Promise.all(
        cart.map(async (item: any) => {
          const allowance = await resolveDownloadAllowance(item);
          const used =
            item.totalDownloads != null && String(item.totalDownloads).trim() !== ""
              ? String(item.totalDownloads)
              : "0";
          const remaining =
            item.remainingDownloads != null &&
            String(item.remainingDownloads).trim() !== ""
              ? String(item.remainingDownloads)
              : allowance;

          return {
            itemId: Number(item.id),
            itemslug: String(item.slug),
            title: String(item.title),
            price: parsePrice(item.price),
            quantity: Number(item.quantity) || 1,
            totalnumberOfDownlaod: allowance,
            totalDownlaod: used,
            remainingDownlaod: remaining,
          };
        })
      );

      await prisma.order.create({
        data: {
          userId,
          orderType: "package_purchase",
          packageUsed: true,
          platoonNumber: 0,
          stripeSessionId: session.id,
          total: Number(session.amount_total ?? 0) / 100,
          status: "PAID",
          purchaseDate: new Date(),
          items: {
            create: orderItems,
          },
        } as import("@prisma/client").Prisma.OrderUncheckedCreateInput,
      });
    } catch (err) {
      console.error("Database error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
