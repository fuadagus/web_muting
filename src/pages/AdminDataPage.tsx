import { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const villageData = [
  { id: 1, name: "SP 1 Muting", pop: 650, status: "validated" },
  { id: 2, name: "SP 2 Muting", pop: 820, status: "validated" },
  { id: 3, name: "SP 3 Muting", pop: 540, status: "pending" },
  { id: 4, name: "SP 4 Muting", pop: 730, status: "validated" },
];

const facilityData = [
  { id: 1, name: "SD Negeri 1 Muting", type: "Pendidikan", status: "validated" },
  { id: 2, name: "Puskesmas Muting", type: "Kesehatan", status: "validated" },
  { id: 3, name: "SD Negeri 2 Muting", type: "Pendidikan", status: "pending" },
];

const roadData = [
  { id: 1, name: "Ruas Muting - SP 1", length: "5.2 km", surface: "Aspal", status: "validated" },
  { id: 2, name: "Ruas SP 1 - SP 2", length: "3.8 km", surface: "Kerikil", status: "pending" },
  { id: 3, name: "Ruas SP 3 - Kecamatan", length: "7.1 km", surface: "Tanah", status: "pending" },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "validated" ? "default" : "secondary"}>
      {status === "validated" ? "Tervalidasi" : "Menunggu"}
    </Badge>
  );
}

function DataToolbar() {
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Tambah
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Data Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input placeholder="Masukkan nama..." />
            </div>
            <Button className="w-full hero-gradient border-0">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline">
        <Upload className="mr-1 h-4 w-4" />
        Import
      </Button>
      <Button size="sm" variant="outline">
        <Download className="mr-1 h-4 w-4" />
        Export
      </Button>
    </div>
  );
}

export default function AdminDataPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Kelola Data</h1>
        <p className="text-sm text-muted-foreground">
          Tambah, edit, dan hapus data spasial.
        </p>
      </div>

      <Tabs defaultValue="villages">
        <TabsList>
          <TabsTrigger value="villages">Kampung</TabsTrigger>
          <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
          <TabsTrigger value="roads">Jalan</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DataToolbar />
        </div>

        <TabsContent value="villages">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Populasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {villageData.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell className="text-right">{v.pop}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="facilities">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilityData.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.type}</TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="roads">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruas</TableHead>
                  <TableHead>Panjang</TableHead>
                  <TableHead>Permukaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roadData.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.length}</TableCell>
                    <TableCell>{r.surface}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
