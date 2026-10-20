import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import Catalogo from './pages/Catalogo';
import DetalleLibro from './pages/DetalleLibro';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import NoEncontrado from './pages/NoEncontrado';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/libros/:id" element={<DetalleLibro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <footer className="pie">
        <div className="contenedor">
          <p>LibroGest, tu librería en línea.</p>
        </div>
      </footer>
    </>
  );
}
