// Saves the backend's OpenAPI schema to docs/api/, as the reference for every feature's api/
// folder: `npm run api:schema` (staging) or `API_URL=https://… npm run api:schema`.
// Writes openapi.json (the full schema) and endpoints.md (one line per endpoint, easy to grep).
import { mkdirSync, writeFileSync } from "node:fs";

const base = (process.env.API_URL ?? "https://api-staging.docuhealthservices.net").replace(
  /\/+$/,
  "",
);
const response = await fetch(`${base}/api/raw?format=json`, {
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  console.error(`Couldn't fetch the schema: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const schema = await response.json();

const methods = ["get", "post", "put", "patch", "delete"];
const lines = Object.entries(schema.paths).flatMap(([path, operations]) =>
  methods
    .filter((method) => operations[method])
    .map((method) => `| ${method.toUpperCase()} | \`${path}\` |`),
);

mkdirSync("docs/api", { recursive: true });
writeFileSync("docs/api/openapi.json", `${JSON.stringify(schema, null, 2)}\n`);
writeFileSync(
  "docs/api/endpoints.md",
  [
    `# API endpoints`,
    ``,
    `From \`${base}/api/raw\`, fetched ${new Date().toISOString().slice(0, 10)} by \`npm run api:schema\`.`,
    `Request and response shapes are in \`openapi.json\` (\`components.schemas\`).`,
    ``,
    `| Method | Path |`,
    `| --- | --- |`,
    ...lines,
    ``,
  ].join("\n"),
);
process.stdout.write(`Saved ${lines.length} endpoints to docs/api/.\n`);
