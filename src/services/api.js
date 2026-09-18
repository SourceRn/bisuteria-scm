import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// TODO (dia 2): Productos
// export const getProductos = (params = {}) => { ... };
// export const crearProducto = (datos) => request("/productos", { method: "POST", body: JSON.stringify(datos) });

// TODO (dia 2): Proveedores
// export const getProveedores = () => request("/proveedores");

// TODO (dia 3): Movimientos de inventario
// export const getMovimientosDeProducto = (productoId) => request(`/productos/${productoId}/movimientos`);

// TODO (dia 4): Estrategia push/pull
// export const actualizarEstrategia = (id, estrategia) => ...

// TODO (dia 5): Pedidos SCM
// export const getPedidosScm = () => request("/pedidos-scm");

// TODO (dia 6): Nivel SCM + reportes
// export const getNivelScm = () => request("/scm/estado");