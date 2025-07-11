import { useEffect, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove, update } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedData, setEditedData] = useState({});
  const otherKey = "Altro";

  // Legge i dati da Firebase
  useEffect(() => {
    const scelteRef = ref(db, "scelte");
    const unsubscribe = onValue(scelteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setAllChoices(array);
      } else {
        setAllChoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Calcolo Totali
  const totals = {};
  allChoices.forEach(({ choices }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === otherKey) {
        totals[otherKey] = qty;
      } else if (dish === "Antipasto di mare") {
        // ignorato nei totali
      } else {
        totals[dish] = (totals[dish] || 0) + qty;
      }
    });
  });

  // Reset globale
  const handleReset = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) {
      remove(ref(db, "scelte"));
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedData({ ...allChoices[index] });
  };

  const handleSaveEdit = async () => {
    const updates = {};
    updates[`scelte/${editedData.id}`] = {
      room: editedData.room,
      choices: editedData.choices
    };
    await update(ref(db), updates);
    setEditIndex(null);
  };

  const handleInputChange = (dish, value) => {
    setEditedData((prev) => ({
      ...prev,
      choices: {
        ...prev.choices,
        [dish]: dish === "Antipasto di mare" ? value === "true" : parseInt(value) || 0
      }
    }));
  };

  const handleOtherChange = (value) => {
    setEditedData((prev) => ({
      ...prev,
      choices: {
        ...prev.choices,
        [otherKey]: value
      }
    }));
  };

  return (
    <div style={{ padding: "30px", color: "#2e3e4f", position: "relative" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
      <hr />
      <ul>
        {allChoices.map(({ room, choices }, idx) => (
          <li key={idx}>
            <strong>Camera {room}:</strong>{" "}
            {Object.entries(choices)
              .filter(([k]) => k !== "Antipasto di mare")
              .map(([dish, qty]) =>
                dish === otherKey ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
              )
              .join(", ")}
            {choices["Antipasto di mare"] === false ? " ❌ Antipasto" : " ✔️"}
            <button
              onClick={() => handleEdit(idx)}
              style={{
                marginLeft: "10px",
                backgroundColor: "#eee",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer"
              }}
            >
              ✏️
            </button>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px" }}>🍽️ Totale piatti per tipo:</h3>
      <hr />
      <ul>
        {Object.entries(totals).map(([dish, qty], idx) => (
          <li key={idx}>{`${dish}: ${qty}`}</li>
        ))}
      </ul>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: "#a94444",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ❌ Reset scelte
        </button>
      </div>

      {/* MODALE di modifica */}
      {editIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "400px"
            }}
          >
            <h3>Modifica ordine camera {editedData.room}</h3>
            {Object.entries(editedData.choices).map(([dish, qty]) => {
              if (dish === otherKey) {
                return (
                  <div key={dish}>
                    <label>{dish}</label>
                    <input
                      type="text"
                      value={qty}
                      onChange={(e) => handleOtherChange(e.target.value)}
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                  </div>
                );
              }
              if (dish === "Antipasto di mare") {
                return (
                  <div key={dish}>
                    <label>{dish}</label>
                    <select
                      value={qty ? "true" : "false"}
                      onChange={(e) => handleInputChange(dish, e.target.value)}
                      style={{ width: "100%", marginBottom: "10px" }}
                    >
                      <option value="true">✔️ Sì</option>
                      <option value="false">❌ No</option>
                    </select>
                  </div>
                );
              }
              return (
                <div key={dish}>
                  <label>{dish}</label>
                  <input
                    type="number"
                    value={qty}
                    min="0"
                    onChange={(e) => handleInputChange(dish, e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                </div>
              );
            })}

            <button
              onClick={handleSaveEdit}
              style={{
                backgroundColor: "#4a5f44",
                color: "white",
                padding: "10px 20px",
                marginRight: "10px",
                border: "none",
                borderRadius: "6px"
              }}
            >
              Salva
            </button>
            <button
              onClick={() => setEditIndex(null)}
              style={{
                padding: "10px 20px",
                border: "1px solid gray",
                borderRadius: "6px",
                backgroundColor: "white"
              }}
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
