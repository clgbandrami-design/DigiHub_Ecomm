/**
 * generateEmbeddings.js
 *
 * One-time CLI script to generate AI embeddings for all products.
 * Usage:  node generateEmbeddings.js
 *
 * Requires GEMINI_API_KEY in .env
 * Idempotent — skips products whose embedding text hasn't changed.
 */

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const Product = require('./models/Product');
const { generateEmbedding, buildEmbeddingText, isAvailable } = require('./utils/geminiService');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  if (!isAvailable()) {
    console.error('❌ GEMINI_API_KEY is not set in .env — cannot generate embeddings.');
    process.exit(1);
  }

  await connectDB();

  // Select embedding fields explicitly since they are `select: false`
  const products = await Product.find({}).select('+embedding +embeddingText');

  console.log(`\n🔍 Found ${products.length} products.\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const text = buildEmbeddingText(product);

    // Skip if embedding already exists and text hasn't changed
    if (product.embedding?.length > 0 && product.embeddingText === text) {
      skipped++;
      console.log(`⏭️  [${i + 1}/${products.length}] Skipped: ${product.name}`);
      continue;
    }

    try {
      const embedding = await generateEmbedding(text);

      product.embedding = embedding;
      product.embeddingText = text;
      await product.save();

      generated++;
      console.log(`✅ [${i + 1}/${products.length}] Embedded: ${product.name} (${embedding.length} dims)`);

      // Rate limiting — 1s between API calls to avoid 429 errors
      await delay(1000);
    } catch (error) {
      failed++;
      console.error(`❌ [${i + 1}/${products.length}] Failed: ${product.name} — ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped:   ${skipped}`);
  console.log(`   ❌ Failed:    ${failed}`);
  console.log(`   Total:       ${products.length}\n`);

  process.exit(0);
};

run();
