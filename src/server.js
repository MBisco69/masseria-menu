// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const escpos = require("escpos");

// Per stampanti USB (es. Equipe/Caysn)
escpos.USB = require("escpos-usb");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Usa il vendor/product ID della tua stampante
const device = new escpos.USB(0x0fe6, 0x811e);
const printer = new escpos.Printer(device);

app.post("/print", async (req, res) => {
  const { room, choices, noStarter } = req.body;

  if (!room || !choices) {
    return res.status(400).send("Dati incompleti.");
  }

  try {
    device.open(() => {
      printer
        .align("CT")
        .style("B")
        .size(1, 1)
        .text("LA TORRE")
        .text(`Camera ${room}`)
        .text("-----------------------------")
        .align("LT");

      for (const [dish, qty] of Object.entries(choices)) {
        printer.text(`${dish}: ${qty}`);
      }

      printer
        .text("-----------------------------")
        .text(`Antipasto di mare: ${noStarter ? "❌" : "✅"}`)
        .text(" ")
        .text(" ")
        .cut()
        .close();
    });

    res.send("Comanda inviata alla stampante.");
  } catch (err) {
    console.error("Errore di stampa:", err);
    res.status(500).send("Errore durante la stampa.");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🖨️  Server stampa attivo su http://localhost:${PORT}`);
});
