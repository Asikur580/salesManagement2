import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import {
    ChevronRight,
    ChevronLeft,
    Menu,
    Zap,
    Star,
    ShieldCheck,
    Clock,
    Truck,
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

// ─── 3-Level Category Data ────────────────────────────────────────────────────
type Category = {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    children?: Category[];
};

interface ShopHeroProps {
    categories?: Category[];
}

// ─── Slider Data ─────────────────────────────────────────────────────────────
const BANNER_SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1600&h=900",
        badge: "Premium Collection",
        title: "Your Trusted",
        highlight: "Car Accessories",
        subtitle: "Hub in Bangladesh",
        desc: "Enhance your driving experience with our premium and authentic car products.",
        cta: "SHOP NOW",
        bg: "from-black/80 via-black/40",
    },
    {
        image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=1600&h=900",
        badge: "New Service",
        title: "Nano Ceramic",
        highlight: "Coating Service",
        subtitle: "9H & 10H Protection",
        desc: "World-class ceramic coating that keeps your car looking brand new for years.",
        cta: "BOOK NOW",
        bg: "from-black/90 via-black/50",
    },
    {
        image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1600&h=900",
        badge: "Hot Deals",
        title: "Premium",
        highlight: "Engine Care",
        subtitle: "Lubricants & Performance",
        desc: "Quality engine lubricants and performance tools to keep your engine healthy.",
        cta: "EXPLORE",
        bg: "from-black/85 via-black/40",
    },
    {
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1600&h=900",
        badge: "30% Off",
        title: "LED &",
        highlight: "Lighting Range",
        subtitle: "Interior & Exterior Lights",
        desc: "Upgrade your car's ambience and visibility with our curated LED lighting collection.",
        cta: "SHOP LIGHTS",
        bg: "from-black/80 via-black/30",
    },
    {
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1600&h=900",
        badge: "Exclusive Combos",
        title: "Best Value",
        highlight: "Combo Packs",
        subtitle: "Save More, Drive Better",
        desc: "Specially curated combo packs with the best accessories at unbeatable prices.",
        cta: "SAVE NOW",
        bg: "from-black/85 via-black/40",
    },
];

// ─── Right Panel Slider Data ─────────────────────────────────────────────────
const RIGHT_PANELS = [
    [
        {
            image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
            title: "Ceramic Coating",
            sub: "Starts from ৳5,999",
        },
        {
            image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80",
            title: "Paint Protection",
            sub: "PPF from ৳12,999",
        },
        {
            image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80",
            title: "Car Detailing",
            sub: "Deep Clean ৳2,499",
        },
    ],
    [
        {
            image: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80",
            title: "LED & Lighting",
            sub: "30% Discount",
        },
        {
            image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
            title: "Dash Cameras",
            sub: "Best Sellers",
        },
        {
            image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
            title: "Combo Packs",
            sub: "Save up to 40%",
        },
    ],
];

export function ShopHero({ categories = [] }: ShopHeroProps) {
    const [hoveredCat, setHoveredCat] = useState<number | null>(null);
    const [hoveredSub, setHoveredSub] = useState<number | null>(null);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [rightIdx, setRightIdx] = useState([0, 0]);

    const activeCat = categories.find((c) => c.id === hoveredCat);
    const activeSub =
        activeCat?.children?.find((s) => s.id === hoveredSub) ?? null;

    const handleCatEnter = (id: number) => {
        setHoveredCat(id);
        setHoveredSub(null);
    };

    const next = useCallback(
        () => setCurrent((p) => (p + 1) % BANNER_SLIDES.length),
        [],
    );
    const prev = () =>
        setCurrent(
            (p) => (p - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length,
        );

    // Center slider timer
    useEffect(() => {
        if (paused) return;
        const timer = setInterval(next, 4500);
        return () => clearInterval(timer);
    }, [paused, next]);

    // Right panel timers
    useEffect(() => {
        const t1 = setInterval(
            () =>
                setRightIdx((p) => [(p[0] + 1) % RIGHT_PANELS[0].length, p[1]]),
            3000,
        );
        const t2 = setTimeout(() => {
            const t = setInterval(
                () =>
                    setRightIdx((p) => [
                        p[0],
                        (p[1] + 1) % RIGHT_PANELS[1].length,
                    ]),
                3000,
            );
            return () => clearInterval(t);
        }, 1500);
        return () => {
            clearInterval(t1);
            clearTimeout(t2);
        };
    }, []);

    const slide = BANNER_SLIDES[current];

    // Helper to get Lucide icon or fallback
    const getCategoryIcon = (iconName: string | undefined) => {
        // You could map string names to Lucide components here
        // For now, default to Layers as a fallback
        return <Layers className="h-4 w-4" />;
    };

    return (
        <div className="w-full bg-[#F8F9FA] py-8">
            <div
                className="w-full mx-auto px-4 flex flex-col lg:flex-row gap-6 lg:h-[500px]"
                style={{ maxWidth: "100rem" }}
            >
                {/* ── Column 1: Main Categories ── */}
                <div
                    className="hidden lg:flex flex-col w-[240px] shrink-0 bg-card rounded-2xl shadow-sm border border-border relative h-full"
                    onMouseLeave={() => {
                        setHoveredCat(null);
                        setHoveredSub(null);
                    }}
                >
                    <div className="bg-primary px-5 py-4 flex items-center gap-3 shrink-0 rounded-t-2xl">
                        <Menu className="h-5 w-5 text-white" />
                        <span className="font-black text-white uppercase tracking-wider text-sm">
                            All Categories
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-1 rounded-b-2xl">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onMouseEnter={() => handleCatEnter(cat.id)}
                                className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all group ${
                                    hoveredCat === cat.id
                                        ? "bg-orange-50 border-l-4 border-primary"
                                        : "border-l-4 border-transparent hover:bg-orange-50 hover:border-primary"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`${
                                            hoveredCat === cat.id
                                                ? "text-primary"
                                                : "text-muted-foreground group-hover:text-primary"
                                        } transition-colors`}
                                    >
                                        {getCategoryIcon(cat.icon)}
                                    </span>
                                    <span
                                        className={`text-[13px] font-bold transition-colors ${
                                            hoveredCat === cat.id
                                                ? "text-primary"
                                                : "text-card-foreground group-hover:text-primary"
                                        }`}
                                    >
                                        {cat.name}
                                    </span>
                                </div>
                                <ChevronRight
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                        hoveredCat === cat.id
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                    }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* ── Column 2: Subcategories flyout ── */}
                    {activeCat &&
                        activeCat.children &&
                        activeCat.children.length > 0 && (
                            <div
                                className="absolute left-[240px] top-0 z-40 w-[210px] min-h-full bg-card border border-border shadow-2xl rounded-r-2xl"
                                onMouseLeave={() => setHoveredSub(null)}
                            >
                                <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 rounded-tr-2xl shrink-0">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                                        Categories
                                    </p>
                                    <p className="text-[13px] font-black text-foreground mt-0.5">
                                        {activeCat.name}
                                    </p>
                                </div>
                                <div className="py-1 overflow-y-auto max-h-[400px]">
                                    {activeCat.children.map((sub) => (
                                        <div key={sub.id} className="group/sub">
                                            <Link
                                                href={route(
                                                    "shop.category",
                                                    sub.slug,
                                                )}
                                                className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all hover:bg-orange-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors bg-primary" />
                                                    <span className="text-[13px] font-bold transition-colors text-card-foreground group-hover/sub:text-primary">
                                                        {sub.name}
                                                    </span>
                                                </div>
                                                {sub.children &&
                                                    sub.children.length > 0 && (
                                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                    )}
                                            </Link>

                                            {/* Sub-subcategories (3rd level) */}
                                            {sub.children &&
                                                sub.children.length > 0 && (
                                                    <div className="pl-8 pb-2 flex flex-col gap-1.5">
                                                        {sub.children.map(
                                                            (child) => (
                                                                <Link
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    href={route(
                                                                        "shop.category",
                                                                        child.slug,
                                                                    )}
                                                                    className="text-[12px] text-muted-foreground hover:text-primary transition-colors font-medium border-l border-border pl-3 py-0.5"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>

                {/* ── Center: Banner Slider ── */}
                <div
                    className="flex-1 rounded-2xl overflow-hidden relative h-full shadow-xl"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* Slides */}
                    {BANNER_SLIDES.map((s, i) => (
                        <div
                            key={i}
                            className={`absolute inset-0 transition-opacity duration-700 ${
                                i === current
                                    ? "opacity-100 z-10"
                                    : "opacity-0 z-0"
                            }`}
                        >
                            <img
                                src={s.image}
                                alt={s.title}
                                className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-&lsqb;8000ms&rsqb;"
                            />
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${s.bg} to-transparent`}
                            />
                            <div className="absolute inset-0 flex flex-col justify-center p-10 md:p-14 text-white z-10">
                                <div className="inline-flex items-center gap-2 mb-5 bg-primary py-1 px-3 rounded-full self-start">
                                    <Star className="h-3.5 w-3.5 fill-white" />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {s.badge}
                                    </span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight uppercase italic drop-shadow-lg">
                                    {s.title} <br />
                                    <span className="text-primary">
                                        {s.highlight}
                                    </span>{" "}
                                    <br />
                                    <span className="text-2xl md:text-3xl font-black opacity-90">
                                        {s.subtitle}
                                    </span>
                                </h2>
                                <p className="text-gray-200 text-base mb-6 max-w-md font-medium mt-2">
                                    {s.desc}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button className="bg-primary hover:bg-card hover:text-primary text-white font-black px-7 py-5 rounded-lg text-base transition-all transform hover:-translate-y-1 shadow-lg border-2 border-primary">
                                        {s.cta}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-transparent border-white text-white hover:bg-card hover:text-black font-black px-7 py-5 rounded-lg text-base transition-all"
                                    >
                                        BROWSE ALL
                                    </Button>
                                </div>
                                <div className="flex gap-5 pt-5 border-t border-white/20 mt-6">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold uppercase">
                                            Genuine Parts
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold uppercase">
                                            Free Delivery
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Prev / Next Arrows */}
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {BANNER_SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`transition-all rounded-full ${
                                    i === current
                                        ? "bg-primary w-8 h-2.5"
                                        : "bg-card/50 hover:bg-card w-2.5 h-2.5"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Slide counter */}
                    <div className="absolute top-4 right-4 z-20 bg-black/40 text-white text-xs font-black px-3 py-1 rounded-full">
                        {current + 1} / {BANNER_SLIDES.length}
                    </div>
                </div>

                {/* ── Right: Mini Sliders ── */}
                <div className="hidden xl:flex flex-col w-[280px] gap-6 shrink-0 h-full">
                    {/* Panel 1 */}
                    <div
                        className="flex-1 rounded-2xl overflow-hidden relative shadow-lg"
                        style={{ background: "#111" }}
                    >
                        {RIGHT_PANELS[0].map((s, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    i === rightIdx[0]
                                        ? "opacity-100 z-10"
                                        : "opacity-0 z-0"
                                }`}
                            >
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Panel 2 */}
                    <div className="flex-1 rounded-2xl overflow-hidden relative shadow-lg">
                        {RIGHT_PANELS[1].map((s, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    i === rightIdx[1]
                                        ? "opacity-100 z-10"
                                        : "opacity-0 z-0"
                                }`}
                            >
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
