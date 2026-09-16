import { describe, expect, it } from "vitest";
import { listPageMetadata } from "@/lib/list-metadata";

describe("directory indexing", () => {
  const base = { title: "الأطباء", alternates: { canonical: "/doctors" } };
  it("keeps the main directory indexable", () => {
    expect(listPageMetadata(base, {})).toEqual(base);
  });
  it.each(["q", "areaId", "governorateId", "specialtyId", "cursor", "featuredOnly"])("noindexes %s without blocking links", (key) => {
    expect(listPageMetadata(base, { [key]: "value" })).toMatchObject({ robots: { index: false, follow: true }, alternates: base.alternates });
  });
});
