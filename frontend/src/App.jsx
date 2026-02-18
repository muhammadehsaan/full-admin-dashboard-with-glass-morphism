import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiBarChart2,
  FiBell,
  FiBox,
  FiChevronDown,
  FiClipboard,
  FiCreditCard,
  FiEdit2,
  FiEye,
  FiFileText,
  FiHome,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const fallbackDashboard = {
  kpis: [],
  revenue: [],
  streams: [],
  funnel: [],
  salesBreakdown: [],
  notifications: 0,
  profile: { name: '', role: '' },
}

const defaultLoginEmail = 'admin@gmail.com'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome },
  { key: 'cnic', label: 'CNIC & Inventory Check', icon: FiFileText },
  { key: 'inventory', label: 'Inventory', icon: FiBox },
  { key: 'vendors', label: 'Vendors', icon: FiUsers },
  { key: 'customers', label: 'Customers', icon: FiUserCheck },
  { key: 'guarantors', label: 'Guarantors', icon: FiUserPlus },
  {
    key: 'installment',
    label: 'Installment Plans',
    icon: FiCreditCard,
    children: [
      { key: 'all-plans', label: 'All Plans' },
      { key: 'new-plan', label: 'Add New Plan' },
    ],
  },
  {
    key: 'hr',
    label: 'HR Management',
    icon: FiClipboard,
    children: [
      { key: 'attendance', label: 'Attendance' },
      { key: 'employees', label: 'Employees' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FiBarChart2,
    children: [
      { key: 'summary', label: 'Summary' },
      { key: 'daily-closing', label: 'Daily Closing' },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    icon: FiShield,
    children: [
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles & Permissions' },
    ],
  },
]

const pageMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Track performance, revenue streams, and customer activity.',
  },
  cnic: {
    title: 'CNIC & Inventory Check',
    subtitle: 'Search customer records using CNIC number.',
    endpoint: '/api/customers',
    allowCreate: false,
    allowEdit: false,
    allowDelete: false,
  },
  inventory: {
    title: 'Inventory',
    subtitle: 'Monitor stock levels and product movement.',
    endpoint: '/api/inventory',
  },
  vendors: {
    title: 'Vendors',
    subtitle: 'Manage supplier accounts and outstanding balances.',
    endpoint: '/api/vendors',
  },
  customers: {
    title: 'Customers',
    subtitle: 'Track customer profiles, payments, and history.',
    endpoint: '/api/customers',
  },
  guarantors: {
    title: 'Guarantors',
    subtitle: 'Review guarantor documents and credit exposure.',
    endpoint: '/api/guarantors',
  },
  'all-plans': {
    title: 'Installment Plans',
    subtitle: 'Active installment plans and schedules.',
    endpoint: '/api/installment-plans',
  },
  'new-plan': {
    title: 'Add New Plan',
    subtitle: 'Create and review installment plan records.',
    endpoint: '/api/installment-plans',
  },
  attendance: {
    title: 'Attendance',
    subtitle: 'Daily staff attendance tracking.',
    endpoint: '/api/attendance',
  },
  employees: {
    title: 'Employees',
    subtitle: 'Employee profiles and assignments.',
    endpoint: '/api/employees',
  },
  summary: {
    title: 'Reports Summary',
    subtitle: 'High-level operational insights.',
    endpoint: '/api/reports/summary',
  },
  'daily-closing': {
    title: 'Daily Closing',
    subtitle: 'End-of-day reconciliation data.',
    endpoint: '/api/reports/daily-closing',
  },
  users: {
    title: 'Users',
    subtitle: 'System user accounts.',
    endpoint: '/api/users',
  },
  roles: {
    title: 'Roles & Permissions',
    subtitle: 'Access control and permissions.',
    endpoint: '/api/roles',
  },
}

const moduleFormMap = {
  customers: {
    label: 'Customer',
    list: {
      title: 'fullName',
      subtitle: 'cnic',
      meta: ['primaryPhone', 'address'],
    },
    sections: [
      {
        title: 'Personal Information',
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'fatherName', label: 'Father Name', type: 'text' },
          {
            name: 'primaryPhone',
            label: 'Primary Phone',
            type: 'text',
            required: true,
          },
          { name: 'secondaryPhone', label: 'Secondary Phone', type: 'text' },
          { name: 'cnic', label: 'CNIC Number', type: 'text', required: true },
          { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          {
            name: 'maritalStatus',
            label: 'Marital Status',
            type: 'select',
            options: ['Single', 'Married', 'Other'],
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive', 'Hold'],
          },
          { name: 'address', label: 'Full Address', type: 'textarea' },
        ],
      },
      {
        title: 'Work & Income',
        fields: [
          {
            name: 'homeType',
            label: 'Home Type',
            type: 'select',
            options: ['Owned', 'Rented', 'Family'],
          },
          {
            name: 'sourceOfIncome',
            label: 'Source of Income',
            type: 'select',
            options: ['Salary', 'Business', 'Self-employed', 'Other'],
          },
          { name: 'companyName', label: 'Company Name', type: 'text' },
          { name: 'designation', label: 'Designation', type: 'text' },
          { name: 'yearsExperience', label: 'Years of Experience', type: 'number' },
          { name: 'referencedBy', label: 'Referenced By', type: 'text' },
          { name: 'companyAddress', label: 'Company Address', type: 'textarea' },
        ],
      },
    ],
  },
  vendors: {
    label: 'Vendor',
    list: { title: 'name', subtitle: 'phone', meta: ['companyName', 'status'] },
    sections: [
      {
        title: 'Vendor Details',
        fields: [
          { name: 'name', label: 'Vendor Name', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'companyName', label: 'Company Name', type: 'text' },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'balance', label: 'Balance', type: 'number' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
          },
        ],
      },
    ],
  },
  guarantors: {
    label: 'Guarantor',
    list: { title: 'name', subtitle: 'cnic', meta: ['phone', 'relation'] },
    sections: [
      {
        title: 'Guarantor Details',
        fields: [
          { name: 'name', label: 'Guarantor Name', type: 'text', required: true },
          { name: 'cnic', label: 'CNIC', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'relation', label: 'Relation', type: 'text' },
          { name: 'address', label: 'Address', type: 'textarea' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
          },
        ],
      },
    ],
  },
  inventory: {
    label: 'Item',
    list: { title: 'itemName', subtitle: 'sku', meta: ['category', 'quantity'] },
    sections: [
      {
        title: 'Inventory Item',
        fields: [
          { name: 'itemName', label: 'Item Name', type: 'text', required: true },
          { name: 'sku', label: 'SKU', type: 'text' },
          { name: 'category', label: 'Category', type: 'text' },
          { name: 'quantity', label: 'Quantity', type: 'number' },
          { name: 'unitPrice', label: 'Unit Price', type: 'number' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['In Stock', 'Low Stock', 'Out of Stock'],
          },
        ],
      },
    ],
  },
  cnic: {
    label: 'Customer',
    list: { title: 'fullName', subtitle: 'cnic', meta: ['primaryPhone', 'address'] },
    sections: [
      {
        title: 'Customer Lookup',
        fields: [
          { name: 'fullName', label: 'Customer Name', type: 'text' },
          { name: 'cnic', label: 'CNIC', type: 'text', required: true },
          { name: 'primaryPhone', label: 'Primary Phone', type: 'text' },
          { name: 'address', label: 'Address', type: 'textarea' },
        ],
      },
    ],
  },
  'all-plans': {
    label: 'Installment Plan',
    list: {
      title: 'customerName',
      subtitle: 'planName',
      meta: ['totalAmount', 'status'],
    },
    sections: [
      {
        title: 'Installment Plan',
        fields: [
          { name: 'customerName', label: 'Customer Name', type: 'text' },
          { name: 'planName', label: 'Plan Name', type: 'text' },
          { name: 'totalAmount', label: 'Total Amount', type: 'number' },
          { name: 'downPayment', label: 'Down Payment', type: 'number' },
          {
            name: 'monthlyInstallment',
            label: 'Monthly Installment',
            type: 'number',
          },
          { name: 'durationMonths', label: 'Duration (Months)', type: 'number' },
          { name: 'startDate', label: 'Start Date', type: 'date' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Completed', 'Overdue'],
          },
        ],
      },
    ],
  },
  'new-plan': {
    label: 'Installment Plan',
    list: {
      title: 'customerName',
      subtitle: 'planName',
      meta: ['totalAmount', 'status'],
    },
    sections: [
      {
        title: 'Installment Plan',
        fields: [
          { name: 'customerName', label: 'Customer Name', type: 'text' },
          { name: 'planName', label: 'Plan Name', type: 'text' },
          { name: 'totalAmount', label: 'Total Amount', type: 'number' },
          { name: 'downPayment', label: 'Down Payment', type: 'number' },
          {
            name: 'monthlyInstallment',
            label: 'Monthly Installment',
            type: 'number',
          },
          { name: 'durationMonths', label: 'Duration (Months)', type: 'number' },
          { name: 'startDate', label: 'Start Date', type: 'date' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Completed', 'Overdue'],
          },
        ],
      },
    ],
  },
  attendance: {
    label: 'Attendance',
    list: { title: 'employeeName', subtitle: 'date', meta: ['status'] },
    sections: [
      {
        title: 'Attendance Record',
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text' },
          { name: 'date', label: 'Date', type: 'date' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Present', 'Absent', 'Late', 'Leave'],
          },
          { name: 'checkIn', label: 'Check In', type: 'time' },
          { name: 'checkOut', label: 'Check Out', type: 'time' },
          { name: 'remarks', label: 'Remarks', type: 'textarea' },
        ],
      },
    ],
  },
  employees: {
    label: 'Employee',
    list: { title: 'fullName', subtitle: 'department', meta: ['phone'] },
    sections: [
      {
        title: 'Employee Details',
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'department', label: 'Department', type: 'text' },
          { name: 'designation', label: 'Designation', type: 'text' },
          { name: 'joiningDate', label: 'Joining Date', type: 'date' },
          { name: 'salary', label: 'Salary', type: 'number' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
          },
        ],
      },
    ],
  },
  summary: {
    label: 'Report Summary',
    list: { title: 'reportDate', subtitle: 'totalSales', meta: ['totalOrders'] },
    sections: [
      {
        title: 'Summary Report',
        fields: [
          { name: 'reportDate', label: 'Report Date', type: 'date' },
          { name: 'totalSales', label: 'Total Sales', type: 'number' },
          { name: 'totalOrders', label: 'Total Orders', type: 'number' },
          { name: 'totalCustomers', label: 'Total Customers', type: 'number' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ],
      },
    ],
  },
  'daily-closing': {
    label: 'Daily Closing',
    list: {
      title: 'closingDate',
      subtitle: 'cashInHand',
      meta: ['totalSales'],
    },
    sections: [
      {
        title: 'Daily Closing',
        fields: [
          { name: 'closingDate', label: 'Closing Date', type: 'date' },
          { name: 'cashInHand', label: 'Cash In Hand', type: 'number' },
          { name: 'totalSales', label: 'Total Sales', type: 'number' },
          { name: 'expenses', label: 'Expenses', type: 'number' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ],
      },
    ],
  },
  users: {
    label: 'User',
    list: { title: 'name', subtitle: 'email', meta: ['role', 'status'] },
    sections: [
      {
        title: 'User Account',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'role', label: 'Role', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
          },
        ],
      },
    ],
  },
  roles: {
    label: 'Role',
    list: { title: 'name', subtitle: 'slug', meta: ['status'] },
    sections: [
      {
        title: 'Role Details',
        fields: [
          { name: 'name', label: 'Role Name', type: 'text', required: true },
          { name: 'slug', label: 'Slug', type: 'text' },
          { name: 'permissions', label: 'Permissions', type: 'textarea' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
          },
        ],
      },
    ],
  },
}

const motionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' },
  }),
}

const dashboardRangeOptions = [
  { key: '7d', label: 'Last 7 Days', points: 7 },
  { key: '30d', label: 'Last 30 Days', points: 30 },
  { key: '90d', label: 'Last 90 Days', points: 90 },
  { key: 'all', label: 'All Time', points: null },
]

const dashboardCurrencyOptions = [
  { key: 'USD', symbol: '$', rate: 1 },
  { key: 'PKR', symbol: 'Rs ', rate: 278 },
  { key: 'EUR', symbol: 'EUR ', rate: 0.92 },
]

function App() {
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState('dashboard')
  const [moduleCache, setModuleCache] = useState({})
  const [moduleLoading, setModuleLoading] = useState(false)
  const [moduleError, setModuleError] = useState('')
  const [token, setToken] = useState(
    () => localStorage.getItem('auth_token') || '',
  )
  const [authUser, setAuthUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: defaultLoginEmail,
    password: '',
  })
  const [moduleSearch, setModuleSearch] = useState('')
  const [topSearch, setTopSearch] = useState('')
  const [dashboardRange, setDashboardRange] = useState('30d')
  const [dashboardCurrency, setDashboardCurrency] = useState('USD')
  const [dashboardReloadTick, setDashboardReloadTick] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isDashboardFilterOpen, setIsDashboardFilterOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [formData, setFormData] = useState({})
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [openGroups, setOpenGroups] = useState({
    installment: false,
    hr: false,
    reports: false,
    administration: false,
  })
  const notificationRef = useRef(null)
  const dashboardFilterRef = useRef(null)
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const apiFetch = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers,
    })
    if (response.status === 401) {
      handleLogout()
    }
    return response
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setToken('')
    setAuthUser(null)
    setActiveItem('dashboard')
    setIsNotificationOpen(false)
    setIsDashboardFilterOpen(false)
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setLoginError('')
    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      })
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      const payload = await response.json()
      if (payload?.token) {
        localStorage.setItem('auth_token', payload.token)
        setToken(payload.token)
        setAuthUser(payload.user || null)
      } else {
        throw new Error('Missing token')
      }
    } catch (error) {
      setLoginError('Email ya password sahi nahi hai.')
    }
  }

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const loadUser = async () => {
      if (!token) {
        setAuthLoading(false)
        return
      }

      setAuthLoading(true)
      try {
        const response = await apiFetch('/api/auth/me', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Unauthorized')
        }
        const payload = await response.json()
        if (mounted) {
          setAuthUser(payload.user || null)
        }
      } catch (error) {
        if (mounted) {
          handleLogout()
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    loadUser()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [apiBase, dashboardReloadTick, token])

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const load = async () => {
      if (!token) {
        if (mounted) {
          setLoading(false)
          setDashboard(fallbackDashboard)
        }
        return
      }

      try {
        const response = await apiFetch('/api/dashboard', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Failed to load dashboard')
        }
        const payload = await response.json()
        if (mounted) {
          setDashboard(payload)
        }
      } catch (error) {
        if (mounted) {
          setDashboard(fallbackDashboard)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [apiBase, token])

  useEffect(() => {
    if (activeItem === 'dashboard') {
      setModuleError('')
      setModuleLoading(false)
      return
    }

    const meta = pageMeta[activeItem]
    if (!meta?.endpoint) {
      return
    }

    if (moduleCache[activeItem]) {
      return
    }

    if (!token) {
      setModuleError('Please login to view this data.')
      return
    }

    let mounted = true
    const controller = new AbortController()

    const loadModule = async () => {
      setModuleLoading(true)
      setModuleError('')
      try {
        const response = await apiFetch(meta.endpoint, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Failed to load module data')
        }
        const payload = await response.json()
        const rows = Array.isArray(payload)
          ? payload
          : payload?.items || payload?.data || []
        if (mounted) {
          setModuleCache((prev) => ({ ...prev, [activeItem]: rows }))
        }
      } catch (error) {
        if (mounted) {
          setModuleError('Unable to load data from server.')
        }
      } finally {
        if (mounted) {
          setModuleLoading(false)
        }
      }
    }

    loadModule()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [activeItem, apiBase, moduleCache, token])

  useEffect(() => {
    setModuleSearch('')
    setTopSearch('')
    setIsNotificationOpen(false)
    setIsDashboardFilterOpen(false)
  }, [activeItem])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false)
      }
      if (
        dashboardFilterRef.current &&
        !dashboardFilterRef.current.contains(event.target)
      ) {
        setIsDashboardFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const selectedRangeOption =
    dashboardRangeOptions.find((item) => item.key === dashboardRange) ||
    dashboardRangeOptions[1]
  const selectedCurrencyOption =
    dashboardCurrencyOptions.find((item) => item.key === dashboardCurrency) ||
    dashboardCurrencyOptions[0]

  const parseNumber = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value !== 'string') return null
    const normalized = value.replace(/[^0-9.-]/g, '')
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  const formatCurrency = (value, compact = false) => {
    const numericValue = Number(value) || 0
    if (compact) {
      if (Math.abs(numericValue) >= 1_000_000) {
        return `${selectedCurrencyOption.symbol}${(numericValue / 1_000_000).toFixed(1)}m`
      }
      if (Math.abs(numericValue) >= 1_000) {
        return `${selectedCurrencyOption.symbol}${(numericValue / 1_000).toFixed(0)}k`
      }
    }
    return `${selectedCurrencyOption.symbol}${numericValue.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    })}`
  }

  const dashboardView = useMemo(() => {
    const rangePoints = selectedRangeOption.points
    const rate = selectedCurrencyOption.rate
    const symbol = selectedCurrencyOption.symbol
    const currencySensitive = /revenue|sales|amount|cash|price|balance|income|payment/i
    const sliceByRange = (rows) => {
      if (!Array.isArray(rows)) return []
      if (!rangePoints) return rows
      return rows.slice(Math.max(rows.length - rangePoints, 0))
    }
    const scaled = (value) => {
      const numeric = parseNumber(value)
      return numeric === null ? null : numeric * rate
    }

    const revenue = sliceByRange(dashboard.revenue).map((item) => ({
      ...item,
      current: scaled(item.current) ?? 0,
      previous: scaled(item.previous) ?? 0,
    }))

    const streams = sliceByRange(dashboard.streams).map((item) => ({
      ...item,
      amountNumeric: scaled(item.amount),
    }))

    const salesBreakdown = sliceByRange(dashboard.salesBreakdown).map((item) => ({
      ...item,
      value: scaled(item.value) ?? 0,
    }))

    const funnel = sliceByRange(dashboard.funnel)
    const kpis = dashboard.kpis.map((item) => {
      const shouldScale = currencySensitive.test(String(item.label || ''))
      const value = shouldScale ? scaled(item.value) : null
      return {
        ...item,
        displayValue:
          value === null
            ? item.value
            : `${symbol}${(Number(value) || 0).toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}`,
      }
    })

    return {
      ...dashboard,
      kpis,
      revenue,
      streams,
      funnel,
      salesBreakdown,
    }
  }, [
    dashboard,
    selectedCurrencyOption.rate,
    selectedCurrencyOption.symbol,
    selectedRangeOption.points,
  ])

  const revenueMax = useMemo(() => {
    const values = dashboardView.revenue.map((item) => Number(item.current) || 0)
    return Math.max(...values, 16000)
  }, [dashboardView.revenue])

  const breakdownMax = useMemo(() => {
    const values = dashboardView.salesBreakdown.map((item) => Number(item.value) || 0)
    return Math.max(...values, 1)
  }, [dashboardView.salesBreakdown])

  const currentPage = pageMeta[activeItem] || pageMeta.dashboard
  const moduleRows = moduleCache[activeItem] || []
  const moduleFormConfig = moduleFormMap[activeItem]
  const moduleLabel = moduleFormConfig?.label || currentPage.title
  const listConfig = moduleFormConfig?.list
  const isCnicLookup = activeItem === 'cnic'
  const dashboardSearchTerm = topSearch.trim().toLowerCase()

  const notificationItems = useMemo(() => {
    if (Array.isArray(dashboard.notifications)) {
      return dashboard.notifications.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `notif-${index}`,
            title: item,
            detail: 'New update',
          }
        }
        return {
          id: item.id || `notif-${index}`,
          title: item.title || item.message || 'Notification',
          detail: item.detail || item.time || 'New update',
        }
      })
    }

    const count = Number(dashboard.notifications) || 0
    return Array.from({ length: count }, (_, index) => ({
      id: `notif-${index}`,
      title: `Notification ${index + 1}`,
      detail: 'System update available',
    }))
  }, [dashboard.notifications])

  const notificationCount = notificationItems.length

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') {
      const text = JSON.stringify(value)
      return text.length > 60 ? `${text.slice(0, 60)}...` : text
    }
    return String(value)
  }

  const ignoreFieldPattern =
    /(photo|image|cnicfront|cnicback|avatar|logo|attachment|file)/i

  const toLabel = (key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())

  const derivedFields = useMemo(() => {
    if (!moduleRows.length) return []
    const sample = moduleRows[0]
    if (!sample || typeof sample !== 'object') return []
    return Object.keys(sample)
      .filter((key) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key))
      .filter((key) => !ignoreFieldPattern.test(key))
      .map((key) => {
        const value = sample[key]
        let type = 'text'
        if (typeof value === 'number') type = 'number'
        if (typeof value === 'boolean') type = 'select'
        if (key.toLowerCase().includes('date')) type = 'date'
        return {
          name: key,
          label: toLabel(key),
          type,
          options:
            type === 'select' && typeof value === 'boolean'
              ? ['true', 'false']
              : undefined,
        }
      })
  }, [moduleRows])

  const formSections = useMemo(() => {
    if (moduleFormConfig?.sections?.length) {
      return moduleFormConfig.sections
    }
    if (derivedFields.length) {
      return [{ title: 'Details', fields: derivedFields }]
    }
    return []
  }, [moduleFormConfig, derivedFields])

  const canCreate = currentPage.allowCreate !== false && formSections.length > 0
  const canEdit = currentPage.allowEdit !== false
  const canDelete = currentPage.allowDelete !== false

  const filteredRows = useMemo(() => {
    if (!moduleSearch) return moduleRows
    const term = moduleSearch.toLowerCase()
    return moduleRows.filter((row) =>
      JSON.stringify(row || {})
        .toLowerCase()
        .includes(term),
    )
  }, [moduleRows, moduleSearch])

  const cnicSearchTerm = String(moduleSearch || '').replace(/\D/g, '')

  const cnicRows = useMemo(() => {
    if (!cnicSearchTerm) return []
    const normalize = (value) => String(value || '').replace(/\D/g, '')
    return moduleRows.filter((row) =>
      normalize(row?.cnic).includes(cnicSearchTerm),
    )
  }, [cnicSearchTerm, moduleRows])

  const moduleRecordCount = isCnicLookup ? cnicRows.length : filteredRows.length

  const dashboardSearchResults = useMemo(() => {
    if (!dashboardSearchTerm) return []
    const symbol = selectedCurrencyOption.symbol

    const toText = (value) => {
      if (value === null || value === undefined) return '-'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    }

    const results = []
    const addResult = (section, label, value, extra = '') => {
      const text = `${section} ${label} ${value} ${extra}`.toLowerCase()
      if (text.includes(dashboardSearchTerm)) {
        results.push({
          id: `${section}-${label}-${results.length}`,
          section,
          label,
          value: toText(value),
          extra: toText(extra),
        })
      }
    }

    dashboardView.kpis.forEach((item) => {
      addResult('KPI', item.label, item.displayValue || item.value, item.delta)
    })
    dashboardView.streams.forEach((item) => {
      addResult(
        'Revenue Stream',
        item.label,
        item.amountNumeric === null
          ? item.amount
          : `${symbol}${(Number(item.amountNumeric) || 0).toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}`,
        `${item.share || 0}%`,
      )
    })
    dashboardView.funnel.forEach((item) => {
      addResult('Sales Funnel', item.name, item.value)
    })
    dashboardView.salesBreakdown.forEach((item) => {
      addResult('Sales Breakdown', item.name, item.value)
    })
    dashboardView.revenue.forEach((item) => {
      addResult('Revenue', item.name, item.current, item.previous)
    })

    return results.slice(0, 40)
  }, [dashboardSearchTerm, dashboardView, selectedCurrencyOption.symbol])

  const handleToggle = (key, defaultChild) => {
    const isOpen = openGroups[key]
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
    if (!isOpen && defaultChild) {
      setActiveItem(defaultChild)
    }
  }

  const handleDashboardRefresh = () => {
    setLoading(true)
    setDashboardReloadTick((prev) => prev + 1)
    setIsDashboardFilterOpen(false)
  }

  const getRowId = (row) => row?._id || row?.id

  const openForm = (mode, row = null) => {
    const initialData = {}
    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (ignoreFieldPattern.test(field.name)) return
        initialData[field.name] =
          row && row[field.name] !== undefined ? row[field.name] : ''
      })
    })
    setFormData(initialData)
    setFormMode(mode)
    setEditingRow(row)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormError('')
    setEditingRow(null)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const refreshModule = () => {
    setModuleCache((prev) => {
      const next = { ...prev }
      delete next[activeItem]
      return next
    })
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    const meta = pageMeta[activeItem]
    if (!meta?.endpoint) return
    if (formMode === 'create' && !canCreate) {
      setFormError('Create is disabled for this module.')
      return
    }
    if (formMode === 'edit' && !canEdit) {
      setFormError('Edit is disabled for this module.')
      return
    }
    setFormSaving(true)
    setFormError('')
    try {
      const rowId = editingRow ? getRowId(editingRow) : null
      const method = formMode === 'edit' && rowId ? 'PUT' : 'POST'
      const endpoint =
        formMode === 'edit' && rowId ? `${meta.endpoint}/${rowId}` : meta.endpoint
      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        throw new Error('Failed to save')
      }
      closeForm()
      refreshModule()
    } catch (error) {
      setFormError('Save failed. Please try again.')
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async (row) => {
    const meta = pageMeta[activeItem]
    if (!meta?.endpoint) return
    if (!canDelete) {
      setModuleError('Delete is disabled for this module.')
      return
    }
    const rowId = getRowId(row)
    if (!rowId) return
    const confirmed = window.confirm('Delete this record?')
    if (!confirmed) return
    try {
      const response = await apiFetch(`${meta.endpoint}/${rowId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Delete failed')
      }
      refreshModule()
    } catch (error) {
      setModuleError('Unable to delete record.')
    }
  }

  const getDisplayKeys = (row) => {
    if (!row || typeof row !== 'object') return []
    return Object.keys(row).filter(
      (key) =>
        !['_id', '__v', 'createdAt', 'updatedAt'].includes(key) &&
        !ignoreFieldPattern.test(key),
    )
  }

  const getPrimaryValue = (row) => {
    if (listConfig?.title && row?.[listConfig.title] !== undefined) {
      return formatValue(row[listConfig.title])
    }
    const keys = getDisplayKeys(row)
    return keys.length ? formatValue(row[keys[0]]) : 'Record'
  }

  const getSecondaryValue = (row) => {
    if (listConfig?.subtitle && row?.[listConfig.subtitle] !== undefined) {
      return formatValue(row[listConfig.subtitle])
    }
    const keys = getDisplayKeys(row)
    return keys.length > 1 ? formatValue(row[keys[1]]) : ''
  }

  const getMetaValues = (row) => {
    if (listConfig?.meta?.length) {
      return listConfig.meta
        .map((key) => row?.[key])
        .filter((value) => value !== undefined && value !== null)
    }
    const keys = getDisplayKeys(row)
    return keys.slice(2, 4).map((key) => row[key])
  }

  const displayName = authUser?.name || dashboard.profile?.name || 'Admin'
  const displayRole = authUser?.role || dashboard.profile?.role || 'Super Admin'

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-brand">
            <div className="brand-logo" />
            <div>
              <p className="brand-title">karim</p>
              <p className="brand-subtitle">electronics</p>
            </div>
          </div>
          <div className="empty-state">Checking session...</div>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-brand">
            <div className="brand-logo" />
            <div>
              <p className="brand-title">karim</p>
              <p className="brand-subtitle">electronics</p>
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">
            Super admin panel access ke liye login karein.
          </p>
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="admin@gmail.com"
                value={loginForm.email}
                onChange={handleLoginChange}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="********"
                value={loginForm.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError && <div className="auth-error">{loginError}</div>}
            <button className="primary-btn" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-logo" />
            <div>
              <p className="brand-title">karim</p>
              <p className="brand-subtitle">electronics</p>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="sidebar-scroll">
          <nav className="nav">
            {navItems.map((item) => {
              const Icon = item.icon
              const hasChildren = Boolean(item.children)
              const childActive = item.children?.some(
                (child) => child.key === activeItem,
              )
              const isOpen = openGroups[item.key] || childActive

              if (hasChildren) {
                return (
                  <div key={item.key} className="nav-group">
                    <button
                      className={`nav-item ${childActive ? 'active' : ''}`}
                      onClick={() =>
                        handleToggle(item.key, item.children?.[0]?.key)
                      }
                      type="button"
                    >
                      <span className="nav-icon">
                        <Icon />
                      </span>
                      {item.label}
                      <FiChevronDown
                        className={`chevron ${isOpen ? 'open' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="nav-sublist">
                        {item.children.map((child) => (
                          <button
                            key={child.key}
                            className={`nav-subitem ${
                              activeItem === child.key ? 'active' : ''
                            }`}
                            onClick={() => setActiveItem(child.key)}
                            type="button"
                          >
                            <span className="sub-indicator" />
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <button
                  key={item.key}
                  className={`nav-item ${
                    activeItem === item.key ? 'active' : ''
                  }`}
                  onClick={() => setActiveItem(item.key)}
                  type="button"
                >
                  <span className="nav-icon">
                    <Icon />
                  </span>
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="admin-card">
          <div className="admin-left">
            <div className="avatar">A</div>
            <div>
              <p className="profile-name">{displayName}</p>
              <p className="profile-role">{displayRole}</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar glass">
          <div className="search">
            <FiSearch />
            <input
              type="text"
              placeholder={
                activeItem === 'dashboard'
                  ? 'Search dashboard metrics...'
                  : `Search ${moduleLabel.toLowerCase()}...`
              }
              value={activeItem === 'dashboard' ? topSearch : moduleSearch}
              onChange={(event) => {
                const { value } = event.target
                if (activeItem === 'dashboard') {
                  setTopSearch(value)
                } else {
                  setModuleSearch(value)
                }
              }}
            />
          </div>
          <div className="topbar-actions">
            <div className="notification-wrap" ref={notificationRef}>
              <button
                className="icon-button"
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                aria-label="Toggle notifications"
              >
                <FiBell />
                {notificationCount > 0 && (
                  <span className="badge">{notificationCount}</span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="notifications-popover glass">
                  <div className="notifications-head">
                    <strong>Notifications</strong>
                    <span>{notificationCount}</span>
                  </div>
                  {notificationCount === 0 ? (
                    <p className="notifications-empty">No new notifications.</p>
                  ) : (
                    <div className="notifications-list">
                      {notificationItems.map((item) => (
                        <div key={item.id} className="notification-item">
                          <p>{item.title}</p>
                          <span>{item.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="profile">
              <div className="avatar">SA</div>
              <div>
                <p className="profile-name">{displayName}</p>
                <p className="profile-role">{displayRole}</p>
              </div>
              <FiChevronDown />
            </div>
          </div>
        </header>

                <section className="hero">
          <div>
            <h1>{currentPage.title}</h1>
            <p className="subtitle">{currentPage.subtitle}</p>
          </div>
          {activeItem === "dashboard" && (
            <div className="filters-wrap" ref={dashboardFilterRef}>
              <button
                className="filters glass"
                type="button"
                onClick={() => setIsDashboardFilterOpen((prev) => !prev)}
              >
                <span>{selectedRangeOption.label}</span>
                <span className="dot">|</span>
                <span>{loading ? 'Syncing' : 'Now'}</span>
                <span className="dot">|</span>
                <span>{selectedCurrencyOption.key}</span>
                <FiChevronDown className={isDashboardFilterOpen ? 'open' : ''} />
              </button>
              {isDashboardFilterOpen && (
                <div className="filters-menu glass">
                  <div className="filters-group">
                    <p>Range</p>
                    {dashboardRangeOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`filters-option ${
                          dashboardRange === option.key ? 'active' : ''
                        }`}
                        onClick={() => {
                          setDashboardRange(option.key)
                          setIsDashboardFilterOpen(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="filters-group">
                    <p>Currency</p>
                    {dashboardCurrencyOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`filters-option ${
                          dashboardCurrency === option.key ? 'active' : ''
                        }`}
                        onClick={() => {
                          setDashboardCurrency(option.key)
                          setIsDashboardFilterOpen(false)
                        }}
                      >
                        {option.key}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="filters-option refresh"
                    onClick={handleDashboardRefresh}
                  >
                    Refresh Now
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

                        {activeItem === 'dashboard' ? (
          dashboardSearchTerm ? (
            dashboardSearchResults.length === 0 ? (
              <div className="empty-state">No dashboard results for this search.</div>
            ) : (
              <section className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Label</th>
                      <th>Value</th>
                      <th>Extra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardSearchResults.map((item) => (
                      <tr key={item.id}>
                        <td>{item.section}</td>
                        <td>{item.label}</td>
                        <td>{item.value}</td>
                        <td>{item.extra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )
          ) : dashboardView.kpis.length === 0 &&
            dashboardView.revenue.length === 0 &&
            dashboardView.funnel.length === 0 &&
            dashboardView.salesBreakdown.length === 0 ? (
            <div className="empty-state">No dashboard data available.</div>
          ) : (
          <>
<section className="kpi-grid">
          {dashboardView.kpis.map((item, index) => (
            <motion.article
              className="kpi-card glass"
              key={item.label}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={motionVariants}
            >
              <div className="kpi-head">
                <p>{item.label}</p>
                <span
                  className={`delta ${
                    item.trend === 'down' ? 'down' : 'up'
                  }`}
                >
                  {item.delta}
                </span>
              </div>
              <h3>{item.displayValue || item.value}</h3>
              <p className="kpi-note">Updated just now</p>
            </motion.article>
          ))}
        </section>

        <section className="grid-main">
          <motion.article
            className="card glass"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={motionVariants}
          >
          <div className="card-head">
            <div>
              <h2>Revenue</h2>
              <p className="muted-text">Year over year performance</p>
            </div>
            <button className="ghost">Full Report</button>
          </div>
          <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardView.revenue}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8f97b3', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, revenueMax]}
                    tickFormatter={(value) => formatCurrency(value, true)}
                    tick={{ fill: '#8f97b3', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(12, 16, 28, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#d6ddff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#9AA5FF"
                    strokeWidth={2}
                    dot={false}
                    opacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#5A7CFF"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="streams">
              {dashboardView.streams.map((stream) => (
                <div key={stream.label} className="stream">
                  <div>
                    <p>{stream.label}</p>
                    <span>
                      {stream.amountNumeric === null
                        ? stream.amount
                        : formatCurrency(stream.amountNumeric)}
                    </span>
                  </div>
                  <div className="progress">
                    <div style={{ width: `${stream.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            className="card glass highlight"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={motionVariants}
          >
            <div className="card-head">
              <div>
                <h2>Advancement Forecast</h2>
                <p className="muted-text">Debt completion and retention</p>
              </div>
              <button className="ghost">Details</button>
            </div>
            <div className="progress-grid">
              <div className="progress-circle">
                <div className="ring">
                  <span>61.4%</span>
                </div>
                <p>Debt completed</p>
                <span className="muted-text">1,685 of 2,580 orders</span>
              </div>
              <div className="progress-circle">
                <div className="ring alt">
                  <span>58.2%</span>
                </div>
                <p>Customer retention</p>
                <span className="muted-text">996 of 1,665 users</span>
              </div>
            </div>
            <div className="insight">
              <span>+</span>
              <p>
                Retention is on track to exceed forecast by{' '}
                <strong>4.1%</strong>.
              </p>
            </div>
          </motion.article>

          <motion.article
            className="card glass"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={motionVariants}
          >
            <div className="card-head">
              <div>
                <h2>Sales Funnel</h2>
                <p className="muted-text">Visitor to order conversion</p>
              </div>
              <button className="ghost">Full Report</button>
            </div>
            <div className="chart-wrap small">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardView.funnel} barSize={22}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8f97b3', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8f97b3', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(12, 16, 28, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#d6ddff' }}
                  />
                  <Bar dataKey="value" fill="#6D8CFF" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="funnel-stats">
              {dashboardView.funnel.map((item) => (
                <div key={item.name}>
                  <p>{item.name}</p>
                  <span>{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            className="card glass"
            custom={3}
            initial="hidden"
            animate="visible"
            variants={motionVariants}
          >
            <div className="card-head">
              <div>
                <h2>Sales Breakdown</h2>
                <p className="muted-text">Category contribution</p>
              </div>
              <button className="ghost">Full Report</button>
            </div>
            <div className="breakdown">
              {dashboardView.salesBreakdown.map((item) => (
                <div key={item.name} className="breakdown-row">
                  <span>{item.name}</span>
                  <div className="breakdown-bar">
                    <div
                      style={{
                        width: `${Math.min(100, (item.value / breakdownMax) * 100)}%`,
                      }}
                    />
                  </div>
                  <strong>{formatCurrency(item.value)}</strong>
                </div>
              ))}
            </div>
          </motion.article>
        </section>
          </>
        )
        ) : (
          <section className="module-grid">
            <div className="module-toolbar">
              <div className="module-search glass">
                <FiSearch />
                <input
                  type="text"
                  placeholder={
                    isCnicLookup
                      ? 'Search customer by CNIC...'
                      : `Search ${moduleLabel.toLowerCase()}...`
                  }
                  value={moduleSearch}
                  onChange={(event) => setModuleSearch(event.target.value)}
                />
              </div>
              {!isCnicLookup && canCreate && (
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => openForm('create')}
                >
                  <FiPlus /> New {moduleLabel}
                </button>
              )}
            </div>
            {moduleLoading ? (
              <div className="empty-state">Loading data...</div>
            ) : moduleError ? (
              <div className="empty-state">{moduleError}</div>
            ) : isCnicLookup ? (
              !cnicSearchTerm ? (
                <div className="empty-state">CNIC enter karein to customer search ho ga.</div>
              ) : cnicRows.length === 0 ? (
                <div className="empty-state">Is CNIC par koi customer nahi mila.</div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>CNIC</th>
                        <th>Phone</th>
                        <th>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cnicRows.map((row) => {
                        const rowId = getRowId(row)
                        return (
                          <tr key={rowId || `${row.fullName || row.name}-${row.cnic}`}>
                            <td>{formatValue(row.fullName || row.customerName || row.name)}</td>
                            <td>{formatValue(row.cnic)}</td>
                            <td>{formatValue(row.primaryPhone || row.phone)}</td>
                            <td>{formatValue(row.address)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredRows.length === 0 ? (
              <div className="empty-state">No records found.</div>
            ) : (
              <div className="module-list">
                {filteredRows.map((row) => {
                  const primary = getPrimaryValue(row)
                  const secondary = getSecondaryValue(row)
                  const metaValues = getMetaValues(row)
                  const rowId = getRowId(row)
                  return (
                    <div key={rowId || primary} className="module-row glass">
                      <div className="row-avatar">
                        {String(primary).charAt(0).toUpperCase()}
                      </div>
                      <div className="row-main">
                        <p className="row-title">{primary}</p>
                        <p className="row-sub">{secondary}</p>
                      </div>
                      <div className="row-meta">
                        {metaValues.map((item, index) => (
                          <span key={index}>{formatValue(item)}</span>
                        ))}
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => openForm('view', row)}
                        >
                          <FiEye />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => openForm('edit', row)}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => handleDelete(row)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        <section className="footer-note">
          {activeItem === "dashboard"
            ? loading
              ? "Syncing live metrics..."
              : dashboardSearchTerm
                ? `${dashboardSearchResults.length} results found.`
                : "All metrics are up to date."
            : moduleLoading
              ? "Loading records..."
              : `${moduleRecordCount} records loaded.`}
        </section>

        {isFormOpen && (
          <div className="modal">
            <div className="modal-backdrop" onClick={closeForm} />
            <div className="modal-card glass">
              <div className="modal-header">
                <div>
                  <h2>
                    {formMode === 'edit'
                      ? `Edit ${moduleLabel}`
                      : formMode === 'view'
                        ? `${moduleLabel} Details`
                        : `New ${moduleLabel}`}
                  </h2>
                  <p className="muted-text">{currentPage.subtitle}</p>
                </div>
                <button className="icon-button" type="button" onClick={closeForm}>
                  <FiX />
                </button>
              </div>
              <form className="modal-body" onSubmit={handleFormSubmit}>
                {formSections.length === 0 && (
                  <div className="empty-state">No form schema available.</div>
                )}
                {formSections.map((section) => (
                  <div key={section.title} className="form-section">
                    <h3>{section.title}</h3>
                    <div className="form-grid">
                      {section.fields
                        .filter((field) => !ignoreFieldPattern.test(field.name))
                        .map((field) => (
                          <label key={field.name} className="form-field">
                            <span>
                              {field.label}
                              {field.required ? ' *' : ''}
                            </span>
                            {field.type === 'select' ? (
                              <select
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleFormChange}
                                disabled={formMode === 'view'}
                              >
                                <option value="">Select</option>
                                {(field.options || []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'textarea' ? (
                              <textarea
                                name={field.name}
                                rows={3}
                                value={formData[field.name] || ''}
                                onChange={handleFormChange}
                                disabled={formMode === 'view'}
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleFormChange}
                                disabled={formMode === 'view'}
                              />
                            )}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
                {formError && <div className="auth-error">{formError}</div>}
                <div className="modal-footer">
                  <button
                    className="ghost"
                    type="button"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  {formMode !== 'view' && (formMode === 'edit' ? canEdit : canCreate) && (
                    <button className="primary-btn" type="submit" disabled={formSaving}>
                      {formSaving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App











