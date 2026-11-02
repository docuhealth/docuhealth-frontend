import { describe, expect, it } from "vitest";
import { sectionRewrite } from "@/lib/sections";

const input = (href: string) => String(sectionRewrite.input?.({ url: new URL(href) }) ?? href);
const output = (href: string) => String(sectionRewrite.output?.({ url: new URL(href) }) ?? href);

describe("section rewrite", () => {
  it("maps a section subdomain onto its path prefix", () => {
    expect(input("http://hospital.localhost:5173/register")).toBe(
      "http://hospital.localhost:5173/hospital/register",
    );
    expect(input("http://agent.localhost:5173/")).toBe("http://agent.localhost:5173/agent");
  });

  it("leaves the main site and unknown subdomains alone", () => {
    expect(input("http://localhost:5173/login")).toBe("http://localhost:5173/login");
    expect(input("http://www.localhost:5173/login")).toBe("http://www.localhost:5173/login");
  });

  it("strips the prefix for links within a section", () => {
    expect(output("http://hospital.localhost:5173/hospital/verify?token=1")).toBe(
      "http://hospital.localhost:5173/verify?token=1",
    );
  });

  it("sends links to another section to that section's subdomain", () => {
    expect(output("http://localhost:5173/hospital/register")).toBe(
      "http://hospital.localhost:5173/register",
    );
    expect(output("http://hospital.localhost:5173/register?type=individual")).toBe(
      "http://localhost:5173/register?type=individual",
    );
    expect(output("http://agent.localhost:5173/hospital")).toBe("http://hospital.localhost:5173/");
  });

  it("doesn't touch hosts outside the root domain (e.g. preview deploys)", () => {
    expect(input("https://docuhealth-v2-git-x.vercel.app/hospital/register")).toBe(
      "https://docuhealth-v2-git-x.vercel.app/hospital/register",
    );
    expect(output("https://docuhealth-v2-git-x.vercel.app/hospital/register")).toBe(
      "https://docuhealth-v2-git-x.vercel.app/hospital/register",
    );
  });
});
