import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Search,
    ShoppingCart,
    User,
    Heart,
    ChevronDown,
    ChevronRight,
    Menu,
    Headphones,
    X,
    Zap,
    Star,
    ShieldCheck,
    Clock,
    Car,
    Sparkles,
    Layers,
    Wind,
    Cpu,
    Droplets,
    Key,
    Activity,
    Lightbulb,
    Wrench,
    Shirt,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// ─── 3-Level Category Data ────────────────────────────────────────────────────
// ... (CATEGORIES constant remains the same, I will skip it in replace_file_content if possible but I'll include enough context)

// ─── 3-Level Category Data ────────────────────────────────────────────────────
const CATEGORIES = [
    {
        name: "Summer Essential",
        icon: <Zap className="h-4 w-4" />,
        sub: [
            {
                name: "Seat Cooler",
                items: [
                    "USB Seat Fan",
                    "Cooling Cushion",
                    "Ventilated Seat Pad",
                ],
            },
            {
                name: "Windshield Shade",
                items: [
                    "Foldable Shade",
                    "Retractable Shade",
                    "Custom Fit Shade",
                ],
            },
            {
                name: "Car Fan",
                items: ["Clip-on Fan", "Dashboard Fan", "Rear Seat Fan"],
            },
            {
                name: "AC Accessories",
                items: ["AC Vent Cover", "Vent Freshener", "AC Filter"],
            },
        ],
    },
    {
        name: "Winter Essential",
        icon: <Wind className="h-4 w-4" />,
        sub: [
            {
                name: "Steering Cover",
                items: ["Faux Leather", "Furry Cover", "Anti-slip Cover"],
            },
            {
                name: "Seat Warmer",
                items: ["Electric Warmer", "12V Cushion", "Universal Warmer"],
            },
            {
                name: "Body Warmer",
                items: ["Heated Blanket", "Travel Warmer", "Thermal Pad"],
            },
            {
                name: "Defrost Tools",
                items: ["Ice Scraper", "Defrost Spray", "Snow Brush"],
            },
        ],
    },
    {
        name: "Car Interior",
        icon: <Layers className="h-4 w-4" />,
        sub: [
            {
                name: "Storage & Organizers",
                items: [
                    "Back Seat Organizer",
                    "Trunk Organizer",
                    "Center Console Tray",
                    "Glove Box Insert",
                ],
            },
            {
                name: "Seat Accessories",
                items: [
                    "Back Support",
                    "Seat Gap Filler",
                    "Armrest Pad",
                    "Headrest Hook",
                ],
            },
            {
                name: "Covers & Mats",
                items: [
                    "Floor Mat Set",
                    "Cargo Mat",
                    "Dashboard Cover",
                    "Steering Wrap",
                ],
            },
            {
                name: "Sunshade",
                items: [
                    "Front Windshield",
                    "Side Window",
                    "Rear Window",
                    "Pop-up Shade",
                ],
            },
        ],
    },
    {
        name: "Car Exterior",
        icon: <Car className="h-4 w-4" />,
        sub: [
            {
                name: "Body Protection",
                items: [
                    "Full Car Cover",
                    "Door Edge Guard",
                    "Bumper Protector",
                    "Door Handle Cover",
                ],
            },
            {
                name: "Mirrors",
                items: [
                    "Wide Angle Mirror",
                    "Blind Spot Mirror",
                    "Side Mirror Cover",
                    "Fender Mirror",
                ],
            },
            {
                name: "Stickers & Decals",
                items: [
                    "Racing Stripes",
                    "Logo Decal",
                    "Reflective Tape",
                    "Carbon Fiber Wrap",
                ],
            },
            {
                name: "Aerodynamics",
                items: [
                    "Roof Spoiler",
                    "Lip Spoiler",
                    "Side Skirts",
                    "Diffuser",
                ],
            },
        ],
    },
    {
        name: "Electronics & Gadgets",
        icon: <Cpu className="h-4 w-4" />,
        sub: [
            {
                name: "Cameras",
                items: [
                    "Dash Cam 1CH",
                    "Dash Cam 2CH",
                    "Reverse Camera",
                    "360° Camera",
                ],
            },
            {
                name: "Tracking & Safety",
                items: [
                    "GPS Tracker",
                    "OBD2 Scanner",
                    "Radar Detector",
                    "Blind Spot Sensor",
                ],
            },
            {
                name: "Chargers",
                items: [
                    "USB Car Charger",
                    "Fast Charger",
                    "Wireless Charger",
                    "Solar Charger",
                ],
            },
            {
                name: "Audio & Media",
                items: [
                    "Car Bluetooth",
                    "FM Transmitter",
                    "Amplifier",
                    "Subwoofer",
                ],
            },
        ],
    },
    {
        name: "Car Care",
        icon: <Droplets className="h-4 w-4" />,
        sub: [
            {
                name: "Ceramic Coating",
                items: [
                    "9H Coating",
                    "10H Coating",
                    "Graphene Coating",
                    "Nano Coating",
                ],
            },
            {
                name: "Cleaning Products",
                items: [
                    "Car Shampoo",
                    "Dashboard Cleaner",
                    "Glass Cleaner",
                    "Wheel Cleaner",
                ],
            },
            {
                name: "Polish & Wax",
                items: [
                    "Carnauba Wax",
                    "Paint Sealant",
                    "Clay Bar",
                    "Rubbing Compound",
                ],
            },
            {
                name: "Tools",
                items: [
                    "Microfiber Towel",
                    "Applicator Pad",
                    "Wash Mitt",
                    "Bucket Set",
                ],
            },
        ],
    },
    {
        name: "Perfume & Showpiece",
        icon: <Sparkles className="h-4 w-4" />,
        sub: [
            {
                name: "Liquid Perfume",
                items: [
                    "Oud Collection",
                    "Floral Series",
                    "Fresh Scent",
                    "Premium Brand",
                ],
            },
            {
                name: "Vent Freshener",
                items: [
                    "Clip-on Freshener",
                    "Gel Freshener",
                    "Charcoal Purifier",
                    "Mini Diffuser",
                ],
            },
            {
                name: "Dashboard Showpiece",
                items: [
                    "Bobble Head",
                    "Angel Figurine",
                    "Car Mascot",
                    "Floating Ornament",
                ],
            },
        ],
    },
    {
        name: "Key Accessories",
        icon: <Key className="h-4 w-4" />,
        sub: [
            {
                name: "Key Covers",
                items: [
                    "TPU Key Cover",
                    "Leather Key Case",
                    "Carbon Fiber Cover",
                    "Smart Key Protector",
                ],
            },
            {
                name: "Key Chains",
                items: [
                    "Metal Keychain",
                    "Leather Keychain",
                    "Branded Keyring",
                    "Bottle Opener Keyring",
                ],
            },
            {
                name: "Key Finder",
                items: ["Bluetooth Tracker", "NFC Tag", "GPS Key Finder"],
            },
        ],
    },
    {
        name: "Performance",
        icon: <Activity className="h-4 w-4" />,
        sub: [
            {
                name: "Engine Care",
                items: [
                    "Engine Oil Additive",
                    "Fuel Injector Cleaner",
                    "Coolant",
                    "Stop Leak",
                ],
            },
            {
                name: "Air System",
                items: [
                    "Air Filter",
                    "Cold Air Intake",
                    "Throttle Body Cleaner",
                    "MAF Sensor Cleaner",
                ],
            },
            {
                name: "Drive Train",
                items: [
                    "Gear Oil",
                    "Transmission Flush",
                    "Clutch Cable",
                    "Shift Knob",
                ],
            },
        ],
    },
    {
        name: "LED & Lighting",
        icon: <Lightbulb className="h-4 w-4" />,
        sub: [
            {
                name: "Interior Lighting",
                items: [
                    "Dome Light",
                    "Footwell Lights",
                    "Ambient Strip",
                    "Reading Light",
                ],
            },
            {
                name: "Exterior Lighting",
                items: [
                    "DRL Strip",
                    "Underglow Kit",
                    "Fog Light",
                    "Puddle Lamp",
                ],
            },
            {
                name: "Headlights",
                items: [
                    "H4 LED Bulb",
                    "H7 LED Bulb",
                    "HID Kit",
                    "Angel Eye Ring",
                ],
            },
        ],
    },
    {
        name: "Modifications",
        icon: <Wrench className="h-4 w-4" />,
        sub: [
            {
                name: "Body Mods",
                items: [
                    "Lip Kit",
                    "Side Skirts",
                    "Rear Diffuser",
                    "Fender Flare",
                ],
            },
            {
                name: "Interior Mods",
                items: [
                    "Sport Steering Wheel",
                    "Short Shifter",
                    "Carbon Trim",
                    "Sport Pedals",
                ],
            },
            {
                name: "Exhaust",
                items: [
                    "Exhaust Tip",
                    "Resonator",
                    "Muffler Delete",
                    "Cat-back System",
                ],
            },
        ],
    },
    {
        name: "Covers",
        icon: <Shirt className="h-4 w-4" />,
        sub: [
            {
                name: "Full Car Covers",
                items: [
                    "Waterproof Cover",
                    "Sun-proof Cover",
                    "Indoor Cover",
                    "Half Cover",
                ],
            },
            {
                name: "Seat Covers",
                items: [
                    "Leather Seat Set",
                    "Fabric Seat Set",
                    "Single Seat Cover",
                    "Child Seat Cover",
                ],
            },
            {
                name: "Steering Covers",
                items: [
                    "Leather Wrap",
                    "Carbon Fiber",
                    "Suede Grip",
                    "Slim Fit Cover",
                ],
            },
        ],
    },
];

// ─── Mega Dropdown ────────────────────────────────────────────────────────────
function MegaDropdown({ onClose }: { onClose: () => void }) {
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
    const [activeSub, setActiveSub] = useState<{
        name: string;
        items: string[];
    } | null>(null);

    const handleCategoryEnter = (cat: (typeof CATEGORIES)[0]) => {
        setActiveCategory(cat);
        setActiveSub(null);
    };

    return (
        <div
            className="absolute left-0 top-full z-50 flex bg-white shadow-2xl border-t-2 border-[#FF4E00]"
            style={{ width: "900px", maxHeight: "520px" }}
            onMouseLeave={onClose}
        >
            {/* Column 1: Main Categories */}
            <div className="w-[220px] shrink-0 bg-gray-50 border-r overflow-y-auto">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.name}
                        onMouseEnter={() => handleCategoryEnter(cat)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all group ${
                            activeCategory.name === cat.name
                                ? "bg-white border-l-4 border-[#FF4E00]"
                                : "hover:bg-white border-l-4 border-transparent"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span
                                className={`transition-colors ${activeCategory.name === cat.name ? "text-[#FF4E00]" : "text-gray-400 group-hover:text-[#FF4E00]"}`}
                            >
                                {cat.icon}
                            </span>
                            <span
                                className={`text-[13px] font-bold transition-colors ${activeCategory.name === cat.name ? "text-[#FF4E00]" : "text-gray-700 group-hover:text-[#FF4E00]"}`}
                            >
                                {cat.name}
                            </span>
                        </div>
                        <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 transition-colors ${activeCategory.name === cat.name ? "text-[#FF4E00]" : "text-gray-300"}`}
                        />
                    </div>
                ))}
            </div>

            {/* Column 2: Subcategories */}
            <div className="w-[230px] shrink-0 border-r overflow-y-auto bg-white">
                <div className="px-4 pt-4 pb-2 border-b">
                    <p className="text-[10px] font-black text-[#FF4E00] uppercase tracking-[0.25em]">
                        {activeCategory.name}
                    </p>
                </div>
                {activeCategory.sub.map((sub) => (
                    <div
                        key={sub.name}
                        onMouseEnter={() => setActiveSub(sub)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all group ${
                            activeSub?.name === sub.name
                                ? "bg-orange-50 border-l-4 border-[#FF4E00]"
                                : "hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                    >
                        <span
                            className={`text-[13px] font-bold transition-colors ${
                                activeSub?.name === sub.name
                                    ? "text-[#FF4E00]"
                                    : "text-gray-700 group-hover:text-[#FF4E00]"
                            }`}
                        >
                            {sub.name}
                        </span>
                        <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 ${activeSub?.name === sub.name ? "text-[#FF4E00]" : "text-gray-300"}`}
                        />
                    </div>
                ))}
            </div>

            {/* Column 3: Sub-subcategories */}
            <div className="flex-1 overflow-y-auto bg-white">
                {activeSub ? (
                    <div className="p-6">
                        <div className="mb-4 border-b pb-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                                {activeCategory.name}
                            </p>
                            <p className="text-[15px] font-black text-[#FF4E00] mt-0.5">
                                {activeSub.name}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {activeSub.items.map((item, i) => (
                                <Link
                                    key={i}
                                    href={route(
                                        "shop.category",
                                        item
                                            .toLowerCase()
                                            .replace(/ & /g, "-")
                                            .replace(/\s+/g, "-"),
                                    )}
                                    className="group flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#FF4E00] transition-all"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00] group-hover:bg-white shrink-0 transition-colors" />
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-white transition-colors">
                                        {item}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <Link
                            href={route(
                                "shop.category",
                                activeSub.name
                                    .toLowerCase()
                                    .replace(/ & /g, "-")
                                    .replace(/\s+/g, "-"),
                            )}
                            className="mt-5 inline-flex items-center gap-1 text-[#FF4E00] font-black text-xs hover:underline"
                        >
                            View all in {activeSub.name}{" "}
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    // Default: show all subcategories as tiles when no sub is hovered
                    <div className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">
                            Hover a subcategory to explore →
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {activeCategory.sub.map((sub, i) => (
                                <div
                                    key={i}
                                    onMouseEnter={() => setActiveSub(sub)}
                                    className="group px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#FF4E00] hover:border-[#FF4E00] transition-all cursor-pointer"
                                >
                                    <p className="text-[13px] font-bold text-gray-700 group-hover:text-white transition-colors">
                                        {sub.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 group-hover:text-white/80 transition-colors mt-0.5">
                                        {sub.items.length} items
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export function ShopNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMegaOpen, setIsMegaOpen] = useState(false);
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get(route("shop.search"), { q: query });
            setIsSearchOpen(false);
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 shadow-md transition-all duration-300">
            {/* Main Orange Header */}
            <div className="bg-[#FF4E00] text-white py-3 px-4 md:px-6 lg:px-12 flex items-center justify-between gap-4 md:gap-8 lg:gap-12">
                {/* Mobile: Hamburger & Search */}
                <div className="flex items-center gap-3 lg:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <Search className="h-6 w-6" />
                    </button>
                </div>

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group shrink-0"
                >
                    <div className="w-8 h-8 md:w-10 md:h-10 border-[2.5px] border-white rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[2px] border-white relative flex items-center justify-center">
                            <div className="w-[1.5px] h-full bg-white absolute" />
                            <div className="w-full h-[1.5px] bg-white absolute" />
                            <div className="w-2 h-2 rounded-full bg-white z-10" />
                        </div>
                    </div>
                    <span className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter">
                        CarMart
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <form
                    onSubmit={handleSearch}
                    className="hidden lg:flex flex-1 max-w-2xl relative items-center"
                >
                    <Input
                        type="search"
                        placeholder="Search products, categories..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-6 pr-4 h-11 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 placeholder:text-gray-400 font-medium bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
                    />
                    <button
                        type="submit"
                        className="h-11 px-7 bg-black text-white rounded-r-full hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                    <Link
                        href="/login"
                        className="hover:scale-110 transition-transform hidden sm:block"
                    >
                        <Heart className="h-6 w-6 stroke-[2.5px]" />
                    </Link>
                    <Link
                        href="/login"
                        className="hover:scale-110 transition-transform relative"
                    >
                        <ShoppingCart className="h-6 w-6 stroke-[2.5px]" />
                        <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF4E00] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">
                            0
                        </span>
                    </Link>
                    <button className="lg:hidden p-1 hover:bg-white/10 rounded-md">
                        <User className="h-6 w-6 stroke-[2.5px]" />
                    </button>
                </div>
            </div>

            {/* Mobile Search (Collapsible) */}
            {isSearchOpen && (
                <div className="lg:hidden bg-[#FF4E00] px-4 pb-3 animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSearch} className="flex items-center">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-11 pl-5 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="h-11 px-5 bg-black text-white rounded-r-full"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Sub Navigation Bar (Desktop) */}
            <div className="hidden lg:flex bg-white border-b py-2 px-12 justify-between items-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative">
                <div className="flex items-center gap-10">
                    {/* All Categories trigger with Mega Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsMegaOpen(true)}
                        onMouseLeave={() => setIsMegaOpen(false)}
                    >
                        <button className="flex items-center gap-2 group py-1">
                            <Menu
                                className={`h-5 w-5 transition-colors ${isMegaOpen ? "text-[#FF4E00]" : "text-gray-600 group-hover:text-[#FF4E00]"}`}
                            />
                            <span
                                className={`text-[15px] font-black transition-colors ${isMegaOpen ? "text-[#FF4E00]" : "text-gray-800 group-hover:text-[#FF4E00]"}`}
                            >
                                All Categories
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-all duration-300 ${isMegaOpen ? "text-[#FF4E00] rotate-180" : "text-gray-400 group-hover:text-[#FF4E00]"}`}
                            />
                        </button>

                        {isMegaOpen && (
                            <MegaDropdown
                                onClose={() => setIsMegaOpen(false)}
                            />
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200" />

                    <div className="flex items-center gap-6">
                        <Link
                            href={route("shop.all-brands")}
                            className="text-[14px] font-black text-gray-800 hover:text-[#FF4E00] transition-colors"
                        >
                            Brands
                        </Link>
                        <Link
                            href="/offers"
                            className="text-[14px] font-black text-gray-800 hover:text-[#FF4E00] transition-colors"
                        >
                            Offers
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <Link
                        href="/help"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="bg-gray-100 p-1 rounded-full group-hover:bg-orange-50 transition-colors">
                            <Headphones className="h-4 w-4 text-gray-600 group-hover:text-[#FF4E00]" />
                        </div>
                        <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4E00] transition-colors">
                            Help
                        </span>
                    </Link>
                    <button className="flex items-center gap-2 group">
                        <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4E00] transition-colors">
                            Download App
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#FF4E00] group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-[100%] left-0 w-full bg-white shadow-xl animate-in slide-in-from-left duration-300 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                All Categories
                            </p>
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.name}
                                    href={route(
                                        "shop.category",
                                        cat.name
                                            .toLowerCase()
                                            .replace(/ & /g, "-")
                                            .replace(/\s+/g, "-"),
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-[#FF4E00]">
                                        {cat.icon}
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {cat.name}
                                    </span>
                                    <span className="ml-auto text-xs text-gray-400">
                                        {cat.sub.length} sub
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col p-4 gap-4">
                            <Link
                                href="/brands"
                                className="font-bold text-gray-800 border-b pb-2"
                            >
                                Brands
                            </Link>
                            <Link
                                href="/offers"
                                className="font-bold text-gray-800 border-b pb-2"
                            >
                                Offers
                            </Link>
                            <Link
                                href="/help"
                                className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2"
                            >
                                <Headphones className="h-4 w-4 text-[#FF4E00]" />{" "}
                                Help
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 font-bold text-gray-800"
                            >
                                <User className="h-4 w-4 text-[#FF4E00]" /> Sign
                                In
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
