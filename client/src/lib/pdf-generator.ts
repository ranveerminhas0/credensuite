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
              size: 2.051in 3.303in;
              margin: 0;
            }
            @media print {
              .card {
                width: 2.051in !important;
                height: 3.303in !important;
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
              width: 2.051in;
              height: 3.303in;
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              overflow: hidden;
              page-break-after: always;
              position: relative;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            /* Front Side Styles */
            .card-front {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            .header-pattern {
              height: 64px;
              background: linear-gradient(to right, #10b981, #059669);
              position: relative;
              overflow: hidden;
            }
            .header-pattern::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), transparent);
            }
            .header-pattern svg {
              position: absolute;
              top: 0;
              right: 0;
              width: 96px;
              height: 64px;
            }
            .header-content {
              position: relative;
              z-index: 10;
              padding: 8px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              color: white;
            }
            .logo-circle {
              width: 32px;
              height: 32px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(4px);
            }
            .org-info {
              text-align: right;
            }
            .org-name {
              font-size: 10px;
              font-weight: bold;
              line-height: 1.2;
            }
            .volunteer-id {
              font-size: 8px;
              opacity: 0.9;
              font-weight: 500;
              letter-spacing: 0.05em;
            }
            
            .member-info {
              padding: 12px;
              margin-top: -16px;
              position: relative;
              z-index: 20;
              flex: 1;
            }
            .member-row {
              display: flex;
              align-items: flex-start;
              gap: 12px;
            }
            .photo-container {
              position: relative;
            }
            .photo-frame {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: linear-gradient(to bottom right, #d1fae5, #a7f3d0);
              padding: 4px;
            }
            .photo {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: #e5e7eb;
              object-fit: cover;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              font-size: 12px;
            }
            .status-indicator {
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 16px;
              height: 16px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .status-dot {
              width: 6px;
              height: 6px;
              background: white;
              border-radius: 50%;
            }
            .member-details {
              flex: 1;
              padding-top: 4px;
            }
            .member-name {
              font-size: 14px;
              font-weight: bold;
              color: #1f2937;
              line-height: 1.2;
              margin-bottom: 2px;
            }
            .member-designation {
              font-size: 10px;
              color: #10b981;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 4px;
            }
            .member-id {
              background: #d1fae5;
              color: #047857;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-family: 'Courier New', monospace;
              display: inline-block;
            }
            
            .details-section {
              padding: 0 12px 12px;
            }
            .details-box {
              background: #f9fafb;
              border-radius: 8px;
              padding: 8px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              margin-bottom: 6px;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-label {
              color: #6b7280;
              font-weight: 500;
            }
            .detail-value {
              color: #1f2937;
              font-weight: 600;
            }
            .blood-group {
              color: #10b981 !important;
              font-weight: bold !important;
            }
            .detail-divider {
              height: 1px;
              background: #e5e7eb;
              margin: 6px 0;
            }
            
            /* Back Side Styles */
            .card-back {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            .back-header {
              background: linear-gradient(to right, #d1fae5, #a7f3d0);
              padding: 8px;
              border-bottom: 1px solid #d1fae5;
              text-align: center;
            }
            .back-org-name {
              font-size: 12px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 4px;
            }
            .back-address {
              font-size: 8px;
              color: #6b7280;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              margin-bottom: 2px;
            }
            .address-dot {
              width: 4px;
              height: 4px;
              background: #10b981;
              border-radius: 50%;
            }
            
            .emergency-section {
              padding: 8px;
              border-bottom: 1px solid #f3f4f6;
            }
            .emergency-box {
              background: #f9fafb;
              border-radius: 8px;
              padding: 8px;
            }
            .emergency-title {
              font-size: 10px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .emergency-indicator {
              width: 6px;
              height: 6px;
              background: #ef4444;
              border-radius: 50%;
            }
            .emergency-row {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 4px;
            }
            .emergency-row:last-child {
              margin-bottom: 0;
            }
            .emergency-label {
              color: #6b7280;
              font-weight: 500;
            }
            .emergency-value {
              color: #1f2937;
              font-weight: 600;
              text-align: right;
              flex: 1;
              margin-left: 8px;
            }
            
            .qr-section {
              padding: 8px;
              border-bottom: 1px solid #f3f4f6;
            }
            .qr-row {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .qr-code {
              width: 48px;
              height: 48px;
              background: linear-gradient(to bottom right, #d1fae5, #a7f3d0);
              border: 2px solid #d1fae5;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .qr-icon {
              font-size: 16px;
              color: #10b981;
            }
            .qr-text {
              flex: 1;
            }
            .qr-title {
              font-size: 10px;
              color: #1f2937;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .qr-description {
              font-size: 8px;
              color: #6b7280;
              line-height: 1.3;
            }
            
            .signature-section {
              padding: 8px;
              margin-top: auto;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
            }
            .signature-box {
              flex: 1;
            }
            .signature-label {
              font-size: 8px;
              color: #6b7280;
              font-weight: 500;
              margin-bottom: 4px;
            }
            .signature-line {
              width: 100%;
              height: 24px;
              border-bottom: 2px dotted #10b981;
              display: flex;
              align-items: end;
            }
            .validity-note {
              margin-top: 8px;
              text-align: center;
            }
            .validity-text {
              font-size: 8px;
              color: #6b7280;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <!-- Front Side -->
          <div class="card">
            <div class="card-front">
              <div class="header-pattern">
                <svg viewBox="0 0 100 60">
                  <polygon points="70,0 100,0 100,30" fill="rgba(255,255,255,0.1)" />
                  <polygon points="85,15 100,15 100,45" fill="rgba(255,255,255,0.05)" />
                </svg>
                <div class="header-content">
                  <div class="logo-circle">
                    ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width:20px;height:20px;border-radius:50%;object-fit:contain;">` : '♥'}
                  </div>
                  <div class="org-info">
                    <div class="org-name">${settings.organizationName || 'Your NGO Name'}</div>
                    <div class="volunteer-id">VOLUNTEER ID</div>
                  </div>
                </div>
              </div>
              
              <div class="member-info">
                <div class="member-row">
                  <div class="photo-container">
                    <div class="photo-frame">
                      <div class="photo">
                        ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : 'Photo'}
                      </div>
                    </div>
                    <div class="status-indicator">
                      <div class="status-dot"></div>
                    </div>
                  </div>
                  <div class="member-details">
                    <div class="member-name">${member.fullName}</div>
                    <div class="member-designation">${member.designation}</div>
                    <div class="member-id">${member.memberId}</div>
                  </div>
                </div>
              </div>
              
              <div class="details-section">
                <div class="details-box">
                  <div class="detail-row">
                    <span class="detail-label">Joining Date:</span>
                    <span class="detail-value">${new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div class="detail-divider"></div>
                  <div class="detail-row">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${member.contactNumber}</span>
                  </div>
                  <div class="detail-divider"></div>
                  <div class="detail-row">
                    <span class="detail-label">Blood Group:</span>
                    <span class="detail-value blood-group">${member.bloodGroup || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back Side -->
          <div class="card">
            <div class="card-back">
              <div class="back-header">
                <div class="back-org-name">${settings.organizationName || 'Your NGO Name'}</div>
                <div class="back-address">
                  <span class="address-dot"></span>
                  <span>${settings.address || '123 Main Street, City, State 12345'}</span>
                </div>
                <div class="back-address">
                  <span class="address-dot"></span>
                  <span>${settings.phoneNumber || '(555) 123-4567'} | ${settings.emailAddress || 'info@yourorg.org'}</span>
                </div>
              </div>
              
              ${member.emergencyContactName || member.emergencyContactNumber ? `
                <div class="emergency-section">
                  <div class="emergency-box">
                    <div class="emergency-title">
                      <span class="emergency-indicator"></span>
                      Emergency Contact
                    </div>
                    ${member.emergencyContactName ? `
                      <div class="emergency-row">
                        <span class="emergency-label">Name:</span>
                        <span class="emergency-value">${member.emergencyContactName}</span>
                      </div>
                    ` : ''}
                    ${member.emergencyContactNumber ? `
                      <div class="emergency-row">
                        <span class="emergency-label">Phone:</span>
                        <span class="emergency-value">${member.emergencyContactNumber}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              
              <div class="qr-section">
                <div class="qr-row">
                  <div class="qr-code">
                    <div class="qr-icon">⧈</div>
                  </div>
                  <div class="qr-text">
                    <div class="qr-title">Property of ${settings.organizationName || 'Your NGO'}</div>
                    <div class="qr-description">If found, please return to the above address or contact us immediately.</div>
                  </div>
                </div>
              </div>
              
              <div class="signature-section">
                <div class="signature-row">
                  <div class="signature-box">
                    <div class="signature-label">Authorized Signatory</div>
                    <div class="signature-line">
                      ${settings.signatureUrl ? `<img src="${settings.signatureUrl}" style="height:100%;object-fit:contain;">` : ''}
                    </div>
                  </div>
                  <div class="signature-box">
                    <div class="signature-label">Member Signature</div>
                    <div class="signature-line"></div>
                  </div>
                </div>
                <div class="validity-note">
                  <div class="validity-text">Valid with authorized signature only</div>
                </div>
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