"use client";

import { useCartStore } from "@/zustand/cart";
import { useCurrentUser } from "@/utils/currentUser";
interface AccountUser {
    id: number;
    name: string | null;
    email: string | null;
    mobileNumber?: string | null;
    imageUrl?: string | null;
    dob?: string | null;
    gender?: string | null;
    createdAt?: string;
    [key: string]: any;
  }
export default function CheckoutPage() {
    const { cart } = useCartStore();
    const { user: currentUser, loadingUser, errorUser } = useCurrentUser();
    const user = currentUser as AccountUser | null;
    const handleStripeCheckout = async () => {
        const res = await fetch("/api/users/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cart,userId: user?.id, }),
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        }
    };

    return (
        <div className="container py-20 text-center">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <button
                onClick={handleStripeCheckout}
                className="btn btn-primary px-8 py-3 text-lg"
            >
                Pay with Stripe
            </button>
        </div>
    );
}
