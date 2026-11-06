import { CaretDownIcon, CaretRightIcon, ListIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Our Mission", href: "#mission" },
  { label: "Careers", href: "#careers" },
] as const;

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#contact" },
  { label: "Blog", href: "#blog" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" width={36} height={34} />
          <span className="type-accent-h2 text-primary">DocuHealth</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          <nav aria-label="Main" className="flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 type-body-sm-tight text-fg-heading transition-colors outline-none hover:text-primary">
                Our Company
                <CaretDownIcon className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-60">
                {companyLinks.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a href={item.href} className="cursor-pointer py-2 type-body-sm-regular">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="type-body-sm-tight text-fg-heading transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button asChild className="h-11 px-5">
            <Link to="/register">
              Get Started
              <CaretRightIcon data-icon="inline-end" className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Open menu">
              <ListIcon className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col justify-between p-6">
            <div className="flex flex-col gap-6">
              <SheetHeader className="p-0">
                <SheetTitle className="flex items-center gap-2">
                  <img src={logoUrl} alt="" width={28} height={26} />
                  <span className="type-accent-h3 text-primary">DocuHealth</span>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Mobile" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="type-label text-fg-caption">Our Company</p>
                  {companyLinks.map((item) => (
                    <SheetClose key={item.label} asChild>
                      <a
                        href={item.href}
                        className="py-1 type-body-sm text-fg-heading transition-colors hover:text-primary"
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </div>

                <div className="h-px bg-border" />

                {navLinks.map((item) => (
                  <SheetClose key={item.label} asChild>
                    <a
                      href={item.href}
                      className="py-1 type-body-sm text-fg-heading transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
            </div>

            <SheetClose asChild>
              <Button asChild className="h-11 w-full">
                <Link to="/register">
                  Get Started
                  <CaretRightIcon data-icon="inline-end" className="size-3.5" />
                </Link>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
