// app/api/auth/verify-otp/route.ts
import { proxyAuth } from "../_proxy";
export async function POST(req: Request) {
    return proxyAuth("/auth/verify-otp", req);
}
