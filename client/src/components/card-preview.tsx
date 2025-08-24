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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-sm mx-auto overflow-hidden opacity-50">
          {/* Geometric Header Pattern */}
          <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-green-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"></div>
            <svg className="absolute top-0 right-0 w-32 h-24" viewBox="0 0 100 60">
              <polygon points="70,0 100,0 100,30" fill="rgba(255,255,255,0.1)" />
              <polygon points="85,15 100,15 100,45" fill="rgba(255,255,255,0.05)" />
            </svg>
            <div className="relative z-10 p-4 flex items-start justify-between text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div className="text-right">
                <h4 className="text-sm font-bold leading-tight">Your NGO Name</h4>
                <p className="text-xs opacity-90 font-medium tracking-wider">VOLUNTEER ID</p>
              </div>
            </div>
          </div>
          
          {/* Member Info Section */}
          <div className="p-4 -mt-6 relative z-20">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 p-1">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-xl text-gray-800 leading-tight">Member Name</h3>
                <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Designation</p>
                <div className="mt-1 px-2 py-1 bg-emerald-50 rounded text-xs font-mono text-emerald-700">
                  NGO-YYYY-001
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Joining Date:</span>
                <span className="text-gray-800 font-semibold">Jan 2024</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Contact:</span>
                <span className="text-gray-800 font-semibold">+1 555-0123</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Blood Group:</span>
                <span className="text-emerald-600 font-bold">O+</span>
              </div>
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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-sm mx-auto overflow-hidden border border-gray-100" data-testid="card-front">
          {/* Geometric Header Pattern */}
          <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-green-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"></div>
            <svg className="absolute top-0 right-0 w-32 h-24" viewBox="0 0 100 60">
              <polygon points="70,0 100,0 100,30" fill="rgba(255,255,255,0.1)" />
              <polygon points="85,15 100,15 100,45" fill="rgba(255,255,255,0.05)" />
            </svg>
            <div className="relative z-10 p-4 flex items-start justify-between text-white">
              {settings && settings.logoUrl ? (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm p-1">
                  <img 
                    src={settings?.logoUrl || ''} 
                    alt="NGO Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Heart className="h-5 w-5" />
                </div>
              )}
              <div className="text-right">
                <h4 className="text-sm font-bold leading-tight">
                  {settings?.organizationName || "Your NGO Name"}
                </h4>
                <p className="text-xs opacity-90 font-medium tracking-wider">VOLUNTEER ID</p>
              </div>
            </div>
          </div>
          
          {/* Member Info Section */}
          <div className="p-4 -mt-6 relative z-20">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 p-1">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Member photo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-xl text-gray-800 leading-tight">{member.fullName || "Member Name"}</h3>
                <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide capitalize">{member.designation || "Designation"}</p>
                <div className="mt-1 px-2 py-1 bg-emerald-50 rounded text-xs font-mono text-emerald-700">
                  {member.memberId || "NGO-YYYY-001"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Joining Date:</span>
                <span className="text-gray-800 font-semibold">
                  {member.joiningDate 
                    ? new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : "Jan 2024"
                  }
                </span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Contact:</span>
                <span className="text-gray-800 font-semibold">{member.contactNumber || "+1 555-0123"}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Blood Group:</span>
                <span className="text-emerald-600 font-bold">{member.bloodGroup || "O+"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Back Side */}
      {showBack && (
        <div className="relative bg-white rounded-xl shadow-2xl max-w-sm mx-auto overflow-hidden border border-gray-100" data-testid="card-back">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-100">
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                {settings?.organizationName || "Your NGO Name"}
              </h4>
              <div className="space-y-1">
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
          <div className="p-4 border-b border-gray-100">
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Emergency Contact
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-800 font-semibold">
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
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-lg flex items-center justify-center">
                <QrCode className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 font-semibold mb-1">
                  Property of {settings?.organizationName || "Your NGO"}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  If found, please return to the above address or contact us immediately.
                </p>
              </div>
            </div>
          </div>
          
          {/* Signatures Section */}
          <div className="p-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-2 font-medium">Authorized Signatory</p>
                <div className="w-full h-8 border-b-2 border-dotted border-emerald-300 flex items-end">
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
                <p className="text-xs text-gray-600 mb-2 font-medium">Member Signature</p>
                <div className="w-full h-8 border-b-2 border-dotted border-emerald-300"></div>
              </div>
            </div>
            <div className="mt-4 text-center">
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
