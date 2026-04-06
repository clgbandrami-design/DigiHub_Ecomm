const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { keyword, category, sort } = req.query;

  const filter = {};
  if (keyword) filter.name = { $regex: keyword, $options: 'i' };
  if (category && category !== 'All') filter.category = category;

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'newest': { createdAt: -1 },
    'popular': { numReviews: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const products = await Product.find(filter).sort(sortBy);
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, price, description, image, category, fileUrl } = req.body;

  const product = new Product({
    name,
    price,
    description,
    image,
    category,
    fileUrl,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
