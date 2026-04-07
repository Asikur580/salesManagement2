import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

export const PromotionalBanners = () => {
    return (
        <div className="bg-[#F8F9FA] py-16">
            <div className="max-w-[100rem] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-56 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10 text-white">
                            <h4 className="text-3xl font-black mb-2 uppercase italic">
                                Engine Care
                            </h4>
                            <p className="text-sm font-bold opacity-80 mb-6 max-w-[240px] uppercase tracking-wider">
                                Premium Lubricants & Performance Tools
                            </p>
                            <Link className="inline-flex items-center text-primary font-black text-sm group/btn uppercase tracking-widest bg-card py-2 px-4 rounded-full w-fit">
                                LEARN MORE{" "}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    <div className="h-56 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1501"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10 text-white">
                            <h4 className="text-3xl font-black mb-2 uppercase italic">
                                Exclusive Combos
                            </h4>
                            <p className="text-sm font-bold opacity-80 mb-6 max-w-[240px] uppercase tracking-wider">
                                Best Value Packs for Your Car
                            </p>
                            <Link className="inline-flex items-center text-primary font-black text-sm group/btn uppercase tracking-widest bg-card py-2 px-4 rounded-full w-fit">
                                SAVE NOW{" "}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
