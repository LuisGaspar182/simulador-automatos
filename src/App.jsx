import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Simuladores from './pages/Simuladores/Simuladores'
import Conteudo from './pages/Conteudo/Conteudo'
import AFD from './pages/AFD/AFD'
import AFND from './pages/AFND/AFND'
import APD from './pages/APD/APD'
import APND from './pages/APND/APND'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simuladores" element={<Simuladores />} />
        <Route path="/conteudo" element={<Conteudo />} />
        <Route path="/afd" element={<AFD />} />
        <Route path="/afnd" element={<AFND />} />
        <Route path="/apd" element={<APD />} />
        <Route path="/apnd" element={<APND />} />
        <Route path="/turing" element={<Navigate to="/simuladores" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
