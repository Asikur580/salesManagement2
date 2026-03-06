import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Head, useForm } from "@inertiajs/react";
import {
    Activity,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ShieldAlert,
    ArrowRight,
} from "lucide-react";

/**
 * AdminLogin
 * Designed to share aesthetics with the Customer Login (Login.tsx)
 * but retains an authoritative/administrative context.
 */
const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        login: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/admin/login");
    };

    return (
        <div className="min-h-screen items-center justify-center bg-gray-50/50 flex flex-col font-sans">
            <Head title="Admin Login - OrenMart" />
            <main className="flex w-full items-center justify-center p-4 py-16">
                <Card className="w-full max-w-[440px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 md:p-12">
                        {/* Header */}
                        <div className="flex flex-col items-center mb-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner relative group">
                                <ShieldAlert className="w-10 h-10 text-red-500 relative z-10" />
                            </div>
                            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
                                System{" "}
                                <span className="text-red-500">Access</span>
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest px-2">
                                    Authorized Personnel Only
                                </p>
                            </div>
                        </div>

                        {/* Forms */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                                        Phone or Email
                                    </Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Enter Phone or Email"
                                            value={data.login}
                                            onChange={(e) =>
                                                setData("login", e.target.value)
                                            }
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-100 focus:border-red-500 focus:ring-red-500/10 rounded-2xl text-sm font-black"
                                            required
                                        />
                                    </div>
                                    {errors.login && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-current rounded-full" />{" "}
                                            {errors.login}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                                            Security Key
                                        </Label>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            className="pl-12 pr-12 h-14 bg-gray-50/50 border-gray-100 focus:border-red-500 focus:ring-red-500/10 rounded-2xl text-sm font-black"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Access Settings */}
                            <div className="flex items-center px-1 pt-1 justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4 rounded-md border-gray-300 text-red-500 focus:ring-red-500/20"
                                    />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                                        Trust Terminal
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-14 bg-red-500 hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-red-100 group mt-4 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing
                                        ? "Authorizing..."
                                        : "Initialize Session"}
                                    {!processing && (
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    )}
                                </span>
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Core Management by{" "}
                                <span className="text-red-500">
                                    OrenMart Systems
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminLogin;
