import {
  LayoutDashboard,
  Database,
  Map,
  LogOut,
  Building2,
  Route,
  Home,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Kelola Kampung", url: "/admin/villages", icon: Home },
  { title: "Kelola Fasilitas", url: "/admin/facilities", icon: Building2 },
  { title: "Kelola Jalan", url: "/admin/roads", icon: Route },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Map className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-heading text-sm font-bold text-sidebar-foreground">
              Admin Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="hover:bg-sidebar-accent/50">
                <Database className="mr-2 h-4 w-4" />
                {!collapsed && <span>Kembali ke Situs</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/login" className="hover:bg-sidebar-accent/50">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
