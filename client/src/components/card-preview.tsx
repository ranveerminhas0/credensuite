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
        <div className="relative bg-white rounded-xl shadow-2xl mx-auto overflow-hidden opacity-50" style={{width: '205px', height: '330px'}}>
          {/* Complex Geometric Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600"></div>
            <div className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 205 330">
                <defs>
                  <pattern id="diagonalStripesEmpty" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                    <rect width="20" height="20" fill="transparent"/>
                    <rect width="1" height="20" fill="rgba(255,255,255,0.05)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="rgba(16,185,129,0.9)"/>
                <rect width="100%" height="100%" fill="url(#diagonalStripesEmpty)"/>
                <circle cx="190" cy="20" r="25" fill="rgba(255,255,255,0.08)"/>
                <polygon points="0,80 50,60 30,120" fill="rgba(255,255,255,0.06)"/>
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
          </div>

          {/* Header Section */}
          <div className="relative z-30 p-3 pt-4">
            <div className="flex items-start justify-between">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute -inset-1 rounded-full border border-white/20"></div>
                <div className="absolute -inset-2 rounded-full border border-white/10"></div>
              </div>
              <div className="text-right text-white max-w-[120px]">
                <h4 className="text-xs font-bold leading-tight mb-1 drop-shadow-md">Your NGO Name</h4>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <p className="text-xs font-semibold tracking-wider">VOLUNTEER ID</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Photo Section */}
          <div className="relative z-20 flex justify-center -mt-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 p-1 backdrop-blur-sm">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-200/80 to-green-300/80 p-1">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden shadow-lg">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/60 rounded-full"></div>
              <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="absolute -top-2 -right-1 w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Member Details Card */}
          <div className="relative z-10 mx-3 mt-4 mb-4">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
              <div className="p-3 pb-2 text-center border-b border-gray-100">
                <h3 className="font-bold text-base text-gray-800 leading-tight mb-1">Member Name</h3>
                <div className="inline-block bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1 rounded-full">
                  <p className="text-emerald-700 font-semibold text-xs uppercase tracking-wide">Designation</p>
                </div>
              </div>
              <div className="px-3 pt-2 pb-1 text-center">
                <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1 rounded-lg shadow-md">
                  <p className="text-xs font-mono font-bold tracking-wider">NGO-YYYY-001</p>
                </div>
              </div>
              <div className="p-3 pt-2 space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Joining Date
                  </span>
                  <span className="text-xs text-gray-800 font-bold">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-emerald-50 rounded-lg">
                  <span className="text-xs text-emerald-700 font-medium flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                    Contact
                  </span>
                  <span className="text-xs text-emerald-800 font-bold">+1 555-0123</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-red-50 rounded-lg">
                  <span className="text-xs text-red-700 font-medium flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Blood Group
                  </span>
                  <span className="text-xs text-red-800 font-bold">O+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-3">
            <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 h-full">
              <div className="h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
          </div>
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
        <div className="relative bg-white rounded-xl shadow-2xl mx-auto overflow-hidden border border-gray-100" style={{width: '205px', height: '330px'}} data-testid="card-front">
          {/* Complex Geometric Background */}
          <div className="absolute inset-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600"></div>
            
            {/* Geometric overlays */}
            <div className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 205 330">
                {/* Diagonal stripes */}
                <defs>
                  <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                    <rect width="20" height="20" fill="transparent"/>
                    <rect width="1" height="20" fill="rgba(255,255,255,0.05)"/>
                  </pattern>
                  <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16,185,129,0.9)"/>
                    <stop offset="50%" stopColor="rgba(5,150,105,0.95)"/>
                    <stop offset="100%" stopColor="rgba(6,78,59,0.9)"/>
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#cardGradient)"/>
                <rect width="100%" height="100%" fill="url(#diagonalStripes)"/>
                
                {/* Decorative geometric shapes */}
                <circle cx="190" cy="20" r="25" fill="rgba(255,255,255,0.08)"/>
                <circle cx="200" cy="30" r="15" fill="rgba(255,255,255,0.05)"/>
                <polygon points="0,80 50,60 30,120" fill="rgba(255,255,255,0.06)"/>
                <polygon points="170,100 205,90 205,130 180,140" fill="rgba(255,255,255,0.04)"/>
                <polygon points="0,200 40,180 20,240 0,230" fill="rgba(255,255,255,0.05)"/>
                
                {/* Curved elements */}
                <path d="M 0,150 Q 50,120 100,150 T 205,140 L 205,160 Q 150,170 100,160 T 0,170 Z" fill="rgba(255,255,255,0.06)"/>
              </svg>
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
          </div>

          {/* Header Section with Logo and Org Info */}
          <div className="relative z-30 p-3 pt-4">
            <div className="flex items-start justify-between">
              {/* Logo with decorative frame */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    {settings && settings.logoUrl ? (
                      <img 
                        src={settings?.logoUrl || ''} 
                        alt="NGO Logo"
                        className="w-8 h-8 object-contain rounded-full"
                      />
                    ) : (
                      <Heart className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
                {/* Decorative rings */}
                <div className="absolute -inset-1 rounded-full border border-white/20"></div>
                <div className="absolute -inset-2 rounded-full border border-white/10"></div>
              </div>
              
              {/* Organization Info */}
              <div className="text-right text-white max-w-[120px]">
                <h4 className="text-xs font-bold leading-tight mb-1 drop-shadow-md">
                  {settings?.organizationName || "Your NGO Name"}
                </h4>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <p className="text-xs font-semibold tracking-wider">VOLUNTEER ID</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Photo Section with Creative Frame */}
          <div className="relative z-20 flex justify-center -mt-2">
            <div className="relative">
              {/* Outer decorative ring */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 p-1 backdrop-blur-sm">
                {/* Inner decorative ring */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-200/80 to-green-300/80 p-1">
                  {/* Photo container */}
                  <div className="w-full h-full rounded-full bg-white overflow-hidden shadow-lg">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Member photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Decorative elements around photo */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/60 rounded-full"></div>
              <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="absolute -top-2 -right-1 w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Member Details Card */}
          <div className="relative z-10 mx-3 mt-4 mb-4">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
              {/* Name and Designation */}
              <div className="p-3 pb-2 text-center border-b border-gray-100">
                <h3 className="font-bold text-base text-gray-800 leading-tight mb-1">
                  {member.fullName || "Member Name"}
                </h3>
                <div className="inline-block bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1 rounded-full">
                  <p className="text-emerald-700 font-semibold text-xs uppercase tracking-wide">
                    {member.designation || "Designation"}
                  </p>
                </div>
              </div>
              
              {/* Member ID with decorative styling */}
              <div className="px-3 pt-2 pb-1 text-center">
                <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1 rounded-lg shadow-md">
                  <p className="text-xs font-mono font-bold tracking-wider">
                    {member.memberId || "NGO-YYYY-001"}
                  </p>
                </div>
              </div>
              
              {/* Details Grid */}
              <div className="p-3 pt-2 space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Joining Date
                  </span>
                  <span className="text-xs text-gray-800 font-bold">
                    {member.joiningDate 
                      ? new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : "Jan 2024"
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1.5 px-2 bg-emerald-50 rounded-lg">
                  <span className="text-xs text-emerald-700 font-medium flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                    Contact
                  </span>
                  <span className="text-xs text-emerald-800 font-bold">
                    {member.contactNumber || "+1 555-0123"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1.5 px-2 bg-red-50 rounded-lg">
                  <span className="text-xs text-red-700 font-medium flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Blood Group
                  </span>
                  <span className="text-xs text-red-800 font-bold">
                    {member.bloodGroup || "O+"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-3">
            <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 h-full">
              <div className="h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
          </div>
        </div>
      )}

      {/* Card Back Side */}
      {showBack && (
        <div className="relative bg-white rounded-xl shadow-2xl mx-auto overflow-hidden border border-gray-100" style={{width: '205px', height: '330px'}} data-testid="card-back">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-2 border-b border-emerald-100">
            <div className="text-center">
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {settings?.organizationName || "Your NGO Name"}
              </h4>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                  {settings?.address || "123 Main Street, City, State 12345"}
                </p>
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                  {settings?.phoneNumber || "(555) 123-4567"} | {settings?.emailAddress || "info@yourorg.org"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Emergency Contact Section */}
          <div className="p-2 border-b border-gray-100">
            <div className="bg-gray-50 rounded-lg p-2">
              <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Emergency Contact
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-800 font-semibold text-right flex-1 ml-2">
                    {member.emergencyContactName || "Emergency Contact Name"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-800 font-semibold">
                    {member.emergencyContactNumber || "+1 555-9876"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* QR Code and Instructions */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded flex items-center justify-center">
                <QrCode className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 font-semibold mb-0.5">
                  Property of {settings?.organizationName || "Your NGO"}
                </p>
                <p className="text-xs text-gray-600 leading-tight">
                  If found, please return to the above address.
                </p>
              </div>
            </div>
          </div>
          
          {/* Signatures Section */}
          <div className="p-2">
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1 font-medium">Authorized Signatory</p>
                <div className="w-full h-6 border-b border-dotted border-emerald-300 flex items-end">
                  {settings && settings.signatureUrl && (
                    <img 
                      src={settings?.signatureUrl || ''} 
                      alt="Signature"
                      className="h-full object-contain"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1 font-medium">Member Signature</p>
                <div className="w-full h-6 border-b border-dotted border-emerald-300"></div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 italic">
                Valid with authorized signature only
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
