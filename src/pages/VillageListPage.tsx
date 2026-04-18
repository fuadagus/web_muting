import { useState } from "react";
import { Search, MapPin, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const villages = [
  { id: 1, name: "SP 1 Muting", district: "Muting", pop: 650, edu: 2, health: 1 },
  { id: 2, name: "SP 2 Muting", district: "Muting", pop: 820, edu: 1, health: 1 },
  { id: 3, name: "SP 3 Muting", district: "Muting", pop: 540, edu: 1, health: 0 },
  { id: 4, name: "SP 4 Muting", district: "Muting", pop: 730, edu: 2, health: 1 },
  { id: 5, name: "SP 5 Muting", district: "Muting", pop: 610, edu: 1, health: 0 },
  { id: 6, name: "SP 6 Muting", district: "Muting", pop: 480, edu: 1, health: 1 },
];

export default function VillageListPage() {
  const [search, setSearch] = useState("");
  const filtered = villages.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Daftar Kampung</h1>
          <p className="text-sm text-muted-foreground">
            Data kampung ex-transmigrasi di Kawasan Muting.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kampung..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kampung</TableHead>
              <TableHead>Distrik</TableHead>
              <TableHead className="text-right">Populasi</TableHead>
              <TableHead className="text-center">Pendidikan</TableHead>
              <TableHead className="text-center">Kesehatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {v.name}
                  </div>
                </TableCell>
                <TableCell>{v.district}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {v.pop.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={v.edu > 0 ? "default" : "secondary"}>
                    {v.edu}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={v.health > 0 ? "default" : "secondary"}>
                    {v.health}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
