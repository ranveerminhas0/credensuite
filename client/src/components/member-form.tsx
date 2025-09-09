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
import { createApiUrl } from "@/lib/api";
import FileUpload from "@/components/ui/file-upload";
import { ProfessionalDatePicker } from "@/components/ui/professional-date-picker";
import { generatePDF } from "@/lib/pdf-generator";

interface MemberFormProps {
  onPreview: (memberData: Partial<Member>, file?: File) => void;
}

export default function MemberForm({ onPreview }: MemberFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    // Make emergency fields optional for client-side validation
    resolver: zodResolver(
      insertMemberSchema.extend({
        emergencyContactName: insertMemberSchema.shape.emergencyContactName.optional(),
        emergencyContactNumber: insertMemberSchema.shape.emergencyContactNumber.optional(),
        bloodGroup: insertMemberSchema.shape.bloodGroup.optional(),
      })
    ),
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

      const token = await (await import("@/lib/auth")).auth.currentUser?.getIdToken();
      const response = await fetch(createApiUrl('/api/members'), {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        let detail = '';
        try {
          const errJson = await response.json();
          detail = errJson?.issues ? JSON.stringify(errJson.issues) : (errJson?.error || errJson?.message || '');
        } catch {}
        throw new Error(detail ? `Failed to create member: ${detail}` : 'Failed to create member');
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
        await generatePDF(member);
        toast({
          title: "PDF Generated",
          description: "ID card PDF opened in new tab",
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
    onError: (error: any) => {
      // Handle server validation errors
      if (error?.response?.data?.message) {
        const serverError = error.response.data;
        toast({
          title: serverError.message || "Validation Error",
          description: serverError.details || "Please check your input and try again",
          variant: "destructive",
        });
      } else {
        // Handle other errors
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handlePreview = () => {
    const formData = form.getValues();
    onPreview(formData, photoFile || undefined);
  };

  const handleGeneratePDF = async () => {
    // Show validation errors
    setShowValidationErrors(true);
    
    // Trigger validation for all fields
    const isValid = await form.trigger();
    
    if (!isValid) {
      // Get current form errors
      const errors = form.formState.errors;
      const requiredFields = Object.keys(errors).filter(field => 
        ['fullName', 'designation', 'joiningDate', 'contactNumber'].includes(field)
      );
      
      if (requiredFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in: ${requiredFields.map(field => {
            switch(field) {
              case 'fullName': return 'Full Name';
              case 'designation': return 'Designation/Role';
              case 'joiningDate': return 'Date of Joining';
              case 'contactNumber': return 'Contact Number';
              default: return field;
            }
          }).join(', ')}`,
          variant: "destructive",
        });
        
        // Scroll to first error field
        const firstErrorField = requiredFields[0];
        const errorElement = document.querySelector(`[data-testid="input-${firstErrorField}"]`) || 
                           document.querySelector(`[data-testid="select-${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (errorElement as HTMLElement).focus();
        }
      }
      return;
    }
    
    // If valid, proceed with form submission
    const formData = form.getValues();
    createMemberMutation.mutate(formData);
  };

  const onSubmit = (data: any) => {
    createMemberMutation.mutate(data);
  };

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
            render={({ field, fieldState }) => {
              const hasError = fieldState.error || (showValidationErrors && !field.value);
              return (
                <FormItem>
                  <FormLabel className={hasError ? "text-red-600" : ""}>
                    Full Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter full name" 
                      data-testid="input-full-name"
                      className={hasError ? "border-red-500 focus:ring-red-500" : ""}
                    />
                  </FormControl>
                  {hasError && (
                    <FormMessage className="text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      {fieldState.error?.message || "Full Name is required"}
                    </FormMessage>
                  )}
                </FormItem>
              );
            }}
          />


        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field, fieldState }) => {
              const hasError = fieldState.error || (showValidationErrors && !field.value);
              return (
                <FormItem>
                  <FormLabel className={hasError ? "text-red-600" : ""}>
                    Designation/Role <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        data-testid="select-designation"
                        className={hasError ? "border-red-500 focus:ring-red-500" : ""}
                      >
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
                  {hasError && (
                    <FormMessage className="text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      {fieldState.error?.message || "Designation/Role is required"}
                    </FormMessage>
                  )}
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field, fieldState }) => {
              const hasError = fieldState.error || (showValidationErrors && !field.value);
              return (
                <FormItem>
                  <FormLabel className={hasError ? "text-red-600" : ""}>
                    Date of Joining <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ProfessionalDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select joining date"
                      data-testid="input-joining-date"
                      className={hasError ? "border-red-500 focus:ring-red-500" : ""}
                    />
                  </FormControl>
                  {hasError && (
                    <FormMessage className="text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      {fieldState.error?.message || "Date of Joining is required"}
                    </FormMessage>
                  )}
                </FormItem>
              );
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field, fieldState }) => {
              const hasError = fieldState.error || (showValidationErrors && !field.value);
              return (
                <FormItem>
                  <FormLabel className={hasError ? "text-red-600" : ""}>
                    Contact Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel" 
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-contact"
                      className={hasError ? "border-red-500 focus:ring-red-500" : ""}
                    />
                  </FormControl>
                  {hasError && (
                    <FormMessage className="text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      {fieldState.error?.message || "Contact Number is required"}
                    </FormMessage>
                  )}
                </FormItem>
              );
            }}
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
            className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 transition-colors duration-150"
            data-testid="preview-card"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Card
          </Button>
          <Button 
            type="button" 
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            disabled={createMemberMutation.isPending}
            data-testid="generate-pdf"
            onClick={handleGeneratePDF}
          >
            <Download className="mr-2 h-4 w-4" />
            {createMemberMutation.isPending ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
