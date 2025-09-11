import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { toAbsoluteUrl } from "@/lib/api";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Member } from "@shared/schema";
import { createApiUrl } from "@/lib/api";
import { Download, Plus, Eye, Edit, Search, Filter, User, MoreVertical, Share2, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { generatePDF } from "@/lib/pdf-generator";
import { exportMembersToPDF, fetchOrganizationSettings } from "@/lib/members-export";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdvancedSearchDialog } from "@/components/advanced-search-dialog";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Handle URL parameter to auto-open advanced search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAdvancedSearch') === 'true') {
      setAdvancedSearchOpen(true);
      // Clean up the URL parameter
      const newUrl = window.location.pathname;
      setLocation(newUrl);
    }
  }, [setLocation]);

  const { data: members, isLoading, isFetching } = useQuery({
    queryKey: [
      searchQuery
        ? `/api/members?search=${encodeURIComponent(searchQuery)}`
        : "/api/members",
    ],
    queryFn: getQueryFn<Member[]>({ on401: "returnNull" }),
    // Note: older TanStack versions use 'placeholderData' to keep UX stable
    placeholderData: (prev) => prev,
    staleTime: 0,
    gcTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (member: Member) => {
      const mongoId = (member as any)?._id as string | undefined;
      const idOrMongo = mongoId || member.id;
      // Use dedicated toggle endpoint to avoid 405 method issues
      const token = await (await import("@/lib/auth")).auth.currentUser?.getIdToken();
      const response = await fetch(createApiUrl(`/api/members/${idOrMongo}/toggle`), {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to toggle member: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Updated",
        description: "Member status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleExportMembers = async () => {
    try {
      const organizationSettings = await fetchOrganizationSettings();
      const filters = {
        searchQuery: searchQuery || undefined,
        roleFilter: roleFilter || undefined,
        statusFilter: statusFilter || undefined,
      };
      
      await exportMembersToPDF(filteredMembers, organizationSettings, filters);
      
      toast({
        title: "Export Successful",
        description: `Members directory exported successfully. ${filteredMembers.length} members included.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export members directory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members?.filter((member: Member) => {
    const matchesRole = !roleFilter || roleFilter === "all" || member.designation === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || 
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive);
    
    return matchesRole && matchesStatus;
  }) || [];

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleShare = (member: Member) => {
    const phone = (member.contactNumber || "").replace(/\D/g, "");
    const safeName = (member.fullName || "").replace(/[\*_~]/g, "");
    const safeRole = (member.designation || "").replace(/[\*_~]/g, "");
    const message = `Hey *${safeName}*\n\nWe appreciate your joining and we have just approved your Identity card for *${safeRole}*\n\nHappy to have you!\n*Welcome to team* 💚`;
    const url = new URL("https://api.whatsapp.com/send");
    url.searchParams.set("phone", phone);
    url.searchParams.set("text", message);
    // Log share event (fire and forget)
    try {
      fetch(createApiUrl("/api/activities"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp_share", memberId: (member as any)?.memberId, memberName: member.fullName }),
      });
    } catch {}
    window.open(url.toString(), "_blank");
  };

  const handleGeneratePDF = async (member: Member) => {
    try {
      await generatePDF(member);
      toast({
        title: "Success",
        description: "ID card PDF opened in new tab",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  function ViewMemberDialog({ member, onClose }: { member: Member; onClose?: () => void }) {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen && onClose) {
        onClose();
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`view-member-${member.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-500 dark:text-slate-300" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{member.fullName}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">{member.designation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-slate-400">Member ID:</span>
                <p>{member.memberId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-slate-400">Contact:</span>
                <p>{member.contactNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-slate-400">Joining Date:</span>
                <p>{new Date(member.joiningDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-slate-400">Status:</span>
                <Badge className={member.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}>
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {member.bloodGroup && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Blood Group:</span>
                  <p>{member.bloodGroup}</p>
                </div>
              )}
              {member.emergencyContactName && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Emergency Contact:</span>
                  <p>{member.emergencyContactName}</p>
                </div>
              )}
              {member.emergencyContactNumber && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Emergency Phone:</span>
                  <p>{member.emergencyContactNumber}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={() => handleGeneratePDF(member)} 
                className="flex-1"
                data-testid="download-pdf-from-view"
              >
                <Download className="mr-2 h-4 w-4" />
                Download ID Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isInitialLoading = isLoading && !members;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members Database</CardTitle>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              data-testid="export-members"
              onClick={handleExportMembers}
              disabled={!members || members.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/generate">
              <Button data-testid="add-member">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          </div>
        </div>
        {isFetching && !isInitialLoading && (
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">Updating…</div>
        )}
      </CardHeader>

      {/* Filters and Search */}
      <CardContent className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-members"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger data-testid="filter-role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="filter-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="w-full" 
            data-testid="advanced-filters"
            onClick={() => setAdvancedSearchOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </CardContent>

      {/* Members Table */}
      <CardContent className="p-0">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No members found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {searchQuery || roleFilter || statusFilter 
                ? "Try adjusting your search or filters."
                : "Get started by adding your first member."
              }
            </p>
            <div className="mt-6">
              <Link href="/generate">
                <Button data-testid="add-first-member">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Joining Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950 divide-y divide-gray-200 dark:divide-slate-800">
                {filteredMembers.map((member: Member) => (
                  <tr key={member.id} data-testid={`member-row-${member.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                          {member.photoUrl ? (
                            <img 
                              src={toAbsoluteUrl(member.photoUrl)} 
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500 dark:text-slate-300" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {member.contactNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                      {member.memberId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="capitalize">
                        {member.designation}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                      {new Date(member.joiningDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={member.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <ViewMemberDialog member={member} />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleGeneratePDF(member)}
                          data-testid={`download-card-${member.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`member-actions-${member.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleActiveMutation.mutate(member)} data-testid={`toggle-active-${member.id}`}>
                              {member.isActive ? "Mark Inactive" : "Mark Active"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(member)} data-testid={`share-${member.id}`}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share via WhatsApp
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  data-testid={`delete-${member.id}`}
                                  onSelect={(e) => {
                                    // Prevent DropdownMenu from immediately closing the dialog trigger
                                    e.preventDefault();
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertHeader>
                                  <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove the member and all related data.
                                  </AlertDialogDescription>
                                </AlertHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                    onClick={() => handleDelete(((member as any)?._id as string) || member.id)}
                                  >
                                    Delete anyway
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onOpenChange={setAdvancedSearchOpen}
        onMemberSelect={setSelectedMember}
      />

      {/* Member Details Dialog for Advanced Search Results */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedMember.photoUrl ? (
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500 dark:text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMember.fullName}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">{selectedMember.designation}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Member ID:</span>
                  <p>{selectedMember.memberId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Contact:</span>
                  <p>{selectedMember.contactNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Joining Date:</span>
                  <p>{new Date(selectedMember.joiningDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Status:</span>
                  <Badge className={selectedMember.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}>
                    {selectedMember.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {selectedMember.bloodGroup && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-slate-400">Blood Group:</span>
                    <p>{selectedMember.bloodGroup}</p>
                  </div>
                )}
                {selectedMember.emergencyContactName && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-slate-400">Emergency Contact:</span>
                    <p>{selectedMember.emergencyContactName}</p>
                  </div>
                )}
                {selectedMember.emergencyContactNumber && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-slate-400">Emergency Phone:</span>
                    <p>{selectedMember.emergencyContactNumber}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => handleGeneratePDF(selectedMember)} 
                  className="flex-1"
                  data-testid="download-pdf-from-advanced-search"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download ID Card
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
