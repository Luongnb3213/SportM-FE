// app/api/auth/signup/route.ts
import { proxyAuth } from "../_proxy";
export async function PATCH(req: Request) {
    return proxyAuth("/auth/update-password", req);
}