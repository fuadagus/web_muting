import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Map,
  Compass,
  Building2,
  CircleDot,
  Clock,
  ArrowRight,
  MapPin,
  Users,
  GraduationCap,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-map.jpg";

const features = [
  {
    icon: Map,
    title: "Peta Interaktif",
    desc: "Jelajahi distribusi fasilitas dan kampung secara interaktif.",
    link: "/map",
  },
  {
    icon: Compass,
    title: "Peta Analisis",
    desc: "Analisis aksesibilitas dengan buffer dan isochrone.",
    link: "/analysis",
  },
  {
    icon: Building2,
    title: "Daftar Fasilitas",
    desc: "Lihat data fasilitas pendidikan dan kesehatan.",
    link: "/villages",
  },
  {
    icon: Clock,
    title: "Isochrone",
    desc: "Visualisasi cakupan layanan berdasarkan waktu tempuh.",
    link: "/analysis",
  },
];

const stats = [
  { icon: MapPin, value: "24", label: "Kampung" },
  { icon: GraduationCap, value: "18", label: "Fasilitas Pendidikan" },
  { icon: HeartPulse, value: "12", label: "Fasilitas Kesehatan" },
  { icon: Users, value: "15.000+", label: "Penduduk" },
];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
});

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Aerial view of Muting transmigration area"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="container relative z-10 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm mb-6">
              WebGIS Kawasan Transmigrasi
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Aksesibilitas Fasilitas Umum{" "}
              <span className="text-accent">Muting</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 leading-relaxed">
              Sistem informasi geografis untuk visualisasi dan analisis
              aksesibilitas fasilitas pendidikan dan kesehatan di kawasan
              transmigrasi Muting, Kabupaten Merauke.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="hero-gradient border-0 text-primary-foreground font-semibold">
                <Link to="/map">
                  <Compass className="mr-2 h-5 w-5" />
                  Mulai Eksplorasi
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                <Link to="/about">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-20 container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp(i)}
              className="bg-card rounded-xl p-5 card-elevated text-center"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">
            Fitur Utama
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Alat analisis spasial untuk memahami aksesibilitas fasilitas umum di
            kawasan transmigrasi.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i)}
            >
              <Link
                to={f.link}
                className="block bg-card rounded-xl p-6 card-elevated group h-full"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-4">
            Siap Menjelajahi Peta?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Buka peta interaktif untuk melihat distribusi fasilitas dan analisis
            aksesibilitas secara langsung.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/map">
              <Map className="mr-2 h-5 w-5" />
              Buka Peta Interaktif
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
