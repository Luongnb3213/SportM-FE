export type Role = "ADMIN" | "OWNER" | "CLIENT";

export type User = {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: Role;
};

export type LoginPayload = {
    email: string;
    password: string;
    remember?: boolean;
};

export type LoginResponse = {
    data: { user: User };
};

/* Thêm cho đăng ký */
export type SignupPayload = {
    email: string;
    fullName: string;
    phone: string;
    password: string;
};
