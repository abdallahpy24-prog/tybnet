import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  duplicate: vi.fn(), count: vi.fn(), create: vi.fn(), transaction: vi.fn(),
  findUnique: vi.fn(), audit: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: {
  $transaction: mocks.transaction,
  appointment: { findUnique: mocks.findUnique },
  auditLog: { create: mocks.audit }
} }));
import { normalizePatientPhone, storeAppointmentSafely } from "@/lib/appointments";

const input = { providerId: "fixture-doctor", patientName: "مراجع تجريبي", patientPhone: "٠٧٧٠٠٠٠٠٠٠٠", note: "private-note", source: "mobile-api" as const };
const tx = { appointment: { findFirst: mocks.duplicate, count: mocks.count, create: mocks.create } };
function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("fixture error", { code, clientVersion: "test" });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.duplicate.mockResolvedValue(null);
  mocks.count.mockResolvedValue(0);
  mocks.create.mockResolvedValue({ id: "request-1" });
  mocks.audit.mockResolvedValue({});
  mocks.transaction.mockImplementation(async (work) => work(tx));
});

describe("appointment storage", () => {
  it("normalizes local and international Arabic phone forms consistently", () => {
    for (const value of ["٠٧٧٠٠٠٠٠٠٠٠", "+964 770 000 0000", "009647700000000", "7700000000"]) {
      expect(normalizePatientPhone(value)).toBe("9647700000000");
    }
  });
  it("saves once and keeps personal data out of the audit log", async () => {
    expect(await storeAppointmentSafely(input)).toMatchObject({ saved: true, duplicate: false, appointmentId: "request-1" });
    const audit = JSON.stringify(mocks.audit.mock.calls);
    expect(audit).not.toContain(input.patientName);
    expect(audit).not.toContain(input.patientPhone);
    expect(audit).not.toContain(input.note);
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });
  it("returns the existing request without writing a second one", async () => {
    mocks.duplicate.mockResolvedValue({ id: "existing-request" });
    expect(await storeAppointmentSafely(input)).toMatchObject({ saved: false, duplicate: true, appointmentId: "existing-request" });
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("limits repeated patient requests across providers while preserving the contact fallback", async () => {
    mocks.count.mockResolvedValue(5);
    expect(await storeAppointmentSafely(input)).toMatchObject({ saved: false, rateLimited: true });
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("retries a serialization conflict", async () => {
    mocks.transaction.mockRejectedValueOnce(prismaError("P2034"));
    expect(await storeAppointmentSafely(input)).toMatchObject({ saved: true });
    expect(mocks.transaction).toHaveBeenCalledTimes(2);
  });
  it("resolves a concurrent unique-key collision to the existing request", async () => {
    mocks.transaction.mockRejectedValueOnce(prismaError("P2002"));
    mocks.findUnique.mockResolvedValue({ id: "concurrent-request" });
    expect(await storeAppointmentSafely(input)).toMatchObject({ saved: false, duplicate: true, appointmentId: "concurrent-request" });
  });
  it("does not claim a duplicate when a different unique constraint failed", async () => {
    const error = prismaError("P2002");
    mocks.transaction.mockRejectedValueOnce(error);
    mocks.findUnique.mockResolvedValue(null);
    await expect(storeAppointmentSafely(input)).rejects.toBe(error);
  });
  it("stops retrying after three transaction conflicts", async () => {
    mocks.transaction.mockRejectedValue(prismaError("P2034"));
    await expect(storeAppointmentSafely(input)).rejects.toMatchObject({ code: "P2034" });
    expect(mocks.transaction).toHaveBeenCalledTimes(3);
  });
});
