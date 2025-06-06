# Profile Modules - Quick Reference

## 🚀 Quick Start

### Profile Access by Role

| Role | Profile URL | Navigation |
|------|-------------|------------|
| **Customer** | `/profile` | Header dropdown → "Profile" |
| **Admin/Manager/Chef/Staff** | `/admin/profile` | Sidebar → "Thông tin cá nhân" hoặc Header dropdown |
| **Waiter** | `/waiter/profile` | Sidebar → "Thông tin cá nhân" hoặc Header dropdown |

## 📱 Components

```
├── 👤 Customer Profile
│   ├── path: /profile
│   ├── component: CustomerProfilePage.jsx
│   └── features: Loyalty points, customer-focused UI
│
├── 🏢 Admin Profile  
│   ├── path: /admin/profile
│   ├── component: AdminProfilePage.jsx
│   └── features: Role management, system access
│
└── 🍽️ Waiter Profile
    ├── path: /waiter/profile
    ├── component: WaiterProfilePage.jsx
    └── features: Work schedule, performance metrics
```

## 🔧 API

```http
PUT /api/auth/profile
Authorization: Bearer <token>

{
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

## 🎯 Key Features

- ✅ Role-based profile pages
- ✅ Smart navigation (dynamic paths)
- ✅ Real-time profile updates
- ✅ Form validation
- ✅ Responsive design
- ✅ Security & authentication

## 🧪 Testing

```bash
# Customer testing
1. Login as customer → /profile
2. Edit info → Save → Verify update

# Admin testing  
1. Login as admin → /admin/profile
2. Check role display → Edit → Save

# Waiter testing
1. Login as waiter → /waiter/profile
2. View work metrics → Edit basic info
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Profile not loading | Check authentication token |
| Can't edit profile | Verify user permissions |
| Wrong profile page | Check role-based routing |
| Form not saving | Check API endpoint & validation |

## 📁 Important Files

**Backend:**
- `routes/authRoutes.js` - Profile update route
- `controllers/authController.js` - Update logic

**Frontend:**
- `pages/*/ProfilePage.jsx` - Profile components
- `components/layout/NewAdminHeader.jsx` - Navigation
- `store/authStore.js` - State management

---

**📖 Detailed Documentation**: See `PROFILE_MODULES_CHANGELOG.md` 