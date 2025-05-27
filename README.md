# OVK_VERSKEKERING

This repository contains a Vite-based React project for OVK.

## Project Structure

```
Versekering Progam/
├── project/                # Main Vite React app
│   ├── public/             # Static assets
│   ├── src/                # Source code (components, utils, etc.)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .vscode/                # VSCode settings
│   └── launch.json
├── .gitignore
└── README.md
```

## Deployment

1. **Install dependencies:**
   ```sh
   cd project
   npm install
   ```

2. **Build for production:**
   ```sh
   npm run build
   ```

3. **Preview production build locally:**
   ```sh
   npm run preview
   ```

4. **Deploy the contents of `project/dist/` to your web server or static hosting (e.g., GitHub Pages, Netlify, Vercel).**

## Development

To start the development server:

```sh
cd project
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

