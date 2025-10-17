import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { useFirebaseCollection } from '@/hooks/useFirebaseData';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
}

interface Carer {
  id: string;
  name: string;
  email: string;
}

export default function AdminMessages() {
  const { user } = useAuthStore();
  const [selectedCarer, setSelectedCarer] = useState<Carer | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: carers, loading: carersLoading } = useFirebaseCollection<Carer>('carers');

  useEffect(() => {
    if (!selectedCarer) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [user?.uid, selectedCarer.id]),
      where('receiverId', 'in', [user?.uid, selectedCarer.id]),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedCarer, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedCarer || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        senderId: user.uid,
        senderName: 'Admin',
        receiverId: selectedCarer.id,
        timestamp: serverTimestamp(),
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Carers List */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Carers</h2>
        </div>
        <div className="overflow-y-auto">
          {carersLoading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : carers.length === 0 ? (
            <p className="p-4 text-muted-foreground">No carers found</p>
          ) : (
            carers.map((carer) => (
              <button
                key={carer.id}
                onClick={() => setSelectedCarer(carer)}
                className={`w-full p-4 text-left transition-colors hover:bg-muted ${
                  selectedCarer?.id === carer.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{carer.name}</p>
                    <p className="text-sm text-muted-foreground">{carer.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-1 flex-col">
        {selectedCarer ? (
          <>
            <div className="border-b border-border bg-card p-4">
              <h2 className="text-lg font-semibold text-foreground">{selectedCarer.name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 ${
                      msg.senderId === user?.uid
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-border bg-card p-4">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-gradient-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a carer to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
