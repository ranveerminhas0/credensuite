import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, IdCard, Clock, Download, Plus, Edit } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/members"],
  });

  if (statsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentMembers = Array.isArray(members) ? members.slice(0, 3) : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="total-members">
                  {stats?.totalMembers ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <IdCard className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cards Generated</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="cards-generated">
                  {stats?.cardsGenerated ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="active-members">
                  {stats?.activeMembers ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Download className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads Today</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="downloads-today">
                  {stats?.downloadsToday ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No recent activity. Add your first member to get started.
                </p>
              ) : (
                recentMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center" data-testid={`activity-member-${member.id}`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        New member added: {member.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(member.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/generate">
                <Button 
                  className="h-auto p-4 bg-primary hover:bg-blue-600 flex flex-col items-center space-y-2"
                  data-testid="quick-action-generate"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Generate Card</span>
                </Button>
              </Link>

              <Link href="/members">
                <Button 
                  className="h-auto p-4 bg-secondary hover:bg-green-600 flex flex-col items-center space-y-2"
                  data-testid="quick-action-members"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">View Members</span>
                </Button>
              </Link>

              <Link href="/templates">
                <Button 
                  className="h-auto p-4 bg-accent hover:bg-yellow-600 flex flex-col items-center space-y-2"
                  data-testid="quick-action-templates"
                >
                  <Edit className="h-6 w-6" />
                  <span className="text-sm font-medium">Edit Template</span>
                </Button>
              </Link>

              <Link href="/settings">
                <Button 
                  className="h-auto p-4 bg-gray-600 hover:bg-gray-700 flex flex-col items-center space-y-2"
                  data-testid="quick-action-settings"
                >
                  <Edit className="h-6 w-6" />
                  <span className="text-sm font-medium">Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
