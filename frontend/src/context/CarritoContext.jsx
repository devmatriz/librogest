import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CLAVE = 'librogest_carrito';
export const MAX_POR_LIBRO = 20;

const CarritoContext = createContext(null);

function leerGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

// Solo se guarda lo necesario para mostrar el carrito; precio y stock se refrescan desde la API
function resumirLibro(libro) {
  return {
    _id: libro._id,
    titulo: libro.titulo,
    precio: libro.precio,
    stock: libro.stock,
    portadaUrl: libro.portadaUrl,
    autores: libro.autores?.map((a) => ({ _id: a._id, nombre: a.nombre })) ?? [],
  };
}

const limite = (libro) => Math.min(MAX_POR_LIBRO, libro.stock);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerGuardado); // [{ libro, cantidad }]

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento */ }
  }, [items]);

  // Sincroniza el carrito entre pestañas abiertas
  useEffect(() => {
    const alCambiar = (e) => { if (e.key === CLAVE) setItems(leerGuardado()); };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  // Devuelve cuántas unidades se añadieron realmente (puede ser menos por el stock)
  const agregar = useCallback((libro, cantidad = 1) => {
    const enCarrito = items.find((i) => i.libro._id === libro._id)?.cantidad ?? 0;
    const nueva = Math.min(limite(libro), enCarrito + cantidad);
    const añadidas = nueva - enCarrito;
    if (añadidas <= 0) return 0;

    const linea = { libro: resumirLibro(libro), cantidad: nueva };
    setItems((actuales) => (actuales.some((i) => i.libro._id === libro._id)
      ? actuales.map((i) => (i.libro._id === libro._id ? linea : i))
      : [...actuales, linea]));
    return añadidas;
  }, [items]);

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((actuales) => actuales.map((i) =>
      i.libro._id === id ? { ...i, cantidad: Math.max(1, Math.min(limite(i.libro), cantidad)) } : i
    ));
  }, []);

  const quitar = useCallback((id) => setItems((actuales) => actuales.filter((i) => i.libro._id !== id)), []);
  const vaciar = useCallback(() => setItems([]), []);

  // Actualiza precio y stock con los datos recientes de la API; quita los libros que ya no existen
  const refrescar = useCallback((librosActuales) => {
    const porId = new Map(librosActuales.map((l) => [l._id, l]));
    setItems((actuales) => actuales
      .filter((i) => porId.has(i.libro._id))
      .map((i) => {
        const libro = resumirLibro(porId.get(i.libro._id));
        return { libro, cantidad: Math.min(i.cantidad, Math.max(limite(libro), 0)) };
      }));
  }, []);

  const valor = useMemo(() => {
    const unidades = items.reduce((s, i) => s + i.cantidad, 0);
    const total = Math.round(items.reduce((s, i) => s + i.libro.precio * i.cantidad, 0) * 100) / 100;
    const cantidadDe = (id) => items.find((i) => i.libro._id === id)?.cantidad ?? 0;
    return { items, unidades, total, cantidadDe, agregar, cambiarCantidad, quitar, vaciar, refrescar };
  }, [items, agregar, cambiarCantidad, quitar, vaciar, refrescar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return ctx;
}
