import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import usersReducer from "./features/manage/users/usersSlice";
import sportTypesReducer from "./features/manage/sportTypes/sportTypesSlice";
import adsReducer from "./features/manage/ads/adSlice";
import subscriptionsReducer from "./features/manage/packages/packagesSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        manageUsers: usersReducer,
        sportTypes: sportTypesReducer,
        ads: adsReducer,
        subscriptions: subscriptionsReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
