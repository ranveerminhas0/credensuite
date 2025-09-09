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
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200 opacity-50" style={{width: '204px', height: '324px'}}>
          {/* Header */}
          <div className="relative h-20 bg-emerald-700 text-white flex items-center justify-center">
            <div className="text-center">
              <h4 className="text-sm font-bold">Your NGO Name</h4>
              <div className="text-[10px] opacity-90">Identification Card</div>
            </div>
            <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-[24px]"></div>
          </div>

          {/* Photo */}
          <div className="relative -mt-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white p-1 ring-2 ring-yellow-400">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <User className="h-8 w-8 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Name + Designation */}
          <div className="text-center mt-2 px-3">
            <h3 className="text-sm font-bold text-slate-900">Member Name</h3>
            <div className="text-[11px] text-emerald-700 font-semibold uppercase">Designation</div>
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1 px-3">
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded"> <span className="text-slate-600">Member ID</span><span className="font-semibold text-slate-900">NGO-YYYY-001</span> </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded"> <span className="text-slate-600">Join Date</span><span className="font-semibold text-slate-900">Jan 2024</span> </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded"> <span className="text-slate-600">Phone</span><span className="font-semibold text-slate-900">+1 555-0123</span> </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded"> <span className="text-slate-600">Blood Group</span><span className="font-semibold text-slate-900">O+</span> </div>
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

      {/* Card Front Side (Vertical) */}
      {!showBack && (
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200" style={{width: '204px', height: '324px'}} data-testid="card-front">
          {/* Header */}
          <div className="relative h-20 bg-emerald-700 text-white flex items-center justify-center">
            <div className="text-center px-2">
              <h4 className="text-sm font-bold leading-tight">
                {settings?.organizationName || "Your NGO Name"}
              </h4>
              <div className="text-[10px] opacity-90">Identification Card</div>
            </div>
            {/* Curved white cut */}
            <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-[24px]"></div>
          </div>

          {/* Photo */}
          <div className="relative -mt-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white p-1 ring-2 ring-yellow-400">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                {photoUrl ? (
                  <img src={photoUrl} alt="Member photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name + Designation */}
          <div className="text-center mt-2 px-3">
            <h3 className="text-sm font-bold text-slate-900 truncate">{member.fullName || "Member Name"}</h3>
            <div className="text-[11px] text-emerald-700 font-semibold uppercase truncate">{member.designation || "Designation"}</div>
          </div>

          {/* Details list */}
          <div className="mt-3 space-y-1 px-3">
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded">
              <span className="text-slate-600">Member ID</span>
              <span className="font-semibold text-slate-900">{member.memberId || "NGO-YYYY-001"}</span>
            </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded">
              <span className="text-slate-600">Join Date</span>
              <span className="font-semibold text-slate-900">
                {member.joiningDate 
                  ? new Date(member.joiningDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : "MM/DD/YYYY"}
              </span>
            </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded">
              <span className="text-slate-600">Phone</span>
              <span className="font-semibold text-slate-900">{member.contactNumber || "+1 555-0123"}</span>
            </div>
            <div className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded">
              <span className="text-slate-600">Blood Group</span>
              <span className="font-semibold text-slate-900">{member.bloodGroup || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Back Side (Vertical) */}
      {showBack && (
        <div className="relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden border border-gray-200" style={{width: '204px', height: '324px'}} data-testid="card-back">
          {/* Header */}
          <div className="px-3 pt-3 pb-2 bg-emerald-50 border-b border-emerald-100 text-center">
            <h4 className="text-xs font-bold text-slate-900">
              {settings?.organizationName || "Your NGO Name"}
            </h4>
            <div className="text-[10px] text-slate-600 leading-tight">
              <div>{settings?.address || "123 Main Street, City, State 12345"}</div>
              <div>
                {(settings?.phoneNumber || "(555) 123-4567")} • {(settings?.emailAddress || "info@yourorg.org")}
              </div>
            </div>
          </div>

          <div className="p-2 flex flex-col gap-2">
            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-lg p-1.5 border border-red-100">
              <h5 className="text-[11px] font-bold text-red-800 mb-1">Emergency Contact</h5>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-red-700">Name</span><span className="text-red-900 font-semibold">{member.emergencyContactName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-red-700">Phone</span><span className="text-red-900 font-semibold">{member.emergencyContactNumber || "—"}</span></div>
              </div>
            </div>

            {/* Property Of */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-1.5">
              <div className="text-[11px] flex-1">
                <div className="text-slate-800 font-semibold">Property of {settings?.organizationName || "Your NGO"}</div>
                <div className="text-slate-600 leading-tight">If found, please return to the above address.</div>
              </div>
              <div className="w-8 h-8 rounded-md bg-white border border-emerald-200 flex items-center justify-center overflow-hidden">
                {settings && settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <Heart className="h-4 w-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div>
                <p className="text-[11px] text-slate-600 mb-0.5 font-medium">Authorized Signatory</p>
                <div className="w-full h-4 border-b border-dotted border-slate-300 flex items-end">
                  {settings && settings.signatureUrl && (
                    <img src={settings.signatureUrl} alt="Signature" className="h-full object-contain" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-600 mb-0.5 font-medium">Member Signature</p>
                <div className="w-full h-4 border-b border-dotted border-slate-300"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-500 italic">Valid with authorized signature only</p>
          </div>
        </div>
      )}
    </div>
  );
}
