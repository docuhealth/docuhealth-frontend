import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";
import helpIconUrl from "@/assets/svgs/help.svg";
import logoutIconUrl from "@/assets/svgs/logout.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogOut } from "@/hooks/use-log-out";

export type NavItem = {
  to: LinkProps["to"];
  label: string;
  /** URL of the link's icon (an SVG from `src/assets/svgs`). */
  icon: string;
  /** Unread count shown on the right. */
  badge?: number;
};

const itemClass =
  "h-11 gap-3 rounded-lg px-5 type-body-sm-medium text-fg-body hover:bg-line hover:text-fg-heading data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-brand-hover data-active:hover:text-primary-foreground";

/**
 * An SVG icon drawn in the text color, so it turns white on the active link whatever color the
 * file itself uses.
 */
function NavIcon({ src }: { src: string }) {
  const mask = `url("${src}") center / contain no-repeat`;
  return (
    <span aria-hidden className="size-6 shrink-0 bg-current" style={{ mask, WebkitMask: mask }} />
  );
}

/** A titled group of links in a `DashboardSidebar`. */
export type NavGroup = { label: string; items: NavItem[] };

/**
 * A hospital dashboard's navigation: the logo (linking `home`), `groups` of links, then Help &
 * Support (`help`) and Log-out. On phones it opens as a sheet.
 */
export function DashboardSidebar({
  home,
  groups,
  help,
}: {
  home: LinkProps["to"];
  groups: NavGroup[];
  help: LinkProps["to"];
}) {
  const matchRoute = useMatchRoute();
  const { setOpenMobile } = useSidebar();
  const logOut = useLogOut();

  function renderItem({ to, label, icon, badge }: NavItem) {
    // The dashboard home is the parent of every other page, so only match it exactly.
    const active = !!matchRoute({ to, fuzzy: to !== home });
    return (
      <SidebarMenuItem key={label}>
        <SidebarMenuButton asChild isActive={active} className={itemClass}>
          <Link to={to} onClick={() => setOpenMobile(false)}>
            <NavIcon src={icon} />
            <span className="flex-1">{label}</span>
            {!!badge && (
              <>
                <span
                  aria-hidden
                  className="grid size-5 place-content-center rounded-full bg-error-500 type-caption text-white"
                >
                  {badge}
                </span>
                <span className="sr-only">{badge} unread</span>
              </>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar className="border-r border-line">
      <SidebarHeader className="h-20 justify-center px-6">
        <Link to={home} className="flex items-center gap-2">
          <img src={logoUrl} alt="" width={32} height={30} />
          <span className="type-accent-h2 text-primary">DocuHealth</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 pt-4">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="mb-2 h-auto px-5 type-label text-fg-caption">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">{group.items.map(renderItem)}</SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 pb-6">
        <SidebarMenu className="gap-1">
          {renderItem({ to: help, label: "Help & Support", icon: helpIconUrl })}
          <SidebarMenuItem>
            <SidebarMenuButton className={itemClass} onClick={() => void logOut()}>
              <NavIcon src={logoutIconUrl} />
              <span>Log-out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
