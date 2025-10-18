import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { UserPlus, Search, Phone, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  careLevel: string;
  createdAt: Date;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    phone: '',
    careLevel: 'standard',
  });

  useEffect(() => {
    const clientsQuery = query(collection(db, 'clients'));

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          address: data.address,
          phone: data.phone,
          careLevel: data.careLevel,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setClients(clientsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'clients'), {
        ...newClient,
        createdAt: Timestamp.now(),
      });
      toast.success('Client added successfully');
      setIsAddDialogOpen(false);
      setNewClient({ name: '', address: '', phone: '', careLevel: 'standard' });
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      await updateDoc(doc(db, 'clients', selectedClient.id), {
        name: selectedClient.name,
        address: selectedClient.address,
        phone: selectedClient.phone,
        careLevel: selectedClient.careLevel,
      });
      toast.success('Client updated successfully');
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      await deleteDoc(doc(db, 'clients', selectedClient.id));
      toast.success('Client deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="mt-2 text-muted-foreground">Manage and monitor all clients</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="careLevel">Care Level</Label>
                <select
                  id="careLevel"
                  value={newClient.careLevel}
                  onChange={(e) => setNewClient({ ...newClient, careLevel: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="standard">Standard</option>
                  <option value="enhanced">Enhanced</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                Add Client
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl bg-gradient-card p-6 shadow-soft transition-all hover:shadow-medium"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-lg font-bold">{client.name.charAt(0)}</span>
              </div>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary capitalize">
                {client.careLevel}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {client.address}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Added {client.createdAt.toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedClient(client);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setSelectedClient(client);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={selectedClient?.name || ''}
                onChange={(e) => setSelectedClient(selectedClient ? { ...selectedClient, name: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={selectedClient?.address || ''}
                onChange={(e) => setSelectedClient(selectedClient ? { ...selectedClient, address: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={selectedClient?.phone || ''}
                onChange={(e) => setSelectedClient(selectedClient ? { ...selectedClient, phone: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-careLevel">Care Level</Label>
              <select
                id="edit-careLevel"
                value={selectedClient?.careLevel || 'standard'}
                onChange={(e) => setSelectedClient(selectedClient ? { ...selectedClient, careLevel: e.target.value } : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="standard">Standard</option>
                <option value="enhanced">Enhanced</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              Update Client
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedClient?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {filteredClients.length === 0 && (
        <div className="rounded-xl bg-card p-12 text-center shadow-soft">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No clients found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'Add your first client to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
