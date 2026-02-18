require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const mongoUri = process.env.MONGODB_URI
let DashboardModel = null
const modelCache = {}
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me'

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set. Using a dev-only default secret.')
}

if (mongoUri) {
  const dashboardSchema = new mongoose.Schema(
    {
      kpis: { type: Array, default: [] },
      revenue: { type: Array, default: [] },
      streams: { type: Array, default: [] },
      funnel: { type: Array, default: [] },
      salesBreakdown: { type: Array, default: [] },
      notifications: { type: Number, default: 0 },
      profile: { type: Object, default: {} },
    },
    { collection: 'dashboard', minimize: false },
  )

  DashboardModel = mongoose.model('Dashboard', dashboardSchema)

  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected')
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message)
    })
} else {
  console.warn('MONGODB_URI not set. Using fallback dashboard data.')
}

const getCollectionModel = (collection) => {
  const modelName = `Collection_${collection}`
  if (modelCache[modelName]) {
    return modelCache[modelName]
  }

  const schema = new mongoose.Schema({}, { strict: false, collection })
  const model = mongoose.model(modelName, schema)
  modelCache[modelName] = model
  return model
}

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      name: user.name || user.fullName || 'Admin',
      email: user.email || user.username,
      role: user.role || 'Admin',
    },
    jwtSecret,
    { expiresIn: '7d' },
  )

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    req.user = jwt.verify(token, jwtSecret)
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const listHandler = (collection) => async (req, res) => {
  if (!mongoUri || mongoose.connection.readyState !== 1) {
    res.json([])
    return
  }

  const limit = Math.min(Number(req.query.limit) || 25, 200)
  try {
    const model = getCollectionModel(collection)
    const docs = await model.find().limit(limit).lean()
    res.json(docs)
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch data.' })
  }
}

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return {}
  const { _id, __v, createdAt, updatedAt, ...rest } = payload
  return rest
}

const createHandler = (collection) => async (req, res) => {
  if (!mongoUri || mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database not connected.' })
    return
  }
  try {
    const model = getCollectionModel(collection)
    const doc = await model.create(sanitizePayload(req.body))
    res.json(doc)
  } catch (error) {
    res.status(500).json({ error: 'Unable to create record.' })
  }
}

const updateHandler = (collection) => async (req, res) => {
  if (!mongoUri || mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database not connected.' })
    return
  }
  try {
    const model = getCollectionModel(collection)
    const doc = await model.findByIdAndUpdate(
      req.params.id,
      sanitizePayload(req.body),
      { new: true },
    )
    if (!doc) {
      res.status(404).json({ error: 'Record not found.' })
      return
    }
    res.json(doc)
  } catch (error) {
    res.status(500).json({ error: 'Unable to update record.' })
  }
}

const deleteHandler = (collection) => async (req, res) => {
  if (!mongoUri || mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database not connected.' })
    return
  }
  try {
    const model = getCollectionModel(collection)
    const doc = await model.findByIdAndDelete(req.params.id)
    if (!doc) {
      res.status(404).json({ error: 'Record not found.' })
      return
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete record.' })
  }
}

const collections = {
  vendors: process.env.COLLECTION_VENDORS || 'vendors',
  customers: process.env.COLLECTION_CUSTOMERS || 'customers',
  guarantors: process.env.COLLECTION_GUARANTORS || 'guarantors',
  inventory: process.env.COLLECTION_INVENTORY || 'inventory',
  cnicChecks: process.env.COLLECTION_CNIC_CHECKS || 'cnic_checks',
  installmentPlans:
    process.env.COLLECTION_INSTALLMENT_PLANS || 'installment_plans',
  attendance: process.env.COLLECTION_ATTENDANCE || 'attendance',
  employees: process.env.COLLECTION_EMPLOYEES || 'employees',
  reportSummary: process.env.COLLECTION_REPORT_SUMMARY || 'report_summary',
  reportDaily: process.env.COLLECTION_REPORT_DAILY || 'report_daily_closing',
  users: process.env.COLLECTION_USERS || 'users',
  roles: process.env.COLLECTION_ROLES || 'roles',
}

const emptyDashboard = {
  kpis: [],
  revenue: [],
  streams: [],
  funnel: [],
  salesBreakdown: [],
  notifications: 0,
  profile: { name: '', role: '' },
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required.' })
    return
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  let user = null
  let passwordValid = false

  if (mongoUri && mongoose.connection.readyState === 1) {
    try {
      const usersModel = getCollectionModel(collections.users)
      user = await usersModel.findOne({ email: normalizedEmail }).lean()
      if (user?.passwordHash) {
        passwordValid = await bcrypt.compare(password, user.passwordHash)
      } else if (user?.password) {
        passwordValid = user.password === password
      }
    } catch (error) {
      console.error('Login query failed:', error.message)
    }
  }

  if (!passwordValid) {
    const envEmail = process.env.ADMIN_EMAIL
    const envPassword = process.env.ADMIN_PASSWORD
    if (
      envEmail &&
      envPassword &&
      normalizedEmail === envEmail.toLowerCase() &&
      password === envPassword
    ) {
      user = {
        _id: 'env-admin',
        name: process.env.ADMIN_NAME || 'Admin',
        email: envEmail,
        role: 'Super Admin',
      }
      passwordValid = true
    }
  }

  if (!passwordValid || !user) {
    res.status(401).json({ error: 'Invalid credentials.' })
    return
  }

  const token = signToken(user)
  res.json({
    token,
    user: {
      name: user.name || user.fullName || 'Admin',
      email: user.email || normalizedEmail,
      role: user.role || 'Super Admin',
    },
  })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

app.get('/api/dashboard', requireAuth, (req, res) => {
  if (DashboardModel && mongoose.connection.readyState === 1) {
    DashboardModel.findOne()
      .lean()
      .then((doc) => {
        if (doc) {
          res.json(doc)
        } else {
          res.json(emptyDashboard)
        }
      })
      .catch(() => {
        res.json(emptyDashboard)
      })
    return
  }

  res.json(emptyDashboard)
})

app.get('/api/vendors', requireAuth, listHandler(collections.vendors))
app.get('/api/customers', requireAuth, listHandler(collections.customers))
app.get('/api/guarantors', requireAuth, listHandler(collections.guarantors))
app.get('/api/inventory', requireAuth, listHandler(collections.inventory))
app.get('/api/cnic-checks', requireAuth, listHandler(collections.cnicChecks))
app.get('/api/installment-plans', requireAuth, listHandler(collections.installmentPlans))
app.get('/api/attendance', requireAuth, listHandler(collections.attendance))
app.get('/api/employees', requireAuth, listHandler(collections.employees))
app.get('/api/reports/summary', requireAuth, listHandler(collections.reportSummary))
app.get('/api/reports/daily-closing', requireAuth, listHandler(collections.reportDaily))
app.get('/api/users', requireAuth, listHandler(collections.users))
app.get('/api/roles', requireAuth, listHandler(collections.roles))

app.post('/api/vendors', requireAuth, createHandler(collections.vendors))
app.post('/api/customers', requireAuth, createHandler(collections.customers))
app.post('/api/guarantors', requireAuth, createHandler(collections.guarantors))
app.post('/api/inventory', requireAuth, createHandler(collections.inventory))
app.post('/api/cnic-checks', requireAuth, createHandler(collections.cnicChecks))
app.post('/api/installment-plans', requireAuth, createHandler(collections.installmentPlans))
app.post('/api/attendance', requireAuth, createHandler(collections.attendance))
app.post('/api/employees', requireAuth, createHandler(collections.employees))
app.post('/api/reports/summary', requireAuth, createHandler(collections.reportSummary))
app.post('/api/reports/daily-closing', requireAuth, createHandler(collections.reportDaily))
app.post('/api/users', requireAuth, createHandler(collections.users))
app.post('/api/roles', requireAuth, createHandler(collections.roles))

app.put('/api/vendors/:id', requireAuth, updateHandler(collections.vendors))
app.put('/api/customers/:id', requireAuth, updateHandler(collections.customers))
app.put('/api/guarantors/:id', requireAuth, updateHandler(collections.guarantors))
app.put('/api/inventory/:id', requireAuth, updateHandler(collections.inventory))
app.put('/api/cnic-checks/:id', requireAuth, updateHandler(collections.cnicChecks))
app.put('/api/installment-plans/:id', requireAuth, updateHandler(collections.installmentPlans))
app.put('/api/attendance/:id', requireAuth, updateHandler(collections.attendance))
app.put('/api/employees/:id', requireAuth, updateHandler(collections.employees))
app.put('/api/reports/summary/:id', requireAuth, updateHandler(collections.reportSummary))
app.put('/api/reports/daily-closing/:id', requireAuth, updateHandler(collections.reportDaily))
app.put('/api/users/:id', requireAuth, updateHandler(collections.users))
app.put('/api/roles/:id', requireAuth, updateHandler(collections.roles))

app.delete('/api/vendors/:id', requireAuth, deleteHandler(collections.vendors))
app.delete('/api/customers/:id', requireAuth, deleteHandler(collections.customers))
app.delete('/api/guarantors/:id', requireAuth, deleteHandler(collections.guarantors))
app.delete('/api/inventory/:id', requireAuth, deleteHandler(collections.inventory))
app.delete('/api/cnic-checks/:id', requireAuth, deleteHandler(collections.cnicChecks))
app.delete('/api/installment-plans/:id', requireAuth, deleteHandler(collections.installmentPlans))
app.delete('/api/attendance/:id', requireAuth, deleteHandler(collections.attendance))
app.delete('/api/employees/:id', requireAuth, deleteHandler(collections.employees))
app.delete('/api/reports/summary/:id', requireAuth, deleteHandler(collections.reportSummary))
app.delete('/api/reports/daily-closing/:id', requireAuth, deleteHandler(collections.reportDaily))
app.delete('/api/users/:id', requireAuth, deleteHandler(collections.users))
app.delete('/api/roles/:id', requireAuth, deleteHandler(collections.roles))

app.listen(port, () => {
  console.log(`Dashboard API running on port ${port}`)
})
