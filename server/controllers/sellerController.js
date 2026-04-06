const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get seller's own products
// @route   GET /api/seller/my-products
// @access  Private (seller)
const getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};

// @desc    Create a product (seller)
// @route   POST /api/seller/products
// @access  Private (seller)
const createProduct = async (req, res) => {
  if (!req.user.isSeller) {
    return res.status(403).json({ message: 'Not authorized as a seller' });
  }

  const { name, image, description, price, originalPrice, category, fileUrl, badge } = req.body;

  const product = await Product.create({
    name,
    image,
    description,
    price,
    originalPrice: originalPrice || price,
    category,
    fileUrl,
    badge: badge || '',
    seller: req.user._id,
  });

  res.status(201).json(product);
};

// @desc    Update a product (seller - own products only)
// @route   PUT /api/seller/products/:id
// @access  Private (seller)
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this product' });
  }

  const { name, image, description, price, originalPrice, category, fileUrl, badge } = req.body;
  product.name = name || product.name;
  product.image = image || product.image;
  product.description = description || product.description;
  product.price = price ?? product.price;
  product.originalPrice = originalPrice ?? product.originalPrice;
  product.category = category || product.category;
  product.fileUrl = fileUrl || product.fileUrl;
  product.badge = badge ?? product.badge;

  const updated = await product.save();
  res.json(updated);
};

// @desc    Delete a product (seller - own products only)
// @route   DELETE /api/seller/products/:id
// @access  Private (seller)
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this product' });
  }

  await product.deleteOne();
  res.json({ message: 'Product removed' });
};

// @desc    Become a seller
// @route   PUT /api/seller/become-seller
// @access  Private
const becomeSeller = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { storeName, description } = req.body;

  user.isSeller = true;
  user.sellerInfo = {
    storeName: storeName || `${user.name}'s Store`,
    description: description || '',
  };

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    sellerInfo: user.sellerInfo,
    avatar: user.avatar,
  });
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct, becomeSeller };
