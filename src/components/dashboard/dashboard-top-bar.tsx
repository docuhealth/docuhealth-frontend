import { ArrowLeftIcon, BellIcon, GearSixIcon, ListIcon, SignOutIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { toast } from "sonner";
import hospitalIconUrl from "@/assets/svgs/hospital-01.svg";
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
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { useLogOut } from "@/hooks/use-log-out";

/**
 * A hospital dashboard's top bar: the hospital's name (or, on a profile page, `back` to its
 * list), notifications and the signed-in person's account menu.
 */
export function DashboardTopBar({
  hospitalName,
  user,
  unreadNotifications,
  back,
  settings,
}: {
  hospitalName: string;
  user: { name: string; email: string; avatarUrl: string | null };
  unreadNotifications: number;
  back?: { to: LinkProps["to"]; label: string };
  /** Where the account menu's Settings goes. */
  settings: LinkProps["to"];
}) {
  const logOut = useLogOut();
  const { toggleSidebar } = useSidebar();

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
      {/* A profile swaps the hospital name for a way back to its list. */}
      {back ? (
        <Link
          to={back.to}
          className="flex min-w-0 items-center gap-2 rounded-md type-body-sm-medium text-fg-caption hover:text-fg-heading"
        >
          <ArrowLeftIcon className="size-5 shrink-0" />
          <span className="truncate">{back.label}</span>
        </Link>
      ) : (
        <>
          <img src={hospitalIconUrl} alt="" width={20} height={20} className="shrink-0" />
          <p className="truncate type-body-sm-medium text-fg-heading">{hospitalName}</p>
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-6 rounded-full"
          aria-label={`Notifications, ${unreadNotifications} unread`}
          // TODO(design): open the notifications panel once it's designed.
          onClick={() => toast.info("Notifications aren’t built yet.")}
        >
          <BellIcon className="size-6" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1.5 -right-1.5 grid size-4 place-content-center rounded-full bg-error-500 type-caption text-white">
              {unreadNotifications}
            </span>
          )}
        </Button>
        <Separator orientation="vertical" className="h-5! bg-divider" />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full" aria-label="Account menu">
            <PersonAvatar name={user.name} src={user.avatarUrl} size="sm" online />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col">
              <span className="type-body-sm text-fg-heading">{user.name}</span>
              <span className="truncate type-caption text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={settings}>
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
