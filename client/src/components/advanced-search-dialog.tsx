import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { Member } from "@shared/schema";
import { Search, Phone, Calendar, User, X, UserCheck, PhoneCall } from "lucide-react";
import { ProfessionalDatePicker } from "@/components/ui/professional-date-picker";
import { useDebounce } from "@/hooks/use-debounce";

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberSelect: (member: Member) => void;
}

export function AdvancedSearchDialog({ open, onOpenChange, onMemberSelect }: AdvancedSearchDialogProps) {
  const [phoneQuery, setPhoneQuery] = useState("");
  const [joiningDate, setJoiningDate] = useState<Date | undefined>();
  const [emergencyNameQuery, setEmergencyNameQuery] = useState("");
  const [emergencyPhoneQuery, setEmergencyPhoneQuery] = useState("");
  const [searchType, setSearchType] = useState<"phone" | "date" | "emergencyName" | "emergencyPhone">("phone");
  const { toast } = useToast();

  const debouncedPhoneQuery = useDebounce(phoneQuery, 300);
  const debouncedEmergencyNameQuery = useDebounce(emergencyNameQuery, 300);
  const debouncedEmergencyPhoneQuery = useDebounce(emergencyPhoneQuery, 300);

  // Phone number search
  const { data: phoneResults, isLoading: phoneLoading } = useQuery({
    queryKey: [`/api/members?phone=${encodeURIComponent(debouncedPhoneQuery)}`],
    queryFn: getQueryFn<Member[]>({ on401: "returnNull" }),
    enabled: debouncedPhoneQuery.length >= 3 && searchType === "phone",
    placeholderData: (prev) => prev,
  });

  // Joining date search
  const { data: dateResults, isLoading: dateLoading } = useQuery({
    queryKey: [`/api/members?joiningDate=${joiningDate?.toISOString().split('T')[0]}`],
    queryFn: getQueryFn<Member[]>({ on401: "returnNull" }),
    enabled: !!joiningDate && searchType === "date",
    placeholderData: (prev) => prev,
  });

  // Emergency contact name search
  const { data: emergencyNameResults, isLoading: emergencyNameLoading } = useQuery({
    queryKey: [`/api/members?emergencyName=${encodeURIComponent(debouncedEmergencyNameQuery)}`],
    queryFn: getQueryFn<Member[]>({ on401: "returnNull" }),
    enabled: debouncedEmergencyNameQuery.length >= 3 && searchType === "emergencyName",
    placeholderData: (prev) => prev,
  });

  // Emergency contact phone search
  const { data: emergencyPhoneResults, isLoading: emergencyPhoneLoading } = useQuery({
    queryKey: [`/api/members?emergencyPhone=${encodeURIComponent(debouncedEmergencyPhoneQuery)}`],
    queryFn: getQueryFn<Member[]>({ on401: "returnNull" }),
    enabled: debouncedEmergencyPhoneQuery.length >= 3 && searchType === "emergencyPhone",
    placeholderData: (prev) => prev,
  });

  const currentResults = searchType === "phone" ? phoneResults : 
                        searchType === "date" ? dateResults :
                        searchType === "emergencyName" ? emergencyNameResults :
                        emergencyPhoneResults;
  
  const isLoading = searchType === "phone" ? phoneLoading : 
                   searchType === "date" ? dateLoading :
                   searchType === "emergencyName" ? emergencyNameLoading :
                   emergencyPhoneLoading;

  const handleMemberClick = (member: Member) => {
    onMemberSelect(member);
    onOpenChange(false);
  };

  const clearSearch = () => {
    setPhoneQuery("");
    setJoiningDate(undefined);
    setEmergencyNameQuery("");
    setEmergencyPhoneQuery("");
    setSearchType("phone"); // Reset to default search type
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="px-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Database Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-6 px-2">
          {/* Search Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={searchType === "phone" ? "default" : "outline"}
              onClick={() => setSearchType("phone")}
              className="flex-1"
            >
              <Phone className="mr-2 h-4 w-4" />
              Search by Phone
            </Button>
            <Button
              variant={searchType === "date" ? "default" : "outline"}
              onClick={() => setSearchType("date")}
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Search by Date
            </Button>
            <Button
              variant={searchType === "emergencyName" ? "default" : "outline"}
              onClick={() => setSearchType("emergencyName")}
              className="flex-1"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Emergency Name
            </Button>
            <Button
              variant={searchType === "emergencyPhone" ? "default" : "outline"}
              onClick={() => setSearchType("emergencyPhone")}
              className="flex-1"
            >
              <PhoneCall className="mr-2 h-4 w-4" />
              Emergency Phone
            </Button>
          </div>

          {/* Search Inputs */}
          <div className="space-y-4 w-full">
            {searchType === "phone" ? (
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative w-full">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number..."
                    className="pl-10 w-full"
                    value={phoneQuery}
                    onChange={(e) => setPhoneQuery(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Enter at least 3 digits to search
                </p>
              </div>
            ) : searchType === "date" ? (
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Joining Date
                </label>
                <div className="w-full">
                  <ProfessionalDatePicker
                    value={joiningDate}
                    onChange={setJoiningDate}
                    placeholder="Select joining date..."
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Select a date to find members who joined on that day
                </p>
              </div>
            ) : searchType === "emergencyName" ? (
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Emergency Contact Name
                </label>
                <div className="relative w-full">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Enter emergency contact name..."
                    className="pl-10 w-full"
                    value={emergencyNameQuery}
                    onChange={(e) => setEmergencyNameQuery(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Enter at least 3 characters to search
                </p>
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Emergency Contact Phone
                </label>
                <div className="relative w-full">
                  <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
                  <Input
                    type="tel"
                    placeholder="Enter emergency contact phone..."
                    className="pl-10 w-full"
                    value={emergencyPhoneQuery}
                    onChange={(e) => setEmergencyPhoneQuery(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Enter at least 3 digits to search
                </p>
              </div>
            )}
          </div>

          {/* Clear Button */}
          {(phoneQuery || joiningDate || emergencyNameQuery || emergencyPhoneQuery) && (
            <Button
              variant="outline"
              onClick={clearSearch}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Search
            </Button>
          )}

          {/* Results */}
          <div className="flex-1 overflow-hidden w-full">
            <div className="h-full flex flex-col w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Search Results
                </h3>
                {currentResults && (
                  <Badge variant="secondary">
                    {currentResults.length} member{currentResults.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 w-full">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Searching...</p>
                  </div>
                ) : !currentResults || currentResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
                      No members found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      {searchType === "phone" 
                        ? "Try entering a different phone number."
                        : searchType === "date"
                        ? "Try selecting a different date."
                        : searchType === "emergencyName"
                        ? "Try entering a different emergency contact name."
                        : "Try entering a different emergency contact phone."
                      }
                    </p>
                  </div>
                ) : (
                  currentResults.map((member: Member) => (
                    <div
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                          {member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-500 dark:text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {member.fullName}
                            </h4>
                            <Badge
                              className={member.isActive 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              }
                            >
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {member.memberId} • {member.designation}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">
                            {member.contactNumber} • Joined {new Date(member.joiningDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
