import { cache } from "react";

import {
  Prisma,
  ProviderType,
  SpecialtyFor
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  clampPublicSearchQuery,
  searchTokenVariants,
  tokenizeSearch
} from "@/lib/search";

export type SearchParams = Record<
  string,
  string | string[] | undefined
>;

export type PublicPageOptions = {
  cursor?: string | null;
  take?: number;
};

const DEFAULT_PUBLIC_PAGE_SIZE = 9;
const MAX_PUBLIC_PAGE_SIZE = 24;

type ProviderCursor = {
  id: string;
};

function encodeProviderCursor(id: string) {
  return Buffer.from(
    JSON.stringify({ v: 1, i: id })
  ).toString("base64url");
}

function decodeProviderCursor(
  value?: string | null
): ProviderCursor | null {
  if (!value || value.length > 512) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as { v?: unknown; i?: unknown };

    if (
      parsed.v !== 1 ||
      typeof parsed.i !== "string" ||
      !parsed.i ||
      parsed.i.length > 191
    ) {
      return null;
    }

    return { id: parsed.i };
  } catch {
    return null;
  }
}

function scalar(
  value: string | string[] | undefined
) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePageSize(take?: number) {
  if (!Number.isSafeInteger(take)) {
    return DEFAULT_PUBLIC_PAGE_SIZE;
  }

  return Math.min(
    Math.max(take as number, 1),
    MAX_PUBLIC_PAGE_SIZE
  );
}

function cursorFromParams(params: SearchParams) {
  const cursor = scalar(params.cursor)?.trim();

  if (!cursor || cursor.length > 512) {
    return null;
  }

  return cursor;
}

function specialtyTypesForProvider(
  type: ProviderType
): SpecialtyFor[] {
  if (type === "COSMETIC_DOCTOR") {
    return ["COSMETIC_DOCTOR"];
  }

  return type === "DOCTOR" ? ["DOCTOR"] : [];
}

function publicProviderWhere(
  type: ProviderType
): Prisma.ProviderWhereInput {
  const where: Prisma.ProviderWhereInput = {
    type,
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    }
  };

  if (type === "DENTIST") {
    return where;
  }

  return {
    ...where,
    specialty: {
      isActive: true,
      forType: type
    }
  };
}

function publicAnyProviderWhere(): Prisma.ProviderWhereInput {
  return {
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    },
    OR: [
      {
        type: "DOCTOR",
        specialty: {
          isActive: true,
          forType: "DOCTOR"
        }
      },
      {
        type: "DENTIST"
      },
      {
        type: "COSMETIC_DOCTOR",
        specialty: {
          isActive: true,
          forType: "COSMETIC_DOCTOR"
        }
      }
    ]
  };
}

function placeTokenClauses(
  query?: string
): Array<{
  OR: Array<Record<string, unknown>>;
}> | undefined {
  const tokens = tokenizeSearch(query);

  if (!tokens.length) return undefined;

  return tokens.map((token) => {
    const matches: Array<Record<string, unknown>> = [];

    for (const variant of searchTokenVariants(token)) {
      matches.push(
        { name: { contains: variant, mode: "insensitive" } },
        { bio: { contains: variant, mode: "insensitive" } },
        { services: { contains: variant, mode: "insensitive" } },
        { address: { contains: variant, mode: "insensitive" } },
        {
          governorate: {
            name: { contains: variant, mode: "insensitive" }
          }
        },
        {
          area: {
            name: { contains: variant, mode: "insensitive" }
          }
        }
      );
    }

    return { OR: matches };
  });
}

function publicPharmacyWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.PharmacyWhereInput {
  return {
    status: "ACTIVE",
    governorate: { isActive: true },
    area: { isActive: true },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    isFeatured: filters.featuredOnly ? true : undefined,
    AND: placeTokenClauses(filters.q) as Prisma.PharmacyWhereInput[] | undefined
  };
}

function publicLabWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.LabWhereInput {
  return {
    status: "ACTIVE",
    governorate: { isActive: true },
    area: { isActive: true },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    isFeatured: filters.featuredOnly ? true : undefined,
    AND: placeTokenClauses(filters.q) as Prisma.LabWhereInput[] | undefined
  };
}

function publicCosmeticCenterWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.CosmeticCenterWhereInput {
  return {
    status: "ACTIVE",
    governorate: { isActive: true },
    area: { isActive: true },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    isFeatured: filters.featuredOnly ? true : undefined,
    AND: placeTokenClauses(filters.q) as Prisma.CosmeticCenterWhereInput[] | undefined
  };
}

export function readFilters(
  params: SearchParams = {}
) {
  const featuredOnlyValue = scalar(
    params.featuredOnly
  )
    ?.trim()
    .toLowerCase();

  const readId = (value: string | string[] | undefined) => {
    const item = scalar(value)?.trim();
    return item && item.length <= 191 ? item : undefined;
  };

  return {
    q: clampPublicSearchQuery(scalar(params.q), 120),
    governorateId: readId(params.governorateId),
    areaId: readId(params.areaId),
    specialtyId: readId(params.specialtyId),
    featuredOnly:
      featuredOnlyValue === "true" ||
      featuredOnlyValue === "1"
  };
}

export async function getFilterOptions(
  forType?: ProviderType
) {
  const specialtyFor:
    | SpecialtyFor[]
    | undefined = forType
    ? specialtyTypesForProvider(forType)
    : undefined;

  const [governorates, areas, specialties] =
    await Promise.all([
      prisma.governorate.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { sortOrder: "asc" },
          { name: "asc" }
        ]
      }),

      prisma.area.findMany({
        where: {
          isActive: true,
          governorate: {
            isActive: true
          }
        },
        include: {
          governorate: true
        },
        orderBy: [
          {
            governorate: {
              sortOrder: "asc"
            }
          },
          { sortOrder: "asc" },
          { name: "asc" }
        ]
      }),

      prisma.specialty.findMany({
        where: {
          isActive: true,
          forType: specialtyFor
            ? {
                in: specialtyFor
              }
            : undefined
        },
        orderBy: [{ name: "asc" }]
      })
    ]);

  return {
    governorates,
    areas,
    specialties
  };
}

export async function getHomeSearchOptions() {
  const [governorates, specialties] = await Promise.all([
    prisma.governorate.findMany({
      where: {
        isActive: true,
        providers: {
          some: {
            type: "DOCTOR",
            status: "ACTIVE",
            specialty: {
              isActive: true,
              forType: "DOCTOR"
            }
          }
        }
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true }
    }),
    prisma.specialty.findMany({
      where: {
        isActive: true,
        forType: "DOCTOR",
        providers: {
          some: {
            type: "DOCTOR",
            status: "ACTIVE"
          }
        }
      },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true }
    })
  ]);

  return { governorates, specialties };
}

export async function searchProvidersPage(
  type: ProviderType,
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeProviderCursor(
    options.cursor ?? cursorFromParams(params)
  );

  const where: Prisma.ProviderWhereInput =
    publicProviderWhere(type);

  if (filters.governorateId) {
    where.governorateId = filters.governorateId;
  }

  if (filters.areaId) {
    where.areaId = filters.areaId;
  }

  if (type !== "DENTIST" && filters.specialtyId) {
    where.specialtyId = filters.specialtyId;
  }

  if (filters.featuredOnly) {
    where.isFeatured = true;
  }

  const tokens = tokenizeSearch(filters.q);

  if (tokens.length) {
    const tokenClauses: Prisma.ProviderWhereInput[] =
      tokens.map((token) => {
        const variants = searchTokenVariants(token);
        const matches: Prisma.ProviderWhereInput[] = [];

        for (const variant of variants) {
          matches.push(
            { name: { contains: variant, mode: "insensitive" } },
            { bio: { contains: variant, mode: "insensitive" } },
            { address: { contains: variant, mode: "insensitive" } },
            { governorate: { name: { contains: variant, mode: "insensitive" } } },
            { area: { name: { contains: variant, mode: "insensitive" } } }
          );

          if (type !== "DENTIST") {
            matches.push({
              specialty: {
                name: { contains: variant, mode: "insensitive" }
              }
            });
          }
        }

        return { OR: matches };
      });

    where.AND = tokenClauses;
  }

  const orderBy: Prisma.ProviderOrderByWithRelationInput[] = [
    { lastVerifiedAt: { sort: "desc", nulls: "last" } },
    { updatedAt: "desc" },
    { id: "desc" }
  ];

  const [rows, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      include: {
        specialty: true,
        governorate: true,
        area: true
      },
      orderBy,
      cursor: cursor ? { id: cursor.id } : undefined,
      skip: cursor ? 1 : 0,
      take: take + 1
    }),
    prisma.provider.count({ where })
  ]);

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    total,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? encodeProviderCursor(lastItem.id)
        : null
  };
}

export async function searchProviders(
  type: ProviderType,
  params: SearchParams = {},
  take = 24
) {
  const page = await searchProvidersPage(
    type,
    params,
    {
      take
    }
  );

  return page.items;
}

export async function getHomeData() {
  const counts = await Promise.all([
    prisma.provider.count({
      where: publicProviderWhere("DOCTOR")
    }),
    prisma.provider.count({
      where: publicProviderWhere("DENTIST")
    }),
    prisma.provider.count({
      where: publicProviderWhere("COSMETIC_DOCTOR")
    }),
    prisma.pharmacy.count({
      where: {
        status: "ACTIVE",
        governorate: { isActive: true },
        area: { isActive: true }
      }
    }),
    prisma.lab.count({
      where: {
        status: "ACTIVE",
        governorate: { isActive: true },
        area: { isActive: true }
      }
    }),
    prisma.cosmeticCenter.count({
      where: {
        status: "ACTIVE",
        governorate: { isActive: true },
        area: { isActive: true }
      }
    })
  ]);

  return {
    counts: {
      doctors: counts[0],
      dentists: counts[1],
      cosmeticDoctors: counts[2],
      pharmacies: counts[3],
      labs: counts[4],
      cosmeticCenters: counts[5]
    }
  };
}

export const getProviderBySlug = cache(async (
  slug: string
) => {
  return prisma.provider.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      },
      OR: [
        {
          type: "DOCTOR",
          specialty: {
            isActive: true,
            forType: "DOCTOR"
          }
        },
        {
          type: "DENTIST"
        }
      ]
    },
    include: {
      specialty: true,
      governorate: true,
      area: true,
      offers: {
        where: activeOfferWhere(),
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });
});

export const getCosmeticDoctorBySlug = cache(async (
  slug: string
) => {
  return prisma.provider.findFirst({
    where: {
      slug,
      type: "COSMETIC_DOCTOR",
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      },
      specialty: {
        isActive: true,
        forType: "COSMETIC_DOCTOR"
      }
    },
    include: {
      specialty: true,
      governorate: true,
      area: true,
      offers: {
        where: activeOfferWhere(),
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });
});

export function activeOfferWhere():
  Prisma.OfferWhereInput {
  const now = new Date();

  return {
    isActive: true,
    AND: [
      {
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } }
        ]
      },
      {
        OR: [
          { endsAt: null },
          { endsAt: { gte: now } }
        ]
      }
    ]
  };
}

export async function getOffers() {
  return prisma.offer.findMany({
    where: {
      AND: [
        activeOfferWhere(),
        {
          OR: [
            {
              providerId: null
            },
            {
              provider: {
                is: publicAnyProviderWhere()
              }
            }
          ]
        }
      ]
    },
    include: {
      provider: {
        include: {
          specialty: true,
          governorate: true,
          area: true
        }
      }
    },
    orderBy: [
      { endsAt: "asc" },
      { updatedAt: "desc" }
    ]
  });
}

export async function getPublicPharmaciesPage(
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeProviderCursor(options.cursor ?? cursorFromParams(params));
  const where = publicPharmacyWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.pharmacy.findMany({
      where,
      include: { governorate: true, area: true },
      orderBy: [
        { lastVerifiedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
        { id: "desc" }
      ],
      cursor: cursor ? { id: cursor.id } : undefined,
      skip: cursor ? 1 : 0,
      take: take + 1
    }),
    prisma.pharmacy.count({ where })
  ]);

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    total,
    hasMore,
    nextCursor: hasMore && lastItem ? encodeProviderCursor(lastItem.id) : null
  };
}

export async function getPublicPharmacies(
  params: SearchParams = {},
  take = 24
) {
  return (await getPublicPharmaciesPage(params, { take })).items;
}

export async function getPublicLabsPage(
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeProviderCursor(options.cursor ?? cursorFromParams(params));
  const where = publicLabWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.lab.findMany({
      where,
      include: { governorate: true, area: true },
      orderBy: [
        { lastVerifiedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
        { id: "desc" }
      ],
      cursor: cursor ? { id: cursor.id } : undefined,
      skip: cursor ? 1 : 0,
      take: take + 1
    }),
    prisma.lab.count({ where })
  ]);

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    total,
    hasMore,
    nextCursor: hasMore && lastItem ? encodeProviderCursor(lastItem.id) : null
  };
}

export async function getPublicLabs(
  params: SearchParams = {},
  take = 24
) {
  return (await getPublicLabsPage(params, { take })).items;
}

export async function getPublicCosmeticCentersPage(
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeProviderCursor(options.cursor ?? cursorFromParams(params));
  const where = publicCosmeticCenterWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.cosmeticCenter.findMany({
      where,
      include: { governorate: true, area: true },
      orderBy: [
        { lastVerifiedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
        { id: "desc" }
      ],
      cursor: cursor ? { id: cursor.id } : undefined,
      skip: cursor ? 1 : 0,
      take: take + 1
    }),
    prisma.cosmeticCenter.count({ where })
  ]);

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    total,
    hasMore,
    nextCursor: hasMore && lastItem ? encodeProviderCursor(lastItem.id) : null
  };
}

export async function getPublicCosmeticCenters(
  params: SearchParams = {},
  take = 24
) {
  return (await getPublicCosmeticCentersPage(params, { take })).items;
}

export const getPublicPharmacyBySlug = cache(async (
  slug: string
) => {
  return prisma.pharmacy.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      }
    },
    include: {
      governorate: true,
      area: true
    }
  });
});

export const getPublicLabBySlug = cache(async (
  slug: string
) => {
  return prisma.lab.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      }
    },
    include: {
      governorate: true,
      area: true
    }
  });
});

export const getPublicCosmeticCenterBySlug = cache(async (
  slug: string
) => {
  return prisma.cosmeticCenter.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      }
    },
    include: {
      governorate: true,
      area: true
    }
  });
});

export async function incrementPharmacyInquiryCount(
  slug: string
) {
  return prisma.pharmacy.updateMany({
    where: {
      slug,
      status: "ACTIVE"
    },
    data: {
      inquiryCount: {
        increment: 1
      }
    }
  });
}

export async function incrementLabInquiryCount(
  slug: string
) {
  return prisma.lab.updateMany({
    where: {
      slug,
      status: "ACTIVE"
    },
    data: {
      inquiryCount: {
        increment: 1
      }
    }
  });
}

export async function incrementCosmeticCenterInquiryCount(
  slug: string
) {
  return prisma.cosmeticCenter.updateMany({
    where: {
      slug,
      status: "ACTIVE"
    },
    data: {
      inquiryCount: {
        increment: 1
      }
    }
  });
}
