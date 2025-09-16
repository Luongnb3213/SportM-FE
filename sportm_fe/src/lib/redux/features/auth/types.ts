export type User = {
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    role: "CLIENT" | "ADMIN" | string;
    bankAccount: string | null;
    documentUrl: string | null;
    bio: string | null;
};

export type LoginPayload = { email: string; password: string; remember?: boolean };

export type LoginResponse = {
    status: "success";
    statusCode: number;
    data: {
        message: string;
        access: string; 
        user: User;
    };
};
