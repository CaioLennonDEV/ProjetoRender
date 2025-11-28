import { Provider } from 'react-redux';
import { store } from '@/store/store';
import HomePage from '@/app/page';
import '@/index.css';
import '@/components/GanttChart.css';

function App() {
  return (
    <Provider store={store}>
      <HomePage />
    </Provider>
  );
}

export default App;

