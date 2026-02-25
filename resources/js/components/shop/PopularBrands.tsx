import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BRANDS = [
  { name: "Castrol", logo: "https://images.unsplash.com/photo-1614702058414-68565e1d4d5a?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Armor All", logo: "https://images.unsplash.com/photo-1621359953476-ebcc4b0be84b?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Armor All", logo: "https://images.unsplash.com/photo-1621359953476-ebcc4b0be84b?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "TypeR", logo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Sandisk", logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Ambi Pure", logo: "https://images.unsplash.com/photo-1588615419957-ed31ae426a31?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Ambi Pure", logo: "https://images.unsplash.com/photo-1588615419957-ed31ae426a31?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Formula 1", logo: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "MOXOM", logo: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Little Trees", logo: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Little Trees", logo: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=200&h=200" },
  { name: "Meguiar's", logo: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=200&h=200" },
];

export function PopularBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#F8F9FA] py-6">
      <div className="max-w-[100rem] mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-tight">
            POPULAR BRANDS
          </h3>
          
          <div className="relative group/brands">
            {/* Arrows */}
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-[150%] z-20 bg-white shadow-md rounded-full p-2 border border-gray-100 hover:bg-gray-50 transition-all transform -translate-x-1/2"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-[150%] z-20 bg-white shadow-md rounded-full p-2 border border-gray-100 hover:bg-gray-50 transition-all transform translate-x-1/2"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto no-scrollbar gap-10 items-start px-2"
            >
              {BRANDS.map((brand, i) => (
                <Link 
                  key={i} 
                  href="#"
                  className="flex flex-col items-center flex-shrink-0 group w-[100px]"
                >
                  <div className="w-20 h-20 rounded-full border border-gray-100 bg-white p-2 mb-3 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center overflow-hidden">
                    <img 
                      src={brand.logo} 
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
