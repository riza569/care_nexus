import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, UserCircle, CalendarClock } from "lucide-react";
import { clientsAPI, usersAPI, schedulesAPI, leaveAPI } from "@/lib/api";
import type { User, Schedule, LeaveRequest } from "@/types";

const AdminDashboard = () => {
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsAPI.list().then((res) => res.data),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersAPI.list().then((res) => res.data),
  });

  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesAPI.list().then((res) => res.data),
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ["leave"],
    queryFn: () => leaveAPI.list().then((res) => res.data),
  });

  const carers = users?.filter((u: User) => u.role === "carer") || [];
  const pendingLeave =
    leaveRequests?.filter((l: LeaveRequest) => l.status === "pending") || [];
  const todaySchedules =
    schedules?.filter((s: Schedule) => {
      const today = new Date().toISOString().split("T")[0];
      return s.start_time.startsWith(today);
    }) || [];

  const stats = [
    {
      title: "Total Clients",
      value: clients?.length || 0,
      description: "Active care recipients",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Carers",
      value: carers.length,
      description: "Professional caregivers",
      icon: UserCircle,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Today's Schedules",
      value: todaySchedules.length,
      description: "Scheduled visits today",
      icon: Calendar,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Leave",
      value: pendingLeave.length,
      description: "Awaiting approval",
      icon: CalendarClock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your care operations and team
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">
                      {stat.title}
                    </CardDescription>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules?.slice(0, 5).map((schedule: Schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {schedule.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.carer_name} •{" "}
                        {new Date(schedule.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <button className="p-4 text-left rounded-lg border border-border hover:bg-accent/10 transition-colors">
                  <h4 className="font-medium">Create New Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Assign a task to a carer
                  </p>
                </button>
                <button className="p-4 text-left rounded-lg border border-border hover:bg-accent/10 transition-colors">
                  <h4 className="font-medium">Add New Client</h4>
                  <p className="text-sm text-muted-foreground">
                    Register a care recipient
                  </p>
                </button>
                <button className="p-4 text-left rounded-lg border border-border hover:bg-accent/10 transition-colors">
                  <h4 className="font-medium">Review Leave Requests</h4>
                  <p className="text-sm text-muted-foreground">
                    {pendingLeave.length} pending approval
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
