import React from "react";
import { Link } from "@inertiajs/react";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function ShopFooter() {
  return (
    <footer className="bg-white border-t mt-12">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#FF4E00] p-1.5 rounded-lg">
              <span className="font-bold text-white text-lg">O</span>
            </div>
            <span className="text-xl font-bold">OrenMart</span>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Your one-stop shop for premium car parts and accessories. Quality and reliability at your doorstep.
          </p>
          <div className="flex gap-4">
            <Link className="p-2 bg-gray-100 rounded-full hover:bg-[#FF4E00] hover:text-white transition-colors">
              <Facebook className="h-4 w-4" />
            </Link>
            <Link className="p-2 bg-gray-100 rounded-full hover:bg-[#FF4E00] hover:text-white transition-colors">
              <Instagram className="h-4 w-4" />
            </Link>
            <Link className="p-2 bg-gray-100 rounded-full hover:bg-[#FF4E00] hover:text-white transition-colors">
              <Twitter className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
           <h4 className="font-bold text-[#333] mb-6 border-b-2 border-[#FF4E00] pb-2 inline-block">CUSTOMER</h4>
           <ul className="space-y-4 text-sm text-gray-600">
             <li><Link href="#" className="hover:text-[#FF4E00]">My Account</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Cart</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Wishlist</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Customer Service</Link></li>
           </ul>
        </div>

        <div>
           <h4 className="font-bold text-[#333] mb-6 border-b-2 border-[#FF4E00] pb-2 inline-block">INFORMATION</h4>
           <ul className="space-y-4 text-sm text-gray-600">
             <li><Link href="#" className="hover:text-[#FF4E00]">About Us</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Contact Us</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Privacy Policy</Link></li>
             <li><Link href="#" className="hover:text-[#FF4E00]">Terms & Conditions</Link></li>
           </ul>
        </div>

        <div>
           <h4 className="font-bold text-[#333] mb-6 border-b-2 border-[#FF4E00] pb-2 inline-block">CONTACT</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#FF4E00] mt-0.5" />
                <span>220/D/04 Begum Rokeya Sarani Metro Pillar 328, Mirpur Shewrapara, Dhaka-1207</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#FF4E00]" />
                <span>Phone: 09613821382, 01999906676</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#FF4E00]" />
                <span>Email: contactorenmart@gmail.com</span>
              </li>
            </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#111] text-white py-4 text-center text-xs">
        <p>© 2026 OrenMart All Rights Reserved. Designed by SalesHub Team.</p>
      </div>
    </footer>
  );
}
