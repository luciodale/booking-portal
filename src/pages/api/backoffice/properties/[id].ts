import { DELETE } from "@/features/broker/property/api/server-handler/DELETEPropertyById";
import { GET } from "@/features/broker/property/api/server-handler/GETPropertyById";
import { PATCH } from "@/features/broker/property/api/server-handler/PATCHPropertyById";

export const prerender = false;

export { GET };
export { PATCH };
export { PATCH as PUT };
export { DELETE };
