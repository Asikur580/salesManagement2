import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Brand {
    id: number;
    name: string;
    logo?: string;
    slug: string;
}

interface PopularBrandsProps {
    brands?: Brand[];
}

export function PopularBrands({ brands = [] }: PopularBrandsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!brands || brands.length === 0) {
        return null;
    }

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo =
                direction === "left"
                    ? scrollLeft - scrollAmount
                    : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <div className="w-full bg-[#F8F9FA] py-6">
            <div className="max-w-[100rem] mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                            POPULAR BRANDS
                        </h3>
                        <Link
                            href={route("shop.all-brands")}
                            className="text-xs font-bold text-[#FF4E00] hover:underline uppercase tracking-wider"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="relative group/brands">
                        {/* Arrows */}
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-[150%] z-20 bg-white shadow-md rounded-full p-2 border border-gray-100 hover:bg-gray-50 transition-all transform -translate-x-1/2"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-[150%] z-20 bg-white shadow-md rounded-full p-2 border border-gray-100 hover:bg-gray-50 transition-all transform translate-x-1/2"
                        >
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>

                        <div
                            ref={scrollRef}
                            className="flex overflow-x-auto no-scrollbar gap-10 items-start px-2"
                        >
                            {brands.map((brand, i) => (
                                <Link
                                    key={brand.id || i}
                                    href={route("shop.brand", brand.slug)}
                                    className="flex flex-col items-center flex-shrink-0 group w-[100px]"
                                >
                                    <div className="w-20 h-20 rounded-full border border-gray-100 bg-white p-2 mb-3 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center overflow-hidden">
                                        <img
                                            src={
                                                brand.logo
                                                    ? brand.logo.startsWith(
                                                          "http",
                                                      ) ||
                                                      brand.logo.startsWith(
                                                          "/storage/",
                                                      )
                                                        ? brand.logo
                                                        : `/storage/${brand.logo}`
                                                    : "https://via.placeholder.com/200"
                                            }
                                            alt={brand.name}
                                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                                        />
                                    </div>
                                    <span className="text-[13px] font-bold text-center text-gray-800 leading-tight group-hover:text-[#FF4E00] transition-colors truncate w-full">
                                        {brand.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
