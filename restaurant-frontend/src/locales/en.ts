/**
 * @file English Translations
 * @description English language dictionary for the application
 * 
 * This module provides:
 * - Complete English translations
 * - Organized by feature sections
 * - Type-safe translation keys
 * 
 * Sections:
 * - common: Common UI text
 * - auth: Authentication
 * - menu: Menu categories
 * - admin: Admin dashboard
 * - staff: Staff dashboard
 * - kitchen: Kitchen display
 * - customer: Customer ordering
 * - landing: Landing page
 * - dashboard: Analytics
 * - history: Sales history
 * 
 * @module locales/en
 * @requires @/config/constants
 * 
 * @see {@link th} for Thai translations
 */

import { APP_CONFIG } from "@/config/constants";

const en = {
  common: {
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading...",
    back: "Back",
    logout: "Logout",
    logoutConfirm: "Do you want to logout?",
    success: "Success",
    error: "Error",
    dashboard: "Dashboard",
    switchLang: "ภาษาไทย",
    currency: APP_CONFIG.CURRENCY,
  },
  auth: {
    title: "Staff Login",
    subtitle: "Restaurant Management System",
    username: "Username",
    password: "Password",
    loginBtn: "Login",
    loggingIn: "Verifying...",
    loginFailed: "Invalid username or password",
  },
  menu: {
    foods: "Food",
    drinks: "Drinks",
    desserts: "Desserts",
    recommend: "Recommended",
  },
  admin: {
    title: "Admin Dashboard 🛠️",
    toStaff: "Go to Staff →",
    toKitchen: "Go to Kitchen →",
    manageCategories: "Manage Categories",
    manageMenus: "Manage Menus",
    shopSettings: "Restaurant Settings",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    name: "Name",
    price: "Price",
    category: "Category",
    image: "Image URL",
    status: "Status",
    visibility: "Visibility",
    action: "Action",
    save: "Save Changes",
    menuCount: "menus",
    noCategory: "No categories yet",
    noMenu: "No menus yet",
    available: "Available",
    outOfStock: "Out of Stock",
    visible: "Visible",
    hidden: "Hidden",
    recommend: "Recommend",
    modeEdit: "Edit Mode",
    modeCreate: "Create Mode",
    cancel: "Cancel",
    placeholderName: "e.g. Jay Fai Restaurant",
    placeholderCategory: "New Category Name...",
    alertSaved: "Saved successfully ✅",
    alertFailed: "Save failed",
    cannotDeleteCategory: "Cannot delete this category. It has",
    activeMenus: "active menu(s). Please delete or move the menus first.",
    promptEdit: "Enter new name:",
    confirmDelete: "Confirm delete?",
  },
  staff: {
    title: "Table & Cashier Management",
    editMode: "Edit Layout",
    finishEdit: "Done",
    addTable: "Add Table",
    refresh: "Refresh",
    callCustomer: "Calling!",
    newOrder: "New Order!",
    ready: "Ready to Serve",
    closed: "Closed",
    total: "Total",
    viewDetails: "View Details",
    order: "Order",
    checkBill: "Check Bill",
    receipt: "Receipt Summary",
    receiveCash: "Receive Cash",
    subtitle: "Ready to serve",
    placeholderTable: "Table Name",
    alertCannotClose: "⚠️ Cannot close table. There are pending items.",
    alertConfirmDelete: "⚠️ Delete this table?",
    promptEditTable: "New table name:",
    noOrders: "No orders yet",
    new: "NEW",
    cancelled: "CANCELLED",
    cannotCloseTitle: "Cannot close table",
    cannotCloseDesc: "items are not served yet.",
    itemsCount: "Items",
    statusCancelled: "Cancelled", 
  },
  kitchen: {
    title: "Kitchen Display System",
    live: "Live",
    pending: "Pending",
    cooking: "Cooking",
    ready: "Ready",
    startCook: "Start",
    finishCook: "Done",
    served: "Served",
  },
  customer: {
    scanQr: "Please scan QR Code",
    scanQrDesc: "to identify table and start ordering",
    tableClosed: "This table is currently closed",
    contactStaff: "Please contact staff",
    table: "Table",
    alertCallStaff: "🔔 Staff called, please wait a moment.",
    alertCancelCall: "🔕 Call cancelled.",
    alertFailed: "Request failed",
    orderHistory: "Order History",
    noHistory: "No items ordered yet",
    noMenuInCategory: "No items in this category",
    statusCompleted: "Paid",
    viewCart: "View Cart",
    orderSummary: "Order Summary",
    total: "Total",
    confirmOrder: "Confirm Order",
    confirmOrderQuestion: "Confirm this order?",
    orderSent: "Order sent successfully! ✅",
    orderFailed: "Failed to send order ❌",
    tableNotFound: "Table ID not found",
    notePlaceholder: "Add note (e.g. no spicy)",
    serverError: "Server connection failed",
    addToCart: "Add",
    soldOut: "Sold Out",
  },
  landing: {
    welcome: "Welcome",
    subtitle: "Smart Restaurant System. Please scan QR Code at your table to start ordering.",
    scanToOrder: "Scan to Order",
    poweredBy: "Powered by Restaurant OS",
  },
  dashboard: {
    title: "Restaurant Overview",
    todaySales: "Today's Sales",
    todayOrders: "Today's Orders",
    bills: "Bills",
    salesTrend: "Sales Trend (Last 7 Days)",
    bestSellers: "Best Sellers (Top 5)",
    noData: "No sales data available",
    total: "Total",
    loading: "Loading dashboard...",
    error: "Failed to load analytics data.",
    recentOrders: "Recent Orders",
    time: "Time",
    table: "Table",
    items: "Items",
    totalPrice: "Total",
    status: "Status",
    view: "View",
    orderDetail: "Order Detail",
    close: "Close",
    unitPrice: "Unit Price",
    quantity: "Qty",
    subtotal: "Subtotal"
  },
  history: {
    title: "Sales History",
    subtitle: "View past transactions and reports",
    startDate: "Start Date",
    endDate: "End Date",
    search: "Search",
    totalRevenue: "Total Revenue",
    totalBills: "Total Bills",
    date: "Date/Time",
    table: "Table",
    items: "Items",
    total: "Total",
    loading: "Loading data...",
    noData: "No records found for this period."
  },
  errors: {
    TABLE_001: 'Table not found', TABLE_002: 'Failed to create table', TABLE_003: 'Failed to update table',
    TABLE_004: 'Failed to delete table', TABLE_005: 'Failed to fetch table', TABLE_006: 'Cannot delete table with active customers',
    TABLE_007: 'Cannot delete available table. Please disable it first', TABLE_008: 'Failed to close table',
    TABLE_009: 'Cannot close table. Some items are not yet served', TABLE_010: 'Failed to update availability',
    TABLE_011: 'Failed to update call staff status', TABLE_012: 'Failed to fetch table details',
    CATEGORY_001: 'Category not found', CATEGORY_002: 'Failed to create category', CATEGORY_003: 'Failed to update category',
    CATEGORY_004: 'Failed to delete category', CATEGORY_005: 'Cannot delete category with active menus', CATEGORY_006: 'Failed to fetch categories',
    MENU_001: 'Menu not found', MENU_002: 'Failed to create menu', MENU_003: 'Failed to update menu',
    MENU_004: 'Failed to delete menu', MENU_005: 'Failed to fetch menu',
    AUTH_001: 'Login failed', AUTH_002: 'Logout failed', AUTH_003: 'Session expired. Please login again',
    AUTH_004: 'Server configuration error', AUTH_005: 'Invalid credentials', AUTH_006: 'Unauthorized',
    UPLOAD_001: 'No file provided', UPLOAD_002: 'Invalid image file', UPLOAD_003: 'File size exceeds 5MB limit', UPLOAD_004: 'Upload failed',
    ANALYTICS_001: 'Failed to fetch analytics', ANALYTICS_002: 'Failed to fetch bills', ANALYTICS_003: 'Failed to fetch history',
    SETTINGS_001: 'Failed to fetch settings', SETTINGS_002: 'Failed to update settings',
    ORDER_001: 'Failed to create order', ORDER_002: 'Failed to update order', ORDER_003: 'Failed to update order item', ORDER_004: 'Failed to fetch order',
    BILL_001: 'Failed to fetch bill', BILL_002: 'Failed to create bill',
    ERROR_001: 'An error occurred', ERROR_002: 'Validation error', ERROR_003: 'Not found', ERROR_004: 'Bad request'
  },
  success: {
    SUCCESS_TABLE_001: 'Table deleted successfully', SUCCESS_TABLE_002: 'Table closed successfully',
    SUCCESS_TABLE_003: 'Table created successfully', SUCCESS_TABLE_004: 'Table updated successfully',
    SUCCESS_CATEGORY_001: 'Category deleted successfully', SUCCESS_CATEGORY_002: 'Category created successfully', SUCCESS_CATEGORY_003: 'Category updated successfully',
    SUCCESS_MENU_001: 'Menu deleted successfully', SUCCESS_MENU_002: 'Menu created successfully', SUCCESS_MENU_003: 'Menu updated successfully',
    SUCCESS_AUTH_001: 'Logged out successfully', SUCCESS_AUTH_002: 'Logged in successfully'
  }
};

export default en;