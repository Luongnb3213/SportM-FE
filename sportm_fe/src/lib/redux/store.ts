import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import usersReducer from "./features/manage/users/usersSlice";
import sportTypesReducer from "./features/manage/sportTypes/sportTypesSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        manageUsers: usersReducer,
        sportTypes: sportTypesReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
