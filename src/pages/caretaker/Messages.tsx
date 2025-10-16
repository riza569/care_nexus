import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: Date;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user, role } = useAuthStore();

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          timestamp: data.timestamp.toDate(),
        };
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.email?.split('@')[0] || 'User',
        senderRole: role || 'caretaker',
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
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm opacity-90">Chat with admin and team</p>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === user?.uid;
          return (
            <motion.div
              key={message.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  isOwnMessage
                    ? 'bg-gradient-primary text-primary-foreground'
                    : 'bg-card shadow-soft'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium opacity-90">
                    {message.senderName}
                  </span>
                  <span className="text-xs opacity-70">
                    ({message.senderRole})
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
                <p className="mt-2 text-xs opacity-70">
                  {format(message.timestamp, 'h:mm a')}
                </p>
              </div>
            </motion.div>
          );
        })}
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
