import React, { useState } from "react";
import { Smartphone, ArrowRight, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface OTPLoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called after a successful login. Use to redirect or refresh. */
    onSuccess?: () => void;
}

export function OTPLoginModal({
    open,
    onOpenChange,
    onSuccess,
}: OTPLoginModalProps) {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const { sendOTP, verifyOTP } = useAuth();
    const { toast } = useToast();

    const reset = () => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setLoading(false);
    };

    const handleOpenChange = (value: boolean) => {
        if (!value) reset();
        onOpenChange(value);
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await sendOTP(phone);
            toast({ title: "OTP Sent", description: res.message });
            setStep("otp");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyOTP(phone, otp);
            toast({ title: "Success", description: "You are now logged in." });
            onOpenChange(false);
            reset();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "Invalid OTP",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-[#FF4E00] to-orange-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Smartphone className="w-24 h-24" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black italic">
                            CarMart Login
                        </DialogTitle>
                        <DialogDescription className="text-white/80 font-medium">
                            {step === "phone"
                                ? "Enter your phone number to receive an OTP."
                                : "Check your phone for the 6-digit code."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white">
                    {step === "phone" ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="01XXXXXXXXX"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-xl font-bold text-lg focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                disabled={loading}
                                className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-xl font-black gap-2 transition-all active:scale-95 shadow-xl shadow-black/10"
                            >
                                {loading && (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                )}
                                Send OTP <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-2 text-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Enter 6-Digit Code
                                </label>
                                <Input
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-16 text-center text-3xl font-black tracking-[0.5em] bg-gray-50 border-gray-100 rounded-xl focus:ring-[#FF4E00]/20 focus:border-[#FF4E00]"
                                    maxLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setStep("phone")}
                                    className="text-xs font-bold text-[#FF4E00] hover:underline"
                                >
                                    Change phone number
                                </button>
                            </div>
                            <Button
                                disabled={loading}
                                className="w-full h-14 bg-[#FF4E00] hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                            >
                                {loading && (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                )}
                                Verify & Login
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
