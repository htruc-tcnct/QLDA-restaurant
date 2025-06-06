const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Demo data
let managerToken = '';
let staffToken = '';
let orderId = '';

// Login function
async function login(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password
        });
        return response.data.token;
    } catch (error) {
        console.error('Login error:', error.response?.data?.message || error.message);
        return null;
    }
}

// Create order function
async function createOrder(token) {
    try {
        // Get menu items first
        const menuResponse = await axios.get(`${BASE_URL}/menu`);
        const menuItems = menuResponse.data;

        if (!menuItems || menuItems.length === 0) {
            throw new Error('No menu items found');
        }

        const orderData = {
            orderType: 'takeaway',
            items: [
                {
                    menuItem: menuItems[0]._id,
                    quantity: 2,
                    notes: 'Test order'
                },
                {
                    menuItem: menuItems[1]._id,
                    quantity: 1,
                    notes: 'Another item'
                }
            ]
        };

        const response = await axios.post(`${BASE_URL}/v1/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data.data.order;
    } catch (error) {
        console.error('Create order error:', error.response?.data?.message || error.message);
        return null;
    }
}

// Apply promotion function
async function applyPromotion(token, orderId, promotionCode) {
    try {
        const response = await axios.put(
            `${BASE_URL}/v1/orders/${orderId}/apply-promotion`,
            { promotionCode },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Apply promotion error:', error.response?.data?.message || error.message);
        return null;
    }
}

// Get promotions function
async function getPromotions(token) {
    try {
        const response = await axios.get(`${BASE_URL}/v1/promotions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.promotions;
    } catch (error) {
        console.error('Get promotions error:', error.response?.data?.message || error.message);
        return null;
    }
}

// Create promotion function
async function createPromotion(token, promotionData) {
    try {
        const response = await axios.post(`${BASE_URL}/v1/promotions`, promotionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.promotion;
    } catch (error) {
        console.error('Create promotion error:', error.response?.data?.message || error.message);
        return null;
    }
}

// Main demo function
async function demoPromotionFeature() {
    console.log('🚀 DEMO CHỨC NĂNG KHUYẾN MÃI\n');

    // 1. Login as manager
    console.log('1. Đăng nhập với role Manager...');
    managerToken = await login('manager01', '123456');
    if (!managerToken) {
        console.log('❌ Không thể đăng nhập với Manager');
        return;
    }
    console.log('✅ Đăng nhập Manager thành công\n');

    // 2. Login as staff
    console.log('2. Đăng nhập với role Staff...');
    staffToken = await login('waiter_a', '123456');
    if (!staffToken) {
        console.log('❌ Không thể đăng nhập với Staff');
        return;
    }
    console.log('✅ Đăng nhập Staff thành công\n');

    // 3. Get existing promotions
    console.log('3. Lấy danh sách khuyến mãi hiện có...');
    const promotions = await getPromotions(managerToken);
    if (promotions) {
        console.log(`✅ Tìm thấy ${promotions.length} khuyến mãi:`);
        promotions.forEach(promo => {
            console.log(`   - ${promo.name} (${promo.code}): ${promo.type === 'percentage' ? promo.value + '%' : promo.value + 'đ'}`);
        });
        console.log('');
    }

    // 4. Create a new promotion (Admin only)
    console.log('4. Tạo khuyến mãi mới (chỉ Admin/Manager)...');
    const newPromo = await createPromotion(managerToken, {
        name: 'Demo Promotion - Giảm 15%',
        description: 'Khuyến mãi demo cho test',
        type: 'percentage',
        value: 15,
        code: 'DEMO15',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minSpend: 50000,
        maxDiscountAmount: 30000,
        usageLimit: 10,
        isActive: true
    });

    if (newPromo) {
        console.log(`✅ Tạo khuyến mãi thành công: ${newPromo.name} (${newPromo.code})\n`);
    }

    // 5. Create an order
    console.log('5. Tạo đơn hàng mới...');
    const order = await createOrder(staffToken);
    if (!order) {
        console.log('❌ Không thể tạo đơn hàng');
        return;
    }
    orderId = order._id;
    console.log(`✅ Tạo đơn hàng thành công: ${orderId}`);
    console.log(`   Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')}đ\n`);

    // 6. Apply promotion to order
    console.log('6. Áp dụng mã khuyến mãi vào đơn hàng...');
    const applyResult = await applyPromotion(staffToken, orderId, 'WELCOME10');
    if (applyResult) {
        console.log('✅ Áp dụng khuyến mãi thành công!');
        console.log(`   Khuyến mãi: ${applyResult.data.promotionApplied.name}`);
        console.log(`   Giảm giá: ${applyResult.data.promotionApplied.discountAmount.toLocaleString('vi-VN')}đ`);
        console.log(`   Tổng tiền gốc: ${applyResult.data.promotionApplied.originalTotal.toLocaleString('vi-VN')}đ`);
        console.log(`   Tổng tiền mới: ${applyResult.data.promotionApplied.newTotal.toLocaleString('vi-VN')}đ\n`);
    }

    console.log('🎉 DEMO HOÀN THÀNH!\n');
    console.log('📋 Các API có thể sử dụng:');
    console.log('   GET /api/v1/promotions - Lấy danh sách khuyến mãi');
    console.log('   POST /api/v1/promotions - Tạo khuyến mãi mới (Manager only)');
    console.log('   PUT /api/v1/orders/{id}/apply-promotion - Áp dụng khuyến mãi');
    console.log('   DELETE /api/v1/orders/{id}/remove-promotion - Gỡ khuyến mãi');
}

// Run demo
setTimeout(() => {
    demoPromotionFeature().catch(console.error);
}, 2000); // Wait 2 seconds for server to start 