Name: Mirireoluwa Christian Olukanni  
Matric Number: 22120613038

## Portfolio CMS (`/admin`)

Edit projects from the browser; the public site reads them from **Upstash Redis** (falls back to bundled `src/data/projects.ts` if Redis is empty).

### 1. Upstash Redis

1. Create a free database at [Upstash](https://upstash.com/).
2. Copy **REST URL** and **REST TOKEN**.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Admin password

- `ADMIN_PASSWORD` — used to sign in at `/admin` (pick a strong password).

### 3. Image uploads in admin (optional)

Snapshot **file upload** uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). Without it, paste a full **HTTPS image URL** in the snapshot field (e.g. `https://yoursite.com/my-screenshot.png` after adding the file to `public/` and deploying).

**Enable uploads on production**

1. In [Vercel](https://vercel.com) open your **project** → **Storage** tab → **Create** / **Connect** → choose **Blob**.
2. Create a store (or pick an existing one) and **connect it to this project** — Vercel usually adds **`BLOB_READ_WRITE_TOKEN`** to the project automatically.
3. If the token isn’t there: Blob store → **.env.local** tab (or project **Settings → Environment Variables**) and copy **`BLOB_READ_WRITE_TOKEN`** into **Production** (and Preview if needed).
4. **Redeploy** the project so serverless functions receive the variable.

The upload API checks `process.env.BLOB_READ_WRITE_TOKEN`; without it you’ll see “Vercel Blob not configured”.

### 4. Deploy & use

Redeploy after setting env vars. Open `https://your-domain.com/admin`, sign in, edit projects, then **Publish to live site**.

**Local development**

1. Install deps (`npm install` runs **`build:api-lib`**, which compiles `api/lib/*.ts` → **`api/lib-js/*.js`** so Node can load them without clashing with the `.ts` sources in `api/lib/`).
2. Run **`vercel dev`** (not plain `npm run dev`) so `/api/*` and the Vite app work together on one port (e.g. http://localhost:3000).
3. If you change files in **`api/lib/`**, run **`npm run build:api-lib`** again before or while `vercel dev` is running.
4. After editing **`.env.local`**, restart **`vercel dev`** so API routes pick up changes (the app also loads `.env.local` from disk for Redis if the CLI doesn’t inject it).

Plain **`npm run dev`** only serves the frontend; `/api/*` will not exist unless you proxy to a running API.

---

## Now Listening (Last.fm + Apple Music) — optional

If you use the Last.fm API route (`/api/now-playing`), set on Vercel:

- `LAST_FM_API_KEY`
- `LAST_FM_USER`

Scrobble from Apple Music via Marvis Pro, Soor, or the Last.fm app.
