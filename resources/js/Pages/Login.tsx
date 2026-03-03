import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Head, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For now, redirecting to dashboard as per current flow 
    // real implementation would involve OTP etc.
    router.post("/login", { phone }, {
      onFinish: () => setIsLoading(false)
    });
  };

  return (
    <ShopLayout>
      <Head title="Login - OrenMart" />
      <main className="min-h-[70vh] flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-[480px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl py-6">
          <CardContent className="flex flex-col items-center pt-6 px-8 md:px-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-16 h-16 border-[4px] border-[#FF4F17] rounded-full flex items-center justify-center">
                 <div className="w-10 h-10 rounded-full border-[3px] border-[#FF4F17] relative flex items-center justify-center">
                    <div className="w-[2px] h-full bg-[#FF4F17] absolute" />
                    <div className="w-full h-[2px] bg-[#FF4F17] absolute" />
                    <div className="w-3 h-3 rounded-full bg-[#FF4F17] z-10" />
                 </div>
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-[#FF4F17]">
                OrenMart
              </h1>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-10">
              <p className="text-gray-900 font-bold text-base leading-snug">
                Welcome to OrenMart. Please enter your phone number to login.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-8">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-bold text-gray-800">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 border-gray-200 focus:border-[#FF4F17] focus:ring-0 rounded-md placeholder:text-gray-300 font-medium text-lg"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF4F17] hover:bg-[#e64615] text-white text-lg font-black rounded-lg transition-all duration-300 shadow-md shadow-orange-200"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </ShopLayout>
  );
};

export default Login;
