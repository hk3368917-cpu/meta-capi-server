import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const app = express();
app.use(express.json());

const PIXEL_ID = "1669011117589597";
const ACCESS_TOKEN = "EAAUExgiHfZBkBRVoVMjOTODbU0pYW2ZA4wHZA8RcHmrxRM68aw7gAr1dP8nGOf40LJYeOA9gmgk59bpkkyR193Sl8a45ogE5PZA8c5U1wj72z2ZAKlVpht9ZA9J1BNkuvxZCWJoG2ZCNFcM1PLSXqaCGpszZC2SxMyVin3UAvtJViHfv3PrfE0l1y6gqTKqabmAZDZD";

function sha256(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

app.post("/meta-capi", async (req, res) => {
  console.log("Webhook received:", req.body);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
