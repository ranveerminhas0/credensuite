import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  IdCard, 
  LayoutDashboard, 
  Settings, 
  FileImage,
  Heart 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Generate Cards", href: "/generate", icon: IdCard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Card Templates", href: "/templates", icon: FileImage },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 bg-primary">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-white" />
          <h1 className="text-white text-xl font-bold">NGO Admin</h1>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
