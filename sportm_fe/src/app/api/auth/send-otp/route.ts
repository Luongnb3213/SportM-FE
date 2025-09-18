// app/api/auth/send-otp/route.ts
import { proxyAuth } from "../_proxy";
export async function POST(req: Request) {
    return proxyAuth("/auth/send-otp", req);
}
