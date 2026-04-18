import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";
import { Map } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-semibold">WebGIS Muting</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 WebGIS Aksesibilitas Fasilitas Umum — Kawasan Transmigrasi Muting
          </p>
        </div>
      </footer>
    </div>
  );
}
