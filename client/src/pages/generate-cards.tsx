import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberForm from "@/components/member-form";
import CardPreview from "@/components/card-preview";
import { Member } from "@shared/schema";

export default function GenerateCards() {
  const [previewMember, setPreviewMember] = useState<Partial<Member> | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePreview = (memberData: Partial<Member>, file?: File) => {
    setPreviewMember(memberData);
    if (file) {
      setPhotoFile(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Member Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <p className="text-sm text-gray-600">Fill in the details to generate ID card</p>
        </CardHeader>
        <CardContent>
          <MemberForm onPreview={handlePreview} />
        </CardContent>
      </Card>

      {/* Card Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Card Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <CardPreview member={previewMember} photoFile={photoFile} />
        </CardContent>
      </Card>
    </div>
  );
}
