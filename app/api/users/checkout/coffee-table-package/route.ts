import Stripe from "stripe";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded === "string" || decoded.id == null) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(decoded.id);
    if (Number.isNaN(userId) || userId < 1) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    if (!base) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is not set" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Coffee table book — extended package (50+ images)",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/coffe-table-book?coffeePackage=success`,
      cancel_url: `${base}/coffe-table-book?coffeePackage=cancel`,
      metadata: {
        userId: String(userId),
        checkoutType: "coffee_table_extra_package",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Stripe error" },
      { status: 500 }
    );
  }
}
