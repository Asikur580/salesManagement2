import { router, usePage } from "@inertiajs/react";
import axios from "axios";

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
}

export function useAuth() {
    const { auth } = usePage().props as any;
    const user = auth?.user || null;

    const login = async (
        email: string,
        password: string,
    ): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            router.post(
                "/login",
                { email, password },
                {
                    onSuccess: () => resolve({ success: true }),
                    onError: (errors) =>
                        resolve({
                            success: false,
                            error: Object.values(errors)[0],
                        }),
                },
            );
        });
    };

    const logout = (onSuccess?: () => void) => {
        router.post(
            route("logout"),
            {},
            {
                onFinish: () => {
                    if (onSuccess) onSuccess();
                },
            },
        );
    };

    const sendOTP = async (phone: string) => {
        try {
            const response = await axios.post("/api/auth/send-otp", { phone });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    };

    const verifyOTP = async (phone: string, otp: string) => {
        try {
            const response = await axios.post("/api/auth/verify-otp", {
                phone,
                otp,
            });
            if (response.data.success && response.data.redirect) {
                window.location.href = response.data.redirect;
            }
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    };

    return { user, login, logout, sendOTP, verifyOTP };
}
