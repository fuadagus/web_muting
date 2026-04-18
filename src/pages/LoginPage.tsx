import { useState } from "react";
import { Link } from "react-router-dom";
import { Map, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import loginBg from "@/assets/login-bg.jpg";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <img
          src={loginBg}
          alt="GIS Map Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-80" />
        <div className="relative z-10 text-center px-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mx-auto mb-6">
            <Map className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-4">
            WebGIS Muting
          </h2>
          <p className="text-primary-foreground/80 max-w-sm mx-auto">
            Sistem Informasi Geografis untuk Analisis Aksesibilitas Fasilitas
            Umum di Kawasan Transmigrasi Muting.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Map className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">GIS Muting</span>
          </div>

          <h1 className="font-heading text-2xl font-bold mb-1">
            Login Admin
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Masuk untuk mengelola data WebGIS.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email / Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@muting.go.id"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Ingat saya
              </Label>
            </div>

            <Button type="submit" className="w-full hero-gradient border-0">
              Masuk
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-8">
            <Link to="/" className="text-primary hover:underline">
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
