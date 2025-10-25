import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, CalendarClock } from "lucide-react";
import { schedulesAPI } from "@/lib/api";
import { format } from "date-fns";
import type { Schedule } from "@/types";

const CarerDashboard = () => {
  const { data: todaySchedules } = useQuery({
    queryKey: ["schedules-today"],
    queryFn: () => schedulesAPI.myToday().then((res) => res.data),
  });

  const { data: allSchedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesAPI.list().then((res) => res.data),
  });

  const pendingSchedules =
    allSchedules?.filter((s: Schedule) => s.status === "pending") || [];

  const stats = [
    {
      title: "Today's Schedules",
      value: todaySchedules?.length || 0,
      description: "Visits scheduled for today",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Tasks",
      value: pendingSchedules.length,
      description: "Upcoming assignments",
      icon: CalendarClock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Schedules",
      value: allSchedules?.length || 0,
      description: "All assignments",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Completed",
      value:
        allSchedules?.filter((s: Schedule) => s.status === "completed")
          .length || 0,
      description: "Finished visits",
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Your daily tasks and schedules
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                    <div className="text-2xl sm:text-3xl font-bold">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {todaySchedules?.length || 0} visit(s) scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedules && todaySchedules.length > 0 ? (
              <div className="space-y-3">
                {todaySchedules.map((schedule: Schedule) => (
                  <div
                    key={schedule.id}
                    className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-14 sm:w-16 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {format(new Date(schedule.start_time), "HH:mm")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(schedule.start_time), "a")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">
                            {schedule.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {schedule.client?.name || "Client"}
                          </p>
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            schedule.status
                          )} flex-shrink-0`}
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No schedules for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CarerDashboard;
