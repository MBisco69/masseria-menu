const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Identificativo della tua stampante termica (Equipe / Caysn)
const device = new escpos.USB(0x0fe6, 0x811e);
const printer = new escpos.Printer(device);

app.post("/print", async (req, res) => {
  const { room, choices, noStarter } = req.body;

  if (!room || !choices) {
    return res.status(400).send("Dati mancanti.");
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
        .cut()
        .close();
    });

    res.send("✅ Comanda stampata.");
  } catch (err) {
    console.error("Errore stampa:", err);
    res.status(500).send("Errore durante la stampa.");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🖨️ Server stampa avviato su http://localhost:${PORT}`);
});
