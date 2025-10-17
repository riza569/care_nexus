import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { CalendarPlus, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format, addDays, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

interface Visit {
  id: string;
  clientName: string;
  carerName: string;
  scheduledDate: Date;
  duration: number;
  status: string;
}

export default function Scheduling() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [carers, setCarers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newVisit, setNewVisit] = useState({
    clientId: '',
    carerId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 60,
  });

  useEffect(() => {
    // Load visits
    const visitsQuery = query(collection(db, 'visits'));
    const unsubVisits = onSnapshot(visitsQuery, (snapshot) => {
      const visitsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName,
          carerName: data.carerName,
          scheduledDate: data.scheduledDate.toDate(),
          duration: data.duration,
          status: data.status,
        };
      });
      setVisits(visitsData);
    });

    // Load clients
    const clientsQuery = query(collection(db, 'clients'));
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Load carers from carers collection
    const carersQuery = query(collection(db, 'carers'));
    const unsubCarers = onSnapshot(carersQuery, (snapshot) => {
      setCarers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubVisits();
      unsubClients();
      unsubCarers();
    };
  }, []);

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedClient = clients.find((c) => c.id === newVisit.clientId);
    const selectedCarer = carers.find((c) => c.id === newVisit.carerId);

    if (!selectedClient || !selectedCarer) {
      toast.error('Please select both client and carer');
      return;
    }

    const scheduledDateTime = new Date(`${newVisit.date}T${newVisit.time}`);

    try {
      await addDoc(collection(db, 'visits'), {
        clientId: newVisit.clientId,
        clientName: selectedClient.name,
        clientAddress: selectedClient.address,
        carerId: newVisit.carerId,
        carerName: selectedCarer.name,
        scheduledDate: Timestamp.fromDate(scheduledDateTime),
        duration: newVisit.duration,
        status: 'scheduled',
        tasks: ['Personal care', 'Medication', 'Meal preparation'],
        createdAt: Timestamp.now(),
      });

      toast.success('Visit scheduled successfully');
      setIsAddDialogOpen(false);
      setNewVisit({
        clientId: '',
        carerId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        duration: 60,
      });
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Failed to schedule visit');
    }
  };

  const filteredVisits = visits.filter((visit) => {
    const visitDate = startOfDay(visit.scheduledDate);
    const selected = startOfDay(selectedDate);
    return visitDate.getTime() === selected.getTime();
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scheduling</h1>
          <p className="mt-2 text-muted-foreground">Manage visit schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <CalendarPlus className="mr-2 h-5 w-5" />
              Schedule Visit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Visit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <select
                  id="client"
                  value={newVisit.clientId}
                  onChange={(e) => setNewVisit({ ...newVisit, clientId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="carer">Caretaker</Label>
                <select
                  id="carer"
                  value={newVisit.carerId}
                  onChange={(e) => setNewVisit({ ...newVisit, carerId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a caretaker</option>
                  {carers.map((carer) => (
                    <option key={carer.id} value={carer.id}>
                      {carer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newVisit.date}
                    onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newVisit.time}
                    onChange={(e) => setNewVisit({ ...newVisit, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newVisit.duration}
                  onChange={(e) => setNewVisit({ ...newVisit, duration: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                Schedule Visit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setSelectedDate((prev) => addDays(prev, -1))}>
          Previous
        </Button>
        <div className="flex-1 text-center">
          <p className="text-sm text-muted-foreground">Selected Date</p>
          <p className="font-semibold text-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate((prev) => addDays(prev, 1))}>
          Next
        </Button>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <div className="rounded-xl bg-card p-12 text-center shadow-soft">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No visits scheduled</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Schedule visits for this date to see them here
            </p>
          </div>
        ) : (
          filteredVisits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-gradient-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{visit.clientName}</h3>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Carer: {visit.carerName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(visit.scheduledDate, 'h:mm a')} ({visit.duration} mins)
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    visit.status === 'completed'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {visit.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
