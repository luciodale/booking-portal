import { atom } from "nanostores";

export interface Notification {
  message: string;
  type: "success" | "error" | "message";
}

export const notificationStore = atom<Notification | null>(null);

export const showNotification = (notification: Notification) => {
  notificationStore.set(notification);
};

export const showSuccess = (message: string) => {
  showNotification({ message, type: "success" });
};

export const showError = (message: string) => {
  showNotification({ message, type: "error" });
};

export const showMessage = (message: string) => {
  showNotification({ message, type: "message" });
};
