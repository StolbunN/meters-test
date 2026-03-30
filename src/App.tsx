import { useEffect } from 'react';
import { MetersTable } from './components/MetersTable/MetersTable';
import { useStore } from './store/MetersStore';
import { observer } from 'mobx-react-lite';

const App = observer(() => {

  const rootStore = useStore();

  useEffect(() => {
    rootStore.fetchMeters();
  }, []);

  return (
    <div className="max-w-360 w-full m-auto p-4">
      <h1 className="text-2xl/[133%] font-medium mb-4">Список счётчиков</h1>
      {rootStore.loading ? <div>Загрузка...</div> : <MetersTable />}
    </div>
  );
});

export default App;
