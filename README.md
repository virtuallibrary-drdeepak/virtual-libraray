# Virtual Library - Next.js App

India's First Virtual Study Space - A modern Next.js application with TypeScript and Tailwind CSS.

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

## 📁 Project Structure

```
├── components/          # Reusable React components
│   ├── sections/       # Page sections (Hero, FAQ, etc.)
│   ├── modals/         # Modal components
│   └── ...            # Other UI components
├── data/               # Content data (features, FAQs)
├── pages/              # Next.js pages (routes)
│   ├── index.tsx      # Home page (/)
│   ├── neet-pg.tsx    # NEET-PG page (/neet-pg)
│   └── other-exams.tsx # Other exams (/other-exams)
├── public/img/         # Static images
└── styles/             # Global CSS
```

## 🛠️ Available Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check for code issues
```

## ✏️ How to Edit Content

### Update Features/Cards
Edit `data/features.ts`:
```typescript
export const homeFeatures = [
  {
    emoji: '🎯',
    title: 'Feature Title',
    description: 'Feature description',
    bgColor: 'bg-[#f0f0f0]'
  }
]
```

### Update FAQs
Edit `data/faqs.ts`:
```typescript
export const neetPGFaqs = [
  {
    question: 'Your question?',
    answer: 'Your answer (HTML supported)'
  }
]
```

### Change Section Content
Edit component files in `components/sections/`:
- `HeroSection.tsx` - Hero banner
- `WhatYouGetSection.tsx` - Features section
- `FAQSection.tsx` - FAQ accordion
- etc.

## 🎨 Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 18** - UI library

## 📦 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms
1. Build: `npm run build`
2. Upload `.next` folder and `package.json`
3. Run: `npm start`

## 🌐 Pages

- **Home** - `/` - Landing page with courses carousel
- **NEET-PG** - `/neet-pg` - Medical exam page with payment form
- **Other Exams** - `/other-exams` - General exams page

## 🔧 Customization

### Add New Page
Create `pages/new-page.tsx`:
```typescript
import Layout from '@/components/Layout'
import HeroSection from '@/components/sections/HeroSection'

export default function NewPage() {
  return (
    <Layout title="New Page">
      <HeroSection title="Page Title" description="..." />
    </Layout>
  )
}
```

### Change Colors
Edit Tailwind classes in components or `tailwind.config.js`

### Add Images
Place images in `public/img/` and use `/img/filename.jpg` in code

## 📝 Key Features

- ✅ Fully responsive design
- ✅ SEO optimized
- ✅ Type-safe with TypeScript
- ✅ DRY principles (no code duplication)
- ✅ Custom carousels
- ✅ Interactive FAQ accordion
- ✅ Payment forms with modals
- ✅ Mobile-friendly navigation

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001  # Use different port
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Images not loading
- Ensure images are in `public/img/` folder
- Use `/img/filename.jpg` (not `./img/`)

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 📄 License

© 2025 Virtual Library. All rights reserved.
