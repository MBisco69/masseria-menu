import { useState } from "react";
import MenuForm from "./MenuForm";
import AdminPanel from "./AdminPanel";

export default function App() {
  const [allChoices, setAllChoices] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const adminPassword = "masseria2025"; // Cambialo se vuoi

  const handleLogin = () => {
    if (passwordInput === adminPassword) {
      setAdminAuthenticated(true);
      setPasswordInput("");
    } else {
      alert("Password errata");
    }
  };

  const resetData = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) setAllChoices([]);
  };

  const handleToggleView = () => {
    setIsAdmin(!isAdmin);
    setAdminAuthenticated(false); // Reimposta autenticazione ogni volta che si cambia vista
  };

  return (
    <div>
      <button
        onClick={handleToggleView}
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          padding: "8px 12px",
          backgroundColor: "#4a5f44",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {isAdmin ? "Torna al Menù" : "Pannello Admin"}
      </button>

      {isAdmin ? (
        adminAuthenticated ? (
          <div>
            <AdminPanel allChoices={allChoices} />
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <button
                onClick={resetData}
                style={{
                  backgroundColor: "#a94444",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ❌ Reset scelte
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2 style={{ color: "#4a5f44" }}>Accesso Admin</h2>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Inserisci password"
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #aaa",
                marginRight: "10px",
              }}
            />
            <button
              onClick={handleLogin}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4a5f44",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Entra
            </button>
          </div>
        )
      ) : (
        <MenuForm allChoices={allChoices} setAllChoices={setAllChoices} />
      )}
    </div>
  );
}


