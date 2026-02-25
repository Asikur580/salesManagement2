import React from "react";
import { Link } from "@inertiajs/react";

const PRODUCTS = [
    {
        id: 1,
        name: "Stay Safe with Nakamichi NC-501 360 Degree Car Camera – Best 36...",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400",
        price: 13500,
        brand: "Nakamichi",
    },
    {
        id: 2,
        name: "Hyundai Logo Metal Door Lock Cover – Ultimate Protection with a...",
        image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400&h=400",
        price: 850,
        brand: null,
    },
    {
        id: 3,
        name: "Bullsone Multi Cleaner - Professional-Quality Cleaning for...",
        image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400&h=400",
        price: 850,
        brand: "Bullsone",
    },
    {
        id: 4,
        name: "Nakamichi ND 430W Dash Cam – Full HD Car Camera with Night...",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400",
        price: 13500,
        brand: "Nakamichi",
    },
    {
        id: 5,
        name: "Ultimate 600ml Bullsone Synthetic Leather Protect Wax - Superior...",
        image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400&h=400",
        price: 850,
        brand: "Bullsone",
    },
    {
        id: 6,
        name: "Best Performance Pioneer Car Amplifier TS-D3 80W - Experience...",
        image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400&h=400",
        price: 5500,
        brand: "Pioneer",
    },
    {
        id: 7,
        name: "Top-Selling Pioneer Ts-A1697S 400W Speaker - Best Car Speaker ...",
        image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400&h=400",
        price: 4500,
        brand: "Pioneer",
    },
    {
        id: 8,
        name: "Pioneer TS-G1620F Car Speaker - Best Car Speaker for Immersive an...",
        image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400&h=400",
        price: 7500,
        brand: "Pioneer",
    },
    {
        id: 9,
        name: "JBL Stage 161CFS Car Speaker - Feel The Music with Superior Sound",
        image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400&h=400",
        price: 11500,
        brand: "JBL",
    },
    {
        id: 10,
        name: "Best 1080P Car Back Camera - 170 Degree Coverage with Night Vision...",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400",
        price: 1990,
        brand: null,
    },
    {
        id: 11,
        name: "Soft99 Glaco Windshield Cleaning 750ml – Superior Clarity at Rainy...",
        image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400&h=400",
        price: 1250,
        brand: "SOFT99",
    },
    {
        id: 12,
        name: "Soft99 Glaco Window Washer Pack 2L – Powerful Cleaning with...",
        image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400&h=400",
        price: 1900,
        brand: "SOFT99",
    },
];

export function YouMayLike() {
    return (
        <div className="w-full bg-white py-10 border-b">
            <div className="max-w-[100rem] mx-auto px-4">
                <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">
                    YOU MAY LIKE
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className="group cursor-pointer flex flex-col"
                        >
                            <div className="aspect-square bg-gray-50 rounded-lg border border-gray-100 overflow-hidden mb-3 relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <div className="space-y-1.5 flex-1 flex flex-col">
                                <h3 className="text-[12px] font-medium text-gray-600 leading-snug line-clamp-2 min-h-[36px] group-hover:text-[#FF4E00] transition-colors">
                                    {product.name}
                                </h3>

                                <div className="mt-auto space-y-2">
                                    <span className="text-[15px] font-bold text-[#FF4E00] block">
                                        ৳{product.price.toLocaleString()}
                                    </span>

                                    {product.brand && (
                                        <div className="inline-block bg-[#FF4E00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">
                                            {product.brand}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
