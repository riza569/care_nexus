import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check } from "lucide-react";
import { schedulesAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Schedule } from "@/types";

const CarerSchedules = () => {
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesAPI.list().then((res) => res.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) =>
      schedulesAPI.update(id, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules-today"] });
      toast.success("Schedule marked as completed");
    },
    onError: () => toast.error("Failed to update schedule"),
  });

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Schedules</h1>
          <p className="text-muted-foreground mt-1">
            All your assigned visits and tasks
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : schedules && schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule: Schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0 text-center w-20">
                        <div className="text-2xl font-bold text-primary">
                          {format(new Date(schedule.start_time), "HH:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(schedule.start_time), "MMM dd")}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {schedule.title}
                        </h3>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Client:</span>{" "}
                            {schedule.client?.name}
                          </p>
                          {schedule.client?.address && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Location:</span>{" "}
                              {schedule.client.address}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Duration:</span>{" "}
                            {format(new Date(schedule.start_time), "HH:mm")} -{" "}
                            {format(new Date(schedule.end_time), "HH:mm")}
                          </p>
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                      {schedule.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeMutation.mutate(schedule.id)}
                          disabled={completeMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No schedules assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CarerSchedules;
