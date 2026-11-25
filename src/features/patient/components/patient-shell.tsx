import {
  BellIcon,
  CalendarBlankIcon,
  CaretLeftIcon,
  ChatTextIcon,
  GearSixIcon,
  HeartbeatIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  ListIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StethoscopeIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useLogOut } from "@/hooks/use-log-out";

/** The patient side's navigation. */
export function PatientSidebar() {
  const groups: NavGroup[] = [
    {
      label: "",
      items: [
        { to: "/patient", label: "Home", icon: HouseIcon },
        { to: "/patient/health", label: "Health", icon: HeartbeatIcon },
        { to: "/patient/appointments", label: "Appointments", icon: CalendarBlankIcon },
        // TODO(api): no unread count for patients' messages yet.
        { to: "/patient/messages", label: "Messages", icon: ChatTextIcon },
        { to: "/patient/bills", label: "Bills & payments", icon: ReceiptIcon },
      ],
    },
    {
      label: "Manage",
      items: [
        { to: "/patient/family", label: "Family & proxy", icon: UserIcon },
        { to: "/patient/sharing", label: "Sharing & privacy", icon: ShieldCheckIcon },
        { to: "/patient/personnel", label: "Health personnel", icon: StethoscopeIcon },
      ],
    },
  ];
  return (
    <DashboardSidebar
      home="/patient"
      groups={groups}
      help="/patient/help"
      footerItems={[{ to: "/patient/settings", label: "Settings", icon: GearSixIcon }]}
    />
  );
}

/** What the top bar shows for the current page: its title, a line under it, and a way back. */
type PageHeading = {
  title: string;
  subtitle?: string | null;
  back?: { to: LinkProps["to"]; label: string };
};

const HeadingContext = createContext<{ set: (heading: PageHeading) => void } | null>(null);

/** Holds the page heading the top bar shows; the patient layout wraps every page in it. */
export function PatientHeadingProvider({
  children,
  render,
}: {
  children: ReactNode;
  render: (heading: PageHeading) => ReactNode;
}) {
  const [heading, setHeading] = useState<PageHeading>({ title: "" });
  return (
    <HeadingContext value={{ set: setHeading }}>
      {render(heading)}
      {children}
    </HeadingContext>
  );
}

/** A page names itself in the top bar (and the browser tab). Renders nothing itself. */
export function PageHeading({ title, subtitle, back }: PageHeading) {
  const context = use(HeadingContext);
  const set = context?.set;
  const backTo = back?.to;
  const backLabel = back?.label;
  useEffect(() => {
    set?.({
      title,
      subtitle,
      back: backTo && backLabel ? { to: backTo, label: backLabel } : undefined,
    });
  }, [set, title, subtitle, backTo, backLabel]);
  return <title>{`${title} · DocuHealth`}</title>;
}

/**
 * The patient's top bar: the page's title over a line (their HIN, or counts), or a way back to
 * the list on a detail page; search; notifications; and the account menu.
 */
export function PatientTopBar({ heading, name }: { heading: PageHeading; name: string }) {
  const logOut = useLogOut();
  const { toggleSidebar } = useSidebar();
  const notYet = (what: string) => () => toast.info(`${what} isn’t available yet.`);

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-3 bg-card px-4 sm:px-8">
      <Button
        variant="ghost"
        size="icon-lg"
        className="-ml-2 md:hidden"
        aria-label="Open menu"
        onClick={toggleSidebar}
      >
        <ListIcon className="size-6" />
      </Button>
      {heading.back && (
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to={heading.back.to} aria-label={heading.back.label}>
            <CaretLeftIcon className="size-5" />
          </Link>
        </Button>
      )}
      <div className="flex min-w-0 flex-col">
        <p className="truncate type-title-sm text-fg-heading">{heading.title}</p>
        {(heading.back?.label ?? heading.subtitle) && (
          <p className="truncate type-caption text-fg-caption">
            {heading.back?.label ?? heading.subtitle}
          </p>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {/* TODO(api): no search across a patient's records yet. */}
        <button
          type="button"
          onClick={notYet("Search")}
          className="hidden h-10 w-64 items-center gap-2 rounded-full bg-surface px-4 type-body-sm-regular text-fg-caption ring-1 ring-line lg:flex"
        >
          <MagnifyingGlassIcon className="size-4" />
          Search DocuHealth
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full ring-1 ring-line"
          aria-label="Notifications"
          onClick={notYet("Notifications")}
        >
          <BellIcon className="size-5" />
        </Button>
        <Separator orientation="vertical" className="h-5! bg-divider" />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full" aria-label="Account menu">
            <PersonAvatar name={name} src={null} size="sm" online />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="type-body-sm text-fg-heading">{name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/patient/settings">
                <GearSixIcon />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void logOut()}>
              <SignOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
