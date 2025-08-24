import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertMemberSchema, Member } from "@shared/schema";
import { Eye, Download, Camera } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import { generatePDF } from "@/lib/pdf-generator";

interface MemberFormProps {
  onPreview: (memberData: Partial<Member>, file?: File) => void;
}

export default function MemberForm({ onPreview }: MemberFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertMemberSchema.extend({
      emergencyContactName: insertMemberSchema.shape.emergencyContactName.optional(),
      emergencyContactNumber: insertMemberSchema.shape.emergencyContactNumber.optional(),
      bloodGroup: insertMemberSchema.shape.bloodGroup.optional(),
    })),
    defaultValues: {
      fullName: "",
      designation: "",
      joiningDate: new Date(),
      contactNumber: "",
      bloodGroup: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      isActive: true,
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (key === 'joiningDate') {
            formData.append(key, data[key].toISOString());
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });
      
      // Add photo file
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('/api/members', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create member');
      }

      return response.json();
    },
    onSuccess: async (member) => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member created successfully",
      });
      
      // Generate and download PDF
      try {
        await generatePDF(member, photoFile);
        toast({
          title: "PDF Generated",
          description: "ID card PDF downloaded successfully",
        });
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        toast({
          title: "PDF Generation Failed",
          description: "ID card created but PDF download failed. Please try again.",
          variant: "destructive",
        });
      }
      
      // Reset form
      form.reset();
      setPhotoFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    const formData = form.getValues();
    const dataWithId = {
      ...formData,
      memberId: memberIdValue
    };
    onPreview(dataWithId, photoFile || undefined);
  };

  const onSubmit = (data: any) => {
    // Add the generated member ID to the form data
    const memberData = {
      ...data,
      memberId: memberIdValue
    };
    createMemberMutation.mutate(memberData);
  };

  const [memberIdValue] = useState(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NGO-${year}-${random}`;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Member Photo</label>
          <FileUpload
            onFileSelect={setPhotoFile}
            accept="image/*"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            data-testid="upload-photo"
          >
            <div className="space-y-3">
              {photoFile ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(photoFile)} 
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-gray-600">{photoFile.name}</p>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </FileUpload>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter full name" data-testid="input-full-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Member ID *</FormLabel>
            <FormControl>
              <Input 
                value={memberIdValue} 
                placeholder="Auto-generated" 
                readOnly 
                className="bg-gray-50"
                data-testid="input-member-id"
              />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation/Role *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-designation">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Joining *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    data-testid="input-joining-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-contact"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-blood-group">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Emergency Contact */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Emergency contact name"
                      data-testid="input-emergency-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel" 
                      placeholder="Emergency contact number"
                      data-testid="input-emergency-contact"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={handlePreview}
            className="flex-1"
            data-testid="preview-card"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Card
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-secondary hover:bg-green-600"
            disabled={createMemberMutation.isPending}
            data-testid="generate-pdf"
          >
            <Download className="mr-2 h-4 w-4" />
            {createMemberMutation.isPending ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
