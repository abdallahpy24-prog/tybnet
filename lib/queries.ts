import { Prisma, ProviderType, SpecialtyFor } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SearchParams = Record<string, string | string[] | undefined>;

function scalar(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function specialtyTypesForProvider(type: ProviderType): SpecialtyFor[] {
  return type === "DOCTOR" ? ["DOCTOR", "BOTH"] : ["DENTIST", "BOTH"];
}

function publicProviderWhere(type: ProviderType): Prisma.ProviderWhereInput {
  return {
    type,
    status: "ACTIVE",
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    },
    specialty: {
      isActive: true,
      forType: {
        in: specialtyTypesForProvider(type)
      }
    }
  };
}

export function readFilters(params: SearchParams = {}) {
  return {
    q: scalar(params.q)?.trim() || undefined,
    governorateId: scalar(params.governorateId) || undefined,
    areaId: scalar(params.areaId) || undefined,
    specialtyId: scalar(params.specialtyId) || undefined
  };
}

export async function getFilterOptions(forType?: ProviderType) {
  const specialtyFor: SpecialtyFor[] | undefined = forType
    ? specialtyTypesForProvider(forType)
    : undefined;

  const [governorates, areas, specialties] = await Promise.all([
    prisma.governorate.findMany({
      where: {
        isActive: true
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
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
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
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

export async function searchProviders(
  type: ProviderType,
  params: SearchParams = {},
  take = 24
) {
  const filters = readFilters(params);

  const where: Prisma.ProviderWhereInput = publicProviderWhere(type);

  if (filters.governorateId) {
    where.governorateId = filters.governorateId;
  }

  if (filters.areaId) {
    where.areaId = filters.areaId;
  }

  if (filters.specialtyId) {
    where.specialtyId = filters.specialtyId;
  }

  if (filters.q) {
    where.OR = [
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
        specialty: {
          name: {
            contains: filters.q,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  return prisma.provider.findMany({
    where,
    include: {
      specialty: true,
      governorate: true,
      area: true
    },
    orderBy: [
      { isFeatured: "desc" },
      { bookingPoints: "desc" },
      { sortOrder: "asc" },
      { updatedAt: "desc" }
    ],
    take
  });
}

export async function getHomeData() {
  const [counts, featured] = await Promise.all([
    Promise.all([
      prisma.provider.count({
        where: publicProviderWhere("DOCTOR")
      }),

      prisma.provider.count({
        where: publicProviderWhere("DENTIST")
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
              forType: {
                in: ["DOCTOR", "BOTH"]
              }
            }
          },
          {
            type: "DENTIST",
            specialty: {
              isActive: true,
              forType: {
                in: ["DENTIST", "BOTH"]
              }
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
        { sortOrder: "asc" },
        { updatedAt: "desc" }
      ],
      take: 6
    })
  ]);

  return {
    counts: {
      doctors: counts[0],
      dentists: counts[1],
      pharmacies: counts[2],
      labs: counts[3]
    },
    featured
  };
}

export async function getProviderBySlug(slug: string) {
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
            forType: {
              in: ["DOCTOR", "BOTH"]
            }
          }
        },
        {
          type: "DENTIST",
          specialty: {
            isActive: true,
            forType: {
              in: ["DENTIST", "BOTH"]
            }
          }
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

export function activeOfferWhere(): Prisma.OfferWhereInput {
  const now = new Date();

  return {
    isActive: true,
    OR: [{ endsAt: null }, { endsAt: { gte: now } }]
  };
}

export async function getOffers() {
  return prisma.offer.findMany({
    where: activeOfferWhere(),
    include: {
      provider: {
        include: {
          specialty: true,
          governorate: true,
          area: true
        }
      }
    },
    orderBy: [{ endsAt: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getPublicPharmacies(params: SearchParams = {}) {
  const filters = readFilters(params);

  return prisma.pharmacy.findMany({
    where: {
      status: "ACTIVE",
      governorate: {
        isActive: true
      },
      area: {
        isActive: true
      },
      governorateId: filters.governorateId,
      areaId: filters.areaId,
      name: filters.q
        ? {
            contains: filters.q,
            mode: "insensitive"
          }
        : undefined
    },
    include: {
      governorate: true,
      area: true
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }]
  });
}

export async function getPublicLabs(params: SearchParams = {}) {
  const filters = readFilters(params);

  return prisma.lab.findMany({
    where: {
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
              services: {
                contains: filters.q,
                mode: "insensitive"
              }
            }
          ]
        : undefined
    },
    include: {
      governorate: true,
      area: true
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }]
  });
}