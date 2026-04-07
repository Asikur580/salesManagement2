import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryGridProps {
    categories: any[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.7;
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
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-black text-foreground mb-6 uppercase tracking-tight">
                        TOP CATEGORIES
                    </h3>

                    <div className="relative group">
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-full z-20 bg-card shadow-md rounded-full p-2 border border-border hover:bg-muted transition-all transform -translate-x-1/2"
                        >
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-full z-20 bg-card shadow-md rounded-full p-2 border border-border hover:bg-muted transition-all transform translate-x-1/2"
                        >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <div
                            ref={scrollRef}
                            className="flex overflow-x-auto no-scrollbar gap-10 items-start"
                        >
                            {categories.map((cat, i) => (
                                <Link
                                    key={cat.id || i}
                                    href={route("shop.category", cat.slug)}
                                    className="flex flex-col items-center flex-shrink-0 group w-[100px]"
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-inner hover:scale-105 transition-transform bg-muted flex items-center justify-center">
                                        <img
                                            src={
                                                cat.image
                                                    ? cat.image.startsWith(
                                                          "http",
                                                      ) ||
                                                      cat.image.startsWith(
                                                          "/storage/",
                                                      )
                                                        ? cat.image
                                                        : `/storage/${cat.image}`
                                                    : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400&h=400"
                                            }
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-[13px] font-bold text-center text-foreground leading-tight group-hover:text-primary transition-colors truncate w-full px-1">
                                        {cat.name}
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
