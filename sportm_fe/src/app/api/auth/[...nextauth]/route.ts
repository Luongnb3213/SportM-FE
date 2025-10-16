import { createNextAuthHandler } from "@/lib/auth/nextAuthOptions";

const handler = createNextAuthHandler();

export { handler as GET, handler as POST };
