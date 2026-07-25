import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { getIntegrationConfig } from "@/lib/server/integrations/config";

export const runtime = "nodejs";

/**
 * Generic, secure webhook receiver template for third-party integrations.
 * Verifies an HMAC-SHA256 signature (header `x-signature`) against a server-only
 * `WEBHOOK_SECRET` before doing any work. The secret never reaches the client.
 * Route by `params.provider` to fan out to per-provider handlers.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { webhookSecret } = getIntegrationConfig();
  const rawBody = await req.text();

  if (webhookSecret) {
    const signature = req.headers.get("x-signature") ?? "";
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    const valid =
      signatureBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(signatureBuf, expectedBuf);

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  } else {
    console.warn(
      `[webhook:${params.provider}] WEBHOOK_SECRET not set — skipping signature check (dev only).`
    );
  }

  // TODO: parse rawBody and dispatch based on params.provider.
  console.info(`[webhook:${params.provider}] received ${rawBody.length} bytes`);

  return NextResponse.json({ received: true, provider: params.provider });
}
