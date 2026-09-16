import { describe, expect, it } from "vitest";
import { readJsonBodyWithLimit } from "@/lib/http-body";

function request(body: BodyInit, headers: Record<string, string> = {}) {
  return new Request("https://example.test/api", {
    method: "POST", body,
    headers: { "content-type": "application/json", ...headers },
    ...({ duplex: "half" } as RequestInit)
  });
}

describe("bounded JSON request bodies", () => {
  it("accepts a JSON charset parameter", async () => {
    expect(await readJsonBodyWithLimit(request('{"ok":true}', { "content-type": "application/json; charset=utf-8" }), 64))
      .toEqual({ ok: true, body: { ok: true } });
  });
  it("rejects a MIME type that merely starts with application/json", async () => {
    expect(await readJsonBodyWithLimit(request("{}", { "content-type": "application/json-evil" }), 64))
      .toMatchObject({ ok: false, status: 415 });
  });
  it("counts bytes in streamed Arabic content without trusting content-length", async () => {
    const bytes = new TextEncoder().encode('"عراق"');
    const body = new ReadableStream({ start(controller) { controller.enqueue(bytes.slice(0, 3)); controller.enqueue(bytes.slice(3)); controller.close(); } });
    expect(await readJsonBodyWithLimit(request(body, { "content-length": "1" }), 7))
      .toMatchObject({ ok: false, status: 413 });
  });
  it("keeps the size error if cancelling the incoming stream fails", async () => {
    const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(50)); }, cancel() { throw new Error("closed"); } });
    expect(await readJsonBodyWithLimit(request(body), 10)).toMatchObject({ ok: false, status: 413 });
  });
  it.each(["", "{", "not-json"])("rejects malformed or empty JSON: %s", async (body) => {
    expect(await readJsonBodyWithLimit(request(body), 64)).toMatchObject({ ok: false, status: 400 });
  });
});
