import { useState } from 'react';
import { Bell, MessageSquare, CheckCheck, Clock, Loader2, Inbox as InboxIcon } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/features/notifications/hooks/useNotifications';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

type Tab = 'notifications' | 'comments';

function TabBtn({ active, onClick, icon: Icon, label, badge }: {
  active: boolean; onClick: () => void; icon: React.ElementType; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 ${
        active
          ? 'border-ip-primary text-ip-primary'
          : 'border-transparent text-ip-on-surface-variant hover:text-ip-on-surface hover:border-ip-outline-variant'
      }`}
    >
      <Icon size={15} />
      {label}
      {badge != null && badge > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-ip-primary text-ip-on-primary text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Notifications tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-ip-primary" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ip-on-surface-variant">
        <InboxIcon size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">You're all caught up!</p>
        <p className="text-xs mt-1 opacity-60">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Actions */}
      {unread > 0 && (
        <div className="flex justify-end px-6 py-3 border-b border-ip-outline-variant">
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-ip-primary hover:text-ip-on-primary-fixed-variant transition-colors"
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        </div>
      )}

      <div className="divide-y divide-ip-outline-variant/50">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && markRead.mutate(n.id)}
            className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer ${
              n.isRead
                ? 'hover:bg-ip-surface-container-low'
                : 'bg-ip-primary/[0.03] hover:bg-ip-primary/[0.06]'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.isRead ? 'bg-ip-surface-container' : 'bg-ip-secondary-container'
            }`}>
              <Bell size={14} className={n.isRead ? 'text-ip-on-surface-variant' : 'text-ip-primary'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${n.isRead ? 'text-ip-on-surface-variant' : 'text-ip-on-surface font-medium'}`}>
                {n.message}
              </p>
              <p className="flex items-center gap-1 text-xs text-ip-on-surface-variant mt-1">
                <Clock size={11} />
                {timeAgo(n.createdAt)}
              </p>
            </div>
            {!n.isRead && (
              <div className="w-2 h-2 rounded-full bg-ip-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comments tab (placeholder) ───────────────────────────────────────────────
function CommentsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ip-on-surface-variant">
      <MessageSquare size={32} className="mb-3 opacity-30" />
      <p className="text-sm font-medium">Comments coming soon</p>
      <p className="text-xs mt-1 opacity-60">Task comments will appear here.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const [tab, setTab] = useState<Tab>('notifications');
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="font-jakarta space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-ip-on-surface tracking-tight">Inbox</h1>
        <p className="text-sm text-ip-on-surface-variant mt-1">Your notifications and team messages.</p>
      </div>

      {/* Card */}
      <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
        {/* Tab bar */}
        <div className="flex border-b border-ip-outline-variant px-2 pt-2">
          <TabBtn
            active={tab === 'notifications'}
            onClick={() => setTab('notifications')}
            icon={Bell}
            label="Notifications"
            badge={unread}
          />
          <TabBtn
            active={tab === 'comments'}
            onClick={() => setTab('comments')}
            icon={MessageSquare}
            label="Comments"
          />
        </div>

        {/* Content */}
        {tab === 'notifications' ? <NotificationsTab /> : <CommentsTab />}
      </div>
    </div>
  );
}
