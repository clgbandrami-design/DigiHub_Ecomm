const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

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

  if (!name || !image || !description || !category || !fileUrl) {
    return res.status(400).json({ message: 'Please provide all required product fields' });
  }

  const numericPrice = Number(price);
  const numericOriginalPrice = originalPrice ? Number(originalPrice) : numericPrice;
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }

  const product = await Product.create({
    name,
    image,
    description,
    price: numericPrice,
    originalPrice: Number.isFinite(numericOriginalPrice) ? numericOriginalPrice : numericPrice,
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
  product.price = price !== undefined ? Number(price) : product.price;
  product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
  product.category = category || product.category;
  product.fileUrl = fileUrl || product.fileUrl;
  product.badge = badge ?? product.badge;

  if (!Number.isFinite(product.price) || product.price <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }

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

// @desc    Get seller analytics
// @route   GET /api/seller/analytics
// @access  Private (seller)
const getSellerAnalytics = async (req, res) => {
  if (!req.user.isSeller && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized as a seller' });
  }

  const products = await Product.find({ seller: req.user._id }).select('_id name image price');
  const productIds = products.map((product) => product._id);
  const orders = productIds.length
    ? await Order.find({
        status: 'paid',
        isPaid: true,
        'orderItems.product': { $in: productIds },
      }).sort({ paidAt: -1, createdAt: -1 })
    : [];

  const statsByProduct = new Map();
  products.forEach((product) => {
    statsByProduct.set(product._id.toString(), {
      productId: product._id,
      name: product.name,
      image: product.image,
      revenue: 0,
      unitsSold: 0,
    });
  });

  let totalRevenue = 0;
  let totalOrders = 0;
  const recentSales = [];

  orders.forEach((order) => {
    let counted = false;
    order.orderItems.forEach((item) => {
      const key = item.product?.toString();
      if (!key || !statsByProduct.has(key)) return;
      const entry = statsByProduct.get(key);
      entry.revenue += Number(item.price) || 0;
      entry.unitsSold += Number(item.qty) || 0;
      totalRevenue += Number(item.price) || 0;
      counted = true;
      recentSales.push({
        orderId: order._id,
        purchasedAt: order.paidAt || order.createdAt,
        productName: item.name,
        image: item.image,
        qty: item.qty,
        amount: item.price,
      });
    });
    if (counted) totalOrders += 1;
  });

  const topProducts = Array.from(statsByProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    totalProducts: products.length,
    totalOrders,
    totalRevenue,
    topProducts,
    recentSales: recentSales.slice(0, 5),
  });
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct, becomeSeller, getSellerAnalytics };
