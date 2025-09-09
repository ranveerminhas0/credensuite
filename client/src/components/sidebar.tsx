import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  IdCard, 
  LayoutDashboard, 
  Settings, 
  X
} from "lucide-react";
import DottedGlobe from "@/components/ui/dotted-globe";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const navigation = [
  { name: "Control Suite", href: "/", icon: LayoutDashboard },
  { name: "Registry Suite", href: "/generate", icon: IdCard },
  { name: "Members Suite", href: "/members", icon: Users },
  { name: "System Suite", href: "/settings", icon: Settings },
];

export function SidebarNavList({ useSheetClose = false }: { useSheetClose?: boolean }) {
  const [location] = useLocation();
  return (
    <nav className="mt-6">
      <div className="px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          const LinkContent = (
            <Link key={item.name} href={item.href}>
              <div
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "group flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer select-none relative",
                  "hover:shadow-sm",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 shadow-sm border border-primary/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary dark:bg-primary/30" 
                    : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/15 group-hover:text-primary"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="ml-3 font-medium text-sm">{item.name}</span>
                {isActive && (
                  <div className="absolute right-2 w-1 h-6 bg-primary rounded-full" />
                )}
              </div>
            </Link>
          );

          return useSheetClose ? (
            <SheetClose asChild key={item.name}>{LinkContent}</SheetClose>
          ) : LinkContent;
        })}
      </div>
    </nav>
  );
}

export default function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-slate-500 to-slate-600 dark:from-primary dark:to-primary/90">
        <div className="flex items-center space-x-2">
          <DottedGlobe size={32} className="text-white" />
          <h1 className="text-white text-xl font-bold">Sphere</h1>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <SidebarNavList />
      </div>
    </div>
  );
}
