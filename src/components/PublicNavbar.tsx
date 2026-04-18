import { Link, useLocation } from "react-router-dom";
import { Map, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Beranda", path: "/" },
  { label: "Peta Interaktif", path: "/map" },
  { label: "Peta Analisis", path: "/analysis" },
  { label: "Daftar Kampung", path: "/villages" },
  { label: "Berita", path: "/news" },
  { label: "Tentang", path: "/about" },
];

export function PublicNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">
            GIS <span className="text-gradient">Muting</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Admin Login</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-card px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-primary"
          >
            Admin Login
          </Link>
        </nav>
      )}
    </header>
  );
}
