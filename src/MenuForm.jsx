import { useState } from "react";
import logo from "./assets/logo.png";

const menuData = {
  firstCourses: [
    {
      it: "Pennette all'arrabbiata",
      en: "Penne arrabbiata",
      de: "Penne all’arrabbiata"
    },
    {
      it: "Gnocchi al salmone",
      en: "Salmon gnocchi",
      de: "Lachs-Gnocchi"
    }
  ],
  secondCourses: [
    {
      it: "Caciocavallo al forno",
      en: "Baked caciocavallo",
      de: "Gebackener Caciocavallo"
    },
    {
      it: "Merluzzo al forno",
      en: "Baked cod",
      de: "Gebackener Kabeljau"
    }
  ]
};

export default function MenuForm({ allChoices, setAllChoices }) {
  const [language, setLanguage] = useState("it");
  const [room, setRoom] = useState("");
  const [quantities, setQuantities] = useState({});
  const [otherChoice, setOtherChoice] = useState("");

  const getLabel = (obj) => obj[language];

  const handleQuantityChange = (dish, value) => {
    setQuantities((prev) => ({
      ...prev,
      [dish]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room) {
      alert("Inserisci il numero della camera.");
      return;
    }

    const choices = { ...quantities };
    if (otherChoice.trim()) {
      choices["Altro"] = otherChoice.trim();
    }

    const newEntry = { room, choices };
    setAllChoices([...allChoices, newEntry]);
    setRoom("");
    setQuantities({});
    setOtherChoice("");
    alert("Scelta inviata!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f6ef",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        color: "#2e2e2e"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ maxWidth: "180px", marginBottom: "20px" }}
        />
        <h2 style={{ color: "#4a5f44", fontSize: "26px" }}>Menù del giorno</h2>
      </div>

      <label style={{ fontWeight: "bold", color: "#4a5f44" }}>
        Seleziona la lingua:&nbsp;
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "6px",
            backgroundColor: "#f1f1f1",
            color: "#4a5f44"
          }}
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </label>

      <br />
      <br />

      <label>
        <strong>
          {getLabel({
            it: "Numero camera",
            en: "Room number",
            de: "Zimmernummer"
          })}
          :
        </strong>
        <br />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Inserire il numero della stanza"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1"
          }}
        />
      </label>

      <br />
      <br />

      <h3 style={{ color: "#4a5f44" }}>
        {getLabel({
          it: "Primi piatti",
          en: "First Courses",
          de: "Erste Gänge"
        })}
      </h3>
      {menuData.firstCourses.map((dish, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          {getLabel(dish)}:
          <input
            type="number"
            min="0"
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) =>
              handleQuantityChange(getLabel(dish), e.target.value)
            }
            style={{
              width: "60px",
              marginLeft: "10px",
              padding: "4px",
              backgroundColor: "#f1f1f1"
            }}
          />
        </div>
      ))}

      <h3 style={{ color: "#4a5f44", marginTop: "20px" }}>
        {getLabel({
          it: "Secondi piatti",
          en: "Second Courses",
          de: "Zweite Gänge"
        })}
      </h3>
      {menuData.secondCourses.map((dish, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          {getLabel(dish)}:
          <input
            type="number"
            min="0"
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) =>
              handleQuantityChange(getLabel(dish), e.target.value)
            }
            style={{
              width: "60px",
              marginLeft: "10px",
              padding: "4px",
              backgroundColor: "#f1f1f1"
            }}
          />
        </div>
      ))}

      <br />

      <label>
        <strong>
          {getLabel({
            it: "Altro (inserire piatti alternativi)",
            en: "Other (insert alternatives)",
            de: "Andere (bitte Alternativen angeben)"
          })}
          :
        </strong>
        <br />
        <input
          type="text"
          value={otherChoice}
          onChange={(e) => setOtherChoice(e.target.value)}
          placeholder="Riportare anche allergie e intolleranze, se presenti"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1"
          }}
        />
      </label>

      <br />
      <br />

      <button
        type="submit"
        style={{
          backgroundColor: "#4a5f44",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        {getLabel({
          it: "Invia scelta",
          en: "Submit choice",
          de: "Auswahl senden"
        })}
      </button>
    </form>
  );
}




