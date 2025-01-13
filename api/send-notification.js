const webPush = require("web-push");

const publicKey =
  "BP6LNLZ3mgjKV3t_wO4DZdnd1QwAOWN_VIPoNWRB8-w4T2ATVEMIcuLgkm2D7L0uAAWX0oaMhWoUtQH-TjLqUvU";
const privateKey = "<private_vapid_key>"; // Yes my real key is here

webPush.setVapidDetails("mailto:anic3tus.inv@gmail.com", publicKey, privateKey);

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("payload: ", req.body);

    const { subscription, title, message, actions, tag } = req.body;

    const notificationActions = Array.isArray(actions) ? actions : [];

    if (!subscription || !subscription.endpoint) {
      console.error("Invalid subscription object:", subscription);
      return res.status(400).json({ error: "Invalid subscription" });
    }

    // why am i supsosed to have a regustration thing here??
    try {
      console.log(subscription);
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: title || 'Ping title',
          body: message || "Your ping has triggered! (Name not sent)",
          icon: "/images/PingMe.png",
          actions: notificationActions,
          tag: tag || "ping-message",
        })
      );
      res.status(200).json({ message: "Notification sent!" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
