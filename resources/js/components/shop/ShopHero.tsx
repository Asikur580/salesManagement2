import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, Zap, Star, ShieldCheck, Clock } from "lucide-react";

export function ShopHero() {
  const sidebarCategories = [
    { name: "Summer Essential", icon: <Zap className="h-4 w-4" /> },
    { name: "Winter Essential", icon: <Star className="h-4 w-4" /> },
    { name: "Car Interior", icon: <ShieldCheck className="h-4 w-4" />, hasSub: true },
    { name: "Car Exterior", icon: <Clock className="h-4 w-4" />, hasSub: true },
    { name: "Electronics & Gadgets", icon: <Zap className="h-4 w-4" />, hasSub: true },
    { name: "Car Care", icon: <Star className="h-4 w-4" />, hasSub: true },
    { name: "Perfume & Showpiece", icon: <ShieldCheck className="h-4 w-4" />, hasSub: true },
    { name: "Key Accessories", icon: <Clock className="h-4 w-4" />, hasSub: true },
    { name: "Performance", icon: <Zap className="h-4 w-4" />, hasSub: true },
  ];

  return (
    <div className="w-full bg-[#F5F5F5] py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Categories Sidebar */}
        <div className="hidden lg:block w-[260px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-white px-4 py-3 border-b flex items-center gap-3">
            <Menu className="h-5 w-5 text-gray-700" />
            <span className="font-bold text-gray-800">All Categories</span>
          </div>
          <div className="py-2">
            {sidebarCategories.map((cat, i) => (
              <div
                key={i}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 group-hover:text-[#FF4E00] transition-colors bg-gray-100 p-1.5 rounded-full">
                    {cat.icon}
                  </div>
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#FF4E00]">
                    {cat.name}
                  </span>
                </div>
                {cat.hasSub && (
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF4E00]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Main Banner */}
        <div className="flex-1 rounded-xl overflow-hidden relative group h-[300px] md:h-[450px] shadow-lg border border-gray-100">
           {/* Background Image - Clean and High Quality */}
           <img 
             src="https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=1583" 
             alt="Featured Banner" 
             className="w-full h-full object-cover"
           />
           {/* Light Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent z-10" />
           
           <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#FF4E00] p-1.5 rounded-lg">
                  <span className="font-bold text-white text-lg">O</span>
                </div>
                <span className="text-xl font-bold text-gray-800">OrenMart</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight text-gray-800 uppercase italic">
                OrenMart এর <br />
                <span className="text-[#FF4E00]">Car Accessories</span> মানেই
              </h2>
              
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF4E00] rounded-full p-1">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-bold uppercase tracking-tighter">High Quality Material</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF4E00] rounded-full p-1">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-bold uppercase tracking-tighter">Authentic Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF4E00] rounded-full p-1">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-bold uppercase tracking-tighter">Long-Lasting Performance</span>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex gap-1.5">
                <div className="h-1.5 w-6 bg-[#FF4E00] rounded-full" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full" />
              </div>
           </div>
        </div>

        {/* Right Side: Vertical Banner */}
        <div className="hidden lg:block w-[280px]">
           <div className="h-full rounded-xl overflow-hidden relative group shadow-md border border-gray-100 bg-[#FF4E00]">
              <img 
                src="https://images.unsplash.com/photo-1552933529-e359b247726e?auto=format&fit=crop&q=80&w=1470" 
                alt="Promo 1" 
                className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                 <h4 className="font-black text-2xl uppercase italic leading-none mb-1">CarQuick</h4>
                 <h4 className="font-black text-4xl uppercase italic leading-none mb-4">Washing</h4>
                 
                 <div className="mt-4 flex flex-col items-center">
                    <div className="w-12 h-1 bg-white mb-4" />
                    <p className="text-sm font-bold opacity-90 uppercase tracking-widest">Premium Care</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
