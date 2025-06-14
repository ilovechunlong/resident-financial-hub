
import { Home, Building2, Users, FileText, Settings, DollarSign, PlusCircle } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Nursing Homes",
    url: "/nursing-homes",
    icon: Building2,
  },
  {
    title: "Residents",
    url: "/residents",
    icon: Users,
  },
  {
    title: "Financial Tracking",
    url: "/finances",
    icon: DollarSign,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const quickActions = [
  {
    title: "Add Nursing Home",
    url: "/nursing-homes/new",
    icon: Building2,
  },
  {
    title: "Onboard Resident",
    url: "/residents/new",
    icon: PlusCircle,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo/Header */}
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-healthcare-primary to-healthcare-secondary text-white">
          <h2 className="text-xl font-bold">Care Home MS</h2>
          <p className="text-sm opacity-90">Management System</p>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`w-full justify-start rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      location.pathname === item.url 
                        ? 'bg-healthcare-primary text-white shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-muted'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3 p-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup className="px-4 pb-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="w-full justify-start rounded-lg bg-gradient-to-r from-healthcare-secondary to-healthcare-primary text-white hover:opacity-90 transition-opacity duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3 p-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
