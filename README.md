# Snake Offline – Fast PWA

A lightweight Snake game that works **completely offline** and can be installed on your phone or desktop.

## Features
- Pure HTML/CSS/JS (no dependencies)
- Offline-first via Service Worker
- Installable PWA (Add to Home Screen)
- Touch + keyboard controls
- High score saved in localStorage
- Responsive design

## How to play
- **Desktop**: Arrow keys or WASD
- **Mobile**: Swipe on the canvas or use the on-screen D-pad
- Eat the red food, grow longer, don't hit yourself

## Deploy on Vercel (recommended)

### Option 1 – Vercel CLI (fastest)
```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# From this folder
cd snake-pwa
vercel
```

Follow the prompts → done. You get a live URL instantly.

### Option 2 – GitHub + Vercel Dashboard
1. Create a new GitHub repository
2. Upload the contents of this folder
3. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
4. Deploy (zero config needed)

### Option 3 – Drag & Drop
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag the entire `snake-pwa` folder onto the page

## Local testing
```bash
# Any static server works
npx serve .
# or
python3 -m http.server 3000
```

Then open `http://localhost:3000`.  
To test the PWA install + offline, use Chrome DevTools → Application → Service Workers, and try “Add to Home Screen”.

## File structure
```
snake-pwa/
├── index.html      # Main page + styles
├── game.js         # Game logic
├── sw.js           # Service Worker (offline)
├── manifest.json   # PWA manifest
├── vercel.json     # Vercel headers
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

Enjoy the game!
