const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { keyword, category, sort, limit } = req.query;

  const filter = {};
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (category && category !== 'All') filter.category = category;

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'newest': { createdAt: -1 },
    'popular': { numReviews: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const parsedLimit = Number(limit);
  const query = Product.find(filter).sort(sortBy);
  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    query.limit(parsedLimit);
  }

  const products = await query;
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

  if (!name || !description || !image || !category || !fileUrl) {
    return res.status(400).json({ message: 'Please provide all required product fields' });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }

  const product = new Product({
    name,
    price: numericPrice,
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
