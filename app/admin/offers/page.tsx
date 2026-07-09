import { createOffer, deleteOffer, updateOffer } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { OfferForm } from "@/components/admin/offer-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function OffersAdminPage() {
  const [providers, rows] = await Promise.all([
    prisma.provider.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }]
    }),

    prisma.offer.findMany({
      include: {
        provider: true
      },
      orderBy: [{ updatedAt: "desc" }]
    })
  ]);

  const providerOptions = providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    titlePrefix: provider.titlePrefix,
    type: provider.type
  }));

  return (
    <>
      <PageHeader
        title="العروض"
        description="إدارة العروض من مكان واحد: العنوان، الخصم، الصورة، تاريخ البداية والنهاية، وربط العرض بطبيب أو طبيب أسنان."
      />

      <FormShell title="إضافة عرض">
        <OfferForm
          mode="create"
          action={createOffer}
          providers={providerOptions}
          submit="إضافة عرض"
        />
      </FormShell>

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={row.isActive} />

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {row.provider
                      ? `${row.provider.titlePrefix} ${row.provider.name}`
                      : "غير مرتبط"}
                  </span>

                  {row.discountText ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                      {row.discountText}
                    </span>
                  ) : null}

                  {row.imageUrl ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      صورة
                    </span>
                  ) : null}

                  {row.endsAt ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                      ينتهي: {row.endsAt.toISOString().slice(0, 10)}
                    </span>
                  ) : null}
                </div>

                <form action={deleteOffer}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="danger">
                    حذف
                  </Button>
                </form>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm font-bold text-slate-500">
            لا توجد عروض بعد.
          </Card>
        )}
      </div>
    </>
  );
}