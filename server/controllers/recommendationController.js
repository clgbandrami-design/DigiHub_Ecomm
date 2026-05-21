const Product = require('../models/Product');
const { generateEmbedding, cosineSimilarity, isAvailable } = require('../utils/geminiService');

// @desc    Get AI-powered similar product recommendations
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 12);

    // Get the target product with its embedding
    const targetProduct = await Product.findById(req.params.id).select('+embedding');

    if (!targetProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If the target product has an embedding, use AI similarity
    if (targetProduct.embedding?.length > 0) {
      // Fetch all other products with their embeddings
      const allProducts = await Product.find({ _id: { $ne: targetProduct._id } }).select('+embedding');

      // Compute similarity scores
      const scored = allProducts
        .filter((p) => p.embedding?.length > 0)
        .map((p) => ({
          product: p,
          score: cosineSimilarity(targetProduct.embedding, p.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Return products without the embedding field
      const recommendations = scored.map(({ product, score }) => {
        const obj = product.toObject();
        delete obj.embedding;
        delete obj.embeddingText;
        return { ...obj, similarityScore: Math.round(score * 100) / 100 };
      });

      return res.json({
        method: 'ai-embedding',
        recommendations,
      });
    }

    // Fallback: same category + price range
    const fallback = await Product.find({
      _id: { $ne: targetProduct._id },
      category: targetProduct.category,
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit);

    // If not enough in same category, fill with other popular products
    if (fallback.length < limit) {
      const existingIds = [targetProduct._id, ...fallback.map((p) => p._id)];
      const more = await Product.find({ _id: { $nin: existingIds } })
        .sort({ rating: -1, numReviews: -1 })
        .limit(limit - fallback.length);
      fallback.push(...more);
    }

    return res.json({
      method: 'category-fallback',
      recommendations: fallback,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
};

// @desc    Get AI-powered search recommendations
// @route   GET /api/products/ai/search-recommendations
// @access  Public
const getSearchRecommendations = async (req, res) => {
  try {
    const query = req.query.q;
    const limit = Math.min(Number(req.query.limit) || 8, 12);

    if (!query || query.trim().length === 0) {
      return res.json({ method: 'none', recommendations: [] });
    }

    // Try AI-powered semantic search
    if (isAvailable()) {
      try {
        const queryEmbedding = await generateEmbedding(query.trim());

        const allProducts = await Product.find({}).select('+embedding');

        const scored = allProducts
          .filter((p) => p.embedding?.length > 0)
          .map((p) => ({
            product: p,
            score: cosineSimilarity(queryEmbedding, p.embedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        const recommendations = scored.map(({ product, score }) => {
          const obj = product.toObject();
          delete obj.embedding;
          delete obj.embeddingText;
          return { ...obj, similarityScore: Math.round(score * 100) / 100 };
        });

        return res.json({
          method: 'ai-semantic',
          recommendations,
        });
      } catch (aiError) {
        console.error('AI search failed, falling back:', aiError.message);
      }
    }

    // Fallback: text-based search
    const fallback = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ rating: -1 })
      .limit(limit);

    return res.json({
      method: 'text-fallback',
      recommendations: fallback,
    });
  } catch (error) {
    console.error('Search recommendation error:', error);
    res.status(500).json({ message: 'Failed to get search recommendations' });
  }
};

module.exports = { getRecommendations, getSearchRecommendations };
