import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Communicate with your care team
        </p>
      </motion.div>

      {/* Messages Container */}
      <div className="flex h-[calc(100vh-16rem)] gap-6">
        {/* Carers List */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-80 rounded-xl bg-gradient-card shadow-soft overflow-hidden"
        >
          <div className="border-b border-border bg-background/50 p-4">
            <h2 className="text-lg font-semibold text-foreground">Carers</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {carersLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              </div>
            ) : carers.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">No carers found</p>
            ) : (
              carers.map((carer) => (
                <button
                  key={carer.id}
                  onClick={() => setSelectedCarer(carer)}
                  className={`w-full p-4 text-left transition-all hover:bg-background/80 ${
                    selectedCarer?.id === carer.id ? 'bg-background border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                      <User className="h-6 w-6 text-primary-foreground" />
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
        </motion.div>

        {/* Messages Area */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-1 flex-col rounded-xl bg-gradient-card shadow-soft overflow-hidden"
        >
          {selectedCarer ? (
            <>
              <div className="border-b border-border bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedCarer.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCarer.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/30">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 shadow-soft ${
                          msg.senderId === user?.uid
                            ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <p className={msg.senderId === user?.uid ? 'text-primary-foreground' : 'text-foreground'}>{msg.text}</p>
                        <p className={`mt-2 text-xs ${msg.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {msg.senderName}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-border bg-background/50 p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-gradient-primary shadow-glow hover:shadow-glow-lg">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center space-y-2">
                <User className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">Select a carer</p>
                <p className="text-sm text-muted-foreground">Choose a carer from the list to start messaging</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
