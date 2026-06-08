# 🛡️ CAMPUS SHIELD — CERS v2.0
## Campus Emergency Response System — Full Technical Guide (Zero-Cost Edition)

> **Stack:** Next.js · MongoDB Atlas Free · Redis (Upstash Free) · whatsapp-web.js · Vercel · Render  
> **Target:** FUTMINNA Pilot | **Build Time:** < 1 Week | **Monthly Cost:** $0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack--free-tier-breakdown)
3. [System Architecture](#3-system-architecture)
4. [WhatsApp Bot](#4-whatsapp-bot--whatsapp-webjs)
5. [Database — MongoDB](#5-database--mongodb-atlas-m0)
6. [API Routes — Next.js](#6-api-routes--nextjs)
7. [Frontend — Pages & Components](#7-frontend--pages--components)
8. [Environment Variables](#8-environment-variables)
9. [7-Day Build Plan](#9-7-day-build-plan)
10. [Known Limitations](#10-known-limitations-of-the-free-stack)
11. [Appendix](#appendix)

---

## 1. Executive Summary

Campus Shield v2.0 is a fully web-based emergency alert platform built entirely on free-tier services. There is no mobile app, no DevOps overhead, and no monthly cost.

A student opens the web app in any browser, taps **SOS**, and within seconds:
- Their live location is sent to emergency contacts
- Campus security is alerted via WhatsApp
- A broadcast message goes to all registered students

### Problem

| Threat | Risk Level |
|---|---|
| Armed Robbery (near hostels, ATMs) | 🔴 Critical |
| Kidnapping (isolated campus roads) | 🔴 Critical |
| Medical Emergencies | 🟠 High |
| Harassment | 🟠 High |
| Missing Persons | 🟡 Medium |

Most campuses have **no fast, centralized emergency response system**. Security is reactive, not proactive.

### Free Stack Overview

| Component | Tool / Service | Free? | Limit |
|---|---|---|---|
| Framework | Next.js 14 (App Router) | ✅ Free | Unlimited |
| Hosting | Vercel (free tier) | ✅ Free | 100GB bandwidth/mo |
| Database | MongoDB Atlas M0 | ✅ Free | 512MB storage |
| Cache / Pub-Sub | Redis — Upstash free tier | ✅ Free | 10,000 req/day |
| WhatsApp | whatsapp-web.js | ✅ Free | Unofficial — see §10 |
| Push Notifications | Web Push (browser native) | ✅ Free | Unlimited |
| Maps | Leaflet.js + OpenStreetMap | ✅ Free | Unlimited |
| Auth | NextAuth.js | ✅ Free | Unlimited |
| SMS Fallback | N/A | N/A | N/A |
| Mobile App | N/A (web-only) | N/A | N/A |
| DevOps / CI-CD | Vercel auto-deploy from GitHub | ✅ Free | Unlimited |

---

## 2. Technology Stack — Free Tier Breakdown

### 2.1 Next.js — Framework (Frontend + Backend)

Next.js handles both the React frontend and all server-side API routes in a single codebase. No separate backend server is needed.

- **Frontend:** React pages for student dashboard, SOS screen, admin view, tracking page
- **Backend:** API routes (`/app/api/...`) replace a dedicated Express/Node server entirely
- **Real-time:** Vercel doesn't support persistent WebSockets — use **Server-Sent Events (SSE)** instead (free, no extra service needed)
- **Deployment:** Push to GitHub → Vercel auto-deploys. Zero configuration.

### 2.2 MongoDB Atlas — Database (Free M0 Tier)

> **Free limit:** 512MB shared cluster. Sufficient for ~100,000 alert records. No credit card required.

- Collections: `students`, `alerts`, `emergency_contacts`, `campuses`, `guard_assignments`
- Connection: Use Mongoose ODM in Next.js API routes
- ⚠️ M0 does **not** support change streams. Use polling or SSE for real-time updates.
- Create indexes on `campusId + status` and `createdAt` for fast alert queries

### 2.3 Redis — Cache & Pub/Sub (Upstash Free Tier)

> **Free limit:** 10,000 requests/day, 256MB. Upstash is the only Redis provider with a truly free persistent tier compatible with Vercel serverless.

- Use for: active alert location cache, SOS rate limiting, session presence
- Upstash offers a **REST API** — no persistent TCP connection needed (works with Vercel serverless)
- If 10k req/day is exceeded during pilot: cache only active alerts, not all location updates

### 2.4 whatsapp-web.js — WhatsApp Integration

> ⚠️ **Important:** whatsapp-web.js is an **unofficial** library that controls WhatsApp Web via a headless browser (Puppeteer). It is FREE but:
> - Requires a phone to stay connected
> - May violate WhatsApp ToS and can get the number banned
> - **Acceptable for a pilot.** Upgrade to Meta Cloud API (free up to 1,000 conversations/month) for production.

- Must run on **Render.com** (not Vercel — requires a persistent process + Puppeteer)
- One phone number acts as the "bot number" — student/security scans QR once to connect
- Sends broadcast messages to all registered students on alert trigger
- Session persistence: saved to file so QR scan is only needed once

### 2.5 Hosting — Vercel (Free) + Render (Free)

| Service | What Runs There | Free Limits |
|---|---|---|
| Vercel (free) | Next.js web app + API routes | 100GB bandwidth, unlimited deployments |
| Render.com (free) | whatsapp-web.js bot process | 750 hrs/month. Spins down after 15min idle — use UptimeRobot to prevent. |

### 2.6 Maps — Leaflet.js + OpenStreetMap

- **Leaflet.js** — free, open-source JavaScript mapping library
- **OpenStreetMap** tiles are free with no API key required
- Use `react-leaflet` for easy integration in Next.js
- Google Maps: **N/A** — not free beyond $200/month credit

### 2.7 Authentication — NextAuth.js

- Free, built for Next.js
- Use **Credentials provider** (email + password) for simplest setup
- Session stored in JWT (no DB session table needed)
- Role field in JWT payload: `student | guard | admin`

---

## 3. System Architecture

### 3.1 Project Folder Structure

```
campus-shield/
├── app/
│   ├── page.tsx                  # Home / SOS dashboard
│   ├── register/page.tsx         # Student registration
│   ├── track/[token]/page.tsx    # Public live tracking page
│   ├── admin/page.tsx            # Security admin dashboard
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth
│       ├── alerts/
│       │   ├── trigger/route.ts  # POST — SOS trigger
│       │   ├── cancel/route.ts   # POST — cancel alert
│       │   └── active/route.ts   # GET — active alerts SSE stream
│       ├── location/
│       │   ├── update/route.ts   # POST — push GPS update
│       │   └── stream/route.ts   # GET — SSE location broadcast
│       └── students/
│           └── register/route.ts
├── lib/
│   ├── mongodb.ts                # Mongoose connection singleton
│   ├── redis.ts                  # Upstash Redis client
│   ├── whatsapp.ts               # WA bot HTTP trigger helper
│   └── geo.ts                    # Haversine distance util
├── models/
│   ├── Student.ts
│   ├── Alert.ts
│   └── EmergencyContact.ts
├── components/
│   ├── SOSButton.tsx
│   ├── LiveMap.tsx
│   └── AlertFeed.tsx
├── whatsapp-bot/                 # Separate process — deployed on Render
│   ├── index.js
│   └── package.json
└── .env.local
```

### 3.2 SOS Alert — Full Data Flow

```
[1]  Student opens web app → taps SOS → selects incident type
[2]  Browser calls navigator.geolocation.getCurrentPosition()
[3]  POST /api/alerts/trigger
       → saves alert to MongoDB
       → caches location in Redis
[4]  API calls WA bot on Render → POST /broadcast
       → bot sends message to all registered student numbers
[5]  API calls WA bot → POST /notify-contacts
       → sends personal message + tracking link to emergency contacts
[6]  API calls WA bot → POST /notify-guard
       → sends alert to nearest guard's WhatsApp number
[7]  Browser starts streaming GPS to POST /api/location/update every 5s
[8]  Admin dashboard + tracking page subscribe to GET /api/location/stream (SSE)
[9]  Guard resolves alert via admin panel
       → MongoDB status updated → SSE notifies all subscribers
```

### 3.3 Real-Time Without WebSockets — SSE Pattern

Vercel serverless functions don't support persistent WebSocket connections. **Server-Sent Events (SSE)** are used instead — one-directional (server → browser), work over standard HTTP, fully supported on Vercel.

```typescript
// app/api/location/stream/route.ts
export async function GET(req: Request) {
  const alertId = new URL(req.url).searchParams.get('alertId');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        const loc = await redis.get(`location:${alertId}`);
        if (loc) {
          controller.enqueue(encoder.encode(`data: ${loc}\n\n`));
        }
      }, 3000); // poll Redis every 3 seconds

      req.signal.addEventListener('abort', () => clearInterval(interval));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
```

---

## 4. WhatsApp Bot — whatsapp-web.js

### 4.1 Setup & Deployment (Render.com — Free)

1. Create a new Web Service on Render.com → connect GitHub repo → point to `/whatsapp-bot` folder
2. Set Start Command: `node index.js`
3. First deploy: check Render logs for QR code → scan with the campus security WhatsApp number
4. Session saved to `session.json` — subsequent restarts reconnect without QR scan
5. Add a `/ping` endpoint and use **UptimeRobot** (free) to ping every 5 minutes — keeps Render awake

### 4.2 Bot Code

```javascript
// whatsapp-bot/index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
app.use(express.json());

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
  console.log('QR CODE — scan in WhatsApp:');
  require('qrcode-terminal').generate(qr, { small: true });
});

client.on('ready', () => console.log('WhatsApp bot connected'));

// Incoming message handler
client.on('message', async msg => {
  const cmd = msg.body.trim().toUpperCase();
  const phone = msg.from; // format: 2348XXXXXXXX@c.us

  if (cmd === 'REGISTER') {
    await msg.reply('Reply with: REGISTER [your student ID]');

  } else if (cmd.startsWith('REGISTER ')) {
    const studentId = cmd.split(' ')[1];
    await fetch(`${process.env.APP_URL}/api/students/link-wa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, studentId })
    });
    await msg.reply('Registered! You will receive campus emergency alerts.');

  } else if (cmd === 'SAFE') {
    await msg.reply('Noted. Stay alert and report anything suspicious.');

  } else if (cmd === 'SOS') {
    await msg.reply(
      'Open the web app to trigger a full alert with location:\n' +
      process.env.APP_URL
    );
  }
});

// HTTP endpoints called by Next.js API routes
app.post('/broadcast', async (req, res) => {
  const { numbers, message } = req.body;
  for (const num of numbers) {
    await client.sendMessage(`${num}@c.us`, message);
    await new Promise(r => setTimeout(r, 500)); // avoid rate limit
  }
  res.json({ sent: numbers.length });
});

app.post('/notify-contacts', async (req, res) => {
  const { contacts, studentName, alertId, incidentType } = req.body;
  const msg =
    `🆘 ${studentName} triggered a ${incidentType} alert.\n` +
    `Track live: ${process.env.APP_URL}/track/${alertId}`;

  for (const contact of contacts) {
    if (contact.whatsapp) {
      await client.sendMessage(`${contact.whatsapp}@c.us`, msg);
    }
  }
  res.json({ ok: true });
});

app.get('/ping', (req, res) => res.send('alive'));

app.listen(3001, () => console.log('WA bot HTTP server on 3001'));
client.initialize();
```

### 4.3 Message Templates

**Campus Broadcast (all students):**
```
🚨 CAMPUS SHIELD ALERT — FUTMINNA

Emergency reported near campus.
Incident: [TYPE] | Time: [HH:MM]

⚠️ Avoid the area. Security alerted.
Reply SAFE if you are not affected.
```

**Personal Contact Alert:**
```
🆘 [NAME] has triggered an emergency alert.
Incident: [TYPE] | Time: [TIME]

📍 Live location: https://campusshield.vercel.app/track/[TOKEN]

Campus security has been notified.
```

### 4.4 Student Commands

| Command | Response |
|---|---|
| `REGISTER` | Prompts for student ID |
| `REGISTER [ID]` | Links WhatsApp to campus account |
| `SOS` | Returns web app link to trigger full alert |
| `SAFE` | Acknowledges student is safe during campus alert |
| `STATUS` | Returns current active alert count on campus |
| `HELP` | Lists all commands |

---

## 5. Database — MongoDB Atlas M0

### 5.1 Connection Singleton (Next.js)

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise = mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### 5.2 Schemas

**Student**
```typescript
const StudentSchema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, unique: true, required: true },
  password:   { type: String, required: true }, // bcrypt hashed
  studentId:  { type: String, unique: true, required: true },
  campusId:   { type: String, default: 'futminna' },
  role:       { type: String, enum: ['student', 'guard', 'admin'], default: 'student' },
  whatsapp:   { type: String },
  createdAt:  { type: Date, default: Date.now }
});
```

**Alert**
```typescript
const AlertSchema = new Schema({
  studentId:  { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  campusId:   { type: String, default: 'futminna' },
  type:       { type: String, enum: ['ROBBERY', 'MEDICAL', 'KIDNAP', 'HARASSMENT', 'OTHER'] },
  status:     { type: String, enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'], default: 'ACTIVE' },
  lat:        { type: Number, required: true },
  lng:        { type: Number, required: true },
  trackToken: { type: String, unique: true },
  resolvedAt: { type: Date },
  createdAt:  { type: Date, default: Date.now }
});

AlertSchema.index({ campusId: 1, status: 1 });
AlertSchema.index({ createdAt: -1 });
```

**EmergencyContact**
```typescript
const ContactSchema = new Schema({
  studentId:    { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  name:         { type: String, required: true },
  phone:        { type: String, required: true },
  whatsapp:     { type: String },
  relationship: { type: String },
});
```

### 5.3 Redis Key Patterns (Upstash)

| Use Case | Key Pattern |
|---|---|
| Active alert location | `location:{alertId}` → `{ lat, lng, ts }` |
| SOS rate limit | `sos:ratelimit:{userId}` → Counter, TTL 60s |
| Student presence | `presence:futminna` → Set of active student IDs |

---

## 6. API Routes — Next.js

### 6.1 SOS Trigger

```typescript
// app/api/alerts/trigger/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { lat, lng, type } = await req.json();
  await connectDB();

  // Rate limit: max 3 SOS per minute per user
  const key = `sos:ratelimit:${session.user.id}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  if (count > 3) return Response.json({ error: 'Rate limited' }, { status: 429 });

  const trackToken = crypto.randomUUID();
  const alert = await Alert.create({
    studentId: session.user.id, lat, lng, type, trackToken
  });

  // Cache location in Redis (6 hour TTL)
  await redis.set(`location:${alert._id}`, JSON.stringify({ lat, lng }), { ex: 21600 });

  // Get all registered WA numbers for this campus
  const students = await Student.find(
    { campusId: 'futminna', whatsapp: { $exists: true } },
    'whatsapp'
  );
  const numbers = students.map(s => s.whatsapp);

  // Fire-and-forget: broadcast to all students
  fetch(`${process.env.WA_BOT_URL}/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numbers,
      message: `🚨 CAMPUS ALERT\nIncident: ${type}\nTime: ${new Date().toLocaleTimeString('en-NG')}\n⚠️ Avoid the area. Security notified.`
    })
  });

  // Notify personal emergency contacts
  const contacts = await EmergencyContact.find({ studentId: session.user.id });
  fetch(`${process.env.WA_BOT_URL}/notify-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contacts,
      studentName: session.user.name,
      alertId: trackToken,
      incidentType: type
    })
  });

  return Response.json({ alertId: alert._id, trackToken });
}
```

### 6.2 All API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register student (name, email, password, studentId) |
| `POST` | `/api/auth/[...nextauth]` | NextAuth login / logout / session |
| `POST` | `/api/alerts/trigger` | Trigger SOS — saves alert, broadcasts WA, returns trackToken |
| `POST` | `/api/alerts/cancel` | Cancel active alert (within 30s window) |
| `POST` | `/api/alerts/resolve` | Mark alert resolved (guard / admin only) |
| `GET` | `/api/alerts/active` | SSE stream of active campus alerts (admin) |
| `POST` | `/api/location/update` | Student pushes new GPS coords during active alert |
| `GET` | `/api/location/stream` | SSE stream of live location for tracking page |
| `POST` | `/api/students/link-wa` | Links WhatsApp number to student account (called by bot) |
| `GET` | `/api/students/contacts` | Get current user's emergency contacts |

---

## 7. Frontend — Pages & Components

### 7.1 Pages

**`/` — Student Dashboard**
- Large red SOS button (center, full thumb-reachable)
- Incident type selector: Robbery, Medical, Harassment, Kidnap, Other
- Campus alert feed (active/recent alerts, polled every 10s)
- Quick link to campus clinic number

**`/register` — Registration**
- Fields: Full Name, Student ID, Email, Password, WhatsApp Number
- Emergency contacts form (up to 3 contacts: name, phone, WhatsApp)

**`/track/[token]` — Public Live Tracking**
- No login required — accessible via link sent to contacts
- Leaflet map with live student location (updates via SSE every 5s)
- Alert type, time, and status displayed

**`/admin` — Security Dashboard**
- Login required (role: `guard` or `admin`)
- Live map of all active campus alerts
- Alert list: student name, type, time, GPS, status
- Dispatch and Resolve buttons

### 7.2 SOS Button Component

```tsx
// components/SOSButton.tsx
'use client';
import { useState } from 'react';

export default function SOSButton() {
  const [status, setStatus] = useState<'idle' | 'locating' | 'sent'>('idle');
  const [incidentType, setIncidentType] = useState('ROBBERY');

  const triggerSOS = async () => {
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const res = await fetch('/api/alerts/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, type: incidentType })
        });
        const data = await res.json();
        setStatus('sent');
        startLocationStream(data.alertId);
      },
      () => {
        // GPS failed — alert still sent without coordinates
        alert('Could not get location. Alert sent without GPS.');
        setStatus('idle');
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <select
        onChange={e => setIncidentType(e.target.value)}
        className="border rounded p-2 w-full max-w-xs"
      >
        <option value="ROBBERY">Robbery</option>
        <option value="MEDICAL">Medical Emergency</option>
        <option value="KIDNAP">Kidnapping</option>
        <option value="HARASSMENT">Harassment</option>
        <option value="OTHER">Other</option>
      </select>

      <button
        onClick={triggerSOS}
        disabled={status !== 'idle'}
        className="w-48 h-48 rounded-full bg-red-600 text-white text-2xl font-bold
          shadow-2xl active:scale-95 disabled:opacity-60"
      >
        {status === 'idle' && '🆘 SOS'}
        {status === 'locating' && 'Getting Location...'}
        {status === 'sent' && '✅ Alert Sent'}
      </button>
    </div>
  );
}
```

### 7.3 Live Map Component

```tsx
// components/LiveMap.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

export default function LiveMap({ alertId }: { alertId: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/location/stream?alertId=${alertId}`);
    es.onmessage = e => {
      const { lat, lng } = JSON.parse(e.data);
      setPosition([lat, lng]);
    };
    return () => es.close();
  }, [alertId]);

  if (!position) return <p>Waiting for location...</p>;

  return (
    <MapContainer center={position} zoom={16} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position}>
        <Popup>Student last known location</Popup>
      </Marker>
    </MapContainer>
  );
}
```

---

## 8. Environment Variables

```bash
# .env.local

# MongoDB Atlas (free M0 cluster)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campusshield

# Upstash Redis (free tier)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxx

# NextAuth
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://your-app.vercel.app

# WhatsApp Bot (Render URL)
WA_BOT_URL=https://your-wa-bot.onrender.com
WA_BOT_SECRET=<shared-secret-for-auth>

# App URL (used by WA bot for tracking links)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 9. 7-Day Build Plan

| Day | Focus | Deliverables |
|---|---|---|
| **Day 1** | Project Setup | Next.js project created, MongoDB Atlas M0 connected, Upstash Redis connected, NextAuth configured, student register/login working, deployed to Vercel |
| **Day 2** | Database & Models | Mongoose schemas (Student, Alert, Contact) done, registration page with emergency contacts form, student dashboard shell |
| **Day 3** | SOS Core | `POST /api/alerts/trigger` complete, GPS capture in browser, alert saved to MongoDB, location in Redis, cancel/resolve endpoints, SOS button wired up |
| **Day 4** | WhatsApp Bot | whatsapp-web.js set up in `/whatsapp-bot`, deployed to Render, QR scan done, `/broadcast` and `/notify-contacts` tested with real numbers |
| **Day 5** | Live Tracking | SSE location stream live, `/track/[token]` public Leaflet map page working, location update loop from browser, admin dashboard with alert list |
| **Day 6** | Admin & Guards | Admin/guard login with role-based access, admin map showing active campus alerts, dispatch and resolve functional, guard notified via WhatsApp on trigger |
| **Day 7** | Polish & Launch | Responsive mobile layout, full end-to-end flow tested, WhatsApp broadcast tested with FUTMINNA security number, final Vercel build deployed |

---

## 10. Known Limitations of the Free Stack

| Limitation | Impact | Upgrade Path |
|---|---|---|
| whatsapp-web.js is unofficial | May be banned by WhatsApp. Sessions can drop. | Meta Cloud API (free 1k conv/month) for production |
| Render free tier spins down | WA bot takes 30–60s to respond after idle | Use UptimeRobot (free) to ping every 5 min |
| No SMS fallback | No backup if student has no WhatsApp or internet | Africa's Talking SMS (free sandbox) in v2 |
| Upstash 10k req/day limit | High alert volume could throttle Redis calls | Upstash pay-as-you-go (~free until large scale) |
| MongoDB Atlas 512MB | Sufficient for pilot, will fill at scale | Atlas M2 ($9/mo) when nearing limit |
| No offline support | Web app requires internet to trigger SOS | PWA + background sync in v2 |
| SSE not WebSockets | One-directional only (server → client) | Ably or Pusher free tier if two-way needed |

### Keeping the Render Bot Alive (Free)

1. Sign up for [UptimeRobot](https://uptimerobot.com) — free, monitors up to 50 URLs
2. Add a monitor pointing to `https://your-wa-bot.onrender.com/ping`
3. Set interval to every 5 minutes
4. Render stays awake permanently. **Total extra cost: $0**

---

## Appendix

### A. Package Dependencies

**Next.js App (`package.json`)**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "mongoose": "^8.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "@upstash/redis": "^1.28.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4"
  }
}
```

**WhatsApp Bot (`whatsapp-bot/package.json`)**
```json
{
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "express": "^4.18.0"
  }
}
```

### B. Deployment Checklist

**Vercel (Next.js App)**
- [ ] Push repo to GitHub
- [ ] Connect repo to Vercel → New Project
- [ ] Add all environment variables in Vercel dashboard
- [ ] Deploy — Vercel builds and gives live URL
- [ ] Set `NEXTAUTH_URL` to the live Vercel URL

**Render (WhatsApp Bot)**
- [ ] Create new Web Service on Render → connect `/whatsapp-bot` folder
- [ ] Set env var: `APP_URL` = your Vercel URL
- [ ] Deploy — check logs for QR code
- [ ] Scan QR with campus security WhatsApp number
- [ ] Copy Render URL → add to Vercel env as `WA_BOT_URL`
- [ ] Set up UptimeRobot monitor on Render `/ping` URL

### C. Free Service Sign-up Links

| Service | URL | What to Create |
|---|---|---|
| MongoDB Atlas | mongodb.com/atlas | Free M0 cluster, get connection string |
| Upstash | upstash.com | Free Redis database, get REST URL + token |
| Vercel | vercel.com | Connect GitHub repo, add env vars |
| Render | render.com | New Web Service for WA bot |
| UptimeRobot | uptimerobot.com | Free monitor to ping Render every 5 min |

---

*© 2025 Campus Shield — FUTMINNA Pilot, Free Stack Edition. Built to protect students at zero cost.*
