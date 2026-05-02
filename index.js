import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const app = express();
app.use(express.json());

const PIXEL_ID = "PASTE_PIXEL_ID";
const ACCESS_TOKEN = "PASTE_ACCESS_TOKEN";

function sha256(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

app.post("/meta-capi", async (req, res) => {
  const order = req.body;

  const eventId = order.name || String(order.id);

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: {
          em: order.email ? sha256(order.email) : undefined
        },
        custom_data: {
          currency: order.currency,
          value: Number(order.total_price)
        }
      }
    ]
  };

  await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  res.send("ok");
});

app.listen(3000, () => console.log("Server running"));
