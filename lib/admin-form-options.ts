import { prisma } from "@/lib/prisma";

type SpecialtyType = "DOCTOR" | "COSMETIC_DOCTOR";

export async function getAdminLocationOptions() {
  const [governorates, areas] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ]
    }),
    prisma.area.findMany({
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
        {
          name: "asc"
        }
      ]
    })
  ]);

  return {
    governorates: governorates.map((row) => ({
      id: row.id,
      name: row.name
    })),
    areas: areas.map((row) => ({
      id: row.id,
      name: row.name,
      governorateId: row.governorateId,
      governorateName: row.governorate.name
    }))
  };
}

export async function getAdminSpecialtyOptions(
  forType: SpecialtyType
) {
  const rows = await prisma.specialty.findMany({
    where: {
      forType,
      isActive: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    forType: row.forType
  }));
}
