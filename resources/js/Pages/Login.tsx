import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Head, router, useForm } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import {
    Phone,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Key,
    ArrowRight,
    MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Login = () => {
    const { toast } = useToast();
    const [loginMode, setLoginMode] = useState<"otp" | "password">("otp");
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const passwordForm = useForm({
        login: "",
        password: "",
        remember: true,
    });

    const [otpData, setOtpData] = useState({
        phone: "",
        otp: "",
    });

    const startTimer = () => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpData.phone) return;

        setIsLoading(true);
        try {
            const response = await axios.post(route("auth.send-otp"), {
                phone: otpData.phone,
            });
            if (response.data.success) {
                setOtpSent(true);
                startTimer();
                toast({
                    title: "OTP Sent",
                    description:
                        "Please check your phone for the 6-digit code.",
                });
                if (response.data.otp_preview) {
                    console.log("OTP Preview:", response.data.otp_preview);
                }
            }
        } catch (error: any) {
            toast({
                title: "Failed to send OTP",
                description:
                    error.response?.data?.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(
                route("auth.verify-otp"),
                otpData,
            );
            if (response.data.success) {
                window.location.href = response.data.redirect || "/";
            }
        } catch (error: any) {
            toast({
                title: "Invalid OTP",
                description:
                    error.response?.data?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post(route("login"), {
            onSuccess: () => {
                toast({
                    title: "Welcome back!",
                    description: "Login successful.",
                });
            },
            onError: (errors) => {
                toast({
                    title: "Login Failed",
                    description: Object.values(errors)[0] as string,
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <ShopLayout>
            <Head title="Login - OrenMart" />
            <main className="min-h-[85vh] flex items-center justify-center p-4 py-16 bg-muted/50">
                <Card className="w-full max-w-[440px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-card">
                    <CardContent className="p-8 md:p-12">
                        {/* Header */}
                        <div className="flex flex-col items-center mb-10 text-center">
                            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                <ShieldCheck className="w-10 h-10 text-[#FF4F17]" />
                            </div>
                            <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
                                Welcome{" "}
                                <span className="text-[#FF4F17]">Back</span>
                            </h1>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2 px-6">
                                Choose your preferred secure login method
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex p-1.5 bg-muted/80 rounded-2xl mb-10 gap-1">
                            <button
                                onClick={() => {
                                    setLoginMode("otp");
                                    setOtpSent(false);
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    loginMode === "otp"
                                        ? "bg-card text-[#FF4F17] shadow-sm"
                                        : "text-muted-foreground hover:text-muted-foreground"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    OTP Login
                                </div>
                            </button>
                            <button
                                onClick={() => setLoginMode("password")}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    loginMode === "password"
                                        ? "bg-card text-[#FF4F17] shadow-sm"
                                        : "text-muted-foreground hover:text-muted-foreground"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Key className="w-3.5 h-3.5" />
                                    Password
                                </div>
                            </button>
                        </div>

                        {/* Forms */}
                        {loginMode === "otp" ? (
                            <div className="space-y-6">
                                {!otpSent ? (
                                    <form
                                        onSubmit={handleSendOtp}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF4F17] ml-1">
                                                Phone Number
                                            </Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#FF4F17] transition-colors" />
                                                <Input
                                                    type="tel"
                                                    placeholder="01XXXXXXXXX"
                                                    value={otpData.phone}
                                                    onChange={(e) =>
                                                        setOtpData({
                                                            ...otpData,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="pl-12 h-14 bg-muted/50 border-border focus:border-[#FF4F17] focus:ring-[#FF4F17]/10 rounded-2xl text-lg font-black tracking-tight"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={
                                                isLoading || !otpData.phone
                                            }
                                            className="w-full h-14 bg-[#FF4F17] hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-orange-100 group"
                                        >
                                            {isLoading
                                                ? "Sending..."
                                                : "Send Secure OTP"}
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </form>
                                ) : (
                                    <form
                                        onSubmit={handleVerifyOtp}
                                        className="space-y-8 animate-in fade-in slide-in-from-bottom-2"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF4F17] ml-1">
                                                    Enter 6-Digit Code
                                                </Label>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOtpSent(false)
                                                    }
                                                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#FF4F17] transition-colors"
                                                >
                                                    Change Number?
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#FF4F17] transition-colors" />
                                                <Input
                                                    type="text"
                                                    placeholder="Enter OTP"
                                                    maxLength={6}
                                                    value={otpData.otp}
                                                    onChange={(e) =>
                                                        setOtpData({
                                                            ...otpData,
                                                            otp: e.target.value,
                                                        })
                                                    }
                                                    className="pl-12 h-14 bg-muted/50 border-border focus:border-[#FF4F17] focus:ring-[#FF4F17]/10 rounded-2xl text-2xl font-black tracking-[0.4em] text-center"
                                                    required
                                                />
                                            </div>
                                            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Code sent to {otpData.phone}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isLoading ||
                                                    otpData.otp.length !== 6
                                                }
                                                className="w-full h-14 bg-black hover:bg-[#FF4F17] text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl"
                                            >
                                                {isLoading
                                                    ? "Verifying..."
                                                    : "Verify & Continue"}
                                            </Button>
                                            {timer > 0 ? (
                                                <p className="text-center text-[10px] font-black text-muted-foreground uppercase">
                                                    Resend in {timer}s
                                                </p>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    className="w-full text-[10px] font-black uppercase tracking-widest text-[#FF4F17] hover:underline"
                                                >
                                                    Resend New Code
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <form
                                onSubmit={handlePasswordLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF4F17] ml-1">
                                            Phone or Email
                                        </Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#FF4F17] transition-colors" />
                                            <Input
                                                type="text"
                                                placeholder="Enter Phone or Email"
                                                value={passwordForm.data.login}
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        "login",
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-12 h-14 bg-muted/50 border-border focus:border-[#FF4F17] focus:ring-[#FF4F17]/10 rounded-2xl text-sm font-black"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF4F17] ml-1">
                                                Password
                                            </Label>
                                            <button
                                                type="button"
                                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#FF4F17]"
                                            >
                                                Forgot?
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#FF4F17] transition-colors" />
                                            <Input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="••••••••"
                                                value={
                                                    passwordForm.data.password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-12 pr-12 h-14 bg-muted/50 border-border focus:border-[#FF4F17] focus:ring-[#FF4F17]/10 rounded-2xl text-sm font-black"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
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
                                <Button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full h-14 bg-[#FF4F17] hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-orange-100 group mt-4 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {passwordForm.processing
                                            ? "Securing Content..."
                                            : "Secure Login"}
                                        {!passwordForm.processing && (
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        )}
                                    </span>
                                </Button>
                            </form>
                        )}

                        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Secure gateway provided by{" "}
                                <span className="text-[#FF4F17]">
                                    OrenMart v2.0
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </ShopLayout>
    );
};

export default Login;
