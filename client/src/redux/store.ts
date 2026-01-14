import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import createIndexedDBStorage from "redux-persist-indexeddb-storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import sidebarReducer from "./slices/sidebarSlice";
import toastReducer from "./slices/toastSlice";
import userReducer,{UserState} from "./slices/UserSlice";

// Import types for proper typing with redux-persist
import { PersistConfig } from 'redux-persist';
import { SidebarState } from "@/types";
import { TypedUseSelectorHook,useSelector } from "react-redux";
const indexedDBStorage = createIndexedDBStorage("myAppDB");
const encryptionTransform = encryptTransform({
  secretKey: import.meta.env.VITE_API_INDEX_DB_STORAGE,
  onError: (error: Error) => {
    console.warn("Encryption error:", error);
  },
});

const sidebarpersistConfig: PersistConfig<SidebarState> = {
  key: "sidebar",
  storage: indexedDBStorage,
  transforms: [encryptionTransform],
};
// Create the store with properly typed reducers
export const store = configureStore({
  reducer: {
    sidebar: persistReducer<SidebarState>(sidebarpersistConfig, sidebarReducer),
    toast: toastReducer,
    user:  userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof store.dispatch;