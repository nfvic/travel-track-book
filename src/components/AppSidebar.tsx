import { Map, Bus, QrCode, ArrowRight, Ticket, List, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useUserRoles from "@/hooks/useUserRoles";
import { useState, useEffect } from "react";

// Define all possible role-based menus
const passengerItems = [
  {
    title: "Passenger Dashboard",
    url: "/passenger",
    icon: Map,
  },
  {
    title: "My Tickets",
    url: "/my-tickets",
    icon: Ticket,
  },
  {
    title: "Scan QR / Enter Code",
    url: "/qr",
    icon: QrCode,
  },
];

const operatorItems = [
  {
    title: "Operator Dashboard",
    url: "/operator",
    icon: Bus,
  },
];

const adminItems = [
  {
    title: "Admin Dashboard",
    url: "/admin",
  },
];

const allMenus = {
  admin: adminItems,
  operator: operatorItems,
  passenger: passengerItems
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  operator: "Bus Operator",
  passenger: "Passenger"
};

// Accept "admin" in role even if the sidebar is empty for now
export function AppSidebar({ role }: { role: "passenger" | "operator" | "admin" | null }) {
  // Use all roles from DB for the current user
  const { roles } = useUserRoles();
  const location = useLocation();

  // Only show menu if there are any roles
  if (roles.length === 0) return null;

  // We'll use the priority for ordering the groups: admin, operator, passenger
  const priorities: ("admin" | "operator" | "passenger")[] = ["admin", "operator", "passenger"];
  const uniqueRoles: ("admin" | "operator" | "passenger")[] = priorities.filter(r => roles.includes(r));

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Show nothing here for now to keep it clean */}
      </SidebarHeader>
      <SidebarContent>
        {/* Render a SidebarGroup for each role the user has */}
        {uniqueRoles.map(role => {
          const menu = allMenus[role];
          return (
            <SidebarGroup key={role}>
              <SidebarGroupLabel>{roleLabels[role]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menu.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname.startsWith(item.url)}
                      >
                        <Link to={item.url}>
                          {/* <item.icon className="mr-2" /> */}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground pl-2 pb-2">
          <span>Bus Booking Web App</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
