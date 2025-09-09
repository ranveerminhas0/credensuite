import jsPDF from 'jspdf';
import { Member } from '@shared/schema';
import { createApiUrl } from './api';

interface OrganizationSettings {
  organizationName: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  website: string;
  logoUrl?: string;
}

export async function exportMembersToPDF(
  members: Member[], 
  organizationSettings: OrganizationSettings,
  filters?: { searchQuery?: string; roleFilter?: string; statusFilter?: string }
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  
  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };
  
  // Helper function to add a line
  const addLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#E5E7EB') => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };
  
  // Header Section
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Organization Logo placeholder (if available)
  if (organizationSettings.logoUrl) {
    try {
      // For now, we'll add a placeholder for the logo
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, 10, 30, 30, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('LOGO', margin + 15, 25, { align: 'center' });
    } catch (error) {
      console.log('Logo not available for PDF');
    }
  }
  
  // Organization Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(organizationSettings.organizationName, margin + 40, 20);
  
  // Organization Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let orgDetailsY = 28;
  
  if (organizationSettings.phoneNumber) {
    doc.text(`Phone: ${organizationSettings.phoneNumber}`, margin + 40, orgDetailsY);
    orgDetailsY += 4;
  }
  
  if (organizationSettings.emailAddress) {
    doc.text(`Email: ${organizationSettings.emailAddress}`, margin + 40, orgDetailsY);
    orgDetailsY += 4;
  }
  
  if (organizationSettings.website) {
    doc.text(`Website: ${organizationSettings.website}`, margin + 40, orgDetailsY);
    orgDetailsY += 4;
  }
  
  if (organizationSettings.address) {
    doc.text(`Address: ${organizationSettings.address}`, margin + 40, orgDetailsY);
  }
  
  yPosition = 60;
  
  // Report Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMBERS DIRECTORY', margin, yPosition);
  yPosition += 10;
  
  // Report Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.text(`Generated on: ${reportDate}`, margin, yPosition);
  yPosition += 5;
  
  doc.text(`Total Members: ${members.length}`, margin, yPosition);
  yPosition += 5;
  
  // Filter information
  if (filters && (filters.searchQuery || filters.roleFilter || filters.statusFilter)) {
    doc.text('Applied Filters:', margin, yPosition);
    yPosition += 5;
    
    if (filters.searchQuery) {
      doc.text(`• Search: "${filters.searchQuery}"`, margin + 10, yPosition);
      yPosition += 4;
    }
    
    if (filters.roleFilter && filters.roleFilter !== 'all') {
      doc.text(`• Role: ${filters.roleFilter}`, margin + 10, yPosition);
      yPosition += 4;
    }
    
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      doc.text(`• Status: ${filters.statusFilter}`, margin + 10, yPosition);
      yPosition += 4;
    }
  }
  
  yPosition += 10;
  
  // Members Table Header
  addLine(margin, yPosition, pageWidth - margin, yPosition, '#6B7280');
  yPosition += 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const colWidths = [25, 40, 30, 25, 30, 20];
  const headers = ['ID', 'Name', 'Role', 'Contact', 'Joining Date', 'Status'];
  let xPosition = margin;
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });
  
  yPosition += 5;
  addLine(margin, yPosition, pageWidth - margin, yPosition, '#6B7280');
  yPosition += 8;
  
  // Members Data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  members.forEach((member, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
      
      // Add header to new page
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MEMBERS DIRECTORY (continued)', margin, 20);
      
      yPosition = 40;
      doc.setTextColor(0, 0, 0);
    }
    
    xPosition = margin;
    
    // Member ID
    doc.text(member.memberId, xPosition, yPosition);
    xPosition += colWidths[0];
    
    // Name
    doc.text(member.fullName, xPosition, yPosition);
    xPosition += colWidths[1];
    
    // Role
    doc.text(member.designation, xPosition, yPosition);
    xPosition += colWidths[2];
    
    // Contact
    doc.text(member.contactNumber, xPosition, yPosition);
    xPosition += colWidths[3];
    
    // Joining Date
    const joiningDate = new Date(member.joiningDate).toLocaleDateString();
    doc.text(joiningDate, xPosition, yPosition);
    xPosition += colWidths[4];
    
    // Status
    doc.text(member.isActive ? 'Active' : 'Inactive', xPosition, yPosition);
    
    yPosition += 6;
    
    // Add separator line every 5 members
    if ((index + 1) % 5 === 0 && index < members.length - 1) {
      addLine(margin, yPosition, pageWidth - margin, yPosition, '#E5E7EB');
      yPosition += 3;
    }
  });
  
  // Footer
  const footerY = pageHeight - 20;
  addLine(margin, footerY, pageWidth - margin, footerY, '#E5E7EB');
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, margin, footerY + 5);
  doc.text(`Generated by ${organizationSettings.organizationName}`, pageWidth - margin - 50, footerY + 5, { align: 'right' });
  
  // Save the PDF
  const fileName = `members-directory-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export async function fetchOrganizationSettings(): Promise<OrganizationSettings> {
  try {
    const token = await (await import("@/lib/auth")).auth.currentUser?.getIdToken();
    const response = await fetch(createApiUrl('/api/settings'), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch organization settings');
    }
    
    const settings = await response.json();
    return {
      organizationName: settings.organizationName || 'Organization',
      phoneNumber: settings.phoneNumber || '',
      emailAddress: settings.emailAddress || '',
      address: settings.address || '',
      website: settings.website || '',
      logoUrl: settings.logoUrl || undefined,
    };
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return {
      organizationName: 'Organization',
      phoneNumber: '',
      emailAddress: '',
      address: '',
      website: '',
    };
  }
}
