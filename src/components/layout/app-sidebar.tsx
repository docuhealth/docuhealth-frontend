import { AddressBookIcon, HouseIcon, ShieldCheckIcon, SignOutIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type Role, useAuthStore } from "@/stores/auth-store";

type NavItem = {
  to: LinkProps["to"];
  label: string;
  icon: ComponentType;
  /** Omit to show the item to every signed-in user. */
  roles?: readonly Role[];
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: HouseIcon },
  { to: "/contacts", label: "Contacts", icon: AddressBookIcon },
  { to: "/admin", label: "Admin", icon: ShieldCheckIcon, roles: ["admin"] },
];

export function AppSidebar() {
  const user = useAuthStore((s) => s.session?.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = () => {
    clearSession();
    queryClient.clear();
    void navigate({ to: "/sign-in" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 font-heading text-lg font-semibold">
        DocuHealth
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav
                .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
                .map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild>
                      <Link to={to} activeProps={{ "data-active": true }}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <SignOutIcon />
              <span>Sign out {user?.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
