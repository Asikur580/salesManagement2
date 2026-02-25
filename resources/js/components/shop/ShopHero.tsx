import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import {
  ChevronRight, ChevronLeft, Menu, Zap, Star, ShieldCheck, Clock, Truck,
  Car, Sparkles, Layers, Wind, Cpu, Droplets, Key, Activity,
  Lightbulb, Wrench, Shirt,
} from "lucide-react";

// ─── 3-Level Category Data ────────────────────────────────────────────────────
const SIDEBAR_CATEGORIES = [
  {
    name: "Summer Essential", icon: <Zap className="h-4 w-4" />,
    sub: [
      { name: "Seat Cooler",     items: ["USB Seat Fan", "Cooling Cushion", "Ventilated Pad"] },
      { name: "Windshield Shade",items: ["Foldable Shade", "Retractable Shade", "Custom Fit"] },
      { name: "Car Fan",         items: ["Clip-on Fan", "Dashboard Fan", "Rear Seat Fan"] },
      { name: "AC Accessories",  items: ["Vent Cover", "Vent Freshener", "AC Filter"] },
    ],
  },
  {
    name: "Winter Essential", icon: <Wind className="h-4 w-4" />,
    sub: [
      { name: "Steering Cover", items: ["Faux Leather", "Furry Cover", "Anti-slip"] },
      { name: "Seat Warmer",    items: ["12V Cushion", "Universal Warmer", "Electric Warmer"] },
      { name: "Body Warmer",    items: ["Heated Blanket", "Travel Warmer", "Thermal Pad"] },
      { name: "Defrost Tools",  items: ["Ice Scraper", "Defrost Spray", "Snow Brush"] },
    ],
  },
  {
    name: "Car Interior", icon: <Layers className="h-4 w-4" />,
    sub: [
      { name: "Storage & Organizers", items: ["Back Seat Organizer", "Trunk Organizer", "Console Tray", "Glove Insert"] },
      { name: "Seat Accessories",     items: ["Back Support", "Seat Gap Filler", "Armrest Pad", "Headrest Hook"] },
      { name: "Covers & Mats",        items: ["Floor Mat Set", "Cargo Mat", "Dashboard Cover", "Steering Wrap"] },
      { name: "Sunshade",             items: ["Front Windshield", "Side Window", "Rear Window", "Pop-up Shade"] },
    ],
  },
  {
    name: "Car Exterior", icon: <Car className="h-4 w-4" />,
    sub: [
      { name: "Body Protection", items: ["Full Car Cover", "Door Edge Guard", "Bumper Guard", "Handle Cover"] },
      { name: "Mirrors",         items: ["Wide Angle Mirror", "Blind Spot Mirror", "Mirror Cover"] },
      { name: "Stickers & Decals", items: ["Racing Stripes", "Logo Decal", "Reflective Tape", "Wrap Film"] },
      { name: "Aerodynamics",    items: ["Roof Spoiler", "Lip Spoiler", "Side Skirts", "Diffuser"] },
    ],
  },
  {
    name: "Electronics & Gadgets", icon: <Cpu className="h-4 w-4" />,
    sub: [
      { name: "Cameras",          items: ["Dash Cam 1CH", "Dash Cam 2CH", "Reverse Cam", "360° Camera"] },
      { name: "Tracking & Safety",items: ["GPS Tracker", "OBD2 Scanner", "Radar Detector", "Blind Spot"] },
      { name: "Chargers",         items: ["USB Charger", "Fast Charger", "Wireless Charger", "Solar"] },
      { name: "Audio & Media",    items: ["Car Bluetooth", "FM Transmitter", "Amplifier", "Subwoofer"] },
    ],
  },
  {
    name: "Car Care", icon: <Droplets className="h-4 w-4" />,
    sub: [
      { name: "Ceramic Coating",     items: ["9H Coating", "10H Coating", "Graphene", "Nano Coating"] },
      { name: "Cleaning Products",   items: ["Car Shampoo", "Dashboard Cleaner", "Glass Cleaner", "Wheel Cleaner"] },
      { name: "Polish & Wax",        items: ["Carnauba Wax", "Paint Sealant", "Clay Bar", "Compound"] },
      { name: "Tools",               items: ["Microfiber Towel", "Applicator Pad", "Wash Mitt", "Bucket Set"] },
    ],
  },
  {
    name: "Perfume & Showpiece", icon: <Sparkles className="h-4 w-4" />,
    sub: [
      { name: "Liquid Perfume",    items: ["Oud Collection", "Floral Series", "Fresh Scent", "Premium Brand"] },
      { name: "Vent Freshener",    items: ["Clip-on Freshener", "Gel Freshener", "Charcoal Purifier"] },
      { name: "Dashboard Showpiece", items: ["Bobble Head", "Angel Figurine", "Car Mascot", "Floating Ornament"] },
    ],
  },
  {
    name: "Key Accessories", icon: <Key className="h-4 w-4" />,
    sub: [
      { name: "Key Covers", items: ["TPU Cover", "Leather Case", "Carbon Fiber", "Smart Key Protector"] },
      { name: "Key Chains", items: ["Metal Keychain", "Leather Keychain", "Branded Keyring"] },
      { name: "Key Finder", items: ["Bluetooth Tracker", "NFC Tag", "GPS Key Finder"] },
    ],
  },
  {
    name: "Performance", icon: <Activity className="h-4 w-4" />,
    sub: [
      { name: "Engine Care", items: ["Oil Additive", "Injector Cleaner", "Coolant", "Stop Leak"] },
      { name: "Air System",  items: ["Air Filter", "Cold Air Intake", "Throttle Cleaner"] },
      { name: "Drive Train", items: ["Gear Oil", "Transmission Flush", "Shift Knob"] },
    ],
  },
  {
    name: "LED & Lighting", icon: <Lightbulb className="h-4 w-4" />,
    sub: [
      { name: "Interior Lighting",  items: ["Dome Light", "Footwell Lights", "Ambient Strip"] },
      { name: "Exterior Lighting",  items: ["DRL Strip", "Underglow Kit", "Fog Light", "Puddle Lamp"] },
      { name: "Headlights",         items: ["H4 LED Bulb", "H7 LED Bulb", "HID Kit", "Angel Eye Ring"] },
    ],
  },
  {
    name: "Modifications", icon: <Wrench className="h-4 w-4" />,
    sub: [
      { name: "Body Mods",     items: ["Lip Kit", "Side Skirts", "Rear Diffuser", "Fender Flare"] },
      { name: "Interior Mods", items: ["Sport Steering Wheel", "Short Shifter", "Carbon Trim"] },
      { name: "Exhaust",       items: ["Exhaust Tip", "Resonator", "Muffler Delete"] },
    ],
  },
  {
    name: "Covers", icon: <Shirt className="h-4 w-4" />,
    sub: [
      { name: "Full Car Covers", items: ["Waterproof", "Sun-proof", "Indoor Cover", "Half Cover"] },
      { name: "Seat Covers",     items: ["Leather Set", "Fabric Set", "Single Seat", "Child Seat"] },
      { name: "Steering Covers", items: ["Leather Wrap", "Carbon Fiber", "Suede Grip"] },
    ],
  },
];

type SubItem = { name: string; items: string[] };

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
// Panel 1 — Services (Ceramic Coating focus)
const RIGHT_PANELS = [
  [
    { image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800&h=600", title: "Ceramic Coating",   sub: "Starts from ৳5,999" },
    { image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800&h=600",     title: "Paint Protection", sub: "PPF from ৳12,999" },
    { image: "https://images.unsplash.com/photo-1552933529-e359b24772ff?auto=format&fit=crop&q=80&w=800&h=600",  title: "Car Detailing",    sub: "Deep Clean ৳2,499" },
  ],
  [
    { image: "https://images.unsplash.com/photo-1552650272-b8a34de21b22?auto=format&fit=crop&q=80&w=800&h=600",     title: "LED & Lighting",   sub: "30% Discount" },
    { image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800&h=600", title: "Dash Cameras",    sub: "Best Sellers" },
    { image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800&h=600",   title: "Combo Packs",     sub: "Save up to 40%" },
  ],
];

// ─── Hero Component ───────────────────────────────────────────────────────────
export function ShopHero() {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [current, setCurrent]  = useState(0);
  const [paused, setPaused]     = useState(false);
  const [rightIdx, setRightIdx] = useState([0, 0]);

  const activeCat = SIDEBAR_CATEGORIES.find((c) => c.name === hoveredCat);
  const activeSub = activeCat?.sub.find((s) => s.name === hoveredSub) ?? null;

  const handleCatEnter = (name: string) => { setHoveredCat(name); setHoveredSub(null); };

  const next = useCallback(() => setCurrent((p) => (p + 1) % BANNER_SLIDES.length), []);
  const prev = () => setCurrent((p) => (p - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);

  // Center slider timer
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [paused, next]);

  // Right panel timers (offset by 1.5s so they don't change simultaneously)
  useEffect(() => {
    const t1 = setInterval(() =>
      setRightIdx((p) => [( p[0] + 1) % RIGHT_PANELS[0].length, p[1]]), 3000);
    const t2 = setTimeout(() => {
      const t = setInterval(() =>
        setRightIdx((p) => [p[0], (p[1] + 1) % RIGHT_PANELS[1].length]), 3000);
      return () => clearInterval(t);
    }, 1500);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  const slide = BANNER_SLIDES[current];

  return (
    <div className="w-full bg-[#F8F9FA] py-8">
      <div className="w-full mx-auto px-4 flex flex-col lg:flex-row gap-6 lg:h-[500px]" style={{ maxWidth: "100rem" }}>

        {/* ── Column 1: Main Categories ── */}
        <div
          className="hidden lg:flex flex-col w-[240px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 relative h-full"
          onMouseLeave={() => { setHoveredCat(null); setHoveredSub(null); }}
        >
          <div className="bg-[#FF4E00] px-5 py-4 flex items-center gap-3 shrink-0 rounded-t-2xl">
            <Menu className="h-5 w-5 text-white" />
            <span className="font-black text-white uppercase tracking-wider text-sm">All Categories</span>
          </div>

          <div className="flex-1 overflow-y-auto py-1 rounded-b-2xl">
            {SIDEBAR_CATEGORIES.map((cat, i) => (
              <div
                key={i}
                onMouseEnter={() => handleCatEnter(cat.name)}
                className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all group ${
                  hoveredCat === cat.name
                    ? "bg-orange-50 border-l-4 border-[#FF4E00]"
                    : "border-l-4 border-transparent hover:bg-orange-50 hover:border-[#FF4E00]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${hoveredCat === cat.name ? "text-[#FF4E00]" : "text-gray-400 group-hover:text-[#FF4E00]"} transition-colors`}>
                    {cat.icon}
                  </span>
                  <span className={`text-[13px] font-bold transition-colors ${hoveredCat === cat.name ? "text-[#FF4E00]" : "text-gray-700 group-hover:text-[#FF4E00]"}`}>
                    {cat.name}
                  </span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${hoveredCat === cat.name ? "text-[#FF4E00]" : "text-gray-300"}`} />
              </div>
            ))}
          </div>

          {/* ── Column 2: Subcategories flyout ── */}
          {activeCat && (
            <div
              className="absolute left-[240px] top-0 z-40 w-[210px] min-h-full bg-white border border-gray-100 shadow-2xl rounded-r-2xl"
              onMouseLeave={() => setHoveredSub(null)}
            >
              <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 rounded-tr-2xl shrink-0">
                <p className="text-[9px] font-black text-[#FF4E00] uppercase tracking-[0.2em]">Categories</p>
                <p className="text-[13px] font-black text-gray-800 mt-0.5">{activeCat.name}</p>
              </div>
              <div className="py-1">
                {activeCat.sub.map((sub, j) => (
                  <div
                    key={j}
                    onMouseEnter={() => setHoveredSub(sub.name)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all group ${
                      hoveredSub === sub.name
                        ? "bg-[#FF4E00]"
                        : "hover:bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${hoveredSub === sub.name ? "bg-white" : "bg-[#FF4E00]"}`} />
                      <span className={`text-[13px] font-bold transition-colors ${hoveredSub === sub.name ? "text-white" : "text-gray-700 group-hover:text-[#FF4E00]"}`}>
                        {sub.name}
                      </span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 ${hoveredSub === sub.name ? "text-white" : "text-gray-300"}`} />
                  </div>
                ))}
              </div>

              {/* ── Column 3: Sub-subcategories flyout ── */}
              {activeSub && (
                <div className="absolute left-[210px] top-0 z-50 w-[200px] min-h-full bg-white border border-gray-100 shadow-2xl rounded-r-2xl">
                  <div className="bg-gray-800 px-4 py-3 border-b rounded-tr-2xl">
                    <p className="text-[9px] font-black text-orange-300 uppercase tracking-[0.2em]">Sub-category</p>
                    <p className="text-[13px] font-black text-white mt-0.5">{activeSub.name}</p>
                  </div>
                  <div className="py-1">
                    {activeSub.items.map((item, k) => (
                      <Link
                        key={k}
                        href="#"
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#FF4E00] group transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00] group-hover:bg-white shrink-0" />
                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-white">{item}</span>
                      </Link>
                    ))}
                  </div>
                  <Link href="#" className="mx-4 my-2 inline-flex items-center gap-1 text-[#FF4E00] font-black text-xs hover:underline">
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
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
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-[8000ms]"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} to-transparent`} />
              <div className="absolute inset-0 flex flex-col justify-center p-10 md:p-14 text-white z-10">
                <div className="inline-flex items-center gap-2 mb-5 bg-[#FF4E00] py-1 px-3 rounded-full self-start">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  <span className="text-xs font-black uppercase tracking-widest">{s.badge}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight uppercase italic drop-shadow-lg">
                  {s.title} <br />
                  <span className="text-[#FF4E00]">{s.highlight}</span> <br />
                  <span className="text-2xl md:text-3xl font-black opacity-90">{s.subtitle}</span>
                </h2>
                <p className="text-gray-200 text-base mb-6 max-w-md font-medium mt-2">{s.desc}</p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-[#FF4E00] hover:bg-white hover:text-[#FF4E00] text-white font-black px-7 py-5 rounded-lg text-base transition-all transform hover:-translate-y-1 shadow-lg border-2 border-[#FF4E00]">
                    {s.cta}
                  </Button>
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black font-black px-7 py-5 rounded-lg text-base transition-all">
                    BROWSE ALL
                  </Button>
                </div>
                <div className="flex gap-5 pt-5 border-t border-white/20 mt-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#FF4E00]" />
                    <span className="text-xs font-bold uppercase">Genuine Parts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#FF4E00]" />
                    <span className="text-xs font-bold uppercase">Free Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Prev / Next Arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#FF4E00] text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#FF4E00] text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
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
                    ? "bg-[#FF4E00] w-8 h-2.5"
                    : "bg-white/50 hover:bg-white w-2.5 h-2.5"
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
          <div className="flex-1 rounded-2xl overflow-hidden relative shadow-lg" style={{ background: "#111" }}>
            {RIGHT_PANELS[0].map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === rightIdx[0] ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Panel 2 */}
          <div className="flex-1 rounded-2xl overflow-hidden relative shadow-lg">
            {RIGHT_PANELS[1].map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === rightIdx[1] ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
