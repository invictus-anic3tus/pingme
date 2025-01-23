// import webPush from 'web-push';
// import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('admin');
  }
  return db;
}

const publicKey =
  "BPn0Ry5ZSfJJGxerDmCGGwVB75xBBCyHHTTyQaQWr2Gz244Ek12DSUs7kdimRYwcoPLjg0NCiVdIjAlfiBispqI";
const privateKey = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails("mailto:anic3tus.inv@gmail.com", publicKey, privateKey);

export default async function handler(req, res) {
  if (req.method === "POST") {
    // console.log("payload: ", req.body);

    const { subscription, title, message, actions, tag } = req.body;

    const notificationActions = Array.isArray(actions) ? actions : [];

    if (!subscription || !subscription.endpoint) {
      console.error("Invalid subscription object:", subscription);
      return res.status(400).json({ error: "Invalid subscription" });
    }

    // why am i supsosed to have a regustration thing here??
    try {
      // console.log(subscription);
      // await webPush.sendNotification(
      //   subscription,
      //   JSON.stringify({
      //     title: title || 'Ping title',
      //     body: message || "Your ping has triggered! (Name not sent)",
      //     icon: "/images/PingMe.png",
      //     actions: notificationActions,
      //     tag: tag || "ping-message",
      //   })
      // );
      // res.status(200).json({ message: "Notification sent!" });

      const db = await connectToDatabase();
      await db.collection('subscriptions').updateOne(
        { endpoint: subscription.endpoint },
        { $set: subscription },
        { upsert: true}
      );

      const payload = JSON.stringify({
        title: title || 'PingMe Notification!',
        body: message || 'Placeholder content',
        actions: actions || [],
        tag: tag || 'default',
        icon: '/images/PingMe.png'
      });

      await webPush.sendNotification(subscription, payload);
      res.status(201).json({ message: 'Notification sent and subscription saved' });

    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
