const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const products = [
  // UI/UX & Templates
  { name: 'Modern UI Kit Pro', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800', description: 'Complete UI kit with 200+ components, 15 pre-built templates, and interactive prototypes. Perfect for SaaS applications.', price: 89.00, originalPrice: 133.50, category: 'Templates', fileUrl: 'https://example.com/download/modern-ui-kit.zip' },
  { name: 'E-Commerce Figma Template', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800', description: 'Full e-commerce Figma UI kit with 80+ screens, auto-layout components, and dark/light mode support.', price: 49.00, originalPrice: 79.00, category: 'Templates', fileUrl: 'https://example.com/download/ecom-figma.zip' },
  { name: 'Dashboard Admin Pro', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', description: 'Premium admin dashboard template with 6 unique layouts, 40+ widgets, and chart components.', price: 59.00, originalPrice: 99.00, category: 'Templates', fileUrl: 'https://example.com/download/dashboard-admin.zip' },
  { name: 'Mobile App UI Bundle', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800', description: 'A stunning bundle of 5 complete mobile app UI kits: fitness, food delivery, finance, travel, and social media.', price: 119.00, originalPrice: 199.00, category: 'Templates', fileUrl: 'https://example.com/download/mobile-bundle.zip' },
  { name: 'Landing Page Kit', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800', description: '20 beautifully crafted landing page templates for SaaS, agencies, portfolios, and product launches.', price: 39.00, originalPrice: 65.00, category: 'Templates', fileUrl: 'https://example.com/download/landing-kit.zip' },

  // Graphics
  { name: 'Abstract 3D Icon Pack', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800', description: 'A beautiful collection of 50+ abstract 3D icons for web and mobile. Includes high-resolution PNGs and source files.', price: 29.99, originalPrice: 44.98, category: 'Graphics', fileUrl: 'https://example.com/download/abstract-3d-icons.zip' },
  { name: 'Brand Identity Pack', image: 'https://images.unsplash.com/photo-1493421419110-74f4e85ba126?auto=format&fit=crop&q=80&w=800', description: 'Everything you need to launch a professional brand: logos, business card templates, letterheads, and brand guidelines.', price: 69.00, originalPrice: 120.00, category: 'Graphics', fileUrl: 'https://example.com/download/brand-identity.zip' },
  { name: 'Social Media Template Bundle', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800', description: '150+ Instagram, Facebook, Twitter, and LinkedIn post templates. Fully editable in Canva and Photoshop.', price: 24.00, originalPrice: 40.00, category: 'Graphics', fileUrl: 'https://example.com/download/social-media-bundle.zip' },
  { name: 'Illustration Vector Pack', image: 'https://images.unsplash.com/photo-1580541631971-1f6a46bc6b01?auto=format&fit=crop&q=80&w=800', description: '80+ unique vector illustrations in flat design style. Available in SVG, PNG, and AI formats.', price: 34.00, originalPrice: 58.00, category: 'Graphics', fileUrl: 'https://example.com/download/illustration-pack.zip' },
  { name: 'Gradient Background Pack', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800', description: '200+ unique gradient backgrounds in 4K resolution. Perfect for websites, apps, and print projects.', price: 14.00, originalPrice: 25.00, category: 'Graphics', fileUrl: 'https://example.com/download/gradients.zip' },

  // Audio
  { name: 'Lo-Fi Beats Sample Pack', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800', description: '500 MB of high-quality lo-fi beats, drum loops, and atmospheric textures. Royalty-free.', price: 15.50, originalPrice: 23.25, category: 'Audio', fileUrl: 'https://example.com/download/lo-fi-beats.zip' },
  { name: 'Epic Cinematic Soundtrack', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800', description: '30 epic cinematic BGM tracks ideal for trailers, YouTube, games, and presentations. 320kbps MP3 + WAV.', price: 29.00, originalPrice: 49.00, category: 'Audio', fileUrl: 'https://example.com/download/cinematic-ost.zip' },
  { name: 'Podcast Intro Pack', image: 'https://images.unsplash.com/photo-1478737270197-b239a9fcaaf1?auto=format&fit=crop&q=80&w=800', description: '10 professional podcast intro/outro jingles and transitions. Perfect for branding your show.', price: 19.00, originalPrice: 32.00, category: 'Audio', fileUrl: 'https://example.com/download/podcast-intro.zip' },
  { name: 'UI Sound Effects Kit', image: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&q=80&w=800', description: '200+ UI sound effects including notification beeps, button clicks, transitions, and alerts for apps & games.', price: 22.00, originalPrice: 36.00, category: 'Audio', fileUrl: 'https://example.com/download/ui-sfx.zip' },

  // Photography
  { name: 'Minimalist Lightroom Presets', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800', description: 'Give your photos a clean, professional look with these 12 Lightroom presets. For desktop and mobile.', price: 12.00, originalPrice: 18.00, category: 'Photography', fileUrl: 'https://example.com/download/minimal-presets.zip' },
  { name: 'Moody Film Presets Pack', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800', description: '20 moody film-inspired Lightroom presets for portrait, landscape, and street photography.', price: 18.00, originalPrice: 30.00, category: 'Photography', fileUrl: 'https://example.com/download/moody-film.zip' },
  { name: 'Stock Photo Mega Bundle', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800', description: '500 curated royalty-free stock photos across 10 categories. High-resolution (5000px+). Commercial license included.', price: 39.00, originalPrice: 69.00, category: 'Photography', fileUrl: 'https://example.com/download/stock-bundle.zip' },

  // Fonts & Typography
  { name: 'Premium Font Collection', image: 'https://images.unsplash.com/photo-1636051028886-0059ad2383c8?auto=format&fit=crop&q=80&w=800', description: '25 professionally crafted font families including serifs, sans-serifs, and display fonts. OTF + TTF + WOFF2.', price: 45.00, originalPrice: 89.00, category: 'Fonts', fileUrl: 'https://example.com/download/font-collection.zip' },
  { name: 'Handwritten Script Bundle', image: 'https://images.unsplash.com/photo-1455541504462-57ebb2a9cec1?auto=format&fit=crop&q=80&w=800', description: '10 beautiful handwritten and brush script fonts for personal and commercial use. Great for logos and invitations.', price: 22.00, originalPrice: 40.00, category: 'Fonts', fileUrl: 'https://example.com/download/script-fonts.zip' },

  // Code & Dev
  { name: 'React Component Library', image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=800', description: '100+ production-ready React components built with Tailwind CSS. Includes Storybook docs and TypeScript support.', price: 79.00, originalPrice: 129.00, category: 'Code', fileUrl: 'https://example.com/download/react-components.zip' },
  { name: 'Next.js SaaS Boilerplate', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800', description: 'Full-stack SaaS starter with Next.js 14, authentication, Stripe payments, prisma DB, and dashboard.', price: 149.00, originalPrice: 249.00, category: 'Code', fileUrl: 'https://example.com/download/nextjs-saas.zip' },
  { name: 'Python Automation Scripts', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800', description: '30 ready-to-use Python automation scripts for data scraping, file management, email automation, and more.', price: 35.00, originalPrice: 59.00, category: 'Code', fileUrl: 'https://example.com/download/python-scripts.zip' },

  // Video
  { name: 'Motion Graphics Pack', image: 'https://images.unsplash.com/photo-1574717024453-46e75a35d38d?auto=format&fit=crop&q=80&w=800', description: '50 After Effects motion graphics templates for YouTube intros, logos reveals, and lower thirds.', price: 55.00, originalPrice: 89.00, category: 'Video', fileUrl: 'https://example.com/download/motion-graphics.zip' },
  { name: 'LUTs Color Grading Pack', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800', description: '40 cinematic LUTs for video color grading. Compatible with Premiere Pro, Final Cut, DaVinci Resolve.', price: 25.00, originalPrice: 45.00, category: 'Video', fileUrl: 'https://example.com/download/luts-pack.zip' },
];

const seedData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    await Product.insertMany(products);

    await User.create({
      name: 'Admin Developer',
      email: 'admin@digihub.com',
      password: 'adminpassword123',
      isAdmin: true,
      isVerified: true,
    });

    console.log('✅ Database Seeded with 24 products!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
