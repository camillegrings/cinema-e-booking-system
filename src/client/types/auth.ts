export type UserRole = "CUSTOMER" | "ADMIN";

export type UserStatus = "active" | "inactive";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}