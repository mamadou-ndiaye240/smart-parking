import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Map from './pages/Map'
import ParkingDetails from './pages/ParkingDetails'
import RoutePage from './pages/Route'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/parking/:id" element={<ParkingDetails />} />
        <Route path="/route/:id" element={<RoutePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App