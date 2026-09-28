import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getNivelScm, actualizarNivelScm } from "../services/api";
import "./NivelSCM.css";

const NIVELES = ["Inicial", "En desarrollo", "Optimizado"];
const NIVEL_PORCENTAJE = { "Inicial": 15, "En desarrollo": 55, "Optimizado": 95 };

export default function NivelSCM() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    getNivelScm()
      .then(setDatos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCambiarNivel(nivel) {
    setGuardando(true);
    try {
      const actualizado = await actualizarNivelScm({ nivel });
      setDatos(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleChecklist(index) {
    const nuevoChecklist = datos.checklist.map((item, i) =>
      i === index ? { ...item, completado: !item.completado } : item
    );
    setGuardando(true);
    try {
      const actualizado = await actualizarNivelScm({ checklist: nuevoChecklist });
      setDatos(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Layout titulo="Nivel de madurez SCM"><p>Cargando...</p></Layout>;
  if (error && !datos) return <Layout titulo="Nivel de madurez SCM"><p className="nivel-scm__error">Error: {error}</p></Layout>;

  const porcentaje = NIVEL_PORCENTAJE[datos.nivel] || 0;

  return (
    <Layout titulo="Nivel de madurez SCM">
      <div className="nivel-scm__panel">
        <p className="nivel-scm__label">Nivel actual</p>
        <div className="nivel-scm__bar-track">
          <div className="nivel-scm__bar-fill" style={{ width: `${porcentaje}%` }} />
        </div>
        <p className="nivel-scm__current">{datos.nivel}</p>
      </div>

      <div className="nivel-scm__niveles">
        {NIVELES.map((n) => (
          <button
            key={n}
            className={`nivel-scm__nivel-card ${datos.nivel === n ? "is-active" : ""}`}
            onClick={() => handleCambiarNivel(n)}
            disabled={guardando}
          >
            <p className="nivel-scm__nivel-title">{n}</p>
            <p className="nivel-scm__nivel-desc">
              {n === "Inicial" && "Procesos básicos."}
              {n === "En desarrollo" && "Integración de procesos."}
              {n === "Optimizado" && "Procesos avanzados."}
            </p>
          </button>
        ))}
      </div>

      <div className="nivel-scm__checklist">
        <h2>Checklist de avance</h2>
        <ul>
          {datos.checklist.map((item, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={item.completado}
                  onChange={() => handleToggleChecklist(i)}
                  disabled={guardando}
                />
                <span className={item.completado ? "is-done" : ""}>{item.item}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {datos.descripcion && (
        <div className="nivel-scm__descripcion">
          <h2>Descripción del nivel</h2>
          <p>{datos.descripcion}</p>
        </div>
      )}
    </Layout>
  );
}