import { Member } from "@shared/schema";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(member: Member, photoFile?: File | null) {
  try {
    // Get organization settings
    const settingsResponse = await fetch('/api/settings');
    const settings = settingsResponse.ok ? await settingsResponse.json() : {};
    
    const photoUrl = photoFile ? URL.createObjectURL(photoFile) : member.photoUrl || '';
    
    // Create a temporary container for the cards
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.background = 'white';
    container.style.padding = '20px';
    
    // Card dimensions: 2.051" x 3.303" at 300 DPI = 615px x 991px
    const cardWidth = 615;
    const cardHeight = 991;
    
    container.innerHTML = `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <!-- Front Side -->
        <div id="card-front" style="width: ${cardWidth}px; height: ${cardHeight}px; background: white; border: 3px solid #d1d5db; border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.15); font-family: Arial, sans-serif;">
          <!-- Header Pattern -->
          <div style="height: 192px; background: linear-gradient(to right, #10b981, #059669); position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), transparent);"></div>
            <svg style="position: absolute; top: 0; right: 0; width: 288px; height: 192px;" viewBox="0 0 100 60">
              <polygon points="70,0 100,0 100,30" fill="rgba(255,255,255,0.1)" />
              <polygon points="85,15 100,15 100,45" fill="rgba(255,255,255,0.05)" />
            </svg>
            <div style="position: relative; z-index: 10; padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; color: white;">
              <div style="width: 96px; height: 96px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-size: 32px;">
                ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:contain;">` : '♥'}
              </div>
              <div style="text-align: right;">
                <div style="font-size: 30px; font-weight: bold; line-height: 1.2; margin-bottom: 6px;">${settings.organizationName || 'Your NGO Name'}</div>
                <div style="font-size: 24px; opacity: 0.9; font-weight: 500; letter-spacing: 0.15em;">VOLUNTEER ID</div>
              </div>
            </div>
          </div>
          
          <!-- Member Info -->
          <div style="padding: 36px; margin-top: -48px; position: relative; z-index: 20; flex: 1;">
            <div style="display: flex; align-items: flex-start; gap: 36px;">
              <div style="position: relative;">
                <div style="width: 192px; height: 192px; border-radius: 50%; background: linear-gradient(to bottom right, #d1fae5, #a7f3d0); padding: 12px;">
                  <div style="width: 100%; height: 100%; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 48px; overflow: hidden;">
                    ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : 'Photo'}
                  </div>
                </div>
                <div style="position: absolute; bottom: -12px; right: -12px; width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 18px; height: 18px; background: white; border-radius: 50%;"></div>
                </div>
              </div>
              <div style="flex: 1; padding-top: 12px;">
                <div style="font-size: 54px; font-weight: bold; color: #1f2937; line-height: 1.2; margin-bottom: 12px;">${member.fullName}</div>
                <div style="font-size: 30px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 18px;">${member.designation}</div>
                <div style="background: #d1fae5; color: #047857; padding: 9px 24px; border-radius: 12px; font-size: 30px; font-family: 'Courier New', monospace; display: inline-block;">${member.memberId}</div>
              </div>
            </div>
          </div>
          
          <!-- Details Section -->
          <div style="padding: 0 36px 36px;">
            <div style="background: #f9fafb; border-radius: 24px; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 30px; margin-bottom: 18px;">
                <span style="color: #6b7280; font-weight: 500;">Joining Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div style="height: 3px; background: #e5e7eb; margin: 18px 0;"></div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 30px; margin-bottom: 18px;">
                <span style="color: #6b7280; font-weight: 500;">Contact:</span>
                <span style="color: #1f2937; font-weight: 600;">${member.contactNumber}</span>
              </div>
              <div style="height: 3px; background: #e5e7eb; margin: 18px 0;"></div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 30px;">
                <span style="color: #6b7280; font-weight: 500;">Blood Group:</span>
                <span style="color: #10b981; font-weight: bold;">${member.bloodGroup || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Back Side -->
        <div id="card-back" style="width: ${cardWidth}px; height: ${cardHeight}px; background: white; border: 3px solid #d1d5db; border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.15); font-family: Arial, sans-serif; display: flex; flex-direction: column;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #d1fae5, #a7f3d0); padding: 24px; border-bottom: 3px solid #d1fae5; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; margin-bottom: 12px;">${settings.organizationName || 'Your NGO Name'}</div>
            <div style="font-size: 24px; color: #6b7280; display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;">
              <span style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></span>
              <span>${settings.address || '123 Main Street, City, State 12345'}</span>
            </div>
            <div style="font-size: 24px; color: #6b7280; display: flex; align-items: center; justify-content: center; gap: 12px;">
              <span style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></span>
              <span>${settings.phoneNumber || '(555) 123-4567'} | ${settings.emailAddress || 'info@yourorg.org'}</span>
            </div>
          </div>
          
          ${member.emergencyContactName || member.emergencyContactNumber ? `
            <!-- Emergency Contact -->
            <div style="padding: 24px; border-bottom: 3px solid #f3f4f6;">
              <div style="background: #f9fafb; border-radius: 24px; padding: 24px;">
                <div style="font-size: 30px; font-weight: 600; color: #1f2937; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                  <span style="width: 18px; height: 18px; background: #ef4444; border-radius: 50%;"></span>
                  Emergency Contact
                </div>
                ${member.emergencyContactName ? `
                  <div style="display: flex; justify-content: space-between; font-size: 30px; margin-bottom: 12px;">
                    <span style="color: #6b7280; font-weight: 500;">Name:</span>
                    <span style="color: #1f2937; font-weight: 600; text-align: right; flex: 1; margin-left: 24px;">${member.emergencyContactName}</span>
                  </div>
                ` : ''}
                ${member.emergencyContactNumber ? `
                  <div style="display: flex; justify-content: space-between; font-size: 30px;">
                    <span style="color: #6b7280; font-weight: 500;">Phone:</span>
                    <span style="color: #1f2937; font-weight: 600;">${member.emergencyContactNumber}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- QR Section -->
          <div style="padding: 24px; border-bottom: 3px solid #f3f4f6;">
            <div style="display: flex; align-items: center; gap: 24px;">
              <div style="width: 144px; height: 144px; background: linear-gradient(to bottom right, #d1fae5, #a7f3d0); border: 6px solid #d1fae5; border-radius: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="font-size: 48px; color: #10b981;">⧈</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 30px; color: #1f2937; font-weight: 600; margin-bottom: 6px;">Property of ${settings.organizationName || 'Your NGO'}</div>
                <div style="font-size: 24px; color: #6b7280; line-height: 1.3;">If found, please return to the above address or contact us immediately.</div>
              </div>
            </div>
          </div>
          
          <!-- Signatures -->
          <div style="padding: 24px; margin-top: auto;">
            <div style="display: flex; justify-content: space-between; gap: 24px;">
              <div style="flex: 1;">
                <div style="font-size: 24px; color: #6b7280; font-weight: 500; margin-bottom: 12px;">Authorized Signatory</div>
                <div style="width: 100%; height: 72px; border-bottom: 6px dotted #10b981; display: flex; align-items: end;">
                  ${settings.signatureUrl ? `<img src="${settings.signatureUrl}" style="height:100%;object-fit:contain;">` : ''}
                </div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 24px; color: #6b7280; font-weight: 500; margin-bottom: 12px;">Member Signature</div>
                <div style="width: 100%; height: 72px; border-bottom: 6px dotted #10b981;"></div>
              </div>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <div style="font-size: 24px; color: #6b7280; font-style: italic;">Valid with authorized signature only</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create PDF with exact credit card dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [2.051, 3.303]
    });
    
    // Capture front side
    const frontCard = container.querySelector('#card-front') as HTMLElement;
    const frontCanvas = await html2canvas(frontCard, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    
    // Add front side to PDF
    pdf.addImage(
      frontCanvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      2.051,
      3.303
    );
    
    // Add new page for back side
    pdf.addPage([2.051, 3.303]);
    
    // Capture back side
    const backCard = container.querySelector('#card-back') as HTMLElement;
    const backCanvas = await html2canvas(backCard, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    
    // Add back side to PDF
    pdf.addImage(
      backCanvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      2.051,
      3.303
    );
    
    // Clean up
    document.body.removeChild(container);
    
    // Clean up object URL if created
    if (photoFile && photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    
    // Download the PDF
    const fileName = `ID-Card-${member.fullName.replace(/\s+/g, '-')}-${member.memberId}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
}