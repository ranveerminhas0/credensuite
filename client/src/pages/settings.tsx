import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertNgoSettingsSchema } from "@shared/schema";
import { Heart, Upload, QrCode, FileSignature } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";

export default function Settings() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertNgoSettingsSchema),
    defaultValues: {
      organizationName: "",
      phoneNumber: "",
      emailAddress: "",
      address: "",
      website: "",
      qrCodePattern: "",
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        organizationName: settings.organizationName || "",
        phoneNumber: settings.phoneNumber || "",
        emailAddress: settings.emailAddress || "",
        address: settings.address || "",
        website: settings.website || "",
        qrCodePattern: settings.qrCodePattern || "",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Add files
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (signatureFile) {
        formData.append('signature', signatureFile);
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      setLogoFile(null);
      setSignatureFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* NGO Information */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>NGO Information</CardTitle>
            <p className="text-sm text-gray-600">Update your organization details</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-organization-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending}
                  data-testid="submit-settings"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Information"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Assets Management */}
      <div className="space-y-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings?.logoUrl && (
                <div className="flex justify-center">
                  <img 
                    src={settings.logoUrl} 
                    alt="Current logo"
                    className="w-16 h-16 object-contain rounded"
                  />
                </div>
              )}
              
              <FileUpload
                onFileSelect={setLogoFile}
                accept="image/*"
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                data-testid="upload-logo"
              >
                <div className="space-y-2">
                  <Heart className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {logoFile ? logoFile.name : "Click to upload logo"}
                  </p>
                </div>
              </FileUpload>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Settings */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="qrCodePattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QR Code URL Pattern</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://verify.yourorg.com/{id}"
                        data-testid="input-qr-pattern"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button variant="secondary" className="w-full" data-testid="test-qr">
                <QrCode className="mr-2 h-4 w-4" />
                Test QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Signature Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Authorized Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings?.signatureUrl && (
                <div className="flex justify-center">
                  <img 
                    src={settings.signatureUrl} 
                    alt="Current signature"
                    className="max-w-24 h-12 object-contain"
                  />
                </div>
              )}
              
              <FileUpload
                onFileSelect={setSignatureFile}
                accept="image/*"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                data-testid="upload-signature"
              >
                <div className="space-y-2">
                  <FileSignature className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {signatureFile ? signatureFile.name : "Upload Signature"}
                  </p>
                  <p className="text-xs text-gray-500">PNG or JPG format</p>
                </div>
              </FileUpload>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
