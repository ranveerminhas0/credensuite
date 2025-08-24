import { Member } from "@shared/schema";

export async function generatePDF(member: Member, photoFile?: File | null) {
  try {
    // Get organization settings
    const settingsResponse = await fetch('/api/settings');
    const settings = settingsResponse.ok ? await settingsResponse.json() : {};
    
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
              background: linear-gradient(135deg, #1e40af, #3b82f6);
              color: white;
              padding: 8px;
              box-sizing: border-box;
              page-break-after: always;
              border-radius: 12px;
              position: relative;
              display: flex;
              flex-direction: column;
              border: 3px solid #1e40af;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 6px;
              height: 35px;
            }
            .logo {
              width: 32px;
              height: 32px;
              background: linear-gradient(45deg, #ffffff, #f8fafc);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #1e40af;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .org-info {
              text-align: right;
              font-size: 8px;
              line-height: 1.1;
              max-width: 130px;
            }
            .org-name {
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 1px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            .member-section {
              display: flex;
              align-items: center;
              margin-bottom: 6px;
              flex: 1;
            }
            .photo {
              width: 64px;
              height: 64px;
              background: #ffffff;
              border-radius: 8px;
              margin-right: 8px;
              object-fit: cover;
              border: 3px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            }
            .member-details {
              flex: 1;
            }
            .member-details h3 {
              margin: 0 0 3px 0;
              font-size: 15px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              line-height: 1.1;
            }
            .member-details .role {
              margin: 0 0 2px 0;
              font-size: 10px;
              opacity: 0.95;
              text-transform: capitalize;
              background: rgba(255,255,255,0.2);
              padding: 1px 4px;
              border-radius: 3px;
              display: inline-block;
            }
            .member-details .id {
              margin: 0;
              font-size: 9px;
              opacity: 0.85;
              font-weight: bold;
              font-family: 'Courier New', monospace;
            }
            .card-footer {
              margin-top: auto;
              font-size: 7px;
              border-top: 1px solid rgba(255,255,255,0.4);
              padding-top: 4px;
              background: rgba(0,0,0,0.1);
              margin-left: -8px;
              margin-right: -8px;
              margin-bottom: -8px;
              padding-left: 8px;
              padding-right: 8px;
              padding-bottom: 4px;
              border-radius: 0 0 9px 9px;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1px;
            }
            .footer-label {
              opacity: 0.85;
              font-weight: 500;
            }
            .footer-value {
              font-weight: bold;
              text-shadow: 0 1px 1px rgba(0,0,0,0.2);
            }
            .card-back {
              background: linear-gradient(135deg, #f8fafc, #e2e8f0);
              color: #1e293b;
              border: 3px solid #1e40af;
              border-radius: 12px;
              padding: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .back-header {
              text-align: center;
              margin-bottom: 8px;
              font-size: 8px;
              line-height: 1.2;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 6px;
              background: linear-gradient(90deg, #dbeafe, #bfdbfe, #dbeafe);
              margin-left: -8px;
              margin-right: -8px;
              margin-top: -8px;
              padding-left: 8px;
              padding-right: 8px;
              padding-top: 8px;
              border-radius: 9px 9px 0 0;
            }
            .back-org-name {
              font-weight: bold;
              font-size: 10px;
              color: #1e40af;
              margin-bottom: 2px;
              text-shadow: 0 1px 1px rgba(0,0,0,0.1);
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
              margin-bottom: 6px;
              border-top: 1px solid #cbd5e1;
              padding-top: 6px;
            }
            .qr-code {
              width: 40px;
              height: 40px;
              background: linear-gradient(45deg, #ffffff, #f8fafc);
              border: 2px solid #1e40af;
              margin-right: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6px;
              font-weight: bold;
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              flex-shrink: 0;
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
              border-top: 2px solid #1e40af;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 6px;
              background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9);
              margin-left: -8px;
              margin-right: -8px;
              margin-bottom: -8px;
              padding-left: 8px;
              padding-right: 8px;
              padding-bottom: 6px;
              border-radius: 0 0 9px 9px;
            }
            .signature-box {
              width: 65px;
              border-bottom: 2px solid #1e40af;
              height: 16px;
              margin-top: 3px;
            }
            .signature-label {
              font-weight: bold;
              margin-bottom: 1px;
              color: #1e40af;
            }
          </style>
        </head>
        <body>
          <!-- Front Side -->
          <div class="card">
            <div class="card-header">
              <div class="logo">NGO</div>
              <div class="org-info">
                <div class="org-name">${settings.organizationName || 'Hope Foundation NGO'}</div>
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
              <div class="back-org-name">${settings.organizationName || 'Hope Foundation NGO'}</div>
              <div>${settings.address || '123 Main Street, City, State 12345'}</div>
              <div>Phone: ${settings.phoneNumber || '(555) 123-4567'} | Email: ${settings.emailAddress || 'info@hopefoundation.org'}</div>
              <div>Website: ${settings.website || 'www.hopefoundation.org'}</div>
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
                <div>This card is the exclusive property of ${settings.organizationName || 'Hope Foundation NGO'}.</div>
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
