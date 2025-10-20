import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { UserPlus, Search, Phone, MapPin, Calendar, Pencil, Trash2, Navigation } from 'lucide-react';
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
  location?: {
    latitude: number;
    longitude: number;
  };
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
    latitude: '',
    longitude: '',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
          location: data.location,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setClients(clientsData);
    });

    return () => unsubscribe();
  }, []);

  const getCurrentLocation = (isEdit: boolean = false) => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (isEdit && selectedClient) {
            setSelectedClient({
              ...selectedClient,
              location: { latitude, longitude },
            });
          } else {
            setNewClient({
              ...newClient,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            });
          }
          toast.success('Location captured successfully');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientData: any = {
        name: newClient.name,
        address: newClient.address,
        phone: newClient.phone,
        careLevel: newClient.careLevel,
        createdAt: Timestamp.now(),
      };

      if (newClient.latitude && newClient.longitude) {
        clientData.location = {
          latitude: parseFloat(newClient.latitude),
          longitude: parseFloat(newClient.longitude),
        };
      }

      await addDoc(collection(db, 'clients'), clientData);
      toast.success('Client added successfully');
      setIsAddDialogOpen(false);
      setNewClient({ name: '', address: '', phone: '', careLevel: 'standard', latitude: '', longitude: '' });
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      const updateData: any = {
        name: selectedClient.name,
        address: selectedClient.address,
        phone: selectedClient.phone,
        careLevel: selectedClient.careLevel,
      };

      if (selectedClient.location) {
        updateData.location = selectedClient.location;
      }

      await updateDoc(doc(db, 'clients', selectedClient.id), updateData);
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

  const getCareLevelBadge = (level: string) => {
    const colors = {
      standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      enhanced: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      complex: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[level as keyof typeof colors] || colors.standard;
  };

  const openInMaps = (location: { latitude: number; longitude: number }) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              
              {/* Location Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Location (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => getCurrentLocation(false)}
                    disabled={isGettingLocation}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {isGettingLocation ? 'Getting...' : 'Use Current Location'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="51.5074"
                      value={newClient.latitude}
                      onChange={(e) => setNewClient({ ...newClient, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-0.1278"
                      value={newClient.longitude}
                      onChange={(e) => setNewClient({ ...newClient, longitude: e.target.value })}
                    />
                  </div>
                </div>
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

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-xl bg-gradient-card p-4 shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-lg font-bold">{client.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">{client.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-xs">{client.address}</span>
                    </div>
                    {client.location && (
                      <button
                        onClick={() => openInMaps(client.location!)}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>View on Map</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{client.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Level Badge */}
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize whitespace-nowrap ${getCareLevelBadge(client.careLevel)}`}>
                  {client.careLevel}
                </span>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(client);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setSelectedClient(client);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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

            {/* Location Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => getCurrentLocation(true)}
                  disabled={isGettingLocation}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {isGettingLocation ? 'Getting...' : 'Update Location'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    placeholder="51.5074"
                    value={selectedClient?.location?.latitude || ''}
                    onChange={(e) => setSelectedClient(selectedClient ? {
                      ...selectedClient,
                      location: {
                        latitude: parseFloat(e.target.value) || 0,
                        longitude: selectedClient.location?.longitude || 0,
                      }
                    } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    placeholder="-0.1278"
                    value={selectedClient?.location?.longitude || ''}
                    onChange={(e) => setSelectedClient(selectedClient ? {
                      ...selectedClient,
                      location: {
                        latitude: selectedClient.location?.latitude || 0,
                        longitude: parseFloat(e.target.value) || 0,
                      }
                    } : null)}
                  />
                </div>
              </div>
              {selectedClient?.location && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openInMaps(selectedClient.location!)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  View Current Location on Map
                </Button>
              )}
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