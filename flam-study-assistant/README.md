# Recall — AI Study Assistant

Paste in some notes or a topic, and it turns them into flashcards you can
flip through or quiz yourself on. Wrong answers get re-tested until you clear
a round. Decks save to MySQL so you can come back to them later.

Built for the Flam internship assignment — Study Assistant option.

## Stack

React (Vite, hooks, plain JS) on the frontend, Node/Express backend that
holds the API key and talks to Groq, MySQL for saving decks.

## How it works

The frontend never talks to Groq directly — it hits my own `/api/generate`
route, which has the key and forwards the request. I ask Groq for JSON only
(no prose), get back a raw string, and the frontend runs it through
`validateResult.js` before anything renders — bad JSON, missing fields, or
an empty array all get caught there and turned into an error state instead
of crashing or showing garbage.

There's also a `requestId` check in `App.jsx` so if you fire off a second
request before the first one comes back, the first one gets thrown away when
it eventually resolves instead of overwriting the newer result.

Saving a deck just POSTs the cards to `/api/sessions`, which writes to a
MySQL table. The sidebar lists what's saved and reloads it on click.

## Setup

**DB:** open `server/schema.sql` in Workbench, hit execute.
