import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { mensajeError } from '../services/api';
import Aviso from '../components/Aviso';

export default function Perfil() {
  const { usuario, setUsuario } = useAuth();
  const [datos, setDatos] = useState({
    nombre: usuario.nombre,
    calle: usuario.direccion?.calle ?? '',
    ciudad: usuario.direccion?.ciudad ?? '',
    cp: usuario.direccion?.cp ?? '',
  });
  const [claves, setClaves] = useState({ passwordActual: '', passwordNueva: '' });
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });

  async function guardar(cuerpo, alTerminar) {
    setAviso({ tipo: '', texto: '' });
    try {
      const { data } = await api.put('/auth/perfil', cuerpo);
      setUsuario(data);
      alTerminar?.();
      setAviso({ tipo: 'exito', texto: 'Cambios guardados' });
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
    }
  }

  function guardarDatos(e) {
    e.preventDefault();
    const { nombre, calle, ciudad, cp } = datos;
    guardar({ nombre: nombre.trim(), direccion: { calle, ciudad, cp } });
  }

  function cambiarPassword(e) {
    e.preventDefault();
    guardar(claves, () => setClaves({ passwordActual: '', passwordNueva: '' }));
  }

  const cambiar = (setter, estado, campo) => (e) => setter({ ...estado, [campo]: e.target.value });

  return (
    <>
      <section className="cabecera">
        <h1>Mi perfil</h1>
        <p>
          {usuario.email}
          {usuario.rol === 'admin' && <span className="insignia">Administrador</span>}
        </p>
      </section>

      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>

      <div className="columnas">
        <form className="formulario tarjeta-formulario" onSubmit={guardarDatos}>
          <h2>Datos de envío</h2>
          <p className="nota">Usaremos esta dirección para enviarte tus pedidos.</p>
          <label>
            Nombre
            <input required value={datos.nombre} onChange={cambiar(setDatos, datos, 'nombre')} />
          </label>
          <label>
            Dirección
            <input autoComplete="street-address" value={datos.calle} onChange={cambiar(setDatos, datos, 'calle')} />
          </label>
          <div className="formulario__fila">
            <label>
              Ciudad
              <input autoComplete="address-level2" value={datos.ciudad} onChange={cambiar(setDatos, datos, 'ciudad')} />
            </label>
            <label>
              Código postal
              <input autoComplete="postal-code" value={datos.cp} onChange={cambiar(setDatos, datos, 'cp')} />
            </label>
          </div>
          <button type="submit" className="boton boton--primario">Guardar datos</button>
        </form>

        <form className="formulario tarjeta-formulario" onSubmit={cambiarPassword}>
          <h2>Cambiar contraseña</h2>
          <label>
            Contraseña actual
            <input type="password" autoComplete="current-password" required value={claves.passwordActual} onChange={cambiar(setClaves, claves, 'passwordActual')} />
          </label>
          <label>
            Nueva contraseña
            <input type="password" autoComplete="new-password" required minLength={6} value={claves.passwordNueva} onChange={cambiar(setClaves, claves, 'passwordNueva')} />
          </label>
          <button type="submit" className="boton">Cambiar contraseña</button>
        </form>
      </div>
    </>
  );
}
