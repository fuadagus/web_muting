import { motion } from "framer-motion";
import { MapPin, BookOpen, Database, AlertTriangle, Info } from "lucide-react";

const blocks = [
  {
    icon: MapPin,
    title: "Kawasan Transmigrasi Muting",
    content:
      "Muting merupakan salah satu kawasan transmigrasi di Kabupaten Merauke, Provinsi Papua Selatan. Kawasan ini terdiri dari beberapa Satuan Permukiman (SP) yang ditempatkan sejak era program transmigrasi nasional.",
  },
  {
    icon: Database,
    title: "Sumber Data",
    content:
      "Data spasial yang digunakan dalam WebGIS ini bersumber dari survei lapangan, data BPS, data Dinas Pendidikan dan Kesehatan Kabupaten Merauke, serta citra satelit yang diolah secara digital.",
  },
  {
    icon: BookOpen,
    title: "Metode Analisis",
    content:
      "Sistem ini menggunakan dua metode analisis aksesibilitas: (1) Buffer analysis untuk menentukan jangkauan layanan berdasarkan radius jarak, dan (2) Isochrone analysis untuk menentukan cakupan berdasarkan waktu tempuh melalui jaringan jalan.",
  },
  {
    icon: AlertTriangle,
    title: "Keterbatasan",
    content:
      "Data yang ditampilkan mungkin tidak sepenuhnya terkini. Analisis aksesibilitas menggunakan asumsi kecepatan rata-rata dan kondisi jalan normal. Hasil analisis bersifat estimasi dan perlu verifikasi lapangan.",
  },
];

export default function AboutPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Tentang Sistem
          </span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          WebGIS Aksesibilitas Fasilitas Umum
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          Sistem informasi geografis berbasis web yang dirancang untuk memvisualisasikan
          dan menganalisis tingkat aksesibilitas fasilitas pendidikan dan kesehatan di
          Kawasan Transmigrasi Muting, Kabupaten Merauke.
        </p>
      </motion.div>

      <div className="space-y-8">
        {blocks.map((block, i) => (
          <motion.div
            key={block.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <block.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-1">
                {block.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {block.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
