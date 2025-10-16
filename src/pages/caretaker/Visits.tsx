import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Visit {
  id: string;
  clientName: string;
  clientAddress: string;
  scheduledTime: Date;
  duration: number;
  status: string;
}

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const visitsQuery = query(
      collection(db, 'visits'),
      where('carerId', '==', user.uid),
      orderBy('scheduledDate', 'asc')
    );

    const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
      const visitsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientName: data.clientName,
            clientAddress: data.clientAddress,
            scheduledTime: data.scheduledDate.toDate(),
            duration: data.duration,
            status: data.status,
          };
        })
        .filter((visit) => {
          return visit.scheduledTime >= dayStart && visit.scheduledTime < dayEnd;
        });
      setVisits(visitsData);
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Visits</h1>
        <p className="mt-1 text-sm opacity-90">Manage your scheduled visits</p>
      </div>

      {/* Date Selector */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevDay}>
            Previous
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Selected Date</p>
            <p className="font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMM d')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            Next
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToday}
          className="mt-2 w-full"
        >
          Today
        </Button>
      </div>

      {/* Visits List */}
      <div className="p-4 space-y-4">
        {visits.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-card p-8 text-center shadow-soft"
          >
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No visits scheduled
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no visits scheduled for this date.
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
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{visit.clientName}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(visit.scheduledTime, 'h:mm a')} ({visit.duration} mins)
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {visit.clientAddress}
                    </div>
                  </div>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      visit.status === 'completed'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {visit.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
