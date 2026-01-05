"use client";
import { useEffect, useState } from "react";
import { useCartStore } from "@/zustand/cart";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import InnerBanner from "@/components/common/InnerBanner";
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

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCartStore();
    const { user: currentUser, loadingUser, errorUser } = useCurrentUser();
    const user = currentUser as AccountUser | null;
    
    const cartTotal = getCartTotal();

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Shopping Cart'} />
            <section className="cart-section sec-gap bg-gray-50 flex-grow min-h-[50vh]">
                <div className="container">
                    {cart.length === 0 ? (
                        <div className="text-center py-20">
                            <h2 className="text-3xl font-bold mb-4 text-gray-800">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                            <Link href="/" className="btn btn-primary inline-block">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items */}
                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                    <div className="p-6 border-b border-gray-100 hidden md:grid grid-cols-12 gap-4 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                                        <div className="col-span-8">Product</div>
                                        <div className="col-span-2 text-center">Quantity</div>
                                        <div className="col-span-2 text-right">Price</div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {cart.map((item) => (
                                            <div key={item.id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                                                <div className="col-span-8 w-full">
                                                    <div className="flex-grow">
                                                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                                        <button 
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700 transition-colors"
                                                        >
                                                            <FaTrash className="text-xs" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 text-center font-medium text-gray-800">
                                                    {item.quantity}
                                                </div>
                                                <div className="col-span-2 font-bold text-gray-900 text-right w-full">
                                                    {item.price}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="lg:w-1/3">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                                    <h3 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {user ? (
                                        <Link
                                            href="/checkout"
                                            className="w-full btn btn-primary py-3 text-center text-lg font-bold shadow-md hover:shadow-lg transition-all inline-block"
                                        >
                                            Proceed to Checkout
                                        </Link>
                                        ) : loadingUser ? (
                                        <button
                                            disabled
                                            className="w-full btn btn-primary py-3 text-center text-lg font-bold opacity-70 cursor-not-allowed"
                                        >
                                            Checking login...
                                        </button>
                                        ) : (
                                        <Link
                                            href="/login"
                                            className="w-full btn btn-primary py-3 text-center text-lg font-bold shadow-md hover:shadow-lg transition-all inline-block"
                                        >
                                            Login to Continue
                                        </Link>
                                    )}

                                        <div className="mt-4 text-center">
                                        <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors hover:underline">
                                            or Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
