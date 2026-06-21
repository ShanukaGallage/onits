import { useState, useRef, useEffect } from 'react';
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/useNotifications';
import { useChannels, useCreateChannel, useDeleteChannel } from '@/features/channels/hooks/useChannels';
import { useMessages, useCreateMessage } from '@/features/channels/hooks/useMessages';
import { Bell, MessageSquare, Hash, PlusCircle, Send, CheckCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function InboxPage() {
  const { user } = useAuth();
  
  // System Notifications
  const { data: notifications, isLoading: notifsLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const systemUnreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  // Channels
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();

  const [activeChannelId, setActiveChannelId] = useState<string>('system');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Messages
  const { data: messages, isLoading: messagesLoading } = useMessages(activeChannelId);
  const createMessage = useCreateMessage();

  const threads = channels?.filter(c => c.type === 'Thread') || [];
  const projectChannels = channels?.filter(c => c.type === 'Project') || [];

  const activeChannel = activeChannelId === 'system' 
    ? { id: 'system', type: 'system', name: 'System Alerts' } 
    : channels?.find(c => c.id === activeChannelId);

  const canManageChannels = user?.role === 'Admin' || user?.role === 'ProjectManager';

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateChannel = (type: 'Project' | 'Thread') => {
    const name = window.prompt(`Enter new ${type} name:`);
    if (!name?.trim()) return;
    
    // For projects, we'd ideally select a project. We'll leave projectId blank for now
    // as it's optional in the schema.
    createChannel.mutate({ name: name.trim(), type });
  };

  const handleDeleteChannel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this channel?')) {
      deleteChannel.mutate(id);
      if (activeChannelId === id) setActiveChannelId('system');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || activeChannelId === 'system') return;

    createMessage.mutate({ channelId: activeChannelId, content: messageInput.trim() });
    setMessageInput('');
  };

  return (
    <div className="flex h-[calc(100vh-112px)] gap-6 overflow-hidden max-w-[1600px] mx-auto w-full font-jakarta">
      
      {/* Left Column: Channels (30%) */}
      <aside className="w-[30%] flex flex-col bg-ip-surface-container-lowest rounded-xl border border-ip-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.05)] shrink-0">
        <div className="p-4 border-b border-ip-outline-variant bg-ip-surface-container-lowest">
          <h2 className="text-xl font-bold text-ip-on-surface tracking-tight">Inbox</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          
          {/* System */}
          <div className="px-2 py-1 mt-2">
            <p className="text-[11px] font-bold text-ip-outline uppercase tracking-wider">System</p>
          </div>
          <button
            onClick={() => setActiveChannelId('system')}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeChannelId === 'system' 
                ? 'bg-ip-secondary-container text-ip-on-secondary-container' 
                : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low'
            }`}
          >
            <Bell size={18} className={activeChannelId === 'system' ? 'text-ip-primary' : ''} />
            <span>System Alerts</span>
            {systemUnreadCount > 0 && (
              <span className="ml-auto bg-ip-error text-ip-on-error text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {systemUnreadCount}
              </span>
            )}
          </button>

          {/* Threads */}
          <div className="px-2 py-1 mt-4 flex justify-between items-center group">
            <p className="text-[11px] font-bold text-ip-outline uppercase tracking-wider">Threads</p>
            {canManageChannels && (
              <button 
                onClick={() => handleCreateChannel('Thread')}
                className="text-ip-outline hover:text-ip-primary transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded"
                title="Create Thread"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          {threads.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group ${
                activeChannelId === channel.id 
                  ? 'bg-ip-surface-container-high text-ip-on-surface font-semibold' 
                  : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low'
              }`}
            >
              <MessageSquare size={18} />
              <span className="truncate flex-1 text-left">{channel.name}</span>
              {canManageChannels && (
                <div 
                  onClick={(e) => handleDeleteChannel(e, channel.id)}
                  className="opacity-0 group-hover:opacity-100 text-ip-on-surface-variant hover:text-ip-error transition-colors p-1 rounded-md"
                  title="Delete Thread"
                >
                  <Trash2 size={14} />
                </div>
              )}
            </button>
          ))}

          {/* Project Channels */}
          <div className="px-2 py-1 mt-4 flex justify-between items-center group">
            <p className="text-[11px] font-bold text-ip-outline uppercase tracking-wider">Project Channels</p>
            {canManageChannels && (
              <button 
                onClick={() => handleCreateChannel('Project')}
                className="text-ip-outline hover:text-ip-primary transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded"
                title="Create Project Channel"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          {projectChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group ${
                activeChannelId === channel.id 
                  ? 'bg-ip-surface-container-high text-ip-on-surface font-semibold' 
                  : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low'
              }`}
            >
              <Hash size={18} className="text-ip-outline" />
              <span className="truncate flex-1 text-left">{channel.name}</span>
              {canManageChannels && (
                <div 
                  onClick={(e) => handleDeleteChannel(e, channel.id)}
                  className="opacity-0 group-hover:opacity-100 text-ip-on-surface-variant hover:text-ip-error transition-colors p-1 rounded-md"
                  title="Delete Channel"
                >
                  <Trash2 size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Right Column: Chat/Message Area (70%) */}
      <section className="flex-1 flex flex-col bg-ip-surface-container-lowest rounded-xl border border-ip-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.05)]">
        
        {/* Chat Top Bar */}
        <div className="h-16 px-6 border-b border-ip-outline-variant flex items-center justify-between bg-ip-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2">
            {activeChannel?.type === 'Project' && <Hash size={20} className="text-ip-outline" />}
            {activeChannel?.type === 'Thread' && <MessageSquare size={20} className="text-ip-outline" />}
            {activeChannel?.type === 'system' && <Bell size={20} className="text-ip-primary" />}
            <h3 className="text-lg font-bold text-ip-on-surface">{activeChannel?.name}</h3>
          </div>
          
          <div className="flex items-center gap-4">
            {activeChannel?.type !== 'system' && (
              <>
                <button className="flex items-center gap-1.5 text-ip-on-surface-variant hover:text-ip-primary transition-colors text-sm font-semibold">
                  <MessageSquare size={16} /> Threads
                </button>
                <button className="flex items-center gap-1.5 text-ip-on-surface-variant hover:text-ip-primary transition-colors text-sm font-semibold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Team
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-ip-surface-container-lowest custom-scrollbar">
          
          {(notifsLoading || channelsLoading || messagesLoading) && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-ip-primary" />
            </div>
          )}

          {/* System Notifications */}
          {activeChannelId === 'system' && notifications?.map((n) => (
            <div key={n.id} onClick={() => !n.isRead && markRead.mutate(n.id)} className={`flex gap-4 cursor-pointer group ${n.isRead ? 'opacity-70' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                n.isRead ? 'bg-ip-surface border-ip-outline-variant text-ip-on-surface-variant' : 'bg-ip-primary-container border-ip-primary/30 text-ip-on-primary-container group-hover:bg-ip-primary group-hover:text-ip-on-primary'
              }`}>
                {n.isRead ? <CheckCheck size={18} /> : <Bell size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-ip-on-surface">System</span>
                  <span className="text-ip-outline text-[11px] font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className={`${n.isRead ? 'text-ip-on-surface-variant' : 'text-ip-on-surface font-medium'}`}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}

          {activeChannelId === 'system' && notifications?.length === 0 && (
            <div className="text-center text-ip-on-surface-variant py-10">No system notifications.</div>
          )}

          {/* Real Channel Messages */}
          {activeChannelId !== 'system' && messages?.map((msg) => (
            <div key={msg.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ip-primary to-ip-primary-container border border-ip-outline-variant flex-shrink-0 flex items-center justify-center text-white font-bold">
                {msg.sender.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-ip-on-surface">{msg.sender.name}</span>
                  <span className="text-ip-outline text-[11px] font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-ip-on-surface-variant text-sm whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          
          {activeChannelId !== 'system' && messages?.length === 0 && (
            <div className="text-center text-ip-on-surface-variant py-10">
              No messages yet. Start the conversation!
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-ip-outline-variant bg-ip-surface-container-lowest shrink-0">
          <form className="relative flex items-center" onSubmit={handleSendMessage}>
            <button type="button" className="absolute left-3 text-ip-on-surface-variant hover:text-ip-primary transition-colors">
              <PlusCircle size={20} />
            </button>
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeChannel?.type === 'system' ? 'System' : activeChannel?.name}`} 
              disabled={activeChannel?.type === 'system'}
              className="w-full bg-ip-surface-container-low border border-ip-outline-variant rounded-lg py-2.5 pl-11 pr-12 text-sm text-ip-on-surface focus:border-ip-primary focus:ring-1 focus:ring-ip-primary/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-ip-on-surface-variant/70"
            />
            <button 
              type="submit"
              disabled={activeChannel?.type === 'system' || !messageInput.trim()}
              className="absolute right-3 text-ip-primary hover:text-ip-primary-container transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
