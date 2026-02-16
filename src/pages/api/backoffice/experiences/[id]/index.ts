import { DELETE } from "@/features/broker/experience/api/server-handler/DELETEExperienceById";
import { GET } from "@/features/broker/experience/api/server-handler/GETExperienceById";
import { PATCH } from "@/features/broker/experience/api/server-handler/PATCHExperienceById";

export const prerender = false;

export { GET };
export { PATCH };
export { PATCH as PUT };
export { DELETE };
