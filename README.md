# Photobase

A photographer portfolio website that works on GitHub Pages — with **two admin options** to manage photos.

- **Decap CMS** (`/admin/`) — professional GUI with OAuth login and built-in media library
- **Custom Admin** (`/manage/`) — lightweight alternative using a GitHub Personal Access Token

Both write to the same `gallery.json`, so you can use either — or both.

---

## Quick Start

1. **Fork** this repo or push it to your GitHub account
2. Go to **Settings > Pages** and enable GitHub Pages from the `main` branch root
3. Your gallery is live at `https://your-username.github.io/photobase/`
4. Choose an admin option below

---

## Option A: Decap CMS (`/admin/`)

Full-featured admin panel. Requires a one-time GitHub OAuth App setup.

### Step 1: Register a GitHub OAuth App

1. Go to **GitHub Settings > Developer settings > OAuth Apps > New OAuth App**
2. Fill in:
   - **Application name:** `Photobase`
   - **Homepage URL:** `https://your-username.github.io/photobase/`
   - **Authorization callback URL:** `https://your-username.github.io/photobase/`
3. Click **Register application**
4. Copy the **Client ID** displayed on the next page

### Step 2: Update the config

Edit `admin/config.yml`:

```yaml
backend:
  name: github
  repo: your-username/photobase
  branch: main
  auth_type: implicit
  app_id: YOUR_CLIENT_ID
```

Replace `your-username/photobase` with your repo and `YOUR_CLIENT_ID` with the Client ID from step 1.

### Step 3: Visit the admin panel

Go to `https://your-username.github.io/photobase/admin/` and sign in with GitHub.

---

## Option B: Custom Admin (`/manage/`)

Lightweight admin. No OAuth setup needed — just a Personal Access Token.

### Step 1: Generate a GitHub token

1. Go to **GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a name like `Photobase`
4. Select the **`repo`** scope (full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** — you won't see it again

### Step 2: Open the manager

Go to `https://your-username.github.io/photobase/manage/` and enter:
- **Owner:** your GitHub username
- **Repo:** `photobase` (or whatever you named the repo)
- **Branch:** `main`
- **Token:** the token you just generated

Click **Connect** and you're in.

### Features

| | Decap CMS | Custom Admin |
|---|---|---|
| Auth | GitHub OAuth (1-time setup) | Personal Access Token |
| Add photos | Media Library + entry form | Drag-and-drop upload + form |
| Remove | Delete button per entry | Delete button per card |
| Reorder | Drag items in list | Drag cards by handle |
| Edit metadata | Inline form | Modal form |
| Image upload | Built-in media manager | File picker or drag-and-drop |

---

## File Structure

```
photobase/
├── index.html          Gallery page (Alpine.js)
├── style.css           Global styles
├── gallery.json        Photo data (managed by both admins)
├── admin/
│   ├── index.html      Decap CMS entry
│   └── config.yml      Decap CMS configuration
├── manage/
│   ├── index.html      Custom admin page
│   └── app.js          Custom admin logic
└── assets/
    └── images/         Uploaded photos
```

## Customization

- **Colors:** Edit CSS variables in `style.css` (`--text`, `--bg`, `--accent`)
- **Masonry columns:** Adjust `columns: 3` in `.photo-grid` (also has `1024px` and `640px` breakpoints)
- **Header / site name:** Edit the `<h1>` in `index.html`
- **Sample data:** Replace `gallery.json` with your own photos. Remove the `id` field if you want — the gallery handles missing IDs.

## License

MIT
