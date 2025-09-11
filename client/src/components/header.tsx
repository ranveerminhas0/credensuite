import { Search, Bell, BellRing, User, LogOut, Menu, Loader2, Moon, Sun, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toAbsoluteUrl, createApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { auth, observeAuthState } from "@/lib/auth";
import { signOut } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Member } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DottedGlobe from "@/components/ui/dotted-globe";
import { Badge } from "@/components/ui/badge";
import { generatePDF } from "@/lib/pdf-generator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { SidebarNavList } from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme";

const pageTitles = {
  "/": "Control Suite",
  "/generate": "Registry Suite",
  "/members": "Members Suite",
  "/settings": "System Suite",
  "/templates": "Card Templates",
};

function MemberDetailsDialog({ member, onClose }: { member: Member | null; onClose: () => void }) {
  if (!member) return null;
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
              {member.photoUrl ? (
                <img src={toAbsoluteUrl(member.photoUrl)} alt={member.fullName} className="w-full h-full object-cover" />
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
          </div>
          <div className="flex space-x-2 pt-4">
            <Button onClick={() => generatePDF(member)} className="flex-1 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none">
              Download ID Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Header() {
  const { isDarkMode, toggleDarkModeWithTransition } = useTheme();
  const [location, navigate] = useLocation();
  const pageTitle = pageTitles[location as keyof typeof pageTitles] || "Dashboard";
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState<boolean>(false);
  const accountTriggerRef = useRef<HTMLButtonElement | null>(null);
  const SESSION_PREFIX = "cc_session_start:";
  const SESSION_STORAGE_PREFIX = "cc_session_storage:";
  const [search, setSearch] = useState<string>("");
  const [debounced, setDebounced] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showNotificationBadge, setShowNotificationBadge] = useState<boolean>(false);

  useEffect(() => {
    const unsub = observeAuthState((user) => {
      setEmail(user?.email ?? "");
      setDisplayName(user?.displayName ?? "");
      const providerPhoto = (user?.providerData || []).find((p: any) => p?.providerId === 'google.com')?.photoURL;
      setPhotoUrl(user?.photoURL ?? providerPhoto ?? null);
      
      if (user) {
        const key = `${SESSION_PREFIX}${user.uid || user.email}`;
        const sessionKey = `${SESSION_STORAGE_PREFIX}${user.uid || user.email}`;
        
        // Check if we have a session in sessionStorage (tab-specific)
        const sessionStored = sessionStorage.getItem(sessionKey);
        const now = Date.now();
        
        if (sessionStored) {
          // Session exists in this tab, continue it
          const start = Number(sessionStored);
          setSessionStart(start);
          setElapsed(Math.floor((now - start) / 1000));
        } else {
          // No session in this tab, start fresh
          sessionStorage.setItem(sessionKey, String(now));
          setSessionStart(now);
          setElapsed(0);
        }
      } else {
        setSessionStart(null);
        setElapsed(0);
        setShowNotificationBadge(false);
      }
    });
    return () => unsub();
  }, []);

  // Separate effect to handle notification badge state
  useEffect(() => {
    if (email) {
      const notificationKey = `cc_notification_viewed:${email}`;
      const notificationViewed = localStorage.getItem(notificationKey);
      console.log('Notification viewed status:', notificationViewed, 'for user:', email);
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('Setting badge to:', notificationViewed !== 'true');
      
      // Show badge if notification hasn't been viewed (null means never viewed)
      const shouldShowBadge = notificationViewed !== 'true';
      console.log('Should show badge:', shouldShowBadge);
      setShowNotificationBadge(shouldShowBadge);
      
      // Debug: manually clear the notification key for testing
      if (notificationViewed === 'true') {
        console.log('DEBUG: Manually clearing notification key for testing');
        localStorage.removeItem(notificationKey);
        setShowNotificationBadge(true);
      }
    } else {
      setShowNotificationBadge(false);
    }
  }, [email]);

  useEffect(() => {
    if (!sessionStart) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);


  const formattedElapsed = useMemo(() => {
    const total = elapsed;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  }, [elapsed]);

  const resolvedPhotoUrl = useMemo(() => {
    if (!photoUrl) return null;
    try {
      const u = new URL(photoUrl);
      if (u.host.includes('googleusercontent.com')) {
        if (u.searchParams.has('sz')) {
          u.searchParams.set('sz', '64');
        } else if (/=s\d+-c$/.test(u.pathname)) {
          u.pathname = u.pathname.replace(/=s\d+-c$/, '=s64-c');
        } else {
          u.searchParams.set('sz', '64');
        }
      }
      return u.toString();
    } catch {
      return photoUrl;
    }
  }, [photoUrl]);

  async function handleConfirmLogout() {
    try {
      const key = `${SESSION_PREFIX}${auth.currentUser?.uid || email}`;
      const sessionKey = `${SESSION_STORAGE_PREFIX}${auth.currentUser?.uid || email}`;
      const notificationKey = `cc_notification_viewed:${auth.currentUser?.uid || email}`;
      
      console.log('Logging out, clearing keys:', { key, sessionKey, notificationKey });
      
      if (key) localStorage.removeItem(key);
      if (sessionKey) sessionStorage.removeItem(sessionKey);
      if (notificationKey) {
        localStorage.removeItem(notificationKey);
        console.log('Removed notification key:', notificationKey);
      }
      
      await signOut(auth);
      navigate("/login");
    } finally {
      setLogoutOpen(false);
    }
  }

  // Header search suggestions
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data: suggestions, isFetching } = useQuery({
    queryKey: [debounced ? `/api/members?search=${encodeURIComponent(debounced)}` : null],
    queryFn: async () => {
      if (!debounced) return [] as Member[];
      const token = await (await import("@/lib/auth")).auth.currentUser?.getIdToken();
      const res = await fetch(createApiUrl(`/api/members?search=${encodeURIComponent(debounced)}`), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }
      return (await res.json()) as Member[];
    },
    enabled: !!debounced,
    placeholderData: [] as Member[],
    staleTime: 0,
    gcTime: 0,
  });

  // removed inline dialog in favor of a stable, top-level dialog to avoid remount flicker

  return (
    <header className="relative border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white via-indigo-50/60 to-emerald-50/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-emerald-950/40 shadow-sm">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-indigo-200/40 dark:bg-indigo-900/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-56 w-56 rounded-full bg-emerald-200/40 dark:bg-emerald-900/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="px-6 py-4 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Open menu"
                className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 [&>button]:hidden">
              <SheetHeader className="relative">
                <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-slate-500 to-slate-600 dark:from-primary dark:to-primary/90">
                  <div className="flex items-center space-x-2">
                    <DottedGlobe size={28} className="text-white" />
                    <SheetTitle className="text-white text-xl font-bold">Sphere</SheetTitle>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/40"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                <SidebarNavList useSheetClose={true} />
              </div>
            </SheetContent>
          </Sheet>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100" style={{ fontFamily: "'Poppins', Inter, system-ui, sans-serif" }}>{pageTitle}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/30 to-emerald-300 opacity-0 group-hover:opacity-60 group-focus-within:opacity-100 transition duration-300 blur-sm" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4 transition-colors group-focus-within:text-gray-600 dark:group-focus-within:text-slate-300 z-20 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search members..."
              className="relative z-10 h-8 md:h-9 pl-10 pr-10 w-72 rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none text-sm py-1 focus:border-primary/30 focus:shadow-[0_0_0_6px_rgba(59,130,246,0.08)] dark:focus:shadow-[0_0_0_6px_rgba(30,64,175,0.25)] transition-all"
              data-testid="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-slate-400 z-10" />
            )}
            {debounced && (suggestions as Member[] | undefined)?.length ? (
              <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-gray-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-lg">
                <ul className="max-h-64 overflow-auto py-1">
                  {(suggestions as Member[]).slice(0, 8).map((m) => (
                    <li
                      key={m.id}
                      className="px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-2 rounded-lg mx-1"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedMember(m);
                        setSearch("");
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center ring-1 ring-gray-200 dark:ring-slate-700">
                        {m.photoUrl ? (
                          <img src={toAbsoluteUrl(m.photoUrl)} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-gray-500 dark:text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium leading-tight">{m.fullName}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{m.memberId} · {m.designation}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : debounced && !isFetching ? (
              <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-gray-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-lg">
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">No results found</div>
              </div>
            ) : null}
          </div>
          
          <Popover onOpenChange={(open) => {
            if (open && showNotificationBadge) {
              console.log('Hiding notification badge for user:', email);
              setShowNotificationBadge(false);
              // Mark notification as viewed in localStorage
              if (email) {
                const notificationKey = `cc_notification_viewed:${email}`;
                localStorage.setItem(notificationKey, 'true');
                console.log('Set notification as viewed:', notificationKey);
              }
            }
          }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="notifications-button"
                className="group relative rounded-full hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-95 transition"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-emerald-200 dark:from-primary/10 dark:to-emerald-900 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition" aria-hidden />
                <Bell className="relative z-20 h-5 w-5 text-gray-600 dark:text-slate-300 group-hover:text-gray-800 dark:group-hover:text-slate-100" />
                <span className="absolute inset-0 rounded-full scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition transform" aria-hidden
                style={{boxShadow: '0 0 0 6px rgba(59,130,246,0.15)'}} />
                <BellRing className="absolute z-10 h-5 w-5 text-primary/50 dark:text-primary/40 opacity-0 group-hover:opacity-100 group-hover:animate-[ring_1s_ease-in-out]" />
                {/* Notification badge - smaller size */}
                {showNotificationBadge && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-30">
                    3
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl border border-gray-100 dark:border-slate-800 shadow-lg">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold">Software Updates</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Export members directory is Added
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      10/09/2025 at 1:15 AM
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      by dev team
                    </p>
                  </div>
                </div>
                <Link 
                  to="/members?openAdvancedSearch=true"
                  className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Advance search is Added
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      9/9/2025 at 6:55 AM
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      by dev team
                    </p>
                  </div>
                </Link>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Dark mode is added
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      9/9/2025 at 3:40 AM
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      by dev team
                    </p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu open={accountMenuOpen} onOpenChange={(o) => {
            setAccountMenuOpen(o);
            if (!o && accountTriggerRef.current) {
              accountTriggerRef.current.blur();
            }
          }}>
            <DropdownMenuTrigger asChild>
              <button ref={accountTriggerRef} className="relative inline-flex items-center justify-center rounded-full p-0.5 focus-visible:outline-none">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-emerald-200 opacity-0 hover:opacity-100 transition" aria-hidden />
                <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                  <AvatarImage src={resolvedPhotoUrl || undefined} alt={displayName || email || "Account"} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {(displayName || email || "U").slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                {email || "Not signed in"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" disabled>
                Session: {formattedElapsed}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={async (e) => {
                  e.preventDefault();
                  const target = e.currentTarget as HTMLElement;
                  await toggleDarkModeWithTransition(target);
                }}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:bg-slate-200 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-200 dark:data-[highlighted]:bg-slate-700 hover:!text-black dark:hover:!text-white transition-colors duration-200"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-50 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                onSelect={(e) => {
                  e.preventDefault();
                  setLogoutOpen(true);
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <MemberDetailsDialog member={selectedMember} onClose={() => setSelectedMember(null)} />

          <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <LogOut className="h-5 w-5" />
                </div>
                <AlertDialogTitle className="text-center">Logout this account?</AlertDialogTitle>
              </AlertDialogHeader>
              <p className="text-sm text-muted-foreground text-center -mt-2">
                You will be signed out and redirected to the login screen.
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel> No </AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmLogout}>
                  Yes, Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
