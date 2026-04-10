import type { CustomerNotification, NotificationEmailPreference } from "../models/notifications";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export async function fetchNotifications(customerId: string): Promise<CustomerNotification[]> {
  const response = await fetch(`${API_BASE_URL}/portal/notifications?customerId=${encodeURIComponent(customerId)}`);

  if (!response.ok) {
    throw new Error("Unable to load notifications.");
  }

  return (await response.json()) as CustomerNotification[];
}

export async function openNotification(notificationId: number, customerId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/portal/notifications/${notificationId}/open?customerId=${encodeURIComponent(customerId)}`,
    { method: "PATCH" }
  );

  if (!response.ok) {
    throw new Error("Unable to open notification.");
  }
}

export async function deleteNotification(notificationId: number, customerId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/portal/notifications/${notificationId}?customerId=${encodeURIComponent(customerId)}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error("Unable to delete notification.");
  }
}

export async function fetchNotificationEmailPreference(customerId: string): Promise<NotificationEmailPreference> {
  const response = await fetch(
    `${API_BASE_URL}/portal/notifications/email-preference?customerId=${encodeURIComponent(customerId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load notification email preference.");
  }

  return (await response.json()) as NotificationEmailPreference;
}

export async function updateNotificationEmailPreference(customerId: string, emailEnabled: boolean): Promise<NotificationEmailPreference> {
  const response = await fetch(`${API_BASE_URL}/portal/notifications/email-preference`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ customerId, emailEnabled })
  });

  if (!response.ok) {
    throw new Error("Unable to update notification email preference.");
  }

  return (await response.json()) as NotificationEmailPreference;
}
