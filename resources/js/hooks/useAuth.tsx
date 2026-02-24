import { router, usePage } from "@inertiajs/react";

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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      router.post("/login", { email, password }, {
        onSuccess: () => resolve({ success: true }),
        onError: (errors) => resolve({ success: false, error: Object.values(errors)[0] }),
      });
    });
  };

  const logout = async () => {
    router.post("/logout");
  };

  return { user, login, logout };
}
