"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Building2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type BotChallenge = {
  num1: number;
  num2: number;
};

type LoginFormProps = {
  callbackUrl: string;
  urlError: string | null;
  botChallenge: BotChallenge;
  currentYear: number;
};

function getAuthError(urlError: string | null) {
  return urlError === "CredentialsSignin"
    ? "Invalid email or password. Please try again."
    : null;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function LoginForm({
  callbackUrl,
  urlError,
  botChallenge,
  currentYear,
}: LoginFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(() =>
    getAuthError(urlError)
  );
  const [isPending, startTransition] = useTransition();
  const [botAnswer, setBotAnswer] = useState("");

  useEffect(() => {
    setAuthError(getAuthError(urlError));
  }, [urlError]);

  const isHuman =
    Number(botAnswer) === botChallenge.num1 + botChallenge.num2;

  const handleMagicLogin = () => {
    if (!isHuman) return;
    setAuthError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: "admin@homes.in",
        password: "Admin@Homes2025!",
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Magic login failed.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,169,110,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.28) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-foreground" />
          </div>
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Homes<span className="text-primary">.</span>
          </span>
        </div>

        {/* Card */}
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl font-semibold text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center text-sm">
              Sign in to your admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error alert */}
            {authError && (
              <Alert className="mb-5 bg-red-500/10 border-red-500/30 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 text-sm ml-1">
                  {authError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@homes.in"
                  autoComplete="email"
                  disabled={isPending}
                  className="h-11 border-border bg-accent text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    className="h-11 border-border bg-accent pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-primary hover:bg-primary-light text-foreground font-semibold text-sm transition-colors mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            {/* Divider + info & Magic Login */}
            <div className="mt-6 pt-5 border-t border-border">
              {/* Magic Login (Test Mode) */}
              <div className="mb-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-center text-sm font-medium text-foreground mb-3">
                  Test Mode: Magic Login
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-medium bg-background px-3 py-1.5 rounded-md border border-border shadow-sm">
                      Bot Check: {botChallenge.num1} + {botChallenge.num2} = ?
                    </span>
                    <Input
                      type="number"
                      value={botAnswer}
                      onChange={(e) => setBotAnswer(e.target.value)}
                      className="w-20 text-center h-9 focus:ring-0 focus:border-primary border-border bg-background"
                      placeholder="Answer"
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isHuman || isPending}
                    onClick={handleMagicLogin}
                    className="w-full h-10 border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors mt-1"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    ✨ Magic Login (Admin)
                  </Button>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                This portal is for authorised Homes agents and administrators
                only. Unauthorised access attempts are logged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#2A3E52] mt-6">
          © {currentYear} Homes. All rights reserved.
        </p>
      </div>
    </div>
  );
}
