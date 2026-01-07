"use client";

import { useEffect } from "react";
import { useCartStore } from "@/zustand/cart";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";

export default function SuccessPage() {
    const clearCart = useCartStore((s) => s.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Success'} />
            <section className="success-section sec-gap bg-gray-50 flex-grow min-h-[50vh] flex items-center">
                <div className="container">
                    <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-2xl shadow-xl text-center border border-gray-100">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h1 className="text-4xl font-black text-gray-900 mb-4">
                            Payment Successful!
                        </h1>
                        <p className="text-xl text-gray-600 mb-10">
                            Your order has been placed successfully. Thank you for choosing us!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/account" className="btn btn-primary px-10 py-4 shadow-lg hover:shadow-xl transition-all">
                                View My Orders
                            </Link>
                            <Link href="/" className="btn btn-secondary px-10 py-4 shadow-md hover:shadow-lg transition-all">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}