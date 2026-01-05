import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cart, userId } = body;
        if (!userId) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty" },
                { status: 400 }
            );
        }

        const lineItems = cart.map((item: any) => {
            const price = Number(
                String(item.price).replace(/[^0-9.]/g, "")
            );

            if (isNaN(price)) {
                throw new Error(`Invalid price: ${item.price}`);
            }

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: String(item.title),
                    },
                    unit_amount: Math.round(price * 100),
                },
                quantity: Number(item.quantity) || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                userId: String(userId),
                cart: JSON.stringify(
                    cart.map((item: any) => ({
                        id: item.id,
                        slug: item.slug,
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity,
                    }))
                ),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Stripe error" },
            { status: 500 }
        );
    }
}