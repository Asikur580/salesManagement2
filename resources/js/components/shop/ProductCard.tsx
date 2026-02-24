import React from "react";
import { Link } from "@inertiajs/react";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col relative h-full">
      {/* Badge */}
      {product.quantity < 5 && (
        <Badge className="absolute top-2 left-2 z-10 bg-[#FF4E00]" variant="destructive">
          Low Stock
        </Badge>
      )}

      {/* Image Container */}
      <div className="relative aspect-square bg-[#F9F9F9] overflow-hidden">
        <img 
          src={product.image || `https://placehold.co/400x400/f5f5f5/333333?text=${product.name}`} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
           <Button size="icon" variant="secondary" className="rounded-full shadow-md scale-90 group-hover:scale-100 transition-transform duration-300">
             <Eye className="h-4 w-4" />
           </Button>
           <Button size="icon" variant="secondary" className="rounded-full shadow-md scale-90 group-hover:scale-100 transition-transform duration-300 delay-75">
             <Heart className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-[#FF4E00] uppercase tracking-wider mb-1">
          {product.category?.name || "Uncategorized"}
        </span>
        <h4 className="font-bold text-sm text-[#333] line-clamp-2 mb-2 min-h-[40px] group-hover:text-[#FF4E00] transition-colors">
          {product.name}
        </h4>
        
        <div className="mt-auto pt-2">
          {/* Rating (Mock) */}
          <div className="flex items-center gap-1 mb-2">
             {[...Array(5)].map((_, i) => (
               <svg key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
               </svg>
             ))}
             <span className="text-[10px] text-gray-400 ml-1">(24 reviews)</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-black text-[#FF4E00]">
              ৳{parseFloat(product.price).toLocaleString()}
            </span>
            <Button size="sm" className="bg-gray-100 hover:bg-[#FF4E00] text-[#333] hover:text-white rounded-md transition-all shadow-none h-8 w-8 px-0">
               <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
