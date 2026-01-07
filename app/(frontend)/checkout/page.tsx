"use client";

import { useCartStore } from "@/zustand/cart";
import { useCurrentUser } from "@/utils/currentUser";
import InnerBanner from "@/components/common/InnerBanner";
import Link from "next/link";

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
    const { cart, getCartTotal } = useCartStore();
    const { user: currentUser } = useCurrentUser();
    const user = currentUser as AccountUser | null;
    
    const cartTotal = getCartTotal();

    const handleStripeCheckout = async () => {
        if (cart.length === 0) return;
        
        const res = await fetch("/api/users/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cart, userId: user?.id }),
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        }
    };

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Checkout'} />
            <section className="checkout-section sec-gap bg-gray-50 flex-grow min-h-[50vh]">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Order Summary Side */}
                                <div className="p-8 md:p-12 bg-gray-50 border-r border-gray-100">
                                    <h2 className="text-2xl font-bold mb-8 text-gray-900">Order Summary</h2>
                                    <div className="space-y-6">
                                        {cart.length > 0 ? (
                                            cart.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div className="flex-grow">
                                                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <span className="font-bold text-gray-900">{item.price}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No items in cart</p>
                                        )}
                                        
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <div className="flex justify-between items-center text-xl font-black text-gray-900">
                                                <span>Total Amount</span>
                                                <span>${cartTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Side */}
                                <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center">
                                    <div className="mb-8">
                                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
                                        <p className="text-gray-500 mt-2">Complete your purchase securely via Stripe</p>
                                    </div>

                                    <button
                                        onClick={handleStripeCheckout}
                                        disabled={cart.length === 0}
                                        className="w-full btn btn-primary py-4 text-center text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Pay with Stripe
                                    </button>
                                    
                                    <p className="mt-6 text-xs text-gray-400">
                                        By clicking "Pay with Stripe", you agree to our terms and conditions.
                                    </p>
                                    
                                    <Link href="/cart" className="mt-8 text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors uppercase tracking-wider">
                                        Back to Cart
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
