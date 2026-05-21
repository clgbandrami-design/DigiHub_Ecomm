const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let embeddingModel = null;

/**
 * Initialize the Gemini client lazily.
 * Returns true if the API key is configured, false otherwise.
 */
const isAvailable = () => {
  if (!process.env.GEMINI_API_KEY) return false;

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  }

  return true;
};

/**
 * Generate a 768-dimensional embedding vector for the given text.
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 768-dim float array
 */
const generateEmbedding = async (text) => {
  if (!isAvailable()) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal).
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Build the text representation of a product for embedding.
 * @param {object} product
 * @returns {string}
 */
const buildEmbeddingText = (product) => {
  return `${product.category}: ${product.name}. ${product.description}`;
};

module.exports = {
  isAvailable,
  generateEmbedding,
  cosineSimilarity,
  buildEmbeddingText,
};
