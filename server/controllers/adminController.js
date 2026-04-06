const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// @desc    Update user role (admin/seller flags)
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { isAdmin, isSeller } = req.body;
  if (isAdmin !== undefined) user.isAdmin = isAdmin;
  if (isSeller !== undefined) user.isSeller = isSeller;

  await user.save();
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    createdAt: user.createdAt,
  });
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
};

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Admin
const getAllProductsAdmin = async (req, res) => {
  const products = await Product.find({})
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });
  res.json(products);
};

// @desc    Delete any product
// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProductAdmin = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  res.json({ message: 'Product removed' });
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();
  const sellerCount = await User.countDocuments({ isSeller: true });

  res.json({ userCount, productCount, orderCount, sellerCount });
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllProductsAdmin,
  deleteProductAdmin,
  getStats,
};
