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
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white max-w-sm mx-auto opacity-50">
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8" />
            <div className="text-right">
              <h4 className="text-sm font-bold">Your NGO Name</h4>
              <p className="text-xs opacity-75">VOLUNTEER ID</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Member Name</h3>
              <p className="text-sm opacity-75">Designation</p>
              <p className="text-xs opacity-75">NGO-YYYY-001</p>
            </div>
          </div>
          
          <div className="text-xs space-y-1 opacity-75">
            <div className="flex justify-between">
              <span>Joining Date:</span>
              <span>Jan 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Contact:</span>
              <span>+1 555-0123</span>
            </div>
            <div className="flex justify-between">
              <span>Blood Group:</span>
              <span>O+</span>
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg max-w-sm mx-auto" data-testid="card-front">
          <div className="flex items-center justify-between mb-4">
            {settings && settings.logoUrl ? (
              <img 
                src={settings?.logoUrl || ''} 
                alt="NGO Logo"
                className="w-12 h-12 object-contain bg-white rounded-full p-1"
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="text-right">
              <h4 className="text-sm font-bold">
                {settings?.organizationName || "Your NGO Name"}
              </h4>
              <p className="text-xs opacity-75">VOLUNTEER ID</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-lg mr-4 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt="Member photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{member.fullName || "Member Name"}</h3>
              <p className="text-sm opacity-75 capitalize">{member.designation || "Designation"}</p>
              <p className="text-xs opacity-75">
                {member.memberId || "NGO-YYYY-001"}
              </p>
            </div>
          </div>
          
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Joining Date:</span>
              <span>
                {member.joiningDate 
                  ? new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : "Jan 2024"
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contact:</span>
              <span>{member.contactNumber || "+1 555-0123"}</span>
            </div>
            <div className="flex justify-between">
              <span>Blood Group:</span>
              <span>{member.bloodGroup || "O+"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Back Side */}
      {showBack && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 max-w-sm mx-auto" data-testid="card-back">
          <div className="text-center mb-4">
            <h4 className="text-sm font-bold text-gray-800">
              {settings?.organizationName || "Your NGO Name"}
            </h4>
            <p className="text-xs text-gray-600">
              {settings?.address || "123 Main Street, City, State 12345"}
            </p>
            <p className="text-xs text-gray-600">
              Phone: {settings?.phoneNumber || "(555) 123-4567"} | 
              Email: {settings?.emailAddress || "info@yourorg.org"}
            </p>
          </div>
          
          <div className="border-t border-gray-300 pt-4 mb-4">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Emergency Contact:</h5>
            <p className="text-xs text-gray-600">
              {member.emergencyContactName || "Emergency Contact Name"}
            </p>
            <p className="text-xs text-gray-600">
              {member.emergencyContactNumber || "+1 555-9876"}
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
              <QrCode className="h-6 w-6 text-gray-500" />
            </div>
            <div className="text-xs text-gray-600 text-right flex-1 ml-3">
              <p className="mb-2">
                <strong>This card is property of {settings?.organizationName || "Your NGO"}.</strong>
              </p>
              <p>If found, please return to the above address.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-gray-600 mb-1">Authorized Signatory</p>
                <div className="w-20 h-8 border-b border-gray-400">
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
                <p className="text-gray-600 mb-1">Member Signature</p>
                <div className="w-20 h-8 border-b border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
