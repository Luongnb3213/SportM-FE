// app/api/auth/signup/route.ts
import { proxyAuth } from "../_proxy";
export async function POST(req: Request) {
    return proxyAuth("/auth/signup", req);
}