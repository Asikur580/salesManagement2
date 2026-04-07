import React from "react";
import { Link } from "@inertiajs/react";
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export function ShopFooter() {
    return (
        <footer className="bg-card border-t mt-12">
            {/* Main Footer Links */}
            <div className="max-w-[100rem] mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                        <div className="w-8 h-8 md:w-10 md:h-10 border-[2.5px] border-primary rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[2px] border-primary relative flex items-center justify-center">
                                <div className="w-[1.5px] h-full bg-primary absolute" />
                                <div className="w-full h-[1.5px] bg-primary absolute" />
                                <div className="w-2 h-2 rounded-full bg-primary z-10" />
                            </div>
                        </div>
                        <span className="text-xl font-bold">CartMart</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        Your one-stop shop for premium car parts and
                        accessories. Quality and reliability at your doorstep.
                    </p>
                    <div className="flex gap-4">
                        <Link className="p-2 bg-muted/80 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Facebook className="h-4 w-4" />
                        </Link>
                        <Link className="p-2 bg-muted/80 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Instagram className="h-4 w-4" />
                        </Link>
                        <Link className="p-2 bg-muted/80 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Twitter className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-[#333] mb-6 border-b-2 border-primary pb-2 inline-block">
                        CUSTOMER
                    </h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                        <li>
                            <Link href="#" className="hover:text-primary">
                                My Account
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Cart
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Wishlist
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Customer Service
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-[#333] mb-6 border-b-2 border-primary pb-2 inline-block">
                        INFORMATION
                    </h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                        <li>
                            <Link href="#" className="hover:text-primary">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Contact Us
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-primary">
                                Terms & Conditions
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-[#333] mb-6 border-b-2 border-primary pb-2 inline-block">
                        CONTACT
                    </h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-0.5" />
                            <span>
                                Nikunja-2, Khilkhet, Dhaka-1229
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>Phone: 0**********, 01*********</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>Email: contactcarmart@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-[#111] text-white py-4 text-center text-xs">
                <p>
                    © 2026 CarMart All Rights Reserved. Designed by SalesHub
                    Team.
                </p>
            </div>
        </footer>
    );
}
