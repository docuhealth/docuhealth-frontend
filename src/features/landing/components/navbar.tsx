import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CaretDownIcon, CaretRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { cn } from "@/lib/utils";

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Our Mission", href: "#about" },
  { label: "Careers", href: "#careers" },
] as const;

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#contact" },
  { label: "Blog", href: "#news" },
] as const;

function Logo() {
  return (
    <>
      <img src={logoUrl} alt="" width={40} height={38} className="h-8 w-auto lg:h-9.5" />
      <span className="type-accent-h2 text-primary lg:type-accent-h1">DocuHealth</span>
    </>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pendingHash = useRef<string | null>(null);

  // The open sheet locks page scrolling, so a link's jump is lost if the browser follows it right
  // away. Close first, then go once the sheet has unmounted and released the lock.
  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    pendingHash.current = event.currentTarget.hash;
    setOpen(false);
  }

  function handleCloseAutoFocus(event: Event) {
    const hash = pendingHash.current;
    if (!hash) return;
    pendingHash.current = null;

    // Leave focus at the destination, not back on the menu button at the top of the page.
    event.preventDefault();
    requestAnimationFrame(() => {
      const target = document.querySelector(hash);
      if (!target) return;
      target.scrollIntoView();
      window.location.hash = hash;
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-mr-2.5 size-11 lg:hidden" aria-label="Open menu">
          <ListIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        onCloseAutoFocus={handleCloseAutoFocus}
        className="h-dvh gap-0 data-[side=right]:w-full"
      >
        {/* Lines up with the page's bar, so the close button replaces the menu button in place. */}
        <div className="flex shrink-0 items-center justify-between gap-6 border-b border-line px-4 py-2.5">
          <SheetTitle className="flex items-center gap-2.5">
            <Logo />
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" className="-mr-2.5 size-11" aria-label="Close menu">
              <XIcon className="size-6" />
            </Button>
          </SheetClose>
        </div>

        <nav aria-label="Mobile" className="min-h-0 flex-1 overflow-y-auto px-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="company" className="py-0 first:border-t-0">
              <AccordionTrigger className="min-h-14 py-0 type-title-sm">
                Our Company
              </AccordionTrigger>
              <AccordionContent className="flex flex-col pt-0 pb-2">
                {companyLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex min-h-11 items-center type-body text-fg-body transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className="flex min-h-14 items-center border-b border-line type-title-sm text-fg-heading transition-colors last:border-b-0 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-line p-4">
          <SheetClose asChild>
            <Button asChild variant="outline" className="h-12.5 rounded-md bg-card text-fg-heading">
              <Link to="/login">Log in</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild className="h-12.5 gap-2.5 rounded-md">
              <Link to="/register">
                Get Started
                <CaretRightIcon data-icon="inline-end" className="size-3.5" />
              </Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-background transition-colors",
        scrolled && "border-line",
      )}
    >
      <LandingContainer className="flex items-center justify-between gap-6 py-2.5 lg:py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          <nav aria-label="Main" className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-3 type-body-sm-tight text-fg-heading transition-colors outline-none hover:text-primary">
                Our Company
                <CaretDownIcon className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="min-w-52 p-1.5 shadow-lg"
              >
                {companyLinks.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a
                      href={item.href}
                      className="cursor-pointer px-3 py-2.5 type-body-sm-regular transition-colors focus:bg-primary/5 focus:text-primary"
                    >
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

          <Button asChild className="h-10.5 gap-2.5 rounded-md px-3.5">
            <Link to="/register">
              Get Started
              <CaretRightIcon data-icon="inline-end" className="size-3.5" />
            </Link>
          </Button>
        </div>

        <MobileNav />
      </LandingContainer>
    </header>
  );
}
