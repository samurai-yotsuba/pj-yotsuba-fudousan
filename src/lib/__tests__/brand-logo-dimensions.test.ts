import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { groupLogoDimensions } from "@/config/group";

// CSS fixes the logo height and lets its width follow the intrinsic ratio.
// A wrong ratio reserves the wrong width before the PNG has decoded (CLS).
describe("brand logo layout reservation", () => {
  for (const [business, variants] of Object.entries(groupLogoDimensions)) {
    for (const [variant, dimensions] of Object.entries(variants)) {
      it(`${business} ${variant} reserves the actual PNG aspect ratio`, () => {
        const png = readFileSync(join(process.cwd(), `public/yotsuba/${business}-${variant}.png`));
        expect(png.subarray(1, 4).toString()).toBe("PNG");
        expect(dimensions).toEqual({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
      });
    }
  }
});
