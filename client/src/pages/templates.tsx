import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CardTemplate } from "@shared/schema";

const colorSchemes = [
  { value: "blue", label: "Blue Professional", gradient: "from-blue-600 to-blue-800" },
  { value: "green", label: "Green Nature", gradient: "from-green-600 to-green-800" },
  { value: "red", label: "Red Energy", gradient: "from-red-600 to-red-800" },
  { value: "purple", label: "Purple Creative", gradient: "from-purple-600 to-purple-800" },
  { value: "gray", label: "Clean Minimal", gradient: "from-gray-600 to-gray-800" },
];

const fontStyles = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat"];
const layoutStyles = ["horizontal", "vertical"];

export default function Templates() {
  const [customColorScheme, setCustomColorScheme] = useState("blue");
  const [customFontStyle, setCustomFontStyle] = useState("Inter");
  const [customLayoutStyle, setCustomLayoutStyle] = useState("horizontal");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const activateTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/templates/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template activated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      await apiRequest("POST", "/api/templates", templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Custom template saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleActivateTemplate = (id: string) => {
    activateTemplateMutation.mutate(id);
  };

  const handleSaveCustomTemplate = () => {
    const customTemplate = {
      name: `Custom ${colorSchemes.find(c => c.value === customColorScheme)?.label}`,
      colorScheme: customColorScheme,
      fontStyle: customFontStyle,
      layoutStyle: customLayoutStyle,
      isActive: false,
    };
    
    saveTemplateMutation.mutate(customTemplate);
  };

  const getGradientClass = (colorScheme: string) => {
    const scheme = colorSchemes.find(c => c.value === colorScheme);
    return scheme?.gradient || "from-blue-600 to-blue-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Templates</CardTitle>
        <p className="text-sm text-gray-600">Customize your ID card design</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8">
          {/* Predefined Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(templates) ? templates.map((template: CardTemplate) => (
                <div 
                  key={template.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  data-testid={`template-${template.id}`}
                >
                  {/* Template Preview */}
                  <div className={`bg-gradient-to-br ${getGradientClass(template.colorScheme)} rounded-lg p-4 text-white text-xs mb-4 transform scale-75`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                      <div>NGO Name</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded mr-3"></div>
                      <div>
                        <div className="font-semibold">Member Name</div>
                        <div className="text-xs opacity-75">Role | ID</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {colorSchemes.find(c => c.value === template.colorScheme)?.label || template.colorScheme}
                    </p>
                    <Button 
                      onClick={() => handleActivateTemplate(template.id)}
                      disabled={template.isActive || activateTemplateMutation.isPending}
                      className={`w-full ${
                        template.colorScheme === 'green' ? 'bg-secondary hover:bg-green-600' :
                        template.colorScheme === 'gray' ? 'bg-gray-600 hover:bg-gray-700' :
                        'bg-primary hover:bg-blue-600'
                      }`}
                      data-testid={`activate-template-${template.id}`}
                    >
                      {template.isActive ? "Active" : "Use Template"}
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  Loading templates...
                </div>
              )}
            </div>
          </div>

          {/* Custom Template Editor */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Customize Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <div className="flex space-x-3">
                    {colorSchemes.map((scheme) => (
                      <div
                        key={scheme.value}
                        className={`w-8 h-8 bg-gradient-to-br ${scheme.gradient} rounded cursor-pointer border-2 ${
                          customColorScheme === scheme.value ? 'border-gray-800' : 'border-transparent hover:border-gray-400'
                        }`}
                        onClick={() => setCustomColorScheme(scheme.value)}
                        data-testid={`color-${scheme.value}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                  <Select value={customFontStyle} onValueChange={setCustomFontStyle}>
                    <SelectTrigger data-testid="select-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontStyles.map((font) => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {layoutStyles.map((layout) => (
                      <Button
                        key={layout}
                        variant={customLayoutStyle === layout ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setCustomLayoutStyle(layout)}
                        data-testid={`layout-${layout}`}
                      >
                        {layout}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className={`bg-gradient-to-br ${getGradientClass(customColorScheme)} rounded-lg p-6 text-white shadow-lg max-w-xs`}>
                  <div className="text-center mb-4">
                    <h4 className="text-sm font-bold">Live Preview</h4>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-300 rounded mr-3"></div>
                    <div>
                      <div className="font-semibold" style={{ fontFamily: customFontStyle }}>
                        Sample Name
                      </div>
                      <div className="text-xs opacity-75">Volunteer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <Button 
                onClick={handleSaveCustomTemplate}
                disabled={saveTemplateMutation.isPending}
                data-testid="save-template"
              >
                {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setCustomColorScheme("blue");
                  setCustomFontStyle("Inter");
                  setCustomLayoutStyle("horizontal");
                }}
                data-testid="reset-template"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
