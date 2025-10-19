import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, Timestamp, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { StatCard } from '@/components/ui/stat-card';
import { Users, Calendar, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface RecentVisit {
  id: string;
  carerName: string;
  clientName: string;
  status: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCarers: 0,
    todayVisits: 0,
    completedVisits: 0,
    pendingIncidents: 0,
    upcomingVisits: 0,
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);

  useEffect(() => {
    // Real-time listeners for dashboard stats
    const unsubscribers: (() => void)[] = [];

    // Listen to clients
    const clientsQuery = query(collection(db, 'clients'));
    unsubscribers.push(
      onSnapshot(clientsQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, totalClients: snapshot.size }));
      })
    );

    // Listen to carers
    const carersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'caretaker')
    );
    unsubscribers.push(
      onSnapshot(carersQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, activeCarers: snapshot.size }));
      })
    );

    // Listen to visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitsQuery = query(
      collection(db, 'visits'),
      where('scheduledDate', '>=', Timestamp.fromDate(today)),
      where('scheduledDate', '<', Timestamp.fromDate(tomorrow))
    );

    unsubscribers.push(
      onSnapshot(visitsQuery, (snapshot) => {
        const completed = snapshot.docs.filter((doc) => doc.data().status === 'completed').length;
        const upcoming = snapshot.docs.filter((doc) => doc.data().status === 'scheduled').length;
        setStats((prev) => ({
          ...prev,
          todayVisits: snapshot.size,
          completedVisits: completed,
          upcomingVisits: upcoming,
        }));
      })
    );

    // Listen to incidents
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('status', '==', 'pending')
    );
    unsubscribers.push(
      onSnapshot(incidentsQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, pendingIncidents: snapshot.size }));
      })
    );

    // Fetch recent visits with carer and client info
    const fetchRecentVisits = async () => {
      const recentVisitsQuery = query(
        collection(db, 'visits'),
        orderBy('scheduledDate', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(recentVisitsQuery);
      const visitsWithDetails = await Promise.all(
        snapshot.docs.map(async (visitDoc) => {
          const visitData = visitDoc.data();
          
          // Fetch carer details
          const carerDoc = await getDoc(doc(db, 'carers', visitData.carerId));
          const carerName = carerDoc.exists() ? carerDoc.data().name : 'Unknown Carer';
          
          // Fetch client details
          const clientDoc = await getDoc(doc(db, 'clients', visitData.clientId));
          const clientName = clientDoc.exists() ? clientDoc.data().name : 'Unknown Client';

          return {
            id: visitDoc.id,
            carerName,
            clientName,
            status: visitData.status || 'scheduled',
            timestamp: visitData.scheduledDate.toDate(),
          };
        })
      );

      setRecentVisits(visitsWithDetails);
    };

    fetchRecentVisits();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          trend="+12% from last month"
          trendUp={true}
          delay={0}
        />
        <StatCard
          title="Active Carers"
          value={stats.activeCarers}
          icon={CheckCircle}
          trend="+5 new this week"
          trendUp={true}
          delay={0.1}
        />
        <StatCard
          title="Today's Visits"
          value={stats.todayVisits}
          icon={Calendar}
          trend={`${stats.completedVisits} completed`}
          trendUp={true}
          delay={0.2}
        />
        <StatCard
          title="Completed Today"
          value={stats.completedVisits}
          icon={TrendingUp}
          trend={`${stats.upcomingVisits} upcoming`}
          trendUp={true}
          delay={0.3}
        />
        <StatCard
          title="Pending Incidents"
          value={stats.pendingIncidents}
          icon={AlertCircle}
          trend={stats.pendingIncidents > 0 ? 'Requires attention' : 'All clear'}
          trendUp={false}
          delay={0.4}
        />
        <StatCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          icon={Clock}
          trend="Next 2 hours"
          trendUp={true}
          delay={0.5}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl bg-gradient-card p-6 shadow-soft"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Visits</h2>
        <div className="space-y-3">
          {recentVisits.length > 0 ? (
            recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-background/50 p-4"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  visit.status === 'completed' 
                    ? 'bg-secondary/10 text-secondary' 
                    : visit.status === 'in-progress'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted-foreground/10 text-muted-foreground'
                }`}>
                  {visit.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : visit.status === 'in-progress' ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {visit.status === 'completed' ? 'Visit completed' : visit.status === 'in-progress' ? 'Visit in progress' : 'Visit scheduled'} by {visit.carerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Client: {visit.clientName} • {formatDistanceToNow(visit.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">No recent visits</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
