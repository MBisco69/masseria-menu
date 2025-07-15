import { useState } from "react";
import logo from "./assets/logo.png";
import { db } from "./firebase";
import { push, ref } from "firebase/database";

const translations = {
  it: {
    title: "Menù del giorno 16/07/2025",
    languageLabel: "Seleziona la lingua",
    roomLabel: "Numero camera",
    roomPlaceholder: "Inserire il numero della stanza",
    firstCourses: "Primi piatti",
    secondCourses: "Secondi piatti",
    otherLabel: "Altro (inserire piatti alternativi)",
    otherPlaceholder: "Riportare anche allergie e intolleranze, se presenti",
    submit: "Invia scelta",
    otherKey: "Altro",
    noStarter: "Non desidero l'antipasto di mare"
  },
  en: {
    title: "Menu of the Day 16/07/2025",
    languageLabel: "Select language",
    roomLabel: "Room number",
    roomPlaceholder: "Enter room number",
    firstCourses: "First Courses",
    secondCourses: "Second Courses",
    otherLabel: "Other (insert alternatives)",
    otherPlaceholder: "Also report allergies or intolerances, if any",
    submit: "Submit choice",
    otherKey: "Altro",
    noStarter: "I don't want the seafood starter"
  },
  de: {
    title: "Tagesmenü 16/07/2025",
    languageLabel: "Sprache auswählen",
    roomLabel: "Zimmernummer",
    roomPlaceholder: "Zimmernummer eingeben",
    firstCourses: "Erste Gänge",
    secondCourses: "Zweite Gänge",
    otherLabel: "Andere (bitte Alternativen angeben)",
    otherPlaceholder: "Bitte auch Allergien und Unverträglichkeiten angeben",
    submit: "Auswahl senden",
    otherKey: "Altro",
    noStarter: "Ich möchte keine Meeresfrüchte-Vorspeise"
  }
};

// 🔧 Nuovo menu del 15/07/2025
const menuData = {
  firstCourses: [
    {
      it: "Spaghetti con i lupini di mare (vongoline)",
      en: "Spaghetti with sea lupins (baby clams)",
      de: "Spaghetti mit Meeresschnecken (Venusmuscheln)"
    },
    {
      it: "Orecchiette con cicorietta, olive nere e pane croccante",
      en: "Orecchiette with wild chicory, black olives and crispy bread",
      de: "Orecchiette mit wilder Zichorie, schwarzen Oliven und knusprigem Brot"
    }
  ],
  secondCourses: [
    {
      it: "Filetto di branzino con patate e pomodorini",
      en: "Sea bass fillet with potatoes and cherry tomatoes",
      de: "Wolfsbarschfilet mit Kartoffeln und Kirschtomaten"
    },
    {
      it: "Pollo alla diavola",
      en: "Spicy grilled chicken (Pollo alla diavola)",
      de: "Scharfes Grillhähnchen (Pollo alla diavola)"
    }
  ]
};

export default function MenuForm() {
  const [language, setLanguage] = useState("it");
  const [room, setRoom] = useState("");
  const [quantities, setQuantities] = useState({});
  const [otherChoice, setOtherChoice] = useState("");
  const [noStarter, setNoStarter] = useState(false);

  const t = translations[language];
  const getLabel = (dish) => dish[language];

  const handleQuantityChange = (dishLabel, value) => {
    setQuantities((prev) => ({
      ...prev,
      [dishLabel]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room) {
      alert(t.roomPlaceholder);
      return;
    }

    const choices = {};

    [...menuData.firstCourses, ...menuData.secondCourses].forEach((dish) => {
      const label = getLabel(dish);
      const qty = quantities[label];
      if (qty > 0) {
        choices[dish.it] = qty;
      }
    });

    if (otherChoice.trim()) {
      choices[t.otherKey] = otherChoice.trim();
    }

    try {
      await push(ref(db, "scelte"), {
        room,
        choices,
        antipasto: !noStarter // salva antipasto: true se non selezionato
      });
      alert("Ordine inviato con successo!");
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Errore durante l'invio dell'ordine.");
    }

    setRoom("");
    setQuantities({});
    setOtherChoice("");
    setNoStarter(false);
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
        <h2 style={{ color: "#4a5f44", fontSize: "26px" }}>{t.title}</h2>
      </div>

      <label style={{ fontWeight: "bold", color: "#4a5f44" }}>
        {t.languageLabel}:&nbsp;
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

      <div style={{ marginTop: "10px" }}>
        <label style={{ color: "#4a5f44", fontWeight: "bold" }}>
          <input
            type="checkbox"
            checked={noStarter}
            onChange={(e) => setNoStarter(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          {t.noStarter}
        </label>
      </div>

      <br />

      <label>
        <strong>{t.roomLabel}:</strong>
        <br />
        <input
          type="number"
          inputMode="numeric"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder={t.roomPlaceholder}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1",
            color: "#000"
          }}
        />
      </label>

      <br />
      <br />

      <h3 style={{ color: "#4a5f44" }}>{t.firstCourses}</h3>
      {menuData.firstCourses.map((dish, idx) => {
        const label = getLabel(dish);
        return (
          <div key={idx} style={{ marginBottom: "10px" }}>
            {label}:
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={quantities[label] || ""}
              onChange={(e) => handleQuantityChange(label, e.target.value)}
              style={{
                width: "60px",
                marginLeft: "10px",
                padding: "4px",
                backgroundColor: "#f1f1f1",
                color: "#000"
              }}
            />
          </div>
        );
      })}

      <h3 style={{ color: "#4a5f44", marginTop: "20px" }}>{t.secondCourses}</h3>
      {menuData.secondCourses.map((dish, idx) => {
        const label = getLabel(dish);
        return (
          <div key={idx} style={{ marginBottom: "10px" }}>
            {label}:
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={quantities[label] || ""}
              onChange={(e) => handleQuantityChange(label, e.target.value)}
              style={{
                width: "60px",
                marginLeft: "10px",
                padding: "4px",
                backgroundColor: "#f1f1f1",
                color: "#000"
              }}
            />
          </div>
        );
      })}

      <br />

      <label>
        <strong>{t.otherLabel}:</strong>
        <br />
        <input
          type="text"
          value={otherChoice}
          onChange={(e) => setOtherChoice(e.target.value)}
          placeholder={t.otherPlaceholder}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1",
            color: "#000"
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
        {t.submit}
      </button>
    </form>
  );
}
