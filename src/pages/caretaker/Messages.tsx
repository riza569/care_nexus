import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, getDocs, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      // Filter messages where user is sender or receiver
      const filteredMessages = allMessages.filter(
        (msg) => msg.senderId === user.uid || msg.receiverId === user.uid
      );
      
      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      // Get admin user ID dynamically
      const adminsQuery = query(collection(db, 'users'), limit(1));
      const adminsSnapshot = await getDocs(adminsQuery);
      const adminId = adminsSnapshot.docs[0]?.id || 'admin';

      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Carer',
        receiverId: adminId,
        timestamp: Timestamp.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col bg-background pb-16 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-sm opacity-90">Chat with admin</p>
        </motion.div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-xl bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.uid;
            return (
              <motion.div
                key={message.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    isOwnMessage
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'bg-card shadow-soft'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="mt-1 text-xs opacity-70">{message.senderName}</p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-border bg-card p-4"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-primary shadow-glow"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
