import { notificationStore } from "@/modules/shared/notificationStore";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function GlobalToaster() {
  const $notification = useStore(notificationStore);

  useEffect(() => {
    if ($notification) {
      toast[$notification.type || "message"]($notification.message);
    }
  }, [$notification]);

  return <Toaster richColors position="top-right" theme="dark" />;
}
