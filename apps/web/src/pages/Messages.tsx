import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { useHouseholdStore } from '../stores/householdStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, User as UserIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Messages() {
  const { user } = useAuthStore();
  const { messages, sendMessage } = useMessageStore();
  const { households } = useHouseholdStore();
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client');

  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === 'PROFESSIONAL' && initialClient) {
      setActiveThreadId(initialClient);
    } else if (user?.role === 'CLIENT') {
      const h = households[user.householdId];
      if (h?.professionalId) setActiveThreadId(h.professionalId);
    }
  }, [user, initialClient, households]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeThreadId]);

  if (!user) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    sendMessage({
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.role === 'CLIENT' ? user.householdId : user.id,
      receiverId: activeThreadId,
      text: inputText,
      timestamp: new Date().toISOString(),
    });
    setInputText('');
  };

  // Filter messages for active thread
  const threadMessages = messages.filter(m => {
    const isClientContext = user.role === 'CLIENT';
    const myId = isClientContext ? user.householdId : user.id;
    return (m.senderId === myId && m.receiverId === activeThreadId) || 
           (m.senderId === activeThreadId && m.receiverId === myId);
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[500px] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar for Professional to select client */}
      {user.role === 'PROFESSIONAL' && (
        <Card className="md:w-1/3 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg">Clients</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {Object.values(households).map(h => (
                <button
                  key={h.id}
                  onClick={() => setActiveThreadId(h.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-3 ${activeThreadId === h.id ? 'bg-fuchsia-50 border-l-4 border-fuchsia-600' : ''}`}
                >
                  <div className="bg-slate-200 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.members.length} members</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col h-full">
        {activeThreadId ? (
          <>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-fuchsia-600" />
                {user.role === 'CLIENT' ? 'Nutritionist Chat' : households[activeThreadId]?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {threadMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No messages yet. Send a message to start the conversation.
                </div>
              ) : (
                threadMessages.map(msg => {
                  const isMine = msg.senderId === (user.role === 'CLIENT' ? user.householdId : user.id);
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${isMine ? 'bg-fuchsia-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-900 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-fuchsia-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t bg-slate-50/50">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white"
                />
                <Button type="submit" disabled={!inputText.trim()} className="bg-fuchsia-600">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <UserIcon className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a client to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
}
