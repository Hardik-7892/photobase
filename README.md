# Photobase

A photographer portfolio website that works on GitHub Pages — with an admin panel to manage photos.

- **Gallery** (`index.html`) — responsive masonry layout, category filters, lightbox
- **Admin** (`/manage/`) — connect with a GitHub PAT to add, remove, reorder, and edit photos

---

## Quick Start

1. **Fork** this repo or push it to your GitHub account
2. Go to **Settings > Pages** and enable GitHub Pages from the `main` branch root
3. Your gallery is live at `https://your-username.github.io/photobase/`
4. Open `https://your-username.github.io/photobase/manage/` to start adding photos

---

## Setup: Generate a GitHub Token

1. Go to **GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a name like `Photobase`
4. Under **Expiration**, choose **No expiration**
5. Under **Scopes**, check **`repo`** (full control of private repositories)
6. Click **Generate token**
7. **Copy the token** — it starts with `github_pat_...` or `ghp_...`

## Connect the Admin

Open `https://your-username.github.io/photobase/manage/` and enter:

| Field | Value |
|---|---|
| Repository Owner | your GitHub username |
| Repository Name | `photobase` |
| Branch | `main` |
| Personal Access Token | the token you generated |

Click **Connect**.

## Admin Features

- **Add photos** — drag-and-drop or click to select an image, fill in title/category
- **Reorder** — drag cards by the handle (⠿) to rearrange order
- **Edit** — click Edit on any card to change title, category, or description
- **Delete** — click Delete to remove a photo
- **Save** — click **Save Changes** to commit everything to your repo

## File Structure

```
photobase/
├── index.html       Gallery page (Alpine.js)
├── style.css        Global styles
├── gallery.json     Photo data (edit via /manage/)
├── manage/
│   ├── index.html   Admin page
│   └── app.js       Admin logic (GitHub API)
└── assets/
    └── images/      Uploaded photos
```

## Customization

- **Colors:** Edit CSS variables in `style.css` (`--text`, `--bg`, `--border`)
- **Masonry columns:** Adjust `columns: 3` in `.photo-grid` (also has responsive breakpoints)
- **Site name:** Edit the `<h1>` in `index.html`

## License

MIT
