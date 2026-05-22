const express = require('express');
const router = express.Router();
const pincodeLookup = require('india-pincode-lookup');

router.get('/:pin', (req, res) => {
  try {
    const { pin } = req.params;
    if (!pin || pin.length !== 6) {
      return res.status(400).json({ error: 'Invalid pincode format' });
    }

    const data = pincodeLookup.lookup(pin);
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Pincode not found' });
    }

    // Usually the lookup returns an array of post offices for that pincode
    // We can just return the first one as they share the same district and state
    const info = data[0];
    
    // We will return districtName as city and stateName as state
    res.json({
      city: info.districtName,
      state: info.stateName
    });
  } catch (error) {
    console.error('Pincode lookup error:', error);
    res.status(500).json({ error: 'Server error looking up pincode' });
  }
});

module.exports = router;
