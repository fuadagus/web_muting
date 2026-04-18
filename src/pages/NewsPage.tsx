import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const articles = [
  {
    id: 1,
    title: "Pembangunan Jalan Baru di Kawasan Muting Dimulai",
    excerpt: "Pemerintah kabupaten memulai proyek pembangunan jalan sepanjang 15 km yang menghubungkan SP 3 dengan pusat kecamatan.",
    date: "10 Mar 2026",
    tag: "Infrastruktur",
    featured: true,
  },
  {
    id: 2,
    title: "Puskesmas Pembantu SP 5 Diresmikan",
    excerpt: "Fasilitas kesehatan baru hadir untuk melayani warga SP 5 dan sekitarnya.",
    date: "5 Mar 2026",
    tag: "Kesehatan",
    featured: false,
  },
  {
    id: 3,
    title: "Data Spasial Kawasan Muting Diperbarui",
    excerpt: "Tim survei menyelesaikan pembaruan data peta desa dan jaringan jalan kawasan transmigrasi.",
    date: "28 Feb 2026",
    tag: "Data",
    featured: false,
  },
  {
    id: 4,
    title: "Workshop Pemetaan Partisipatif Bersama Warga",
    excerpt: "Kegiatan pemetaan bersama warga dilaksanakan untuk memperbarui informasi fasilitas umum.",
    date: "20 Feb 2026",
    tag: "Kegiatan",
    featured: false,
  },
];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
});

export default function NewsPage() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="container py-10">
      <h1 className="font-heading text-2xl font-bold mb-2">Berita</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Informasi terbaru seputar kawasan transmigrasi dan pembangunan fasilitas.
      </p>

      {/* Featured */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card card-elevated overflow-hidden mb-8"
        >
          <div className="hero-gradient p-8 md:p-12">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground mb-4">
              {featured.tag}
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              {featured.title}
            </h2>
            <p className="text-primary-foreground/80 mb-4 max-w-xl">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-primary-foreground/60 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {featured.date}
              </span>
              <span className="text-xs text-primary-foreground/80 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                Baca selengkapnya <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {rest.map((article, i) => (
          <motion.div
            key={article.id}
            {...fadeUp(i)}
            className="rounded-xl bg-card card-elevated p-6 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{article.tag}</span>
            </div>
            <h3 className="font-heading font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground flex-1">{article.excerpt}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {article.date}
              </span>
              <span className="text-xs text-primary font-semibold cursor-pointer hover:underline flex items-center gap-1">
                Baca <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
