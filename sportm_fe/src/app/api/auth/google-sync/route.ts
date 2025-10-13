import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextAuthOptions";

const isProd = process.env.NODE_ENV === "production";
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session?.backendAccessToken || !session.backendUser) {
        return NextResponse.json(
            { status: "error", message: "Không tìm thấy thông tin phiên Google hợp lệ." },
            { status: 401 },
        );
    }

    const response = NextResponse.json({
        status: "success",
        data: {
            access: session.backendAccessToken,
            user: session.backendUser,
        },
    });

    response.cookies.set({
        name: "access_token",
        value: encodeURIComponent(session.backendAccessToken),
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        maxAge: DEFAULT_MAX_AGE,
        path: "/",
    });

    response.cookies.set({
        name: "user",
        value: encodeURIComponent(JSON.stringify(session.backendUser)),
        httpOnly: false,
        sameSite: "lax",
        secure: isProd,
        maxAge: DEFAULT_MAX_AGE,
        path: "/",
    });

    return response;
}
