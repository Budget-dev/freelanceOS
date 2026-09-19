"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, Users, Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function AuthSectionTwo({ isLogin = false }: { isLogin?: boolean }) {
  return (
    <section className="flex flex-col min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-white p-3 sm:p-4 text-black antialiased [font-synthesis:none]">
      <div className="grid flex-1 min-h-0 gap-4 lg:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-center overflow-hidden rounded-[16px] bg-[#F8F9FA] px-12 lg:px-16 relative border border-black/5">
          <div className="flex w-full max-w-[600px] flex-col h-full min-h-0 justify-center">
            
            <div className="space-y-6 max-w-[420px] relative z-10">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase">
                  Work Smarter
                </p>
                <h2 className="text-4xl lg:text-[44px] font-bold tracking-tight text-foreground leading-[1.1]">
                  Find better opportunities.
                </h2>
              </div>
              
              <p className="text-[17px] text-muted-foreground leading-relaxed pr-6">
                Analyze projects, discover client insights, and make smarter decisions — all in one place.
              </p>

              <div className="space-y-7 pt-6">
                
                {/* Feature 1 */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 mt-0.5">
                    <Search className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[15px] text-foreground">Analyze Projects</h3>
                    <p className="text-[14px] text-muted-foreground leading-snug">Understand requirements, detect red flags and find missing info.</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 mt-0.5">
                    <Users className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[15px] text-foreground">Discover Clients</h3>
                    <p className="text-[14px] text-muted-foreground leading-snug">Get insights about companies and their public presence.</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 mt-0.5">
                    <Zap className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[15px] text-foreground">Save Time</h3>
                    <p className="text-[14px] text-muted-foreground leading-snug">Focus on the right opportunities and apply with confidence.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Laptop Illustration Decorative block */}
            <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 w-[55%] h-[65%] rounded-l-[20px] shadow-2xl bg-white border border-black/10 overflow-hidden hidden xl:block">
               <img 
                 src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1000&auto=format&fit=crop" 
                 alt="Workspace" 
                 className="w-full h-full object-cover opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent mix-blend-overlay"></div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex min-h-0 items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <AuthForm isLogin={isLogin} />
        </div>
        
      </div>
    </section>
  );
}

function AuthForm({ isLogin }: { isLogin: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[420px] text-center">
      <div className="space-y-2">
        <h1 className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl lg:text-[40px] lg:leading-[1.05]">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-[15px]">
          {isLogin ? "Log in to continue to FreelanceOS" : "Sign up to get started with FreelanceOS"}
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <SocialButton icon={<GoogleIcon />} label={`Continue with Google`} />
        <SocialButton icon={<AppleIcon />} label={`Continue with Apple`} />
      </div>

      <div className="my-7 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4 text-left">
        {!isLogin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldBox label="First Name" type="text" />
            <FieldBox label="Last Name" type="text" />
          </div>
        )}

        <FieldBox 
          label="Email" 
          placeholder="Enter your email" 
          type="email" 
          icon={<Mail className="h-[18px] w-[18px] text-muted-foreground" />} 
        />
        <FieldBox 
          label="Password" 
          placeholder="Enter your password" 
          type="password" 
          icon={<Lock className="h-[18px] w-[18px] text-muted-foreground" />} 
          isPassword
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-black shadow-sm focus:border-black focus:ring-black size-4" />
            <span className="text-[14px] font-medium text-foreground">Keep me signed in</span>
          </label>
          {isLogin && (
            <Link href="#" className="text-[14px] font-medium text-foreground underline underline-offset-4 hover:text-black/80">
              Forgot password?
            </Link>
          )}
        </div>

        <button
          type="button"
          className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg border border-black/40 bg-black text-[16px] font-medium text-white transition-colors hover:bg-black/85 shadow-sm"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        <p className="text-center text-[14px] text-muted-foreground pt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-foreground underline underline-offset-2 hover:text-black/80">
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </form>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[42px] items-center justify-center gap-2.5 rounded-lg border border-input bg-white px-3 text-[14px] font-medium leading-none text-foreground transition-colors hover:bg-muted shadow-sm"
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function FieldBox({
  label,
  placeholder,
  type = "text",
  icon,
  isPassword
}: {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  isPassword?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-[46px] items-center gap-3 rounded-lg border border-input bg-white px-4 text-base shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-input transition-colors">
      {icon && <span className="shrink-0">{icon}</span>}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-[14px]"
      />
      <span className="shrink-0 text-[14px] font-medium text-foreground mr-1">{label}</span>
      {isPassword && (
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EB4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}
