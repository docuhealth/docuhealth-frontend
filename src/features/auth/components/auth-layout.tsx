import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import authImageUrl from "@/assets/images/auth-img.png";
import logoUrl from "@/assets/logos/logo.svg";

/**
 * Split screen for every auth page: logo and form on the left, photo on the right (desktop).
 * `headerAction` sits opposite the logo.
 */
export function AuthLayout({
  headerAction,
  children,
}: {
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="" width={32} height={30} />
            <span className="type-accent-h2 text-primary">DocuHealth</span>
          </Link>
          {headerAction}
        </header>

        <div className="mx-auto w-full max-w-115 py-14 xl:mx-0 xl:ml-17 2xl:mx-auto">
          {children}
        </div>
      </main>

      <div className="sticky top-0 hidden h-svh lg:block lg:w-[52%]">
        <img src={authImageUrl} alt="" className="size-full object-cover object-top" />
      </div>
    </div>
  );
}
