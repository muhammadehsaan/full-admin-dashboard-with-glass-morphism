import { useEffect, useMemo, useState } from 'react'
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
    subtitle: 'Verify customer CNICs and match stock availability.',
    endpoint: '/api/cnic-checks',
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
    label: 'CNIC Check',
    list: { title: 'customerName', subtitle: 'cnic', meta: ['status'] },
    sections: [
      {
        title: 'CNIC Check',
        fields: [
          { name: 'customerName', label: 'Customer Name', type: 'text' },
          { name: 'cnic', label: 'CNIC', type: 'text', required: true },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Verified', 'Pending', 'Rejected'],
          },
          { name: 'remarks', label: 'Remarks', type: 'textarea' },
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
  const [isFormOpen, setIsFormOpen] = useState(false)
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
  }, [apiBase, token])

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
  }, [activeItem])

  const revenueMax = useMemo(() => {
    const values = dashboard.revenue.map((item) => item.current)
    return Math.max(...values, 16000)
  }, [dashboard.revenue])

  const currentPage = pageMeta[activeItem] || pageMeta.dashboard
  const moduleRows = moduleCache[activeItem] || []
  const moduleFormConfig = moduleFormMap[activeItem]
  const moduleLabel = moduleFormConfig?.label || currentPage.title
  const listConfig = moduleFormConfig?.list

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

  const filteredRows = useMemo(() => {
    if (!moduleSearch) return moduleRows
    const term = moduleSearch.toLowerCase()
    return moduleRows.filter((row) =>
      JSON.stringify(row || {})
        .toLowerCase()
        .includes(term),
    )
  }, [moduleRows, moduleSearch])

  const handleToggle = (key, defaultChild) => {
    const isOpen = openGroups[key]
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
    if (!isOpen && defaultChild) {
      setActiveItem(defaultChild)
    }
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
              placeholder="Search orders, products, customers..."
            />
          </div>
          <div className="topbar-actions">
            <button className="icon-button">
              <FiBell />
              {dashboard.notifications > 0 && (
                <span className="badge">{dashboard.notifications}</span>
              )}
            </button>
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
            <div className="filters glass">
              <span>Last 30 Days</span>
              <span className="dot">|</span>
              <span>Now</span>
              <span className="dot">|</span>
              <span>USD</span>
              <FiChevronDown />
            </div>
          )}
        </section>

                        {activeItem === 'dashboard' ? (
          dashboard.kpis.length === 0 &&
          dashboard.revenue.length === 0 &&
          dashboard.funnel.length === 0 &&
          dashboard.salesBreakdown.length === 0 ? (
            <div className="empty-state">No dashboard data available.</div>
          ) : (
          <>
<section className="kpi-grid">
          {dashboard.kpis.map((item, index) => (
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
              <h3>{item.value}</h3>
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
                <LineChart data={dashboard.revenue}>
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
                    tickFormatter={(value) => `$${value / 1000}k`}
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
              {dashboard.streams.map((stream) => (
                <div key={stream.label} className="stream">
                  <div>
                    <p>{stream.label}</p>
                    <span>{stream.amount}</span>
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
                <BarChart data={dashboard.funnel} barSize={22}>
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
              {dashboard.funnel.map((item) => (
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
              {dashboard.salesBreakdown.map((item) => (
                <div key={item.name} className="breakdown-row">
                  <span>{item.name}</span>
                  <div className="breakdown-bar">
                    <div
                      style={{
                        width: `${Math.min(100, (item.value / 60000) * 100)}%`,
                      }}
                    />
                  </div>
                  <strong>${item.value.toLocaleString()}</strong>
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
                  placeholder={`Search ${moduleLabel.toLowerCase()}...`}
                  value={moduleSearch}
                  onChange={(event) => setModuleSearch(event.target.value)}
                />
              </div>
              <button
                className="primary-btn"
                type="button"
                onClick={() => openForm("create")}
              >
                <FiPlus /> New {moduleLabel}
              </button>
            </div>
            {moduleLoading ? (
              <div className="empty-state">Loading data...</div>
            ) : moduleError ? (
              <div className="empty-state">{moduleError}</div>
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
                          onClick={() => openForm("view", row)}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => openForm("edit", row)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDelete(row)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>          )}

        <section className="footer-note">
          {activeItem === "dashboard"
            ? loading
              ? "Syncing live metrics..."
              : "All metrics are up to date."
            : moduleLoading
              ? "Loading records..."
              : `${filteredRows.length} records loaded.`}
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
                  {formMode !== 'view' && (
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











