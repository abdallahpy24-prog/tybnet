import {
  Prisma,
  ProviderType,
  SpecialtyFor
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

type RankedCursor = {
  score: number;
  updatedAt: Date;
  id: string;
};

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

function encodeRankedCursor(
  score: number,
  updatedAt: Date,
  id: string
) {
  return Buffer.from(
    JSON.stringify({
      v: 1,
      s: score,
      u: updatedAt.toISOString(),
      i: id
    })
  ).toString("base64url");
}

function decodeRankedCursor(
  value?: string | null
): RankedCursor | null {
  if (!value || value.length > 512) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as {
      v?: unknown;
      s?: unknown;
      u?: unknown;
      i?: unknown;
    };

    if (
      parsed.v !== 1 ||
      typeof parsed.s !== "number" ||
      !Number.isSafeInteger(parsed.s) ||
      parsed.s < 0 ||
      typeof parsed.u !== "string" ||
      typeof parsed.i !== "string" ||
      !parsed.i ||
      parsed.i.length > 191
    ) {
      return null;
    }

    const updatedAt = new Date(parsed.u);

    if (Number.isNaN(updatedAt.getTime())) {
      return null;
    }

    return {
      score: parsed.s,
      updatedAt,
      id: parsed.i
    };
  } catch {
    return null;
  }
}

function buildRankedPage<
  Row extends {
    id: string;
    updatedAt: Date;
  }
>(
  rows: Row[],
  take: number,
  score: (row: Row) => number
) {
  const hasMore = rows.length > take;
  const items = hasMore
    ? rows.slice(0, take)
    : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? encodeRankedCursor(
            score(lastItem),
            lastItem.updatedAt,
            lastItem.id
          )
        : null
  };
}

function providerAfterCursor(
  cursor: RankedCursor
): Prisma.ProviderWhereInput {
  return {
    OR: [
      {
        bookingPoints: {
          lt: cursor.score
        }
      },
      {
        bookingPoints: cursor.score,
        updatedAt: {
          lt: cursor.updatedAt
        }
      },
      {
        bookingPoints: cursor.score,
        updatedAt: cursor.updatedAt,
        id: {
          lt: cursor.id
        }
      }
    ]
  };
}

function pharmacyAfterCursor(
  cursor: RankedCursor
): Prisma.PharmacyWhereInput {
  return {
    OR: [
      {
        inquiryCount: {
          lt: cursor.score
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: {
          lt: cursor.updatedAt
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: cursor.updatedAt,
        id: {
          lt: cursor.id
        }
      }
    ]
  };
}

function labAfterCursor(
  cursor: RankedCursor
): Prisma.LabWhereInput {
  return {
    OR: [
      {
        inquiryCount: {
          lt: cursor.score
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: {
          lt: cursor.updatedAt
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: cursor.updatedAt,
        id: {
          lt: cursor.id
        }
      }
    ]
  };
}

function cosmeticCenterAfterCursor(
  cursor: RankedCursor
): Prisma.CosmeticCenterWhereInput {
  return {
    OR: [
      {
        inquiryCount: {
          lt: cursor.score
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: {
          lt: cursor.updatedAt
        }
      },
      {
        inquiryCount: cursor.score,
        updatedAt: cursor.updatedAt,
        id: {
          lt: cursor.id
        }
      }
    ]
  };
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

function publicPharmacyWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.PharmacyWhereInput {
  return {
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    OR: filters.q
      ? [
          {
            name: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            bio: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            services: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            address: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            governorate: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          },
          {
            area: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          }
        ]
      : undefined
  };
}

function publicLabWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.LabWhereInput {
  return {
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    OR: filters.q
      ? [
          {
            name: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            bio: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            services: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            address: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            governorate: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          },
          {
            area: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          }
        ]
      : undefined
  };
}

function publicCosmeticCenterWhere(
  filters: ReturnType<typeof readFilters>
): Prisma.CosmeticCenterWhereInput {
  return {
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    },
    governorateId: filters.governorateId,
    areaId: filters.areaId,
    OR: filters.q
      ? [
          {
            name: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            bio: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            services: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            address: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            governorate: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          },
          {
            area: {
              name: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          }
        ]
      : undefined
  };
}

export function readFilters(
  params: SearchParams = {}
) {
  return {
    q: scalar(params.q)?.trim() || undefined,
    governorateId:
      scalar(params.governorateId) || undefined,
    areaId: scalar(params.areaId) || undefined,
    specialtyId:
      scalar(params.specialtyId) || undefined
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

export async function searchProvidersPage(
  type: ProviderType,
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeRankedCursor(
    options.cursor ?? cursorFromParams(params)
  );

  const where: Prisma.ProviderWhereInput =
    publicProviderWhere(type);

  if (filters.governorateId) {
    where.governorateId =
      filters.governorateId;
  }

  if (filters.areaId) {
    where.areaId = filters.areaId;
  }

  if (type !== "DENTIST" && filters.specialtyId) {
    where.specialtyId = filters.specialtyId;
  }

  if (filters.q) {
    const textSearch: Prisma.ProviderWhereInput[] = [
      {
        name: {
          contains: filters.q,
          mode: "insensitive"
        }
      },
      {
        bio: {
          contains: filters.q,
          mode: "insensitive"
        }
      },
      {
        address: {
          contains: filters.q,
          mode: "insensitive"
        }
      },
      {
        governorate: {
          name: {
            contains: filters.q,
            mode: "insensitive"
          }
        }
      },
      {
        area: {
          name: {
            contains: filters.q,
            mode: "insensitive"
          }
        }
      }
    ];

    if (type !== "DENTIST") {
      textSearch.push({
        specialty: {
          name: {
            contains: filters.q,
            mode: "insensitive"
          }
        }
      });
    }

    where.OR = textSearch;
  }

  const rows = await prisma.provider.findMany({
    where: cursor
      ? {
          AND: [where, providerAfterCursor(cursor)]
        }
      : where,
    include: {
      specialty: true,
      governorate: true,
      area: true
    },
    orderBy: [
      { bookingPoints: "desc" },
      { updatedAt: "desc" },
      { id: "desc" }
    ],
    take: take + 1
  });

  return buildRankedPage(
    rows,
    take,
    (row) => row.bookingPoints
  );
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
  const [counts, featured] =
    await Promise.all([
      Promise.all([
        prisma.provider.count({
          where:
            publicProviderWhere("DOCTOR")
        }),

        prisma.provider.count({
          where:
            publicProviderWhere("DENTIST")
        }),

        prisma.provider.count({
          where: publicProviderWhere(
            "COSMETIC_DOCTOR"
          )
        }),

        prisma.pharmacy.count({
          where: {
            status: "ACTIVE",
            governorate: {
              isActive: true
            },
            area: {
              isActive: true
            }
          }
        }),

        prisma.lab.count({
          where: {
            status: "ACTIVE",
            governorate: {
              isActive: true
            },
            area: {
              isActive: true
            }
          }
        }),

        prisma.cosmeticCenter.count({
          where: {
            status: "ACTIVE",
            governorate: {
              isActive: true
            },
            area: {
              isActive: true
            }
          }
        })
      ]),

      prisma.provider.findMany({
        where: {
          status: "ACTIVE",
          isFeatured: true,
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
                forType:
                  "COSMETIC_DOCTOR"
              }
            }
          ]
        },
        include: {
          specialty: true,
          governorate: true,
          area: true
        },
        orderBy: [
          { bookingPoints: "desc" },
          { updatedAt: "desc" },
          { id: "desc" }
        ],
        take: 6
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
    },
    featured
  };
}

export async function getProviderBySlug(
  slug: string
) {
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
}

export async function getCosmeticDoctorBySlug(
  slug: string
) {
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
}

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
  const cursor = decodeRankedCursor(
    options.cursor ?? cursorFromParams(params)
  );

  const baseWhere = publicPharmacyWhere(filters);
  const rows = await prisma.pharmacy.findMany({
    where: cursor
      ? {
          AND: [baseWhere, pharmacyAfterCursor(cursor)]
        }
      : baseWhere,
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" },
      { id: "desc" }
    ],
    take: take + 1
  });

  return buildRankedPage(
    rows,
    take,
    (row) => row.inquiryCount
  );
}

export async function getPublicPharmacies(
  params: SearchParams = {},
  take = 24
) {
  const page = await getPublicPharmaciesPage(
    params,
    {
      take
    }
  );

  return page.items;
}

export async function getPublicLabsPage(
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeRankedCursor(
    options.cursor ?? cursorFromParams(params)
  );

  const baseWhere = publicLabWhere(filters);
  const rows = await prisma.lab.findMany({
    where: cursor
      ? {
          AND: [baseWhere, labAfterCursor(cursor)]
        }
      : baseWhere,
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" },
      { id: "desc" }
    ],
    take: take + 1
  });

  return buildRankedPage(
    rows,
    take,
    (row) => row.inquiryCount
  );
}

export async function getPublicLabs(
  params: SearchParams = {},
  take = 24
) {
  const page = await getPublicLabsPage(
    params,
    {
      take
    }
  );

  return page.items;
}

export async function getPublicCosmeticCentersPage(
  params: SearchParams = {},
  options: PublicPageOptions = {}
) {
  const filters = readFilters(params);
  const take = normalizePageSize(options.take);
  const cursor = decodeRankedCursor(
    options.cursor ?? cursorFromParams(params)
  );

  const baseWhere =
    publicCosmeticCenterWhere(filters);
  const rows = await prisma.cosmeticCenter.findMany({
    where: cursor
      ? {
          AND: [
            baseWhere,
            cosmeticCenterAfterCursor(cursor)
          ]
        }
      : baseWhere,
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" },
      { id: "desc" }
    ],
    take: take + 1
  });

  return buildRankedPage(
    rows,
    take,
    (row) => row.inquiryCount
  );
}

export async function getPublicCosmeticCenters(
  params: SearchParams = {},
  take = 24
) {
  const page = await getPublicCosmeticCentersPage(
    params,
    {
      take
    }
  );

  return page.items;
}

export async function getPublicPharmacyBySlug(
  slug: string
) {
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
}

export async function getPublicLabBySlug(
  slug: string
) {
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
}

export async function getPublicCosmeticCenterBySlug(
  slug: string
) {
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
}

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
