const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu-items
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { 
      category, 
      available, 
      recommended, 
      search, 
      tags,
      sort = '-createdAt',
      page = 1,
      limit = 100
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (available) {
      filter.isAvailable = available === 'true';
    }
    
    if (recommended) {
      filter.chefRecommended = recommended === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const menuItems = await MenuItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await MenuItem.countDocuments(filter);

    res.json({
      menuItems,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu-items
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      imageUrls, 
      isAvailable, 
      chefRecommended, 
      tags,
      stockCount
    } = req.body;

    // Check if menu item already exists
    const menuItemExists = await MenuItem.findOne({ name });
    
    if (menuItemExists) {
      res.status(400);
      throw new Error('Menu item already exists');
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrls: imageUrls || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      chefRecommended: chefRecommended || false,
      tags: tags || [],
      stockCount: stockCount || 0,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu-items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      imageUrls, 
      isAvailable, 
      chefRecommended, 
      tags,
      stockCount
    } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Check if name is being changed and if the new name already exists
    if (name && name !== menuItem.name) {
      const nameExists = await MenuItem.findOne({ name });
      if (nameExists) {
        res.status(400);
        throw new Error('Menu item with this name already exists');
      }
    }

    // Update fields
    menuItem.name = name || menuItem.name;
    menuItem.description = description !== undefined ? description : menuItem.description;
    menuItem.price = price || menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.imageUrls = imageUrls || menuItem.imageUrls;
    menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    menuItem.chefRecommended = chefRecommended !== undefined ? chefRecommended : menuItem.chefRecommended;
    menuItem.tags = tags || menuItem.tags;
    menuItem.stockCount = stockCount !== undefined ? stockCount : menuItem.stockCount;

    const updatedMenuItem = await menuItem.save();

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    
    await menuItem.remove();
    
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu-items/:id/toggle
// @access  Private/Admin
const toggleMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    
    menuItem.isAvailable = !menuItem.isAvailable;
    
    const updatedMenuItem = await menuItem.save();
    
    res.json({
      _id: updatedMenuItem._id,
      name: updatedMenuItem.name,
      isAvailable: updatedMenuItem.isAvailable,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Get distinct categories
// @route   GET /api/menu-items/categories/list
// @access  Public
const getCategoryList = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItem,
  getCategoryList,
}; 