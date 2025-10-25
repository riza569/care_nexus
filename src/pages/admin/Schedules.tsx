import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { schedulesAPI, usersAPI, clientsAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import type {
  User,
  Client,
  Schedule,
  ScheduleFormData,
  ApiError,
} from "@/types";

const AdminSchedules = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesAPI.list().then((res) => res.data),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersAPI.list().then((res) => res.data),
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsAPI.list().then((res) => res.data),
  });

  const carers = users?.filter((u: User) => u.role === "carer") || [];

  const createMutation = useMutation({
    mutationFn: schedulesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule created successfully");
      setOpen(false);
    },
    onError: (error) => {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.detail || "Failed to create schedule"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const startTime = `${formData.get("start_date")}T${formData.get(
      "start_time"
    )}:00`;
    const endTime = `${formData.get("end_date")}T${formData.get(
      "end_time"
    )}:00`;

    const data: ScheduleFormData = {
      carer: Number(formData.get("carer")),
      client: Number(formData.get("client")),
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      start_time: startTime,
      end_time: endTime,
      status: "pending" as const,
    };

    createMutation.mutate(data);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedules</h1>
            <p className="text-muted-foreground mt-1">
              Manage caregiver assignments
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Schedule</DialogTitle>
                <DialogDescription>
                  Assign a task to a caregiver
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carer">Carer *</Label>
                  <Select name="carer" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carer" />
                    </SelectTrigger>
                    <SelectContent>
                      {carers.map((carer: User) => (
                        <SelectItem key={carer.id} value={String(carer.id)}>
                          {carer.first_name} {carer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select name="client" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client: Client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input id="end_date" name="end_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input id="end_time" name="end_time" type="time" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" className="w-full">
                  Create Schedule
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Carer:</span>{" "}
                            {schedule.carer_name}
                          </p>
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">
                No schedules yet. Create your first schedule.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSchedules;
