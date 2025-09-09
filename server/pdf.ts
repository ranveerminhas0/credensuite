import puppeteer from "puppeteer";
import { promises as fs } from "fs";
import path from "path";
import { type Member, type NgoSettings } from "@shared/schema";

function ensureAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | undefined {
	if (!url) return undefined;
	try {
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		return new URL(url, baseUrl).toString();
	} catch {
		return url;
	}
}

function formatDate(dateLike: string | Date | null | undefined): string {
	if (!dateLike) return "MM/DD/YYYY";
	const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
	if (Number.isNaN(d.getTime())) return "MM/DD/YYYY";
	return d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function toDataUriIfLocal(possibleUrl: string | null | undefined): Promise<string | undefined> {
	if (!possibleUrl) return undefined;
	try {
		if (possibleUrl.startsWith("http://") || possibleUrl.startsWith("https://")) return possibleUrl;
		// Treat as app-served path like /uploads/filename
		const normalized = possibleUrl.startsWith("/") ? possibleUrl.slice(1) : possibleUrl;
		const abs = path.join(process.cwd(), normalized);
		const data = await fs.readFile(abs);
		const ext = path.extname(abs).toLowerCase();
		const mime = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";
		return `data:${mime};base64,${data.toString("base64")}`;
	} catch {
		return possibleUrl;
	}
}

async function buildCardHtml(member: Member, settings: NgoSettings | undefined, assetsBaseUrl: string): Promise<string> {
	// Inline assets when they are local (e.g., /uploads/*). For remote URLs, keep them as-is.
	const photoUrl = await toDataUriIfLocal(member.photoUrl as any);
	const logoUrl = await toDataUriIfLocal(settings?.logoUrl as any);
	const signatureUrl = await toDataUriIfLocal(settings?.signatureUrl as any);

	// Important: Force light theme styling for PDF regardless of app theme.
	// We use explicit light colors in CSS and set body background to white.
	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>ID Card - ${member.fullName}</title>
		<style>
			* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
			html, body { margin: 0; padding: 0; }
			body { background: #ffffff; color: #0f172a; }
			.container { width: 100%; }
			.card-page { width: 100%; height: 100%; position: relative; page-break-after: always; }
			.card-page:last-child { page-break-after: auto; }

			.card { width: 204px; height: 324px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; position: relative; }
			.header { position: relative; height: 80px; background: #047857; color: #ffffff; display: flex; align-items: center; justify-content: center; text-align: center; }
			.header h4 { margin: 0; font-size: 14px; line-height: 1.1; font-weight: 700; padding: 0 8px; }
			.header .subtitle { font-size: 10px; opacity: 0.9; }
			.header .cut { position: absolute; left: 0; right: 0; bottom: -16px; height: 32px; background: #ffffff; border-top-left-radius: 24px; border-top-right-radius: 24px; z-index: 0; }

			.photo-wrap { margin-top: -24px; display: flex; justify-content: center; position: relative; z-index: 1; }
			.photo-ring { width: 80px; height: 80px; border-radius: 9999px; background: #ffffff; padding: 4px; box-shadow: 0 0 0 2px #fbbf24 inset; }
			.photo { width: 100%; height: 100%; border-radius: 9999px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
			.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
			.placeholder { width: 100%; height: 100%; border-radius: 9999px; background: #e2e8f0; }

			.center { text-align: center; }
			.name { margin-top: 8px; padding: 0 12px; font-size: 14px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.role { font-size: 11px; font-weight: 600; color: #047857; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

			.list { margin-top: 12px; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }
			.row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: #f8fafc; padding: 4px 8px; border-radius: 4px; }
			.row .label { color: #64748b; }
			.row .value { color: #0f172a; font-weight: 600; }

			.back-header { padding: 8px 12px; text-align: center; background: #ecfdf5; border-bottom: 1px solid #bbf7d0; }
			.back-header h4 { margin: 0; font-size: 12px; font-weight: 700; color: #0f172a; }
			.back-header .small { font-size: 10px; color: #475569; line-height: 1.2; }

			.section { padding: 8px; display: flex; flex-direction: column; gap: 8px; }
			.emergency { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 6px; }
			.emergency .title { font-size: 11px; font-weight: 700; color: #b91c1c; margin-bottom: 4px; }
			.emergency .row { background: transparent; padding: 0; }
			.emergency .label, .emergency .value { color: #b91c1c; }

			.property { display: flex; gap: 8px; align-items: center; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px; }
			.property .text { font-size: 11px; color: #0f172a; }
			.property .sub { color: #64748b; }
			.logo-box { width: 32px; height: 32px; border-radius: 6px; background: #ffffff; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
			.logo-box img { width: 24px; height: 24px; object-fit: contain; }

			.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: auto; align-items: end; }
			.sig { display: flex; flex-direction: column; justify-content: flex-end; }
			.sig-label { font-size: 11px; color: #475569; margin-bottom: 2px; font-weight: 500; }
			.sig-line { width: 100%; height: 16px; border-bottom: 1px dotted #cbd5e1; display: flex; align-items: end; }
			.sig-line img { height: 100%; object-fit: contain; }

			.footer { position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; font-size: 10px; color: #64748b; font-style: italic; }
		</style>
	</head>
	<body>
		<div class="container">
			<!-- Front -->
			<div class="card-page">
				<div class="card">
					<div class="header">
						<div>
							<h4>${settings?.organizationName || "Your NGO Name"}</h4>
							<div class="subtitle">Identification Card</div>
						</div>
						<div class="cut"></div>
					</div>
					<div class="photo-wrap">
						<div class="photo-ring">
							<div class="photo">
								${photoUrl ? `<img src="${photoUrl}" alt="Member photo" />` : `<div class="placeholder"></div>`}
							</div>
						</div>
					</div>
					<div class="center name">${member.fullName}</div>
					<div class="center role">${member.designation}</div>
					<div class="list">
						<div class="row"><span class="label">Member ID</span><span class="value">${member.memberId}</span></div>
						<div class="row"><span class="label">Join Date</span><span class="value">${formatDate(member.joiningDate as any)}</span></div>
						<div class="row"><span class="label">Phone</span><span class="value">${member.contactNumber}</span></div>
						<div class="row"><span class="label">Blood Group</span><span class="value">${member.bloodGroup || "N/A"}</span></div>
					</div>
				</div>
			</div>

			<!-- Back -->
			<div class="card-page">
				<div class="card">
					<div class="back-header">
						<h4>${settings?.organizationName || "Your NGO Name"}</h4>
						<div class="small">${settings?.address || ""}</div>
						<div class="small">${(settings?.phoneNumber || "")} ${settings?.emailAddress ? `• ${settings.emailAddress}` : ""}</div>
					</div>
					<div class="section">
						<div class="emergency">
							<div class="title">Emergency Contact</div>
							<div class="row"><span class="label">Name</span><span class="value">${member.emergencyContactName || "—"}</span></div>
							<div class="row"><span class="label">Phone</span><span class="value">${member.emergencyContactNumber || "—"}</span></div>
						</div>
						<div class="property">
							<div class="text">
								<div><strong>Property of ${settings?.organizationName || "Your NGO"}</strong></div>
								<div class="sub">If found, please return to the above address.</div>
							</div>
							<div class="logo-box">${logoUrl ? `<img src="${logoUrl}" alt="Logo"/>` : ""}</div>
						</div>
						<div class="signatures">
							<div class="sig">
								<div class="sig-label">Authorized Signatory</div>
								<div class="sig-line">${signatureUrl ? `<img src="${signatureUrl}" alt="Signature"/>` : ""}</div>
							</div>
							<div class="sig">
								<div class="sig-label">Member Signature</div>
								<div class="sig-line"></div>
							</div>
						</div>
					</div>
					<div class="footer">Valid with authorized signature only</div>
				</div>
			</div>
		</div>
	</body>
	</html>`;
}

export async function generateMemberPdf(member: Member, settings: NgoSettings | undefined, baseUrl: string): Promise<Buffer> {
	const html = await buildCardHtml(member, settings, baseUrl);
	const executablePath = (puppeteer as any).executablePath ? (puppeteer as any).executablePath() : undefined;
	const browser = await puppeteer.launch({
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		headless: "new" as any,
		...(executablePath ? { executablePath } : {}),
	});
	try {
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "load" });
		await page.emulateMediaType("screen");
		// ID card portrait size: 2.125in x 3.375in. Two pages will be produced from the stacked content.
		const pdfBytes = await page.pdf({
			printBackground: true,
			width: "2.125in",
			height: "3.375in",
			margin: { top: "0", right: "0", bottom: "0", left: "0" },
		});
		await page.close();
		await browser.close();
		return Buffer.from(pdfBytes);
	} catch (error) {
		await browser.close();
		throw error;
	}
}


