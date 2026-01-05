import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function parsePrice(value: any): number {
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    if (isNaN(parsed)) {
        throw new Error(`Invalid price value: ${value}`);
    }
    return parsed;
}

export async function POST(req: Request) {
    let event: Stripe.Event;
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        if (!signature) {
            return NextResponse.json({ received: true });
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        return NextResponse.json({ received: true });
    }

    if (event.type !== "checkout.session.completed") {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    try {
        const userId = Number(session.metadata?.userId);
        const cart = JSON.parse(session.metadata?.cart || "[]");
        if (!userId || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ received: true });
        }

        await prisma.order.create({
            data: {
                userId,
                stripeSessionId: session.id,
                total: Number(session.amount_total ?? 0) / 100,
                status: "PAID",
                purchaseDate: new Date(),

                items: {
                    create: cart.map((item: any) => ({
                        itemId: Number(item.id),
                        itemslug: String(item.slug),
                        title: String(item.title),
                        price: parsePrice(item.price), // ✅ USING HELPER
                        quantity: Number(item.quantity) || 1,
                    })),
                },
            },
        });

    } catch (err) {
        console.error("DB ERROR:", err);
    }
    return NextResponse.json({ received: true });
}