import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Bell, CheckCheck } from "lucide-react";
import {
  NotificationCard,
  EmptyState,
  ListShimmer,
} from "../../components/shared";
import * as notificationService from "../../services/notificationService";
import { useNotificationStore } from "../../stores/notificationStore";
import type { Notification } from "../../types/notification";

export function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => notificationService.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Refresh unread count
      notificationService.getUnreadCount().then((res) => {
        setUnreadCount(res.count);
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setUnreadCount(0);
    },
  });

  const notifications: Notification[] = data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate([notification.id]);
    }
  };

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
        >
          <ChevronLeft size={24} className="rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t("notifications.title")}
        </h1>
        {hasUnread ? (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="p-2 text-primary disabled:opacity-50"
            title={t("notifications.markAllRead", "قراءة الكل")}
          >
            <CheckCheck size={22} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {isLoading ? (
        <div className="p-4">
          <ListShimmer count={5} />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={56} strokeWidth={1.5} />}
          title={t("notifications.empty")}
          subtitle={t("notifications.emptyHint")}
        />
      ) : (
        <div className="p-4 space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
