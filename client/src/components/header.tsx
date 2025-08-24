import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const pageTitles = {
  "/": "Dashboard Overview",
  "/generate": "Generate Member Cards",
  "/members": "Members Database",
  "/settings": "Organization Settings",
  "/templates": "Card Templates",
};

export default function Header() {
  const [location] = useLocation();
  const pageTitle = pageTitles[location as keyof typeof pageTitles] || "Dashboard";

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">{pageTitle}</h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search members..."
              className="pl-10 pr-4 w-64"
              data-testid="search-input"
            />
          </div>
          
          <Button variant="ghost" size="icon" data-testid="notifications-button">
            <Bell className="h-5 w-5 text-gray-400" />
          </Button>
          
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
