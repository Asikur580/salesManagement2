import React, { useState, useEffect, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Cpu,
    Fingerprint,
    Activity,
    Box,
} from "lucide-react";

/**
 * AdminLogin (Elite Edition)
 * A top-tier, ultra-premium login interface designed for maximum visual impact.
 * Features:
 * - Dynamic Mouse Parallax Background
 * - High-Intensity Mesh Gradients
 * - Industrial Carbon-Fibre Glassmorphism
 * - Multi-stage Authentication Aesthetics
 */
const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/admin/login");
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#FF4E00] selection:text-white">
            <Head title="Secure Management Node | OrenMart Elite" />

            {/* --- ELITE BACKGROUND ENGINE --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Dynamic Mesh Gradients */}
                <div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-[#FF4E00]/20 to-transparent rounded-full blur-[140px] animate-pulse"
                    style={{
                        transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
                    }}
                />
                <div
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-gradient-to-tl from-blue-600/15 to-transparent rounded-full blur-[140px]"
                    style={{
                        transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
                    }}
                />

                {/* Animated Scanning Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF4E00]/30 to-transparent animate-[scan_4s_linear_infinite]" />

                {/* Carbon Fibre Silkscreen */}
                <div
                    className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"
                    style={{ mixBlendMode: "overlay" }}
                />

                {/* Backdrop Tint */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div
                ref={containerRef}
                className={`w-full max-w-[520px] relative z-10 transition-all duration-1000 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
                style={{
                    transform: `perspective(1000px) rotateX(${mousePos.y * -0.1}deg) rotateY(${mousePos.x * 0.1}deg)`,
                }}
            >
                {/* --- BRANDING PROTOCOL --- */}
                <div className="flex flex-col items-center mb-10 group">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-[#FF4E00] blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-24 h-24 bg-black border border-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-[#FF4E00]/30 transition-colors">
                            {/* Animated HUD Elements */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-full h-full border-[1.5px] border-[#FF4E00] rounded-full scale-125 animate-ping opacity-20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full animate-[spin_12s_linear_infinite]" />
                            </div>
                            <Box className="text-[#FF4E00] h-12 w-12 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        {/* Tag Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#FF4E00] to-[#E64615] p-2 rounded-xl shadow-xl shadow-orange-500/30">
                            <Fingerprint className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-6xl font-black italic text-white tracking-[-0.05em] uppercase leading-tight">
                            OREN<span className="text-[#FF4E00]">MART</span>
                        </h1>
                        <div className="mt-4 flex items-center justify-center gap-4">
                            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#FF4E00]/40" />
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-[#FF4E00] animate-pulse" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] whitespace-nowrap">
                                    Elite Operations Portal
                                </span>
                            </div>
                            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#FF4E00]/40" />
                        </div>
                    </div>
                </div>

                {/* --- MAIN ELITE CONTAINER --- */}
                <div className="relative">
                    {/* Decorative Edge Glows */}
                    <div className="absolute -inset-[2px] bg-gradient-to-tr from-[#FF4E00]/30 to-blue-500/30 rounded-[3.5rem] blur-[15px] opacity-20" />

                    <div className="relative bg-white/[0.02] backdrop-blur-[50px] border border-white/[0.08] rounded-[3.5rem] p-10 md:p-14 shadow-4xl overflow-hidden">
                        {/* Corner Decorative Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4E00]/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />

                        <div className="mb-12 relative">
                            <div className="flex items-center gap-3 mb-2">
                                <Cpu className="h-5 w-5 text-[#FF4E00]" />
                                <span className="text-[10px] font-black text-[#FF4E00] uppercase tracking-[0.3em]">
                                    Identity Verified
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                                Authorize
                            </h2>
                            <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-wider opacity-60">
                                System core access requested
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-9">
                            {/* Identity Input */}
                            <div className="space-y-3 group/field">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                                        Protocol Email
                                    </Label>
                                    <div className="h-1 w-1 bg-[#FF4E00] rounded-full group-focus-within/field:animate-ping" />
                                </div>
                                <div className="relative box-border">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 h-5 w-5 group-focus-within/field:text-[#FF4E00] transition-colors" />
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="bg-black/40 border-white/[0.05] h-16 pl-14 rounded-2xl text-white placeholder:text-gray-700 focus:border-[#FF4E00]/40 focus:bg-black/60 transition-all font-bold text-lg shadow-inner ring-0 focus:ring-4 focus:ring-[#FF4E00]/5"
                                        placeholder="admin@orenmart.com"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[#FF4E00] text-[10px] font-black uppercase tracking-widest mt-2 ml-2 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-current rounded-full" />{" "}
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Key */}
                            <div className="space-y-3 group/field">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                                        Secure Keyphrase
                                    </Label>
                                    <div className="h-1 w-1 bg-[#FF4E00] rounded-full group-focus-within/field:animate-ping" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 h-5 w-5 group-focus-within/field:text-[#FF4E00] transition-colors" />
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="bg-black/40 border-white/[0.05] h-16 pl-14 pr-14 rounded-2xl text-white placeholder:text-gray-700 focus:border-[#FF4E00]/40 focus:bg-black/60 transition-all font-bold text-lg shadow-inner ring-0 focus:ring-4 focus:ring-[#FF4E00]/5"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Access Settings */}
                            <div className="flex items-center justify-between px-2 pt-1">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData("remember", !!checked)
                                        }
                                        className="border-white/10 data-[state=checked]:bg-[#FF4E00] h-5 w-5 rounded-lg"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-[10px] font-black text-gray-500 cursor-pointer uppercase tracking-widest hover:text-gray-300 transition-colors"
                                    >
                                        Trusted Instance
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="text-[10px] font-black text-[#FF4E00]/60 hover:text-[#FF4E00] transition-colors uppercase tracking-widest leading-none"
                                >
                                    Lost Key?
                                </button>
                            </div>

                            {/* Authorization Launch Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-18 bg-gradient-to-r from-[#FF4E00] via-[#E64615] to-[#FF4E00] bg-[length:200%_auto] hover:bg-right text-white text-xl font-black rounded-3xl transition-all duration-700 shadow-[0_15px_45px_rgba(255,78,0,0.3)] group relative overflow-hidden"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="uppercase tracking-[0.2em]">
                                            Authenticating Node...
                                        </span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-4 uppercase tracking-[0.3em] font-black">
                                        INITIALIZE SYSTEM
                                        <ArrowRight className="h-7 w-7 group-hover:translate-x-3 transition-transform duration-700 ease-out" />
                                    </span>
                                )}
                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Button>
                        </form>

                        {/* Validation Stamps */}
                        <div className="mt-14 flex items-center justify-center gap-10">
                            <div className="flex flex-col items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                <ShieldCheck className="text-[#FF4E00] h-6 w-6 opacity-30 group-hover:opacity-100" />
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.5em]">
                                    AES-256 SECURED
                                </span>
                            </div>
                            <div className="w-[1px] h-8 bg-white/5" />
                            <div className="flex flex-col items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                <Fingerprint className="text-[#FF4E00] h-6 w-6 opacity-30 group-hover:opacity-100" />
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.5em]">
                                    BIO-AUTH READY
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NODE FOOTER --- */}
                <div className="mt-14 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.6em] mb-6">
                        © 2026 ORENMART GLOBAL NETWORKS
                    </p>
                    <div className="flex justify-center gap-10 text-white text-[9px] font-black uppercase tracking-widest">
                        <a
                            href="#"
                            className="hover:text-[#FF4E00] border-b border-transparent hover:border-[#FF4E00] transition-all pb-1"
                        >
                            Technical Support
                        </a>
                        <a
                            href="#"
                            className="hover:text-[#FF4E00] border-b border-transparent hover:border-[#FF4E00] transition-all pb-1"
                        >
                            Legal Protocols
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .shadow-4xl {
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8), 
                      0 0 50px -10px rgba(255, 78, 0, 0.1);
        }
      `}</style>
        </div>
    );
};

export default AdminLogin;
