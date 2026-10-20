import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'librogest_tema'; // 'claro' | 'oscuro'; sin valor = seguir al sistema
const consultaOscuro = '(prefers-color-scheme: dark)';

function leerGuardado() {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
}

const temaActual = () => (document.documentElement.dataset.theme === 'dark' ? 'oscuro' : 'claro');

function aplicar(tema) {
  document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
}

export function useTema() {
  const [tema, setTema] = useState(temaActual);

  // Mientras el usuario no elija, el tema sigue los cambios del sistema operativo
  useEffect(() => {
    const media = window.matchMedia(consultaOscuro);
    const alCambiar = (e) => {
      if (leerGuardado()) return;
      const nuevo = e.matches ? 'oscuro' : 'claro';
      aplicar(nuevo);
      setTema(nuevo);
    };
    media.addEventListener('change', alCambiar);
    return () => media.removeEventListener('change', alCambiar);
  }, []);

  const alternar = useCallback(() => {
    const nuevo = temaActual() === 'oscuro' ? 'claro' : 'oscuro';
    const raiz = document.documentElement;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducido) raiz.classList.add('cambiando-tema');
    aplicar(nuevo);
    setTema(nuevo);
    try { localStorage.setItem(CLAVE, nuevo); } catch { /* sin almacenamiento */ }
    window.setTimeout(() => raiz.classList.remove('cambiando-tema'), 350);
  }, []);

  return { tema, alternar };
}
