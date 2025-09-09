import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, IdCard, Clock, Download, Plus, Settings as SettingsIcon, Trash2, UserX, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader as DHeader, DialogTitle as DTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{ totalMembers: number; activeMembers: number; inactiveMembers: number; downloadsToday: number }>({
    queryKey: ["/api/stats"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<any[]>({
    queryKey: ["/api/members"],
  });

  const { data: activities } = useQuery<any[]>({
    queryKey: ["/api/activities?limit=5"],
  });

  const { data: allActivities } = useQuery<any[]>({
    queryKey: ["/api/activities?limit=50"],
  });

  if (statsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 dark:bg-slate-800 rounded"></div>
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
        <Card className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-white to-blue-50/60 dark:from-slate-950 dark:to-blue-950/20 shadow-sm transition hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-900/40">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Total Members</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100" data-testid="total-members">
                  {stats?.totalMembers ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/40 dark:bg-blue-900/20" />
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50/60 dark:from-slate-950 dark:to-emerald-950/20 shadow-sm transition hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/40">
                <IdCard className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Active Members</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100" data-testid="active-members">
                  {stats?.activeMembers ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20" />
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-white to-amber-50/60 dark:from-slate-950 dark:to-amber-950/20 shadow-sm transition hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-900/40">
                <Clock className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Inactive Members</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100" data-testid="inactive-members">
                  {stats?.inactiveMembers ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100/40 dark:bg-amber-900/20" />
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-gradient-to-br from-white to-rose-50/60 dark:from-slate-950 dark:to-rose-950/20 shadow-sm transition hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-900/40">
                <Download className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Downloads Today</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100" data-testid="downloads-today">
                  {stats?.downloadsToday ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-100/40 dark:bg-rose-900/20" />
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-950 dark:to-slate-900/40 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">View all</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-2xl">
                  <DHeader>
                    <DTitle>All Recent Activity</DTitle>
                  </DHeader>
                  <div className="mt-2 max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                    {Array.isArray(allActivities) && allActivities.length > 0 ? (
                      allActivities.map((act: any, idx: number) => {
                        let chipClass = "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800";
                        let Icon: any = Clock;
                        if (act.type === 'member_added') { chipClass = "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/40"; Icon = Plus; }
                        else if (act.type === 'member_deleted') { chipClass = "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-900/40"; Icon = Trash2; }
                        else if (act.type === 'member_activated') { chipClass = "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/40"; Icon = UserCheck; }
                        else if (act.type === 'member_deactivated') { chipClass = "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-900/40"; Icon = UserX; }
                        else if (act.type === 'pdf_download') { chipClass = "bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900/40"; Icon = Download; }
                        else if (act.type === 'settings_update') { chipClass = "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800"; Icon = SettingsIcon; }
                        return (
                          <div key={idx} className="flex items-center">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${chipClass}`}
                              style={{marginLeft: 2, marginTop: 2}}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {act.type === 'settings_update' ? 'Settings updated'
                                  : act.type === 'member_added' ? `New member added: ${act.memberName}`
                                  : act.type === 'member_deleted' ? `Member deleted: ${act.memberName || act.memberId}`
                                  : act.type === 'member_activated' ? `Member activated: ${act.memberName || act.memberId}`
                                  : act.type === 'member_deactivated' ? `Member deactivated: ${act.memberName || act.memberId}`
                                  : act.type === 'pdf_download' ? `Downloaded ID: ${act.memberName || act.memberId}`
                                  : act.type === 'whatsapp_share' ? `Shared via WhatsApp: ${act.memberName || act.memberId}`
                                  : act.type}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">
                                {new Date(act.ts).toLocaleString()} {act.by ? `• ${act.by}` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No activity yet.</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {Array.isArray(activities) && activities.length > 0 ? (
                activities.map((act: any, idx: number) => {
                  let chipClass = "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
                  let Icon: any = Clock;
                  if (act.type === 'member_added') { chipClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"; Icon = Plus; }
                  else if (act.type === 'member_deleted') { chipClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"; Icon = Trash2; }
                  else if (act.type === 'member_activated') { chipClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"; Icon = UserCheck; }
                  else if (act.type === 'member_deactivated') { chipClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"; Icon = UserX; }
                  else if (act.type === 'pdf_download') { chipClass = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"; Icon = Download; }
                  else if (act.type === 'settings_update') { chipClass = "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"; Icon = SettingsIcon; }
                  return (
                    <div key={idx} className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chipClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {act.type === 'settings_update' ? 'Settings updated' : act.type === 'member_added' ? `New member added: ${act.memberName}` : act.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(act.ts).toLocaleString()} {act.by ? `• ${act.by}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                recentMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">
                    No recent activity. Add your first member to get started.
                  </p>
                ) : (
                  recentMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center" data-testid={`activity-member-${member.id}`}>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          New member added: {member.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(member.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-950 dark:to-slate-900/40 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
              <Link href="/generate">
                <Button
                  aria-label="Generate Card"
                  className="group w-full sm:w-44 h-auto p-4 flex flex-col items-center space-y-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900/30 transition transform hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="quick-action-generate"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900/40 transition">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">Generate Card</span>
                </Button>
              </Link>

              <Link href="/members">
                <Button
                  aria-label="View Members"
                  className="group w-full sm:w-44 h-auto p-4 flex flex-col items-center space-y-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-950 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900/30 transition transform hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="quick-action-members"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/40 transition">
                    <Users className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">View Members</span>
                </Button>
              </Link>

              <Link href="/settings">
                <Button
                  aria-label="Settings"
                  className="group w-full sm:w-44 h-auto p-4 flex flex-col items-center space-y-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition transform hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="quick-action-settings"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800 transition">
                    <SettingsIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer quote */}
      <div className="pt-10 pb-6">
        <p className="text-center text-gray-400 dark:text-slate-500 text-sm italic opacity-60">
          "Serving with compassion, empowering communities — together we make a difference."
        </p>
      </div>
    </div>
  );
}
