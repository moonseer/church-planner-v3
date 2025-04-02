import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import authReducer from './slices/authSlice';
import churchesReducer from './slices/churchesSlice';
import eventsReducer from './slices/eventsSlice';
import teamsReducer from './slices/teamsSlice';
import schedulingReducer from './slices/schedulingSlice';
import uiReducer from './slices/uiSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    churches: churchesReducer,
    events: eventsReducer,
    teams: teamsReducer,
    scheduling: schedulingReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 