// Keep the original WebP as the fallback. Regenerate only the home AVIF sources.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
const source = fileURLToPath(new URL("../public/hero/bunkyo-sakura-16x9.webp", import.meta.url));
for (const width of [420, 750, 828, 1200, 1600]) {
  const output = fileURLToPath(new URL(`../public/hero/bunkyo-sakura-${width}.avif`, import.meta.url));
  await sharp(source).resize({ width, withoutEnlargement: true }).avif({ quality: 50, effort: 6 }).toFile(output);
}
