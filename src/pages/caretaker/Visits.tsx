import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, CheckCircle, PlayCircle } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Visit {
  id: string;
  clientName: string;
  clientAddress: string;
  scheduledDate: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  tasks: string[];
}

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const visitsQuery = query(
      collection(db, 'visits'),
      where('carerId', '==', user.uid),
      where('scheduledDate', '>=', Timestamp.fromDate(dayStart)),
      where('scheduledDate', '<=', Timestamp.fromDate(dayEnd)),
      orderBy('scheduledDate', 'asc')
    );

    const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
      const visitsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName,
          clientAddress: data.clientAddress,
          scheduledDate: data.scheduledDate.toDate(),
          duration: data.duration,
          status: data.status,
          tasks: data.tasks || [],
        };
      });
      setVisits(visitsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleStartVisit = async (visitId: string) => {
    try {
      await updateDoc(doc(db, 'visits', visitId), {
        status: 'in-progress',
        startedAt: Timestamp.now(),
      });
      toast.success('Visit started');
    } catch (error) {
      toast.error('Failed to start visit');
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    try {
      await updateDoc(doc(db, 'visits', visitId), {
        status: 'completed',
        completedAt: Timestamp.now(),
      });
      toast.success('Visit completed');
    } catch (error) {
      toast.error('Failed to complete visit');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-2xl font-bold">My Visits</h1>
          <p className="mt-1 text-sm opacity-90">Browse and manage your visits</p>
        </motion.div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 rounded-xl bg-card p-4 shadow-soft">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
          >
            Previous
          </Button>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-foreground">
              {format(selectedDate, 'EEEE, MMMM d')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
          >
            Next
          </Button>
        </div>

        {/* Visits List */}
        {visits.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-card p-8 text-center shadow-soft"
          >
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No visits scheduled</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check another date or wait for new schedules
            </p>
          </motion.div>
        ) : (
          visits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-gradient-card p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    visit.status === 'completed'
                      ? 'bg-secondary/10 text-secondary'
                      : visit.status === 'in-progress'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {visit.status === 'completed'
                    ? 'Completed'
                    : visit.status === 'in-progress'
                    ? 'In Progress'
                    : 'Scheduled'}
                </span>
                <span className="text-xs text-muted-foreground">{visit.duration} mins</span>
              </div>

              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{visit.clientName}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(visit.scheduledDate, 'h:mm a')}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {visit.clientAddress}
                    </div>
                  </div>
                </div>
              </div>

              {visit.tasks.length > 0 && (
                <div className="mb-4 rounded-lg bg-background/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Tasks:</p>
                  <ul className="space-y-1">
                    {visit.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-3 w-3 text-secondary" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {visit.status === 'scheduled' && (
                <Button
                  onClick={() => handleStartVisit(visit.id)}
                  className="w-full bg-gradient-primary shadow-glow"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Visit
                </Button>
              )}
              {visit.status === 'in-progress' && (
                <Button
                  onClick={() => handleCompleteVisit(visit.id)}
                  className="w-full"
                  variant="secondary"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Visit
                </Button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
