import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member, NgoSettings } from "@shared/schema";
import { Heart, User, QrCode } from "lucide-react";

interface CardPreviewProps {
  member: Partial<Member> | null;
  photoFile?: File | null;
}

export default function CardPreview({ member, photoFile }: CardPreviewProps) {
  const [showBack, setShowBack] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  if (!member) {
    return (
      <div className="text-center py-12">
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200 opacity-50" style={{width: '324px', height: '204px'}}>
          {/* Clean Header with Subtle Green Accent */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-2 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <Heart className="h-5 w-5 text-white" />
              </div>
              
              {/* Organization Info */}
              <div className="text-right max-w-[110px]">
                <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1">
                  Your NGO Name
                </h4>
                <div className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                  ID CARD
                </div>
              </div>
            </div>
          </div>

          {/* Member Photo Section */}
          <div className="flex justify-center pt-6 pb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-lg">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
              </div>

            </div>
          </div>

          {/* Member Information */}
          <div className="px-4 pb-4">
            {/* Name and Designation */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                Member Name
              </h3>
              <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                Designation
              </span>
            </div>
            
            {/* Member ID */}
            <div className="text-center mb-4">
              <div className="inline-block bg-slate-800 text-white px-3 py-1.5 rounded-lg">
                <p className="text-xs font-mono font-bold tracking-wider">
                  NGO-YYYY-001
                </p>
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-600 font-medium">Joined</span>
                <span className="text-xs text-slate-900 font-semibold">
                  Jan 2024
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                <span className="text-xs text-emerald-700 font-medium">Contact</span>
                <span className="text-xs text-emerald-900 font-semibold">
                  +1 555-0123
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg">
                <span className="text-xs text-red-700 font-medium">Blood Type</span>
                <span className="text-xs text-red-900 font-semibold">
                  O+
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Fill the form to see preview</p>
      </div>
    );
  }

  const photoUrl = photoFile ? URL.createObjectURL(photoFile) : member.photoUrl;

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex space-x-4">
        <Button
          variant={!showBack ? "default" : "outline"}
          onClick={() => setShowBack(false)}
          data-testid="show-front"
        >
          Front
        </Button>
        <Button
          variant={showBack ? "default" : "outline"}
          onClick={() => setShowBack(true)}
          data-testid="show-back"
        >
          Back
        </Button>
      </div>

      {/* Card Front Side */}
      {!showBack && (
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200" style={{width: '324px', height: '204px'}} data-testid="card-front">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-2 py-1.5 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg border border-white">
                {settings && settings.logoUrl ? (
                  <img 
                    src={settings?.logoUrl || ''} 
                    alt="NGO Logo"
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <Heart className="h-3 w-3 text-white" />
                )}
              </div>
              
              {/* Organization Info */}
              <div className="text-right">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                  {settings?.organizationName || "Your NGO Name"}
                </h4>
                <div className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-xs font-medium mt-0.5">
                  ID CARD
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Horizontal Layout */}
          <div className="flex items-stretch p-2 gap-2 h-[172px]">
            {/* Member Photo */}
            <div className="flex-shrink-0">
              <div className="w-14 h-18 rounded-lg bg-slate-100 overflow-hidden border border-white shadow-md">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Member photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Member Information */}
            <div className="flex-1 h-full flex flex-col justify-between py-1">
              {/* Name and Designation */}
              <div className="text-center">
                <h3 className="font-bold text-xs text-slate-900 mb-1 leading-tight">
                  {member.fullName || "Member Name"}
                </h3>
                <span className="inline-block bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide">
                  {member.designation || "Designation"}
                </span>
              </div>
              
              {/* Member ID */}
              <div className="text-center my-1">
                <div className="inline-block bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
                  {member.memberId || "NGO-YYYY-001"}
                </div>
              </div>
              
              {/* Details Grid - All Fields Required */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="bg-slate-50 rounded px-1.5 py-1">
                  <div className="text-slate-600 font-medium text-xs">Joined</div>
                  <div className="text-slate-900 font-semibold text-xs">
                    {member.joiningDate 
                      ? new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : "Jan 2024"
                    }
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded px-1.5 py-1">
                  <div className="text-emerald-700 font-medium text-xs">Contact</div>
                  <div className="text-emerald-900 font-semibold text-xs">
                    {member.contactNumber || "+1 555-0123"}
                  </div>
                </div>
                
                <div className="bg-red-50 rounded px-1.5 py-1">
                  <div className="text-red-700 font-medium text-xs">Blood</div>
                  <div className="text-red-900 font-semibold text-xs">
                    {member.bloodGroup || "O+"}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded px-1.5 py-1">
                  <div className="text-blue-700 font-medium text-xs">Status</div>
                  <div className="text-blue-900 font-semibold text-xs">
                    Active
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded px-1.5 py-1 col-span-2">
                  <div className="text-yellow-700 font-medium text-xs">Address</div>
                  <div className="text-yellow-900 font-semibold text-xs truncate">
                    {member.address || "123 Main Street, City"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
        </div>
      )}

      {/* Card Back Side */}
      {showBack && (
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200" style={{width: '324px', height: '204px'}} data-testid="card-back">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-2 py-1.5 border-b border-emerald-200">
            <div className="text-center">
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {settings?.organizationName || "Your NGO Name"}
              </h4>
              <div className="text-xs text-slate-600">
                <p className="leading-tight text-xs">
                  {settings?.address || "123 Main Street, City, State 12345"}
                </p>
                <p className="mt-0.5 text-xs">
                  {settings?.phoneNumber || "(555) 123-4567"} • {settings?.emailAddress || "info@yourorg.org"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="p-2 h-[162px] flex flex-col gap-1.5">
            {/* Emergency Contact Section - Always Show */}
            <div className="bg-red-50 rounded-lg p-1.5 border border-red-100 flex-shrink-0">
              <h5 className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                Emergency Contact
              </h5>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div>
                  <span className="text-red-700 font-medium block text-xs">Name:</span>
                  <span className="text-red-900 font-semibold text-xs">
                    {member.emergencyContactName || "Emergency Contact"}
                  </span>
                </div>
                <div>
                  <span className="text-red-700 font-medium block text-xs">Phone:</span>
                  <span className="text-red-900 font-semibold text-xs">
                    {member.emergencyContactNumber || "+1 555-9999"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Additional Member Details */}
            <div className="grid grid-cols-2 gap-1.5 text-xs flex-shrink-0">
              <div className="bg-blue-50 rounded px-1.5 py-1">
                <div className="text-blue-700 font-medium text-xs">Email</div>
                <div className="text-blue-900 font-semibold text-xs truncate">
                  {member.emailAddress || "member@email.com"}
                </div>
              </div>
              
              <div className="bg-purple-50 rounded px-1.5 py-1">
                <div className="text-purple-700 font-medium text-xs">Department</div>
                <div className="text-purple-900 font-semibold text-xs">
                  {member.department || "General"}
                </div>
              </div>
              
              <div className="bg-green-50 rounded px-1.5 py-1">
                <div className="text-green-700 font-medium text-xs">ID Type</div>
                <div className="text-green-900 font-semibold text-xs">
                  Member ID
                </div>
              </div>
              
              <div className="bg-orange-50 rounded px-1.5 py-1">
                <div className="text-orange-700 font-medium text-xs">Valid</div>
                <div className="text-orange-900 font-semibold text-xs">
                  {new Date().getFullYear() + 1}
                </div>
              </div>
            </div>
            
            {/* QR Code and Instructions */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-800 font-semibold mb-0.5">
                  Property of {settings?.organizationName || "Your NGO"}
                </p>
                <p className="text-xs text-slate-600 leading-tight">
                  If found, please return to above address.
                </p>
              </div>
            </div>
            
            {/* Signatures Section */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <div>
                <p className="text-xs text-slate-600 mb-0.5 font-medium">Authorized By</p>
                <div className="w-full h-4 border-b border-dotted border-slate-300 flex items-end">
                  {settings && settings.signatureUrl && (
                    <img 
                      src={settings?.signatureUrl || ''} 
                      alt="Signature"
                      className="h-full object-contain"
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-0.5 font-medium">Member Sign</p>
                <div className="w-full h-4 border-b border-dotted border-slate-300"></div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <p className="text-xs text-slate-500 italic">
              Valid with authorized signature only
            </p>
          </div>
          
          {/* Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
        </div>
      )}
    </div>
  );
}
