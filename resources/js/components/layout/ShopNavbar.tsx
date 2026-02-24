import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Search, ShoppingCart, User, Heart, ChevronDown, Menu, Headphones, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ShopNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Main Orange Header */}
      <div className="bg-[#FF4F17] text-white py-3 px-4 md:px-6 lg:px-12 flex items-center justify-between gap-4 md:gap-8 lg:gap-12">
        {/* Mobile: Hamburger & Search (Visible only on mobile) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 border-[2.5px] border-white rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            {/* Steering Wheel Icon Simulation */}
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[2px] border-white relative flex items-center justify-center">
              <div className="w-[1.5px] h-full bg-white absolute" />
              <div className="w-full h-[1.5px] bg-white absolute" />
              <div className="w-2 h-2 rounded-full bg-white z-10" />
            </div>
          </div>
          <span className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter">
            OrenMart
          </span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-2xl relative items-center">
          <Input 
            type="search" 
            placeholder="Search" 
            className="w-full pl-6 pr-4 h-11 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 placeholder:text-gray-400 font-medium bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
          />
          <button className="h-11 px-7 bg-black text-white rounded-r-full hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <Link href="/wishlist" className="hover:scale-110 transition-transform hidden sm:block">
            <Heart className="h-6 w-6 stroke-[2.5px]" />
          </Link>
          <Link href="/cart" className="hover:scale-110 transition-transform relative">
            <ShoppingCart className="h-6 w-6 stroke-[2.5px]" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF4F17] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">0</span>
          </Link>
          <button className="lg:hidden p-1 hover:bg-white/10 rounded-md">
            <User className="h-6 w-6 stroke-[2.5px]" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Collapsible) */}
      {isSearchOpen && (
        <div className="lg:hidden bg-[#FF4F17] px-4 pb-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center">
            <Input 
              type="search" 
              placeholder="Search products..." 
              className="w-full h-11 pl-5 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
              autoFocus
            />
            <button className="h-11 px-5 bg-black text-white rounded-r-full">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Sub Navigation Bar (Desktop) */}
      <div className="hidden lg:flex bg-white border-b py-2 px-12 justify-between items-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-10">
          <button className="flex items-center gap-2 group">
            <Menu className="h-5 w-5 text-gray-600 group-hover:text-[#FF4F17]" />
            <span className="text-[15px] font-black text-gray-800 group-hover:text-[#FF4F17] transition-colors">All Categories</span>
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#FF4F17] group-hover:rotate-180 transition-transform duration-300" />
          </button>
          
          <div className="h-4 w-[1px] bg-gray-200" /> {/* Vertical Separator */}
          
          <div className="flex items-center gap-6">
            <Link href="/brands" className="text-[14px] font-black text-gray-800 hover:text-[#FF4F17] transition-colors">Brands</Link>
            <Link href="/offers" className="text-[14px] font-black text-gray-800 hover:text-[#FF4F17] transition-colors">Offers</Link>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/help" className="flex items-center gap-2.5 group">
            <div className="bg-gray-100 p-1 rounded-full group-hover:bg-orange-50 transition-colors">
              <Headphones className="h-4 w-4 text-gray-600 group-hover:text-[#FF4F17]" />
            </div>
            <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4F17] transition-colors">Help</span>
          </Link>
          <button className="flex items-center gap-2 group">
            <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4F17] transition-colors">Download App</span>
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#FF4F17] group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Menu) */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-[100%] left-0 w-full bg-white shadow-xl animate-in slide-in-from-left duration-300 z-50">
          <div className="flex flex-col p-4 gap-4">
            <Link href="/categories" className="flex items-center justify-between font-bold text-gray-800 border-b pb-2">
              All Categories <ChevronDown className="h-4 w-4 -rotate-90" />
            </Link>
            <Link href="/brands" className="font-bold text-gray-800 border-b pb-2">Brands</Link>
            <Link href="/offers" className="font-bold text-gray-800 border-b pb-2">Offers</Link>
            <Link href="/help" className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2">
              <Headphones className="h-4 w-4 text-[#FF4F17]" /> Help
            </Link>
            <Link href="/login" className="flex items-center gap-2 font-bold text-gray-800">
              <User className="h-4 w-4 text-[#FF4F17]" /> Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
