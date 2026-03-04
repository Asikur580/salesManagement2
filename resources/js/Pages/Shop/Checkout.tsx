import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Truck,
    CreditCard,
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    User,
    ArrowLeft,
    CheckCircle2,
    ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutProps {
    cart: any;
}

export default function Checkout({ cart: initialCart }: CheckoutProps) {
    const { toast } = useToast();
    const { cart } = usePage().props as any; // Use global cart for latest data
    const items = cart?.items || [];

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        payment_method: "cod",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // This would post to a route that handles order creation
        // router.post(route('checkout.process'), formData, { ... });

        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Order Placed Successfully",
                description:
                    "Thank you for your purchase! You will receive an email confirmation shortly.",
            });
            router.get("/");
        }, 1500);
    };

    if (items.length === 0) {
        return (
            <ShopLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
                    <h2 className="text-2xl font-black italic uppercase">
                        Your cart is empty
                    </h2>
                    <Button asChild className="mt-6 bg-[#FF4E00]">
                        <Link href="/">Back to Shop</Link>
                    </Button>
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <Head title="Checkout | CarMart" />

            <div className="bg-gray-50/50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-10">
                        <Link
                            href={route("cart.index")}
                            className="p-2 hover:bg-white rounded-full transition-all text-gray-500 hover:text-[#FF4E00]"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-4xl font-black italic uppercase">
                            Safe{" "}
                            <span className="text-[#FF4E00]">Checkout</span>
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                        {/* Left: Shipping & Payment */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Shipping Information */}
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                                        <Truck className="h-5 w-5 text-[#FF4E00]" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">
                                        Shipping Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                placeholder="John"
                                                className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Last Name
                                        </label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="01XXXXXXXXX"
                                                className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Detailed Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="House #, Road #, Area..."
                                                className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            City
                                        </label>
                                        <Input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Dhaka"
                                            className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Postal Code
                                        </label>
                                        <Input
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                            placeholder="1200"
                                            className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                                        <CreditCard className="h-5 w-5 text-[#FF4E00]" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">
                                        Payment Method
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                payment_method: "cod",
                                            }))
                                        }
                                        className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                                            formData.payment_method === "cod"
                                                ? "border-[#FF4E00] bg-orange-50/30"
                                                : "border-gray-100 hover:border-gray-200"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                                formData.payment_method ===
                                                "cod"
                                                    ? "border-[#FF4E00] bg-[#FF4E00]"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {formData.payment_method ===
                                                "cod" && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-sm">
                                                Cash on Delivery
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                                                Pay when you receive your
                                                package at your doorstep.
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                payment_method: "online",
                                            }))
                                        }
                                        className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                                            formData.payment_method === "online"
                                                ? "border-[#FF4E00] bg-orange-50/30"
                                                : "border-gray-100 hover:border-gray-200"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                                formData.payment_method ===
                                                "online"
                                                    ? "border-[#FF4E00] bg-[#FF4E00]"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {formData.payment_method ===
                                                "online" && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-sm">
                                                Online Payment
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                                                SSLCommerz Secured: bKash,
                                                Rocket, Nagad, Visa, Mastercard.
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 lg:sticky lg:top-32">
                                <h3 className="text-xl font-black italic uppercase italic mb-8 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-[#FF4E00]" />
                                    Review{" "}
                                    <span className="text-[#FF4E00]">
                                        Order
                                    </span>
                                </h3>

                                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                    {items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 items-center group"
                                        >
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                                                <img
                                                    src={
                                                        item.image
                                                            ? item.image.startsWith(
                                                                  "http",
                                                              )
                                                                ? item.image
                                                                : `${item.image}`
                                                            : `https://placehold.co/200x200?text=${item.name}`
                                                    }
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-gray-900 leading-tight truncate">
                                                    {item.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-[10px] font-black text-[#FF4E00]">
                                                        ৳
                                                        {parseFloat(
                                                            item.price,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm text-gray-900">
                                                ৳
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100 mb-8">
                                    <div className="flex justify-between text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600">
                                            FREE
                                        </span>
                                    </div>
                                    <div className="h-[1px] bg-dashed border-t border-dashed border-gray-200 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black italic uppercase">
                                            Total Payable
                                        </span>
                                        <span className="text-2xl font-black text-[#FF4E00]">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF4E00] hover:bg-black text-white py-8 rounded-[1.5rem] text-lg font-black tracking-tight transition-all shadow-xl shadow-orange-100 group overflow-hidden relative"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>PROCESSING...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                CONFIRM ORDER{" "}
                                                <CheckCircle2 className="h-5 w-5" />
                                            </span>
                                        </>
                                    )}
                                </Button>

                                <div className="mt-8 flex flex-col items-center gap-4 text-center">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4" />
                                        Guaranteed Safe Transaction
                                    </div>
                                    <img
                                        src="https://securepay.sslcommerz.com/gw/asset/img/footer/footer-logo-full.png"
                                        alt="SSLCommerz"
                                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </ShopLayout>
    );
}
