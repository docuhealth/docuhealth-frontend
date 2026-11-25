import {
  BellIcon,
  CaretLeftIcon,
  GearSixIcon,
  ListIcon,
  MagnifyingGlassIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
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
import type { PageHeadingValue } from "@/features/patient/components/page-heading";
import { notYet } from "@/features/patient/lib/not-yet";
import { useLogOut } from "@/hooks/use-log-out";

/**
 * The patient's top bar: a back arrow on record pages, the page's title over a line (their HIN,
 * counts, or where back goes); search; notifications; and the account menu.
 */
export function PatientTopBar({ heading, name }: { heading: PageHeadingValue; name: string }) {
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
      {heading.back && (
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to={heading.back.to} params={heading.back.params} aria-label={heading.back.label}>
            <CaretLeftIcon className="size-5" />
          </Link>
        </Button>
      )}
      <div className="flex min-w-0 flex-col">
        <p className="truncate type-title-sm text-fg-heading">{heading.title}</p>
        {/* A list page keeps its counts under the title; a detail page says where back goes. */}
        {(heading.subtitle ?? heading.back?.label) && (
          <p className="truncate type-caption text-fg-caption">
            {heading.subtitle ?? heading.back?.label}
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
