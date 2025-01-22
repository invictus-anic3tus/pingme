// import webPush from 'web-push';
const webPush = require('web-push');
const {MongoClient} = require('mongodb');
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

async function scheduleJob(date, message, title, actions, tag) {
  const now = new Date();
  const msDelay = new Date(date).getTime() - now.getTime();

  if (msDelay <= 0) {
    console.error('Date must be in future');
    return;
  }

  setTimeout(async () => {
    const db = await connectToDatabase();
    const subscriptions = await db.collection('subscriptions').find().toArray();

    const payload = JSON.stringify({
      title: title || 'PingMe Notification',
      body: message,
      icon: '/images/icon.png',
      actions: actions,
      tag: tag || 'default'
    });

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
        console.log('Notification sent to:', subscription.endpoint);
      } catch (error) {
        console.error('Failed to send notification:', error);


        if (error.statusCode === 410) {
          await db.collection('subscriptions').deleteOne({ endpoint: subscription.endpoint });
          console.log('removed invalid subscription:', subscription);
        }
      }
    }

  }, msDelay);
}


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { date, message, title, actions, tag } = req.body;

    if (!date || !message) {
      return res.status(400).json({error: 'Date and message are required.'});
    }

    const scheduleTime = new Date(date);
    if (isNaN(scheduleTime)) {
      return res.status(400).json({ error: 'invalid date format' });
    }

    try {
      const db = await connectToDatabase();

      const result = await db.collection('schedules').insertOne({ date: scheduleTime, message, title, tag});

      scheduleJob(scheduleTime, message, title, actions, tag);

      res.status(201).json({ message: 'Notification scheduled!', id: result.insertedId });
    }
    catch (error) {
      console.error('Error scheduling notification:', error);
      res.status(500).json({ error: 'Failed to schedule notification' });
    }
  }
  else {
    res.status(405).json({message: 'Method not allowed'});
  }
}