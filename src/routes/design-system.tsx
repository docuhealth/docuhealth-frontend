import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/design-system")({
  component: DesignSystemPage,
});

// Class names are written out in full so Tailwind generates them.
type Swatch = { name: string; token: string; className: string; usage?: string };

const colorGroups: { title: string; note?: string; swatches: Swatch[] }[] = [
  {
    title: "Brand",
    swatches: [
      {
        name: "Primary/Blue",
        token: "brand",
        className: "bg-brand",
        usage: "Buttons, links, focus",
      },
      {
        name: "Primary/blue-hover",
        token: "brand-hover",
        className: "bg-brand-hover",
        usage: "Hover",
      },
      {
        name: "Primary/blue-pressed",
        token: "brand-pressed",
        className: "bg-brand-pressed",
        usage: "Pressed",
      },
    ],
  },
  {
    title: "Neutral",
    swatches: [
      { name: "Text color", token: "fg-heading", className: "bg-fg-heading", usage: "Headings" },
      { name: "Body color", token: "fg-body", className: "bg-fg-body", usage: "Body text" },
      {
        name: "Caption",
        token: "fg-caption",
        className: "bg-fg-caption",
        usage: "Captions, hints",
      },
      { name: "Border color", token: "line", className: "bg-line", usage: "Borders, inputs" },
      { name: "BG color", token: "surface", className: "bg-surface", usage: "Page background" },
      { name: "White", token: "white", className: "bg-white", usage: "Cards, menus" },
    ],
  },
  {
    title: "Warning",
    note: "100 = tint background · 500 = main · 700 = text on the tint",
    swatches: [
      { name: "Warning-100", token: "warning-100", className: "bg-warning-100" },
      { name: "Warning-500", token: "warning-500", className: "bg-warning-500" },
      { name: "Warning-700", token: "warning-700", className: "bg-warning-700" },
    ],
  },
  {
    title: "Success",
    swatches: [
      { name: "Success-100", token: "success-100", className: "bg-success-100" },
      { name: "Success-500", token: "success-500", className: "bg-success-500" },
      { name: "Success-700", token: "success-700", className: "bg-success-700" },
    ],
  },
  {
    title: "Error",
    swatches: [
      { name: "Error-100", token: "error-100", className: "bg-error-100" },
      { name: "Error-500", token: "error-500", className: "bg-error-500", usage: "Destructive" },
      { name: "Error-700", token: "error-700", className: "bg-error-700" },
    ],
  },
  {
    title: "Information",
    swatches: [
      { name: "Information-100", token: "info-100", className: "bg-info-100" },
      { name: "Information-500", token: "info-500", className: "bg-info-500" },
      { name: "Information-700", token: "info-700", className: "bg-info-700" },
    ],
  },
];

const fonts = [
  {
    family: "Space Grotesk",
    className: "font-heading",
    usage: "Headings (Heading/H1, H2, Quote), card titles and all buttons",
  },
  {
    family: "Inter",
    className: "font-sans",
    usage: "Everything else: body text, accent headings, labels, links, inputs",
  },
];

const typeRoles = [
  { className: "type-h1", name: "Heading/H1", spec: "Space Grotesk · 64px / 110%" },
  { className: "type-h2", name: "Heading/H2", spec: "Space Grotesk · 48px / 110%" },
  { className: "type-quote", name: "Header/Quote", spec: "Space Grotesk · 32px / 125%" },
  { className: "type-accent-h1", name: "Accent/H1", spec: "Inter Semi Bold · 32px / 120% · -2.5%" },
  { className: "type-accent-h2", name: "Accent/H2", spec: "Inter Semi Bold · 24px / 135% · -2.5%" },
  { className: "type-accent-h3", name: "Accent/H3", spec: "Inter Semi Bold · 20px / 140% · -2.5%" },
  { className: "type-accent-h4", name: "Accent/H4", spec: "Inter Regular · 18px / 135%" },
  { className: "type-body", name: "Body/Medium", spec: "Inter Regular · 16px / 140% (default)" },
  { className: "type-body-sm", name: "Body/Small", spec: "Inter Medium · 14px / 150%" },
  { className: "type-caption", name: "Body/Caption", spec: "Inter Regular · 12px / 135%" },
  { className: "type-label", name: "Label", spec: "Inter Semi Bold · 12px / 135% · 8%, caps" },
];

const statusMessages = [
  { className: "bg-warning-100 text-warning-700", text: "Warning: lab result pending review" },
  { className: "bg-success-100 text-success-700", text: "Success: record saved" },
  { className: "bg-error-100 text-error-700", text: "Error: could not reach the server" },
  { className: "bg-info-100 text-info-700", text: "Info: your HIN is linked to your NIN" },
];

function cssVar(token: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  // The production CSS minifier shortens #eeeeee to #eee; show the design's 6-digit form.
  return /^#[0-9a-f]{3}$/i.test(value) ? value.replace(/[0-9a-f]/gi, (c) => c + c) : value;
}

function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 md:px-8">
      <title>Design system · DocuHealth</title>

      <header className="space-y-2">
        <p className="type-label text-fg-caption">DocuHealth</p>
        <h1 className="type-h2">Design system</h1>
        <p>
          Colors and typography from the design guides. Values are read live from{" "}
          <code className="type-body-sm">src/index.css</code>.{" "}
          <Link to="/" className="text-primary underline underline-offset-4">
            Back home
          </Link>
        </p>
      </header>

      <section className="space-y-10">
        <h2 className="type-accent-h1">Color</h2>
        {colorGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div>
              <h3 className="type-accent-h3">{group.title}</h3>
              {group.note && <p className="type-caption text-fg-caption">{group.note}</p>}
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {group.swatches.map((swatch) => (
                <li key={swatch.token} className="space-y-2">
                  <div className={`h-20 rounded-xl border border-line ${swatch.className}`} />
                  <div>
                    <p className="type-body-sm text-fg-heading">{swatch.name}</p>
                    <p className="type-caption text-fg-caption uppercase">{cssVar(swatch.token)}</p>
                    <p className="type-caption text-fg-caption">
                      {swatch.className.replace("bg-", "")}
                      {swatch.usage && ` · ${swatch.usage}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <h2 className="type-accent-h1">Typography</h2>

        <ul className="grid gap-4 md:grid-cols-2">
          {fonts.map((font) => (
            <li key={font.family} className="space-y-3 rounded-xl border border-line bg-white p-6">
              <p className={`${font.className} text-5xl font-semibold text-fg-heading`}>Aa</p>
              <p className="type-accent-h3 text-fg-heading">{font.family}</p>
              <p className="type-body-sm">{font.usage}</p>
              <p className="type-caption text-fg-caption">{font.className}</p>
            </li>
          ))}
        </ul>

        <ul className="divide-y divide-line border-y border-line">
          {typeRoles.map((role) => (
            <li
              key={role.className}
              className="grid gap-2 py-5 md:grid-cols-[220px_1fr] md:items-baseline"
            >
              <div>
                <p className="type-body-sm text-fg-heading">{role.name}</p>
                <p className="type-caption text-fg-caption">{role.spec}</p>
                <p className="type-caption text-fg-caption">{role.className}</p>
              </div>
              <p className={`${role.className} text-fg-heading`}>Lorem ipsum dolor sit</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="type-accent-h1">In use</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {statusMessages.map((message) => (
            <li
              key={message.text}
              className={`rounded-lg px-4 py-3 type-body-sm ${message.className}`}
            >
              {message.text}
            </li>
          ))}
        </ul>
        <div className="grid max-w-md gap-3">
          <Input placeholder="Input with placeholder" />
          <Input aria-invalid placeholder="Invalid input" />
        </div>
      </section>
    </main>
  );
}
