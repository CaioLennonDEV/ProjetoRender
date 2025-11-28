import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CronogramaItem, CronogramaState } from '@/db/types';
import { getAllCronogramaItems, insertCronogramaItem, updateCronogramaItem, deleteCronogramaItem } from '@/db/init';

const initialState: CronogramaState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchCronogramaItems = createAsyncThunk(
  'cronograma/fetchItems',
  async () => {
    const items = await getAllCronogramaItems();
    return items;
  }
);

export const addCronogramaItem = createAsyncThunk(
  'cronograma/addItem',
  async (item: { mes: string; atividade: string; categoria: string; inicio: string; fim: string }) => {
    await insertCronogramaItem(item.mes, item.atividade, item.categoria, item.inicio, item.fim);
    const items = await getAllCronogramaItems();
    return items;
  }
);

export const editCronogramaItem = createAsyncThunk(
  'cronograma/editItem',
  async (item: { id: number; mes: string; atividade: string; categoria: string; inicio: string; fim: string }) => {
    await updateCronogramaItem(item.id, item.mes, item.atividade, item.categoria, item.inicio, item.fim);
    const items = await getAllCronogramaItems();
    return items;
  }
);

export const removeCronogramaItem = createAsyncThunk(
  'cronograma/removeItem',
  async (id: number) => {
    await deleteCronogramaItem(id);
    const items = await getAllCronogramaItems();
    return items;
  }
);

const cronogramaSlice = createSlice({
  name: 'cronograma',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<CronogramaItem[]>) => {
      state.items = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCronogramaItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCronogramaItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCronogramaItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar cronograma';
      })
      .addCase(addCronogramaItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCronogramaItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addCronogramaItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao adicionar item';
      })
      .addCase(editCronogramaItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editCronogramaItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(editCronogramaItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao editar item';
      })
      .addCase(removeCronogramaItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCronogramaItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeCronogramaItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao remover item';
      });
  },
});

export const { setItems, clearError } = cronogramaSlice.actions;
export default cronogramaSlice.reducer;
