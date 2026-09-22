"use client";

import { useState, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function AuthSectionTwo({ isLogin = false }: { isLogin?: boolean }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <section className="flex flex-col min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-[#FDFCFB] p-3 sm:p-4 text-black antialiased [font-synthesis:none]">
      <div className="grid flex-1 min-h-0 gap-4 lg:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* LEFT PANEL: Autoplay looping video with watermark cropped & graceful placeholder tagline */}
        <div className="hidden lg:flex relative w-full h-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#fedac2] via-[#fae3d9] to-[#ebdcf0] border border-stone-200/60 shadow-md items-center justify-center">
          
          {/* Branded Fallback / Tagline visible while video loads */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-700 ${
              isVideoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="max-w-md space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-black/5 text-xs font-semibold text-stone-800 shadow-2xs">
                FreelanceOS Intelligence
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-stone-900 leading-snug">
                Apply smarter, faster, and win verified opportunities.
              </h2>
              <p className="text-sm text-stone-700/80 leading-relaxed font-medium">
                Auditing client briefs and generating truth-checked proposals with calibrated pricing.
              </p>
            </div>
          </div>

          {/* Autoplay Video with Watermark Cropping via Scale & Offset */}
          <video
            src="https://vennky.sirv.com/Prompt-1789913060650%20(2).mp4"
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover scale-[1.12] -translate-x-3 -translate-y-3 transition-opacity duration-700 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex min-h-0 items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <Suspense fallback={<div className="w-full max-w-[420px] h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <AuthForm isLogin={isLogin} />
          </Suspense>
        </div>
        
      </div>
    </section>
  );
}

function getSafeRedirectUrl(rawRedirect: string | null): string {
  if (!rawRedirect) return "/dashboard";
  // Strict check to prevent Open Redirect attacks:
  // Must start with a single slash '/' and not '//' or any protocol
  if (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes("://")) {
    return rawRedirect;
  }
  return "/dashboard";
}

function formatAuthError(error: any): string {
  const code = error?.code || "";
  const msg = error?.message || "";
  
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Invalid email or password. Please verify your credentials.";
  }
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists. Please log in instead.";
  }
  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters long.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled.";
  }
  if (code === "auth/api-key-not-valid" || msg.includes("api-key")) {
    return "Firebase configuration is not initialized or invalid. Please check your NEXT_PUBLIC_FIREBASE_* environment variables.";
  }
  return msg || "An unexpected error occurred during authentication.";
}

function AuthForm({ isLogin }: { isLogin: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirectUrl(searchParams.get("redirect"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (loginErr: any) {
          const code = loginErr?.code;
          // If no account exists for this email, automatically create account and sign them up!
          if (
            code === "auth/user-not-found" ||
            code === "auth/invalid-credential"
          ) {
            try {
              const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
              const defaultName = email.trim().split("@")[0] || "Freelancer";
              if (userCred.user) {
                try {
                  await updateProfile(userCred.user, { displayName: defaultName });
                } catch {
                  // non-fatal
                }
              }
              router.push(redirectTarget);
              return;
            } catch (signupErr: any) {
              if (signupErr?.code === "auth/email-already-in-use") {
                setError("Incorrect password for this account. Please try again or click Forgot password.");
                return;
              }
              if (signupErr?.code === "auth/weak-password") {
                setError("No account found. To create your account automatically, password must be at least 6 characters.");
                return;
              }
              setError(formatAuthError(signupErr));
              return;
            }
          }
          throw loginErr;
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
        if (displayName && userCred.user) {
          try {
            await updateProfile(userCred.user, { displayName });
          } catch {
            // non-fatal
          }
        }
      }
      router.push(redirectTarget);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(redirectTarget);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    setError("Apple sign-in requires an active Apple Developer service configuration in production.");
  };

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
        <SocialButton
          icon={googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          label={googleLoading ? "Signing in..." : "Continue with Google"}
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        />
        <SocialButton
          icon={<AppleIcon />}
          label="Continue with Apple"
          onClick={handleAppleSignIn}
          disabled={googleLoading || loading}
        />
      </div>

      <div className="my-7 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-left text-xs font-medium text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {!isLogin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldBox
              label="First Name"
              type="text"
              value={firstName}
              onChange={setFirstName}
              placeholder="Jane"
              required
            />
            <FieldBox
              label="Last Name"
              type="text"
              value={lastName}
              onChange={setLastName}
              placeholder="Doe"
            />
          </div>
        )}

        <FieldBox 
          label="Email" 
          placeholder="Enter your email" 
          type="email"
          value={email}
          onChange={setEmail}
          required
          icon={<Mail className="h-[18px] w-[18px] text-muted-foreground" />} 
        />
        <FieldBox 
          label="Password" 
          placeholder={isLogin ? "Enter your password" : "At least 6 characters"} 
          type="password"
          value={password}
          onChange={setPassword}
          required
          icon={<Lock className="h-[18px] w-[18px] text-muted-foreground" />} 
          isPassword
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-black shadow-sm focus:border-black focus:ring-black size-4"
            />
            <span className="text-[14px] font-medium text-foreground">Keep me signed in</span>
          </label>
          {isLogin && (
            <Link
              href="/forgot-password"
              className="text-[14px] font-medium text-foreground underline underline-offset-4 hover:text-black/80"
            >
              Forgot password?
            </Link>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-lg border border-black/40 bg-black text-[16px] font-medium text-white transition-colors hover:bg-black/85 disabled:opacity-60 shadow-sm"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
          {loading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Log In" : "Sign Up")}
        </button>

        <p className="text-center text-[14px] text-muted-foreground pt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-semibold text-foreground underline underline-offset-2 hover:text-black/80"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </form>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  onClick,
  disabled
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[42px] items-center justify-center gap-2.5 rounded-lg border border-input bg-white px-3 text-[14px] font-medium leading-none text-foreground transition-colors hover:bg-muted disabled:opacity-60 shadow-sm"
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
  isPassword,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  isPassword?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-[46px] items-center gap-3 rounded-lg border border-input bg-white px-4 text-base shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-input transition-colors">
      {icon && <span className="shrink-0">{icon}</span>}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-[14px]"
      />
      <span className="shrink-0 text-[14px] font-medium text-foreground mr-1">{label}</span>
      {isPassword && (
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
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
