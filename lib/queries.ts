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

function scalar(
  value: string | string[] | undefined
) {
  return Array.isArray(value) ? value[0] : value;
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

export async function searchProviders(
  type: ProviderType,
  params: SearchParams = {},
  take = 24
) {
  const filters = readFilters(params);

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

  return prisma.provider.findMany({
    where,
    include: {
      specialty: true,
      governorate: true,
      area: true
    },
    orderBy: [
      { bookingPoints: "desc" },
      { updatedAt: "desc" }
    ],
    take
  });
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
          { updatedAt: "desc" }
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

export async function getPublicPharmacies(
  params: SearchParams = {}
) {
  const filters = readFilters(params);

  return prisma.pharmacy.findMany({
    where: publicPharmacyWhere(filters),
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" }
    ]
  });
}

export async function getPublicLabs(
  params: SearchParams = {}
) {
  const filters = readFilters(params);

  return prisma.lab.findMany({
    where: publicLabWhere(filters),
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" }
    ]
  });
}

export async function getPublicCosmeticCenters(
  params: SearchParams = {}
) {
  const filters = readFilters(params);

  return prisma.cosmeticCenter.findMany({
    where:
      publicCosmeticCenterWhere(filters),
    include: {
      governorate: true,
      area: true
    },
    orderBy: [
      { inquiryCount: "desc" },
      { updatedAt: "desc" }
    ]
  });
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
