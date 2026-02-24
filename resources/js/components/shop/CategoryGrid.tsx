import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryGridProps {
  categories: any[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Enhanced categories with high-quality car-related Unsplash images
  const displayCategories = [
    { name: "Summer Essential", image: "https://images.unsplash.com/photo-1504215642848-7315397e9281?auto=format&fit=crop&q=80&w=400" },
    { name: "Winter Essential", image: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&q=80&w=400" },
    { name: "Car Interior", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400" },
    { name: "Car Exterior", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400" },
    { name: "Electronics & Gadgets", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400" },
    { name: "Car Care", image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400" },
    { name: "Perfume & Showpiece", image: "https://images.unsplash.com/photo-1588615419957-ed31ae426a31?auto=format&fit=crop&q=80&w=400" },
    { name: "Key Accessories", image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400" },
    { name: "Performance", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400" },
    { name: "LED & Lighting", image: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=400" },
    { name: "Modifications", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8 gap-4 px-2">
        <h3 className="text-sm font-black text-[#333] uppercase tracking-wider">TOP CATEGORIES</h3>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>
      
      <div className="relative group">
        {/* Navigation Arrows */}
        <button className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <button className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex overflow-x-auto no-scrollbar gap-8 pb-4">
          {displayCategories.map((cat, i) => (
            <Link key={i} className="flex flex-col items-center flex-shrink-0 group">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-[#FF4E00] shadow-sm transition-all duration-300 transform group-hover:scale-110">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[12px] font-bold text-center text-gray-800 whitespace-pre-wrap max-w-[80px] leading-tight group-hover:text-[#FF4E00]">
                {cat.name.split(' ').length > 1 ? cat.name.split(' ')[0] + '...' : cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
