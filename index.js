import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const app = express();
app.use(express.json());

const PIXEL_ID = "1669011117589597";
const ACCESS_TOKEN = "EAAUExgiHfZBkBRSPazEkzudleIOAZAYqATVJbsQYydT7zJJREhYnelNxA8rykz4HJpFw1yCMzjHE7N8t9qaTBgay5JhLuuIwUfay5ZBlrih16Js088tnIaDVZAQ15PUhbviTWTytb5BPhxUjxKM0SEwPOUDXmKEIvXFnjk3mj5V7opor98ylKxMrxxgVvAZDZD"; // ⚠️ नया token डालना

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

app.post("/meta-capi", async (req, res) => {
  console.log("Webhook received:", req.body);

  const order = req.body;
  const eventId = order.name || String(order.id);

  // ✅ PURCHASE EVENT (Server)
  const purchasePayload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: {
          em: order.email ? sha256(order.email) : undefined,
          ph: order.phone ? sha256(order.phone) : undefined
        },
        custom_data: {
          currency: order.currency || "INR",
          value: Number(order.total_price || 0)
        }
      }
    ]
  };

  // ✅ INITIATE CHECKOUT EVENT (Server - proxy)
  const initiatePayload = {
    data: [
      {
        event_name: "InitiateCheckout",
        event_time: Math.floor(Date.now() / 1000),
        event_id: "init_" + eventId,
        action_source: "website",
        user_data: {
          em: order.email ? sha256(order.email) : undefined,
          ph: order.phone ? sha256(order.phone) : undefined
        },
        custom_data: {
          currency: order.currency || "INR",
          value: Number(order.total_price || 0)
        }
      }
    ]
  };

  try {
    // 🚀 Send Purchase
    console.log("Sending Purchase:", purchasePayload);

    const purchaseRes = await fetch(
      `https://graph.facebook.com/v18.0/${1669011117589597}/events?access_token=${EAAUExgiHfZBkBRSPazEkzudleIOAZAYqATVJbsQYydT7zJJREhYnelNxA8rykz4HJpFw1yCMzjHE7N8t9qaTBgay5JhLuuIwUfay5ZBlrih16Js088tnIaDVZAQ15PUhbviTWTytb5BPhxUjxKM0SEwPOUDXmKEIvXFnjk3mj5V7opor98ylKxMrxxgVvAZDZD}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchasePayload)
      }
    );

    const purchaseData = await purchaseRes.json();
    console.log("Purchase response:", purchaseData);

    // 🚀 Send InitiateCheckout
    console.log("Sending InitiateCheckout:", initiatePayload);

    const initiateRes = await fetch(
      `https://graph.facebook.com/v18.0/${1669011117589597}/events?access_token=${EAAUExgiHfZBkBRSPazEkzudleIOAZAYqATVJbsQYydT7zJJREhYnelNxA8rykz4HJpFw1yCMzjHE7N8t9qaTBgay5JhLuuIwUfay5ZBlrih16Js088tnIaDVZAQ15PUhbviTWTytb5BPhxUjxKM0SEwPOUDXmKEIvXFnjk3mj5V7opor98ylKxMrxxgVvAZDZD}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initiatePayload)
      }
    );

    const initiateData = await initiateRes.json();
    console.log("Initiate response:", initiateData);

  } catch (error) {
    console.error("Meta error:", error);
  }

  res.send("ok");
});

// ✅ IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
