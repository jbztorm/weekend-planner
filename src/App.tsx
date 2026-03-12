import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GeneratePage } from './pages/GeneratePage';
import { ResultPage } from './pages/ResultPage';
import { MapPage } from './pages/MapPage';
import { SharedPage } from './pages/SharedPage';
import { SavedPage } from './pages/SavedPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/shared/:token" element={<SharedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
