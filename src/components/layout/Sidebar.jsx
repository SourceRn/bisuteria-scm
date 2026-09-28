import { NavLink } from "react-router-dom";
import { IconX } from "@tabler/icons-react";
import "./Sidebar.css";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/productos", label: "Productos" },
  { to: "/proveedores", label: "Proveedores" },
  { to: "/inventario", label: "Inventario" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/comparativa", label: "Push vs Pull" },
  { to: "/nivel-scm", label: "Nivel SCM" },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <span className="sidebar__brand">Yatzari SCM</span>
          <button className="sidebar__close" onClick={onClose} aria-label="Cerrar menú">
            <IconX size={20} stroke={1.6} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}