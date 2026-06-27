import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/session";
import { getCommunity } from "@/lib/communities";
import { buildBrochureData } from "@/lib/brochure";
import { NeighborhoodBrochure } from "@/lib/pdf/NeighborhoodBrochure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  // The 2-page export is an agent-only tool.
  if (user.role !== "agent") {
    return new NextResponse("Forbidden — agent access only.", { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("community");
  const community = id ? getCommunity(id) : undefined;
  if (!community) {
    return new NextResponse("Unknown community.", { status: 400 });
  }

  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const data = buildBrochureData(
    community,
    {
      name: user.fullName,
      license: user.licenseNumber,
      phone: user.businessPhone,
      email: user.email,
    },
    generatedOn,
  );

  const element = createElement(NeighborhoodBrochure, {
    data,
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);

  const filename = `${community.id}-neighborhood-summary.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
