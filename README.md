Name: Mirireoluwa Christian Olukanni
Matric Number: 22120613038

## Now Listening (Last.fm + Apple Music)

The “Now listening” section shows your current or last-played track. It uses **Last.fm** (Apple Music doesn’t expose a “now playing” API for websites). To use it:

1. Create a [Last.fm](https://www.last.fm/) account and get an [API key](https://www.last.fm/api/account/create).
2. Scrobble from Apple Music to Last.fm using an app like [Marvis Pro](https://marvis.app/), [Soor](https://soor.app/), or the [Last.fm app](https://www.last.fm/download).
3. In your Vercel project, set:
   - `LAST_FM_API_KEY` – your Last.fm API key  
   - `LAST_FM_USER` – your Last.fm username  

When something is playing (and scrobbled as “now playing”), the section shows **Now listening** with a rotating CD. When nothing is playing, it shows **Last listened to** with a static CD.
