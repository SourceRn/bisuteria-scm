import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell, IconAlertTriangle, IconClipboardList, IconBolt } from "@tabler/icons-react";
import { getNotificacionesScm } from "../../services/api";
import "./NotificationBell.css";

const POLL_MS = 60000; // refresca cada minuto

export default function NotificationBell() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const cargar = useCallback(() => {
    getNotificacionesScm()
      .then(setDatos)
      .catch(() => {}); // si falla, conserva lo ultimo que se tenia
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, POLL_MS);
    return () => clearInterval(intervalo);
  }, [cargar]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  function toggle() {
    if (!abierto) cargar(); // al abrir, siempre trae datos frescos
    setAbierto((v) => !v);
  }

  function irA(ruta) {
    setAbierto(false);
    navigate(ruta);
  }

  const total = datos?.total ?? 0;
  const sinNada =
    datos &&
    datos.stock_critico.length === 0 &&
    datos.pedidos_por_atender.length === 0 &&
    datos.reposiciones_automaticas.length === 0;

  return (
    <div className="notif" ref={ref}>
      <button
        className="notif__btn"
        onClick={toggle}
        aria-label={total > 0 ? `Notificaciones, ${total} pendientes` : "Notificaciones"}
      >
        <IconBell size={20} stroke={1.6} />
        {total > 0 && <span className="notif__badge">{total > 9 ? "9+" : total}</span>}
      </button>

      {abierto && (
        <div className="notif__panel">
          {!datos ? (
            <p className="notif__empty">Cargando...</p>
          ) : sinNada ? (
            <p className="notif__empty">Todo en orden, no hay notificaciones.</p>
          ) : (
            <>
              {datos.stock_critico.length > 0 && (
                <div className="notif__section">
                  <p className="notif__section-title notif__section-title--critico">
                    <IconAlertTriangle size={14} stroke={1.8} />
                    Stock crítico ({datos.stock_critico.length})
                  </p>
                  {datos.stock_critico.map((p) => (
                    <button key={p.id} className="notif__item" onClick={() => irA("/inventario")}>
                      <div className="notif__item-main">
                        <p className="notif__item-name">{p.nombre}</p>
                        <p className="notif__item-detail">
                          Stock {p.stock_actual} de mínimo {p.stock_minimo}
                        </p>
                      </div>
                      <span className={`notif__tag notif__tag--${p.estrategia_logistica.toLowerCase()}`}>
                        {p.estrategia_logistica}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {datos.pedidos_por_atender.length > 0 && (
                <div className="notif__section">
                  <p className="notif__section-title notif__section-title--pedido">
                    <IconClipboardList size={14} stroke={1.8} />
                    Pedidos por atender ({datos.pedidos_por_atender.length})
                  </p>
                  {datos.pedidos_por_atender.map((p) => (
                    <button key={p.id} className="notif__item" onClick={() => irA("/pedidos")}>
                      <div className="notif__item-main">
                        <p className="notif__item-name">{p.producto_nombre}</p>
                        <p className="notif__item-detail">
                          {p.cantidad} uds · {p.tipo} · {p.estado.replace("_", " ")}
                        </p>
                      </div>
                      {p.automatico && <span className="notif__tag notif__tag--auto">Automático</span>}
                    </button>
                  ))}
                </div>
              )}

              {datos.reposiciones_automaticas.length > 0 && (
                <div className="notif__section">
                  <p className="notif__section-title notif__section-title--auto">
                    <IconBolt size={14} stroke={1.8} />
                    Reposiciones automáticas recientes
                  </p>
                  {datos.reposiciones_automaticas.map((p) => (
                    <button key={p.id} className="notif__item" onClick={() => irA("/pedidos")}>
                      <div className="notif__item-main">
                        <p className="notif__item-name">{p.producto_nombre}</p>
                        <p className="notif__item-detail">
                          {p.cantidad} uds · {new Date(p.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`notif__tag notif__tag--${p.estado}`}>{p.estado}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}