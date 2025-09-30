# Slanup Website v2 🚀

A modern, production-ready website built with the latest web technologies.

## ✨ Tech Stack

### Core
- **Next.js 15** (App Router) - React framework with SSR, SSG, and optimizations
- **TypeScript** - Type safety and better DX
- **React 18** - Latest React with concurrent features

### Styling & Animations
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Smooth, performant animations
- **Google Fonts** - Poppins & Lobster Two

### Development
- **Turbopack** - Next.js's fast bundler
- **ESLint** - Code quality
- **npm** - Package manager

### Features
✅ Server-Side Rendering (SSR)  
✅ Type-safe with TypeScript  
✅ Smooth marquee animations  
✅ Responsive design  
✅ Optimized images with Next.js Image  
✅ SEO-friendly  
✅ Production-ready  

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your website.

## 📁 Project Structure

```
slanup-website-v2/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main landing page
│   └── globals.css      # Global styles & CSS variables
├── components/
│   ├── Header.tsx       # Sticky header with branding
│   ├── PlanCard.tsx     # Event card component
│   ├── MarqueeRow.tsx   # Animated scrolling row
│   └── WaitlistForm.tsx # Modal form component
├── lib/
│   ├── data.ts          # Sample plans data & types
│   └── utils.ts         # Utility functions
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Customization

### Colors
Edit the CSS variables in `app/globals.css`:
```css
:root {
  --brand-green: #636B50;
  --brand-green-dark: #535b40;
}
```

### Plans Data
Edit or add plans in `lib/data.ts`:
```typescript
export const SAMPLE_PLANS: Plan[] = [
  {
    id: '1',
    creatorName: 'Your Name',
    planTitle: 'Your Event',
    // ... more fields
  },
];
```

### Animations
Adjust animation speeds in `components/MarqueeRow.tsx`:
```typescript
transition={{
  duration: 60, // Change speed here
  repeat: Infinity,
  ease: "linear",
}}
```

## 🌐 Deployment

### Vercel (Recommended)
The easiest way to deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

### Azure Static Web Apps
```bash
# Install Azure CLI
brew install azure-cli

# Login
az login

# Create static web app
az staticwebapp create \
  --name slanup-website \
  --resource-group your-resource-group \
  --source . \
  --location "eastus2" \
  --branch main \
  --app-location "/" \
  --output-location "out"
```

### Other Platforms
- **Netlify**: Drag and drop the `.next` folder
- **AWS Amplify**: Connect your Git repo
- **Railway**: One-click deploy

## 📦 Build Output

```bash
npm run build
```

Creates an optimized production build:
- Static pages are pre-rendered
- Images are optimized
- JavaScript is minified
- CSS is purged and minified

## 🔧 Configuration

### Environment Variables
Create `.env.local` for environment-specific config:
```env
NEXT_PUBLIC_API_URL=https://api.slanup.com
```

### Image Optimization
External images are configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'i.pravatar.cc' },
  ],
}
```

## 🐛 Known Issues

### Hydration Warnings
Date-related hydration warnings have been suppressed using `suppressHydrationWarning` as dates can differ between server and client rendering.

### Turbopack Warning
You may see a warning about workspace root detection. This is safe to ignore or fix by setting `turbopack.root` in `next.config.ts`.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your projects!

---

Built with ❤️ using Next.js 15 + TypeScript + Tailwind CSS + Framer Motion