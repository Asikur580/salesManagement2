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

interface Address {
    id: number;
    type: string;
    full_name: string;
    phone: string;
    email: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    area: string | null;
    postal_code: string | null;
    is_default: boolean;
}

interface CheckoutProps {
    cart: any;
    addresses: Address[];
}

export default function Checkout({
    cart: initialCart,
    addresses = [],
}: CheckoutProps) {
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

    const [selectedAddressId, setSelectedAddressId] = useState<number | "new">(
        "new",
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial default address setup
    React.useEffect(() => {
        const defaultAddress = addresses.find((a) => a.is_default);
        if (defaultAddress) {
            handleSelectAddress(defaultAddress);
        }
    }, []);

    const handleSelectAddress = (address: Address | "new") => {
        if (address === "new") {
            setSelectedAddressId("new");
            setFormData((prev) => ({
                ...prev,
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                postal_code: "",
            }));
        } else {
            setSelectedAddressId(address.id);
            const names = address.full_name.split(" ");
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";

            setFormData((prev) => ({
                ...prev,
                first_name: firstName,
                last_name: lastName,
                email: address.email || "",
                phone: address.phone,
                address:
                    address.address_line_1 +
                    (address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""),
                city: address.city,
                postal_code: address.postal_code || "",
            }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route("checkout.process"), formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Order Placed Successfully",
                    description: "Thank you for your purchase!",
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                toast({
                    title: "Order Failed",
                    description: "Please check your information and try again.",
                    variant: "destructive",
                });
            },
        });
    };

    if (items.length === 0) {
        return (
            <ShopLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
                    <h2 className="text-2xl font-black italic uppercase">
                        Your cart is empty
                    </h2>
                    <Button asChild className="mt-6 bg-primary">
                        <Link href="/">Back to Shop</Link>
                    </Button>
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <Head title="Checkout | CarMart" />

            <div className="bg-muted/50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-10">
                        <Link
                            href={route("cart.index")}
                            className="p-2 hover:bg-card rounded-full transition-all text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-4xl font-black italic uppercase">
                            Safe{" "}
                            <span className="text-primary">Checkout</span>
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                        {/* Left: Shipping & Payment */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Shipping Information */}
                            <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                                        <Truck className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">
                                        Shipping Information
                                    </h2>
                                </div>

                                {addresses.length > 0 && (
                                    <div className="mb-10">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">
                                            Select Saved Address
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {addresses.map((address) => (
                                                <button
                                                    key={address.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectAddress(
                                                            address,
                                                        )
                                                    }
                                                    className={`p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                                                        selectedAddressId ===
                                                        address.id
                                                            ? "border-primary bg-orange-50/30"
                                                            : "border-border hover:border-border"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span
                                                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                selectedAddressId ===
                                                                address.id
                                                                    ? "bg-primary text-white"
                                                                    : "bg-muted/80 text-muted-foreground"
                                                            }`}
                                                        >
                                                            {address.type}
                                                        </span>
                                                        {selectedAddressId ===
                                                            address.id && (
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                                                        {address.full_name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate">
                                                        {address.address_line_1}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">
                                                        {address.phone}
                                                    </p>
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectAddress("new")
                                                }
                                                className={`p-5 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group ${
                                                    selectedAddressId === "new"
                                                        ? "border-primary bg-orange-50/30 text-primary"
                                                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    New Address
                                                </span>
                                            </button>
                                        </div>
                                        <div className="h-[1px] bg-muted/80 my-8 w-full" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                placeholder="John"
                                                className="pl-11 h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Last Name
                                        </label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            className="h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                className="pl-11 h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="01XXXXXXXXX"
                                                className="pl-11 h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Detailed Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="House #, Road #, Area..."
                                                className="pl-11 h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            City
                                        </label>
                                        <Input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Dhaka"
                                            className="h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Postal Code
                                        </label>
                                        <Input
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                            placeholder="1200"
                                            className="h-12 bg-muted/50 border-border rounded-xl focus:ring-[#FF4E00]/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                                        <CreditCard className="h-5 w-5 text-primary" />
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
                                                ? "border-primary bg-orange-50/30"
                                                : "border-border hover:border-border"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                                formData.payment_method ===
                                                "cod"
                                                    ? "border-primary bg-primary"
                                                    : "border-border"
                                            }`}
                                        >
                                            {formData.payment_method ===
                                                "cod" && (
                                                <div className="w-2 h-2 rounded-full bg-card" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-sm">
                                                Cash on Delivery
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
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
                                                ? "border-primary bg-orange-50/30"
                                                : "border-border hover:border-border"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                                formData.payment_method ===
                                                "online"
                                                    ? "border-primary bg-primary"
                                                    : "border-border"
                                            }`}
                                        >
                                            {formData.payment_method ===
                                                "online" && (
                                                <div className="w-2 h-2 rounded-full bg-card" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-sm">
                                                Online Payment
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
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
                            <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border lg:sticky lg:top-32">
                                <h3 className="text-xl font-black italic uppercase italic mb-8 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Review{" "}
                                    <span className="text-primary">
                                        Order
                                    </span>
                                </h3>

                                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                    {items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 items-center group"
                                        >
                                            <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden shrink-0 border border-gray-50">
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
                                                <p className="font-black text-sm text-foreground leading-tight truncate">
                                                    {item.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary">
                                                        ৳
                                                        {parseFloat(
                                                            item.price,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm text-foreground">
                                                ৳
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border mb-8">
                                    <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                        <span>Subtotal</span>
                                        <span className="text-foreground">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600">
                                            FREE
                                        </span>
                                    </div>
                                    <div className="h-[1px] bg-dashed border-t border-dashed border-border my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black italic uppercase">
                                            Total Payable
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-black text-white py-8 rounded-[1.5rem] text-lg font-black tracking-tight transition-all shadow-xl shadow-orange-100 group overflow-hidden relative"
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
