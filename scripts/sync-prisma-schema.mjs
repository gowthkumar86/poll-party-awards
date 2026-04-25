import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const templatePath = path.join(ROOT, "prisma", "schema.template.prisma");
const outputPath = path.join(ROOT, "prisma", "schema.prisma");

const provider = (process.env.DB_PROVIDER ?? "sqlite").trim().toLowerCase();
const allowedProviders = new Set(["sqlite", "postgresql"]);

if (!allowedProviders.has(provider)) {
  throw new Error(
    `Unsupported DB_PROVIDER value "${provider}". Expected one of: ${Array.from(allowedProviders).join(", ")}`,
  );
}

const template = fs.readFileSync(templatePath, "utf8");
const resolvedSchema = template.replace("__DB_PROVIDER__", provider);
fs.writeFileSync(outputPath, resolvedSchema, "utf8");

console.log(`[prisma] schema synced with provider=${provider}`);
