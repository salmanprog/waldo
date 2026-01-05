"use client";

import { useEffect } from "react";
import { useCartStore } from "@/zustand/cart";
import Link from "next/link";

export default function SuccessPage() {
    const clearCart = useCartStore((s) => s.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="container py-20 text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-4">
                Payment Successful 🎉
            </h1>
            <p className="mb-6">Your order has been placed successfully.</p>

            <Link href="/account" className="btn btn-primary">
                View My Orders
            </Link>
        </div>
    );
}
