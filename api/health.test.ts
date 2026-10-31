import { describe, expect, it } from "vitest";
import handler from "./health";

function mockRes() {
  const headers: Record<string, string> = {};
  const out = { statusCode: 200, body: undefined as unknown };
  const res = {
    setHeader(name: string, val: string) {
      headers[name.toLowerCase()] = val;
      return res;
    },
    status(code: number) {
      out.statusCode = code;
      return res;
    },
    json(body: unknown) {
      out.body = body;
      return res;
    },
  };
  return { res, out, headers };
}

describe("GET /api/health", () => {
  it("returns ok, hasLlmKey, hasSupabaseUrl, and time without exposing values", () => {
    const { res, out, headers } = mockRes();
    const req = { method: "GET" };

    handler(req as never, res as never);

    expect(out.statusCode).toBe(200);
    expect(headers["cache-control"]).toBe("no-store");

    const body = out.body as {
      ok: boolean;
      hasLlmKey: boolean;
      hasSupabaseUrl: boolean;
      time: string;
    };

    expect(body.ok).toBe(true);
    expect(typeof body.hasLlmKey).toBe("boolean");
    expect(typeof body.hasSupabaseUrl).toBe("boolean");
    expect(typeof body.time).toBe("string");
    expect(Date.parse(body.time)).not.toBeNaN();

    // Verify no secret keys are leaked in keys or values
    const stringified = JSON.stringify(body);
    expect(stringified).not.toContain("sk-ant-");
    expect(stringified).not.toContain("service_role");
  });

  it("rejects non-GET/HEAD methods with 405", () => {
    const { res, out, headers } = mockRes();
    const req = { method: "POST" };

    handler(req as never, res as never);

    expect(out.statusCode).toBe(405);
    expect(headers["allow"]).toBe("GET, HEAD");
    expect(out.body).toEqual({ ok: false });
  });
});

