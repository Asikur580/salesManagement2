import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { ShopHero } from "@/components/shop/ShopHero";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";

interface IndexProps {
  products: any[];
  categories: any[];
  brands: any[];
}

const Index = ({ products, categories, brands }: IndexProps) => {
  return (
    <ShopLayout>
      <Head title="Premium Car Parts & Accessories" />
      
      {/* Hero Section */}
      <ShopHero />

      {/* Trust Badges */}
      <div className="bg-white border-y py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-orange-50 rounded-full group-hover:bg-[#FF4E00] group-hover:text-white transition-colors text-[#FF4E00]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Free Delivery</h4>
                <p className="text-xs text-gray-500">Orders over ৳5000</p>
              </div>
           </div>
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-orange-50 rounded-full group-hover:bg-[#FF4E00] group-hover:text-white transition-colors text-[#FF4E00]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Genuine Parts</h4>
                <p className="text-xs text-gray-500">100% Guaranteed</p>
              </div>
           </div>
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-orange-50 rounded-full group-hover:bg-[#FF4E00] group-hover:text-white transition-colors text-[#FF4E00]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">24/7 Support</h4>
                <p className="text-xs text-gray-500">Dedicated Team</p>
              </div>
           </div>
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-orange-50 rounded-full group-hover:bg-[#FF4E00] group-hover:text-white transition-colors text-[#FF4E00]">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Top Rated</h4>
                <p className="text-xs text-gray-500">Thousands of Reviews</p>
              </div>
           </div>
        </div>
      </div>

      {/* Top Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
           <div>
              <h3 className="text-2xl font-black text-[#333]">NEW ARRIVALS</h3>
              <p className="text-sm text-gray-500">Check out our latest premium car parts.</p>
           </div>
           <Button variant="outline" className="border-[#FF4E00] text-[#FF4E00] hover:bg-[#FF4E00] hover:text-white font-bold rounded-lg group">
              View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-gray-300" />
               </div>
               <h4 className="text-xl font-bold text-gray-400">No Products Available</h4>
               <p className="text-gray-500">Stay tuned for new stock!</p>
            </div>
          )}
        </div>
      </div>

      {/* Promotional Section (Horizontal Banners) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-44 rounded-xl relative overflow-hidden group shadow-md">
               <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=1374" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 text-white">
                  <h4 className="text-2xl font-black mb-2">Engine Care</h4>
                  <p className="text-sm font-medium opacity-90 mb-4">Quality lubricants and tools for <br />your engine's health.</p>
                  <Link className="text-[#FF4E00] font-bold text-sm hover:underline">LEARN MORE</Link>
               </div>
            </div>
            <div className="h-44 rounded-xl relative overflow-hidden group shadow-md">
               <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1501" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 text-white">
                  <h4 className="text-2xl font-black mb-2">Exclusive Combos</h4>
                  <p className="text-sm font-medium opacity-90 mb-4">Save more on our specially <br />curated combo packs.</p>
                  <Link className="text-[#FF4E00] font-bold text-sm hover:underline">SAVE NOW</Link>
               </div>
            </div>
         </div>
      </div>

      {/* Popular Brands (Bottom Bar) */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t text-center">
         <h3 className="text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest">Popular Brands</h3>
         <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {brands.map((brand, i) => (
              <span key={i} className="text-xl font-black italic text-gray-600 hover:text-[#FF4E00] cursor-pointer transition-colors">
                 {brand.name.toUpperCase()}
              </span>
            ))}
            {/* Fallback mock brands if none in DB */}
            {brands.length === 0 && ["Castrol", "Michelin", "Bosch", "Brembo", "Mobil1", "Shell"].map((b, i) => (
              <span key={i} className="text-xl font-black italic text-gray-500 hover:text-[#FF4E00] cursor-pointer transition-colors">
                 {b}
              </span>
            ))}
         </div>
      </div>
    </ShopLayout>
  );
};

export default Index;
