import { CalendarDays, Pencil, Tag } from "lucide-react";

import { AdminSearch } from "@/components/admin/admin-search";
import { FormShell } from "@/components/admin/form-shell";
import { OfferForm } from "@/components/admin/offer-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createOffer,
  deleteOffer,
  updateOffer
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

type OffersAdminPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

export default async function OffersAdminPage({
  searchParams
}: OffersAdminPageProps) {
  const q = (await searchParams).q?.trim() ?? "";

  const [providers, rows] = await Promise.all([
    prisma.provider.findMany({
      orderBy: [
        { type: "asc" },
        { name: "asc" }
      ]
    }),
    prisma.offer.findMany({
      where: q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                discountText: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                provider: {
                  name: {
                    contains: q,
                    mode: "insensitive"
                  }
                }
              }
            ]
          }
        : undefined,
      include: {
        provider: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
  ]);

  const providerOptions = providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    titlePrefix: provider.titlePrefix,
    type: provider.type
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="العروض"
        description="إدارة العروض وإضافتها والبحث عنها وتعديلها وحذفها من صفحة واحدة."
      />

      <FormShell title="إضافة عرض">
        <OfferForm
          mode="create"
          action={createOffer}
          providers={providerOptions}
          submit="إضافة عرض"
        />
      </FormShell>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-navy">
              قائمة العروض
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              اضغط على أي عرض لفتح التعديل داخل نفس الصفحة.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <AdminSearch
              defaultValue={q}
              placeholder="ابحث عن عرض أو طبيب..."
            />
          </div>
        </div>

        {rows.length ? (
          <div className="divide-y divide-borderSoft overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
            {rows.map((row) => (
              <details key={row.id} className="group">
                <summary className="focus-ring flex cursor-pointer list-none flex-col gap-3 p-3 hover:bg-slate-50 sm:flex-row sm:items-center [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <Tag className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-black text-navy">
                          {row.title}
                        </h3>
                        <StatusPill value={row.isActive} />
                      </div>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {row.provider
                          ? `${row.provider.titlePrefix} ${row.provider.name}`
                          : "عرض عام"}
                        {row.discountText
                          ? ` • ${row.discountText}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {row.endsAt ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                      <CalendarDays
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      ينتهي {formatDate(row.endsAt)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      بدون تاريخ انتهاء
                    </span>
                  )}

                  <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-borderSoft px-3 text-xs font-black text-navy group-open:bg-primary-soft">
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    تعديل
                  </span>
                </summary>

                <div className="border-t border-borderSoft bg-slate-50 p-4 md:p-5">
                  <OfferForm
                    mode="edit"
                    action={updateOffer}
                    providers={providerOptions}
                    submit="حفظ التعديل"
                    row={{
                      id: row.id,
                      title: row.title,
                      slug: row.slug,
                      description: row.description,
                      imageUrl: row.imageUrl,
                      discountText: row.discountText,
                      startsAt: row.startsAt,
                      endsAt: row.endsAt,
                      isActive: row.isActive,
                      providerId: row.providerId
                    }}
                  />

                  <div className="mt-4 border-t border-red-100 pt-4">
                    <form action={deleteOffer}>
                      <input
                        type="hidden"
                        name="id"
                        value={row.id}
                      />
                      <Button type="submit" variant="danger">
                        حذف العرض
                      </Button>
                    </form>
                  </div>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center text-sm font-bold text-slate-500">
            {q
              ? "لا توجد نتائج مطابقة."
              : "لا توجد عروض بعد."}
          </Card>
        )}
      </section>
    </div>
  );
}
