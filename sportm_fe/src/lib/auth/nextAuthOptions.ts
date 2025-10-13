import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Role, User as BackendUser } from "@/lib/redux/features/auth/types";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth environment variables are missing.");
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

type BackendAuthPayload = {
    email: string;
    fullName: string;
    imgUrl?: string | null;
};

type BackendAuthSuccess = {
    data: {
        message?: string;
        access: string;
        user: Partial<BackendUser> & {
            id?: string;
            email?: string;
            fullName?: string | null;
            role?: Role;
            phone?: string | null;
            imgUrl?: string | null;
            avatar?: string | null;
        };
    };
};

function extractPicture(profile: unknown, fallback?: string | null) {
    if (typeof profile === "object" && profile && "picture" in profile) {
        const value = (profile as Record<string, unknown>).picture;
        if (typeof value === "string") return value;
    }
    return fallback ?? null;
}

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!account || account.provider !== "google") return true;

            const email = user.email ?? (typeof profile === "object" && profile && "email" in profile
                ? (profile.email as string | undefined)
                : undefined);
            if (!email) {
                console.error("Google sign-in missing email");
                return false;
            }

            const payload: BackendAuthPayload = {
                email,
                fullName: user.name ?? (typeof profile === "object" && profile && "name" in profile
                    ? (profile.name as string | undefined) ?? email
                    : email),
                imgUrl: extractPicture(profile, user.image),
            };

            try {
                const res = await fetch(`${API_BASE}/auth/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", accept: "*/*" },
                    body: JSON.stringify(payload),
                    cache: "no-store",
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Google sign-in sync failed:", res.status, text);
                    return false;
                }

                const json = (await res.json()) as BackendAuthSuccess;
                if (!json?.data?.access || !json?.data?.user) {
                    console.error("Malformed backend response during Google sign-in.");
                    return false;
                }

                (user as typeof user & {
                    backendAuth?: {
                        accessToken: string;
                        user: BackendAuthSuccess["data"]["user"];
                    };
                }).backendAuth = {
                    accessToken: json.data.access,
                    user: json.data.user,
                };

                return true;
            } catch (error) {
                console.error("Unexpected Google sign-in error:", error);
                return false;
            }
        },
        async jwt({ token, account, user }) {
            if (account?.provider === "google") {
                if (account.access_token) {
                    token.googleAccessToken = account.access_token;
                }
                if (account.id_token) {
                    token.googleIdToken = account.id_token;
                }
            }

            const backendAuth = (user as typeof user & {
                backendAuth?: {
                    accessToken: string;
                    user: BackendAuthSuccess["data"]["user"];
                };
            })?.backendAuth;

            if (backendAuth) {
                token.backend = backendAuth;
            }

            const backendUser = token.backend?.user;
            if (backendUser) {
                const fullName = backendUser.fullName ?? backendUser.email ?? null;
                const rawUserImage =
                    typeof user === "object" && user && "image" in user
                        ? ((user as { image?: string | null | undefined }).image ?? null)
                        : null;
                const image =
                    backendUser.imgUrl ??
                    backendUser.avatar ??
                    rawUserImage ??
                    null;

                const resolvedEmail = backendUser.email ?? token.user?.email ?? "";
                token.user = {
                    id: backendUser.id ?? resolvedEmail ?? token.user?.id ?? "",
                    email: resolvedEmail,
                    name: fullName,
                    image,
                    role: backendUser.role ?? (token.user?.role as Role | undefined) ?? "CLIENT",
                };
            }

            return token;
        },
        async session({ session, token }) {
            if (token.googleAccessToken) {
                session.googleAccessToken = token.googleAccessToken as string;
            }
            if (token.googleIdToken) {
                session.googleIdToken = token.googleIdToken as string;
            }
            if (token.backend?.accessToken) {
                session.backendAccessToken = token.backend.accessToken;
            }
            if (token.backend?.user) {
                const backendUser = token.backend.user;
                session.backendUser = backendUser;
                session.user = {
                    ...session.user,
                    id: backendUser.id ?? session.user?.id ?? "",
                    email: backendUser.email ?? session.user?.email ?? "",
                    name: backendUser.fullName ?? session.user?.name ?? backendUser.email ?? null,
                    image:
                        backendUser.imgUrl ??
                        backendUser.avatar ??
                        session.user?.image ??
                        null,
                    role: backendUser.role ?? "CLIENT",
                };
            } else if (token.user) {
                session.user = {
                    ...session.user,
                    id: token.user.id ?? session.user?.id ?? "",
                    email: token.user.email ?? session.user?.email ?? "",
                    name: token.user.name ?? session.user?.name ?? null,
                    image: token.user.image ?? session.user?.image ?? null,
                    role: token.user.role ?? "CLIENT",
                };
            }

            return session;
        },
    },
};

export function createNextAuthHandler() {
    return NextAuth(authOptions);
}
