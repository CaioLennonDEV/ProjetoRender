import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCronogramaItems } from '@/store/cronogramaSlice';
import { CronogramaItem } from '@/db/types';

export function useCronograma() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.cronograma
  );

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      dispatch(fetchCronogramaItems());
    }
  }, [dispatch, items.length, isLoading]);

  return {
    items,
    isLoading,
    error,
    refetch: () => dispatch(fetchCronogramaItems()),
  };
}

export type { CronogramaItem };

