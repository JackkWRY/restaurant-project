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
  }
};

export default en;