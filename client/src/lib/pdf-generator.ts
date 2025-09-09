import { Member } from "@shared/schema";
import { auth } from "@/lib/auth";
import { createApiUrl } from "./api";

export async function generatePDF(member: Member) {
	const token = await auth.currentUser?.getIdToken();
	if (!token) throw new Error("Not authenticated");

	const res = await fetch(createApiUrl(`/api/pdf/members/${encodeURIComponent(member.id)}`), {
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	if (!res.ok) {
		// Try to read error for better message
		let detail = "";
		try { detail = await res.text(); } catch {}
		throw new Error(`Failed to generate PDF (${res.status}). ${detail}`.trim());
	}

	const contentType = res.headers.get("content-type") || "";
	if (!contentType.includes("application/pdf")) {
		const text = await res.text();
		throw new Error(`Server did not return a PDF. Response: ${text}`);
		throw new Error("Failed to generate PDF");
	}
	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `id-card-${member.memberId || member.id}.pdf`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}