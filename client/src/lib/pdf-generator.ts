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
        <div id="card-front" style="width: ${cardWidth}px; height: ${cardHeight}px; background: white; border: 3px solid #d1d5db; border-radius: 36px; overflow: hidden; position: relative; box-shadow: 0 36px 108px rgba(0,0,0,0.15); font-family: Arial, sans-serif;">
          <!-- Complex Geometric Background -->
          <div style="position: absolute; inset: 0;">
            <!-- Base gradient -->
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom right, #059669, #10b981, #0d9488);"></div>
            
            <!-- Geometric overlays -->
            <svg style="position: absolute; inset: 0; width: 100%; height: 100%;" viewBox="0 0 615 991">
              <defs>
                <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                  <rect width="60" height="60" fill="transparent"/>
                  <rect width="3" height="60" fill="rgba(255,255,255,0.05)"/>
                </pattern>
                <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="rgba(16,185,129,0.9)"/>
                  <stop offset="50%" stop-color="rgba(5,150,105,0.95)"/>
                  <stop offset="100%" stop-color="rgba(6,78,59,0.9)"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#cardGradient)"/>
              <rect width="100%" height="100%" fill="url(#diagonalStripes)"/>
              
              <!-- Decorative geometric shapes -->
              <circle cx="570" cy="60" r="75" fill="rgba(255,255,255,0.08)"/>
              <circle cx="600" cy="90" r="45" fill="rgba(255,255,255,0.05)"/>
              <polygon points="0,240 150,180 90,360" fill="rgba(255,255,255,0.06)"/>
              <polygon points="510,300 615,270 615,390 540,420" fill="rgba(255,255,255,0.04)"/>
              <polygon points="0,600 120,540 60,720 0,690" fill="rgba(255,255,255,0.05)"/>
              
              <!-- Curved elements -->
              <path d="M 0,450 Q 150,360 300,450 T 615,420 L 615,480 Q 450,510 300,480 T 0,510 Z" fill="rgba(255,255,255,0.06)"/>
            </svg>
            
            <!-- Gradient overlay -->
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.2), transparent, rgba(255,255,255,0.1));"></div>
          </div>

          <!-- Header Section with Logo and Org Info -->
          <div style="position: relative; z-index: 30; padding: 36px; padding-top: 48px;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
              <!-- Logo with decorative frame -->
              <div style="position: relative;">
                <div style="width: 144px; height: 144px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); padding: 6px; box-shadow: 0 24px 72px rgba(0,0,0,0.2);">
                  <div style="width: 100%; height: 100%; border-radius: 50%; background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;">
                    ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width:96px;height:96px;border-radius:50%;object-fit:contain;">` : '<div style="font-size:72px;color:white;">♥</div>'}
                  </div>
                </div>
                <!-- Decorative rings -->
                <div style="position: absolute; inset: -12px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2);"></div>
                <div style="position: absolute; inset: -24px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.1);"></div>
              </div>
              
              <!-- Organization Info -->
              <div style="text-align: right; color: white; max-width: 360px;">
                <div style="font-size: 36px; font-weight: bold; line-height: 1.2; margin-bottom: 12px; text-shadow: 0 6px 12px rgba(0,0,0,0.3);">
                  ${settings.organizationName || 'Your NGO Name'}
                </div>
                <div style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(6px); border-radius: 999px; padding: 12px 24px;">
                  <div style="font-size: 36px; font-weight: 600; letter-spacing: 0.2em;">VOLUNTEER ID</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Member Photo Section with Creative Frame -->
          <div style="position: relative; z-index: 20; display: flex; justify-content: center; margin-top: -24px;">
            <div style="position: relative;">
              <!-- Outer decorative ring -->
              <div style="width: 240px; height: 240px; border-radius: 50%; background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)); padding: 12px; backdrop-filter: blur(6px);">
                <!-- Inner decorative ring -->
                <div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(to bottom right, rgba(209, 250, 229, 0.8), rgba(167, 243, 208, 0.8)); padding: 12px;">
                  <!-- Photo container -->
                  <div style="width: 100%; height: 100%; border-radius: 50%; background: white; overflow: hidden; box-shadow: 0 24px 72px rgba(0,0,0,0.2);">
                    ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:96px;">Photo</div>'}
                  </div>
                </div>
              </div>
              
              <!-- Status indicators -->
              <div style="position: absolute; bottom: -12px; right: -12px; width: 60px; height: 60px; background: #34d399; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 36px rgba(0,0,0,0.3);">
                <div style="width: 24px; height: 24px; background: white; border-radius: 50%;"></div>
              </div>
              
              <!-- Decorative elements around photo -->
              <div style="position: absolute; top: -12px; left: -12px; width: 36px; height: 36px; background: rgba(255, 255, 255, 0.6); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -12px; left: -24px; width: 24px; height: 24px; background: rgba(255, 255, 255, 0.4); border-radius: 50%;"></div>
              <div style="position: absolute; top: -24px; right: -12px; width: 24px; height: 24px; background: rgba(255, 255, 255, 0.5); border-radius: 50%;"></div>
            </div>
          </div>

          <!-- Member Details Card -->
          <div style="position: relative; z-index: 10; margin: 36px; margin-top: 48px; margin-bottom: 48px;">
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-radius: 36px; box-shadow: 0 24px 72px rgba(0,0,0,0.2); border: 3px solid rgba(255, 255, 255, 0.5);">
              <!-- Name and Designation -->
              <div style="padding: 36px; padding-bottom: 24px; text-align: center; border-bottom: 3px solid #f3f4f6;">
                <div style="font-size: 54px; font-weight: bold; color: #1f2937; line-height: 1.2; margin-bottom: 12px;">
                  ${member.fullName}
                </div>
                <div style="display: inline-block; background: linear-gradient(to right, #d1fae5, #a7f3d0); padding: 12px 36px; border-radius: 999px;">
                  <div style="color: #047857; font-weight: 600; font-size: 36px; text-transform: uppercase; letter-spacing: 0.15em;">
                    ${member.designation}
                  </div>
                </div>
              </div>
              
              <!-- Member ID with decorative styling -->
              <div style="padding: 36px; padding-top: 24px; padding-bottom: 12px; text-align: center;">
                <div style="display: inline-block; background: linear-gradient(to right, #1f2937, #111827); color: white; padding: 12px 36px; border-radius: 18px; box-shadow: 0 12px 36px rgba(0,0,0,0.3);">
                  <div style="font-size: 36px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 0.2em;">
                    ${member.memberId}
                  </div>
                </div>
              </div>
              
              <!-- Details Grid -->
              <div style="padding: 36px; padding-top: 24px;">
                <div style="margin-bottom: 24px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #f9fafb; border-radius: 18px;">
                    <span style="font-size: 36px; color: #6b7280; font-weight: 500; display: flex; align-items: center;">
                      <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 24px;"></div>
                      Joining Date
                    </span>
                    <span style="font-size: 36px; color: #1f2937; font-weight: bold;">
                      ${new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #d1fae5; border-radius: 18px;">
                    <span style="font-size: 36px; color: #047857; font-weight: 500; display: flex; align-items: center;">
                      <div style="width: 12px; height: 12px; background: #059669; border-radius: 50%; margin-right: 24px;"></div>
                      Contact
                    </span>
                    <span style="font-size: 36px; color: #065f46; font-weight: bold;">
                      ${member.contactNumber}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #fef2f2; border-radius: 18px;">
                    <span style="font-size: 36px; color: #b91c1c; font-weight: 500; display: flex; align-items: center;">
                      <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 24px;"></div>
                      Blood Group
                    </span>
                    <span style="font-size: 36px; color: #991b1b; font-weight: bold;">
                      ${member.bloodGroup || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Decorative Elements -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 36px;">
            <div style="background: linear-gradient(to right, #047857, #059669, #0d9488); height: 100%;">
              <div style="height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);"></div>
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
    
    // Open PDF in new tab
    const fileName = `ID-Card-${member.fullName.replace(/\s+/g, '-')}-${member.memberId}.pdf`;
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    console.log('Attempting to open PDF in new tab...');
    
    // Try to open in new tab
    const newTab = window.open('', '_blank');
    if (newTab) {
      console.log('New tab opened successfully');
      newTab.location.href = pdfUrl;
      // Clean up URL after a delay to ensure PDF loads
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } else {
      console.log('Popup blocked, falling back to download');
      // Fallback: if popup blocked, download the file
      pdf.save(fileName);
      URL.revokeObjectURL(pdfUrl);
    }
    
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}