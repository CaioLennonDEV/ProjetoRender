import { configureStore } from '@reduxjs/toolkit';
import cronogramaReducer from './cronogramaSlice';

export const store = configureStore({
  reducer: {
    cronograma: cronogramaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hook tipado para usar dispatch
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

