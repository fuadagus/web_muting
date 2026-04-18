import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Route,
  GraduationCap,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  { icon: MapPin, label: "Total Kampung", value: "24", change: "+2" },
  { icon: Building2, label: "Total Fasilitas", value: "30", change: "+5" },
  { icon: Route, label: "Ruas Jalan", value: "42", change: "+3" },
  { icon: CheckCircle2, label: "Data Tervalidasi", value: "87%", change: "+12%" },
];

const barData = [
  { name: "SP 1", edu: 2, health: 1 },
  { name: "SP 2", edu: 1, health: 1 },
  { name: "SP 3", edu: 1, health: 0 },
  { name: "SP 4", edu: 2, health: 1 },
  { name: "SP 5", edu: 1, health: 0 },
  { name: "SP 6", edu: 1, health: 1 },
];

const pieData = [
  { name: "Pendidikan", value: 18 },
  { name: "Kesehatan", value: 12 },
];
const PIE_COLORS = ["hsl(38,92%,55%)", "hsl(0,72%,50%)"];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
});

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan data WebGIS Kawasan Transmigrasi Muting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            {...fadeUp(i)}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-secondary flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {s.change}
                  </span>
                </div>
                <p className="font-heading text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Fasilitas per Kampung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,18%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="edu" fill="hsl(38,92%,55%)" name="Pendidikan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="health" fill="hsl(0,72%,50%)" name="Kesehatan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Jenis Fasilitas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
