const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const CATEGORIES = ['Templates', 'Graphics', 'Audio', 'Photography', 'Fonts', 'Code', 'Video'];

const NOUNS = {
  Templates: ['Dashboard', 'Landing Page', 'UI Kit', 'Portfolio', 'E-commerce', 'Admin Panel', 'CRM System', 'Wireframes'],
  Graphics: ['Icon Set', 'Illustrations', 'Social Media Kit', 'Logo Pack', '3D Assets', 'Vector Elements', 'Texture Pack'],
  Audio: ['Lo-Fi Beats', 'Cinematic Score', 'Sound Effects Pack', 'Podcast Intro', 'Ambient Track', 'Synthwave Loops'],
  Photography: ['Lightroom Presets', 'Cyberpunk LUTs', 'Nature Mockups', 'Portrait Retouching Kit', 'Film Emulation'],
  Fonts: ['Sans-Serif Family', 'Handwritten Script', 'Display Typeface', 'Monospace Font', 'Vintage Serif', 'Variable Font'],
  Code: ['React Boilerplate', 'Next.js Starter', 'Node API Template', 'Tailwind Components', 'Vue Dashboard', 'Authentication Module'],
  Video: ['Premiere Pro Transitions', 'After Effects Intro', 'Glitch Overlays', 'Lower Thirds Pack', 'Title Animations'],
};

const ADJECTIVES = ['Ultimate', 'Premium', 'Modern', 'Minimalist', 'Pro', 'Complete', 'Essential', 'Advanced', 'Clean', 'Creative', 'Cyberpunk', 'Cinematic', 'Sleek'];

const generateProducts = async () => {
  try {
    await connectDB();

    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('No admin user found, cannot set seller.');
      process.exit(1);
    }

    const newProducts = [];
    
    for (let i = 0; i < 100; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const noun = NOUNS[category][Math.floor(Math.random() * NOUNS[category].length)];
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      
      const name = `${adj} ${noun}`;
      const price = Math.floor(Math.random() * (199 - 9 + 1)) + 9; // $9 to $199
      const description = `This is the ${name}, the perfect premium asset for your next creative project. It includes everything you need to speed up your workflow and produce high-quality results instantly. Carefully crafted and fully customizable.`;
      
      // Random colorful placeholder
      const colors = ['4facfe', 'ff0844', '43e97b', 'fa709a', '667eea', 'ffb199', 'f6d365', '84fab0'];
      const bg = colors[Math.floor(Math.random() * colors.length)];
      const image = `https://placehold.co/800x600/${bg}/ffffff?text=${encodeURIComponent(noun)}`;

      newProducts.push({
        name,
        price,
        description,
        image,
        category,
        fileUrl: 'https://example.com/download.zip',
        seller: adminUser._id,
        rating: (Math.random() * (5 - 3) + 3).toFixed(1), // 3.0 to 5.0
        numReviews: Math.floor(Math.random() * 50) + 1,
      });
    }

    await Product.insertMany(newProducts);
    console.log('✅ Successfully added 100 random products!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

generateProducts();
