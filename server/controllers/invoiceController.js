const PDFDocument = require('pdfkit');
const Order = require('../models/Order');

// @desc    Download order invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is the owner of the order (or an admin)
    // Note: Assuming req.user is populated by protect middleware
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Invoice is only available for paid orders' });
    }

    // Initialize PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=DigiHub_Invoice_${order._id.toString().slice(-8).toUpperCase()}.pdf`
    );

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // ── Header ──
    doc
      .fillColor('#072654')
      .fontSize(28)
      .text('DigiHub', 50, 45, { align: 'right' })
      .fillColor('#fb641b')
      .fontSize(10)
      .text('DIGITAL MARKETPLACE', 200, 75, { align: 'right' })
      .moveDown();

    doc
      .fillColor('#333333')
      .fontSize(20)
      .text('INVOICE', 50, 50);

    doc
      .fontSize(10)
      .text(`Invoice ID: INV-${order._id.toString().slice(-8).toUpperCase()}`, 50, 80)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 95)
      .text(`Payment ID: ${order.razorpay_payment_id || 'N/A'}`, 50, 110)
      .moveDown();

    // ── Customer Details ──
    doc
      .fillColor('#000000')
      .fontSize(12)
      .text('Billed To:', 50, 140)
      .fontSize(10)
      .text(order.user.name, 50, 155)
      .text(order.user.email, 50, 170)
      .moveDown();

    // ── Divider ──
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, 200)
      .lineTo(550, 200)
      .stroke();

    // ── Table Header ──
    let y = 220;
    doc
      .fillColor('#000000')
      .fontSize(10)
      .text('ITEM', 50, y)
      .text('QTY', 350, y, { width: 50, align: 'center' })
      .text('PRICE', 400, y, { width: 70, align: 'right' })
      .text('TOTAL', 480, y, { width: 70, align: 'right' });

    doc
      .moveTo(50, y + 15)
      .lineTo(550, y + 15)
      .stroke();

    // ── Table Items ──
    y += 30;
    let subtotal = 0;

    order.orderItems.forEach((item) => {
      const itemTotal = item.qty * item.price;
      subtotal += itemTotal;

      doc
        .fontSize(10)
        .text(item.name, 50, y, { width: 280 })
        .text(item.qty.toString(), 350, y, { width: 50, align: 'center' })
        .text(`Rs. ${item.price.toLocaleString()}`, 400, y, { width: 70, align: 'right' })
        .text(`Rs. ${itemTotal.toLocaleString()}`, 480, y, { width: 70, align: 'right' });
      
      y += 20;
    });

    // ── Totals ──
    doc
      .moveTo(50, y + 10)
      .lineTo(550, y + 10)
      .stroke();

    y += 25;
    
    // Platform fee calculation (if subtotal doesn't match total, the rest is platform fee)
    const platformFee = Math.max(0, order.totalPrice - subtotal);

    doc
      .fontSize(10)
      .text('Subtotal:', 380, y, { width: 90, align: 'right' })
      .text(`Rs. ${subtotal.toLocaleString()}`, 480, y, { width: 70, align: 'right' });
    y += 15;

    if (platformFee > 0) {
      doc
        .text('Platform Fee:', 380, y, { width: 90, align: 'right' })
        .text(`Rs. ${platformFee.toLocaleString()}`, 480, y, { width: 70, align: 'right' });
      y += 15;
    }

    // Grand Total
    doc
      .fillColor('#fb641b')
      .fontSize(12)
      .text('Total Amount:', 380, y + 5, { width: 90, align: 'right' })
      .text(`Rs. ${order.totalPrice.toLocaleString()}`, 480, y + 5, { width: 70, align: 'right' });

    // ── Footer ──
    doc
      .fillColor('#888888')
      .fontSize(10)
      .text('Thank you for your purchase!', 50, 700, { align: 'center', width: 500 })
      .text('This is a computer generated invoice and requires no signature.', 50, 715, { align: 'center', width: 500 });

    // Finalize PDF file
    doc.end();

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
  }
};

module.exports = { downloadInvoice };
