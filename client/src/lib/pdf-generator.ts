import { Member } from "@shared/schema";

export async function generatePDF(member: Member, photoFile?: File | null) {
  try {
    // For now, we'll create a simple HTML-to-PDF approach
    // In a production app, you'd use libraries like jsPDF or PDFKit
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    const photoUrl = photoFile ? URL.createObjectURL(photoFile) : member.photoUrl || '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Card - ${member.fullName}</title>
          <style>
            @page {
              size: 3.375in 2.125in;
              margin: 0;
            }
            @media print {
              .card {
                width: 3.375in !important;
                height: 2.125in !important;
                margin: 0 !important;
                padding: 0 !important;
                page-break-after: always;
              }
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }
            .card {
              width: 3.375in;
              height: 2.125in;
              background: linear-gradient(135deg, #2563eb, #1e40af);
              color: white;
              padding: 12px;
              box-sizing: border-box;
              page-break-after: always;
              border-radius: 8px;
              position: relative;
              display: flex;
              flex-direction: column;
              border: 2px solid #1e40af;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
              height: 40px;
            }
            .logo {
              width: 35px;
              height: 35px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: #2563eb;
              font-weight: bold;
              border: 2px solid white;
            }
            .org-info {
              text-align: right;
              font-size: 9px;
              line-height: 1.2;
              max-width: 140px;
            }
            .org-name {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 2px;
            }
            .member-section {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              flex: 1;
            }
            .photo {
              width: 70px;
              height: 70px;
              background: #ffffff;
              border-radius: 6px;
              margin-right: 10px;
              object-fit: cover;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .member-details {
              flex: 1;
            }
            .member-details h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .member-details .role {
              margin: 0 0 2px 0;
              font-size: 11px;
              opacity: 0.9;
              text-transform: capitalize;
            }
            .member-details .id {
              margin: 0;
              font-size: 10px;
              opacity: 0.8;
              font-weight: bold;
            }
            .card-footer {
              margin-top: auto;
              font-size: 8px;
              border-top: 1px solid rgba(255,255,255,0.3);
              padding-top: 6px;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .footer-label {
              opacity: 0.8;
            }
            .footer-value {
              font-weight: bold;
            }
            .card-back {
              background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
              color: #333;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 12px;
            }
            .back-header {
              text-align: center;
              margin-bottom: 10px;
              font-size: 9px;
              line-height: 1.3;
              border-bottom: 1px solid #ccc;
              padding-bottom: 8px;
            }
            .back-org-name {
              font-weight: bold;
              font-size: 11px;
              color: #2563eb;
              margin-bottom: 3px;
            }
            .emergency-section {
              border-top: 1px solid #ccc;
              padding-top: 8px;
              margin-bottom: 8px;
              font-size: 8px;
            }
            .emergency-title {
              font-weight: bold;
              margin-bottom: 4px;
              color: #dc2626;
            }
            .qr-section {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              border-top: 1px solid #ccc;
              padding-top: 8px;
            }
            .qr-code {
              width: 45px;
              height: 45px;
              background: #ffffff;
              border: 2px solid #2563eb;
              margin-right: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
              border-radius: 4px;
            }
            .declaration {
              font-size: 7px;
              line-height: 1.4;
            }
            .declaration-title {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .signature-section {
              border-top: 1px solid #ccc;
              padding-top: 8px;
              display: flex;
              justify-content: space-between;
              font-size: 7px;
            }
            .signature-box {
              width: 70px;
              border-bottom: 1px solid #333;
              height: 18px;
              margin-top: 4px;
            }
            .signature-label {
              font-weight: bold;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <!-- Front Side -->
          <div class="card">
            <div class="card-header">
              <div class="logo">NGO</div>
              <div class="org-info">
                <div class="org-name">Hope Foundation NGO</div>
                <div>MEMBER IDENTIFICATION CARD</div>
                <div>Est. 2020</div>
              </div>
            </div>
            
            <div class="member-section">
              ${photoUrl ? `<img src="${photoUrl}" alt="Photo" class="photo">` : '<div class="photo"></div>'}
              <div class="member-details">
                <h3>${member.fullName}</h3>
                <p class="role">${member.designation}</p>
                <p class="id">ID: ${member.memberId}</p>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="footer-row">
                <span class="footer-label">Joined:</span>
                <span class="footer-value">${new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="footer-row">
                <span class="footer-label">Contact:</span>
                <span class="footer-value">${member.contactNumber}</span>
              </div>
              ${member.bloodGroup ? `<div class="footer-row"><span class="footer-label">Blood:</span><span class="footer-value">${member.bloodGroup}</span></div>` : ''}
            </div>
          </div>

          <!-- Back Side -->
          <div class="card card-back">
            <div class="back-header">
              <div class="back-org-name">Hope Foundation NGO</div>
              <div>123 Main Street, City, State 12345</div>
              <div>Phone: (555) 123-4567 | Email: info@hopefoundation.org</div>
              <div>Website: www.hopefoundation.org</div>
            </div>
            
            ${member.emergencyContactName || member.emergencyContactNumber ? `
              <div class="emergency-section">
                <div class="emergency-title">Emergency Contact:</div>
                ${member.emergencyContactName ? `<div><strong>Name:</strong> ${member.emergencyContactName}</div>` : ''}
                ${member.emergencyContactNumber ? `<div><strong>Phone:</strong> ${member.emergencyContactNumber}</div>` : ''}
              </div>
            ` : ''}
            
            <div class="qr-section">
              <div class="qr-code">QR<br>CODE</div>
              <div class="declaration">
                <div class="declaration-title">IMPORTANT NOTICE:</div>
                <div>This card is the exclusive property of Hope Foundation NGO.</div>
                <div>If found, please return to the address above or contact us immediately.</div>
                <div>Valid only with photo identification.</div>
              </div>
            </div>
            
            <div class="signature-section">
              <div>
                <div class="signature-label">Authorized Officer</div>
                <div class="signature-box"></div>
              </div>
              <div>
                <div class="signature-label">Member Signature</div>
                <div class="signature-box"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      
      // Clean up object URL if created
      if (photoFile && photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    }, 1000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
