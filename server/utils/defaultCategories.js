const defaultCategories = [
  { name: 'Salary',        icon: 'briefcase',    color: '#10b981', type: 'income',  isDefault: true },
  { name: 'Investment',    icon: 'trending-up',  color: '#6366f1', type: 'income',  isDefault: true },
  { name: 'Food',          icon: 'utensils',     color: '#f59e0b', type: 'expense', isDefault: true },
  { name: 'Shopping',      icon: 'shopping-bag', color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Travel',        icon: 'plane',        color: '#3b82f6', type: 'expense', isDefault: true },
  { name: 'Bills',         icon: 'receipt',      color: '#ef4444', type: 'expense', isDefault: true },
  { name: 'Health',        icon: 'heart',        color: '#14b8a6', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: 'film',         color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Others',        icon: 'more-horizontal', color: '#6b7280', type: 'both', isDefault: true },
];

module.exports = defaultCategories;
