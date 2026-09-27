import { NextResponse } from "next/server";

import { hasBlobConfiguration } from "@/lib/blob-store";
import { loadAnalyticsSnapshot } from "@/lib/data-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const snapshot = await loadAnalyticsSnapshot();
		const rows = snapshot.datasets.reduce(
			(total, dataset) => total + dataset.rows.length,
			0,
		);
		return NextResponse.json(
			{
				status: "ready",
				dataSource: snapshot.source.kind,
				datasets: snapshot.datasets.length,
				rows,
				liveUploadPipeline: hasBlobConfiguration() ? "configured" : "optional",
				timestamp: new Date().toISOString(),
			},
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (error) {
		console.error("Health check failed:", error);
		return NextResponse.json(
			{ status: "unhealthy", error: "Analytics data could not be loaded." },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}
}
