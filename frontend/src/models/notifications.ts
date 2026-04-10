export type CustomerNotification = {
  notificationId: number;
  customerId: string;
  requestId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type NotificationEmailPreference = {
  customerId: string;
  emailEnabled: boolean;
};
