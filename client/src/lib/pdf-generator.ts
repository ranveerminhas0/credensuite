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
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .card {
              width: 3.375in;
              height: 2.125in;
              background: linear-gradient(135deg, #2563eb, #1e40af);
              color: white;
              padding: 16px;
              box-sizing: border-box;
              page-break-after: always;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .logo {
              width: 32px;
              height: 32px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .org-info {
              text-align: right;
              font-size: 10px;
            }
            .member-info {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
            }
            .photo {
              width: 60px;
              height: 60px;
              background: #ccc;
              border-radius: 4px;
              margin-right: 12px;
              object-fit: cover;
            }
            .member-details h3 {
              margin: 0;
              font-size: 14px;
              font-weight: bold;
            }
            .member-details p {
              margin: 2px 0;
              font-size: 10px;
              opacity: 0.8;
            }
            .card-info {
              font-size: 8px;
            }
            .card-info div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .card-back {
              background: #f8f9fa;
              color: #333;
              border: 2px solid #dee2e6;
            }
            .back-header {
              text-align: center;
              margin-bottom: 12px;
              font-size: 10px;
            }
            .emergency-section {
              border-top: 1px solid #ccc;
              padding-top: 8px;
              margin-bottom: 8px;
              font-size: 8px;
            }
            .qr-section {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .qr-code {
              width: 40px;
              height: 40px;
              background: #e9ecef;
              border: 1px solid #ccc;
              margin-right: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
            }
            .signature-section {
              border-top: 1px solid #ccc;
              padding-top: 8px;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
            }
            .signature-box {
              width: 60px;
              border-bottom: 1px solid #666;
              height: 20px;
            }
          </style>
        </head>
        <body>
          <!-- Front Side -->
          <div class="card">
            <div class="card-header">
              <div class="logo">♥</div>
              <div class="org-info">
                <div style="font-weight: bold;">Hope Foundation NGO</div>
                <div>VOLUNTEER ID</div>
              </div>
            </div>
            
            <div class="member-info">
              ${photoUrl ? `<img src="${photoUrl}" alt="Photo" class="photo">` : '<div class="photo"></div>'}
              <div class="member-details">
                <h3>${member.fullName}</h3>
                <p style="text-transform: capitalize;">${member.designation}</p>
                <p>${member.memberId}</p>
              </div>
            </div>
            
            <div class="card-info">
              <div>
                <span>Joining Date:</span>
                <span>${new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span>Contact:</span>
                <span>${member.contactNumber}</span>
              </div>
              ${member.bloodGroup ? `<div><span>Blood Group:</span><span>${member.bloodGroup}</span></div>` : ''}
            </div>
          </div>

          <!-- Back Side -->
          <div class="card card-back">
            <div class="back-header">
              <div style="font-weight: bold;">Hope Foundation NGO</div>
              <div>123 Main Street, City, State 12345</div>
              <div>Phone: (555) 123-4567 | Email: info@hopefoundation.org</div>
            </div>
            
            ${member.emergencyContactName || member.emergencyContactNumber ? `
              <div class="emergency-section">
                <div style="font-weight: bold; margin-bottom: 4px;">Emergency Contact:</div>
                ${member.emergencyContactName ? `<div>${member.emergencyContactName}</div>` : ''}
                ${member.emergencyContactNumber ? `<div>${member.emergencyContactNumber}</div>` : ''}
              </div>
            ` : ''}
            
            <div class="qr-section">
              <div class="qr-code">QR</div>
              <div style="font-size: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">This card is property of Hope Foundation NGO.</div>
                <div>If found, please return to the above address.</div>
              </div>
            </div>
            
            <div class="signature-section">
              <div>
                <div>Authorized Signatory</div>
                <div class="signature-box"></div>
              </div>
              <div>
                <div>Member Signature</div>
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
