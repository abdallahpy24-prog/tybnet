export type JsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; status: 400 | 413 | 415; message: string };

export async function readJsonBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.split(";", 1)[0].trim() !== "application/json") {
    return {
      ok: false,
      status: 415,
      message: "نوع البيانات غير مدعوم"
    };
  }

  const lengthHeader = request.headers.get("content-length");
  const declaredLength = lengthHeader ? Number(lengthHeader) : null;

  if (
    declaredLength !== null &&
    Number.isFinite(declaredLength) &&
    declaredLength > maxBytes
  ) {
    return {
      ok: false,
      status: 413,
      message: "حجم البيانات كبير جداً"
    };
  }

  if (!request.body) {
    return {
      ok: false,
      status: 400,
      message: "البيانات المرسلة غير صحيحة"
    };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          status: 413,
          message: "حجم البيانات كبير جداً"
        };
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();
  } catch {
    return {
      ok: false,
      status: 400,
      message: "البيانات المرسلة غير صحيحة"
    };
  } finally {
    reader.releaseLock();
  }

  if (!text.trim()) {
    return {
      ok: false,
      status: 400,
      message: "البيانات المرسلة غير صحيحة"
    };
  }

  try {
    return {
      ok: true,
      body: JSON.parse(text) as unknown
    };
  } catch {
    return {
      ok: false,
      status: 400,
      message: "البيانات المرسلة غير صحيحة"
    };
  }
}
