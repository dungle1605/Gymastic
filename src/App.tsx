import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { SystemAssessment } from './components/SystemAssessment';
import { StoreProvider } from './store/UserActivityStore';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assessment" element={<SystemAssessment />} />
          </Routes>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App;
