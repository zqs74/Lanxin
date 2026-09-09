// profile.js - 昇梦体育 商城（原个人中心已迁入首页头像弹层）
const app = getApp()

let requestSequence = 0
const api = () => app.api || app.globalData.api
const showError = error => wx.showToast({ title: (error && error.message) || '请求失败，请重试', icon: 'none' })
const cacheOrders = list => {
  try { wx.setStorageSync('mall_orders', list) } catch (e) { console.error('保存订单失败', e) }
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'jersey', label: '球服' },
  { key: 'ball', label: '篮球' },
  { key: 'guard', label: '护具' },
  { key: 'gear', label: '配件' }
]

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    categories: CATEGORIES,
    activeCategory: 'all',
    products: [],
    filteredProducts: [],
    // 详情/下单
    detailVisible: false,
    currentProduct: null,
    buyCount: 1,
    // 订单
    ordersVisible: false,
    orders: []
  },

  onLoad() {
    this.initTheme()
    return this.loadProducts()
  },

  _themeClass(ut) { return ut === 'auto' ? '' : (ut === 'light' ? 'theme-light' : 'theme-dark') },

  _syncTheme() {
    const ut = app.getUserTheme()
    const { pageBg } = app.getThemeColors()
    this.setData({ themeClass: this._themeClass(ut), pageBg })
    app.applyNavBarColor(app.getTheme())
  },

  initTheme() { this._syncTheme() },
  setTheme(t) { this._syncTheme() },
  applyNavBarColor() { app.applyNavBarColor(app.getTheme()) },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.updateSelected(3)
    this._syncTheme()
    return this.loadOrders()
  },

  async loadProducts() {
    try {
      const products = await api().get('/api/comptrain/products', { category: 'all' })
      if (!Array.isArray(products)) throw new Error('请求失败，请重试')
      const key = this.data.activeCategory
      this.setData({ products, filteredProducts: key === 'all' ? products : products.filter(p => p.category === key) })
    } catch (e) {
      this.setData({ products: [], filteredProducts: [] })
      showError(e)
    }
  },

  // ===== 分类 =====
  switchCategory(e) {
    const key = e.currentTarget.dataset.key
    if (key === this.data.activeCategory) return
    const filtered = key === 'all' ? this.data.products : this.data.products.filter(p => p.category === key)
    this.setData({ activeCategory: key, filteredProducts: filtered })
  },

  // ===== 商品详情 =====
  openDetail(e) {
    if (this._orderSubmitting || this._clearingOrders) return
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(p => p.id === id)
    if (!product) return
    this._orderRequest = null
    this.setData({ currentProduct: product, detailVisible: true, buyCount: 1 })
  },

  closeDetail() {
    if (this._orderSubmitting) return
    this._orderRequest = null
    this.setData({ detailVisible: false })
  },

  increase() {
    if (this._orderSubmitting) return
    if (this.data.buyCount >= 99) return
    this.setData({ buyCount: this.data.buyCount + 1 })
  },

  decrease() {
    if (this._orderSubmitting) return
    if (this.data.buyCount <= 1) return
    this.setData({ buyCount: this.data.buyCount - 1 })
  },

  // ===== 下单 =====
  async submitOrder() {
    if (this._orderSubmitting || this._clearingOrders || !this.data.detailVisible) return
    const product = this.data.currentProduct
    if (!product) return
    const count = this.data.buyCount
    const signature = JSON.stringify([product.id, count])
    if (!this._orderRequest || this._orderRequest.signature !== signature) {
      this._orderRequest = {
        signature,
        id: `order_${Date.now()}_${++requestSequence}_${Math.random().toString(36).slice(2)}`
      }
    }
    this._orderSubmitting = true
    this._ordersVersion = (this._ordersVersion || 0) + 1
    try {
      const order = await api().post('/api/comptrain/orders', {
        productId: product.id, count, requestId: this._orderRequest.id
      })
      if (!order || order.id == null || order.status !== 'UNPAID') throw new Error('请求失败，请重试')
      const list = [order, ...this.data.orders.filter(item => item.id !== order.id)]
      this._ordersVersion = (this._ordersVersion || 0) + 1
      this.setData({ orders: list, detailVisible: false })
      cacheOrders(list)
      this._orderRequest = null
      wx.showToast({ title: '下单成功（演示）', icon: 'success' })
    } catch (e) { showError(e) } finally { this._orderSubmitting = false }
  },

  // ===== 订单 =====
  async loadOrders() {
    const version = this._ordersVersion = (this._ordersVersion || 0) + 1
    try {
      const list = await api().get('/api/comptrain/orders')
      if (!Array.isArray(list)) throw new Error('请求失败，请重试')
      if (version !== this._ordersVersion || this._orderSubmitting || this._clearingOrders) return
      this.setData({ orders: list })
      cacheOrders(list)
    } catch (e) {
      if (version !== this._ordersVersion || this._orderSubmitting || this._clearingOrders) return
      this.setData({ orders: [] })
      showError(e)
    }
  },

  showOrders() { this.setData({ ordersVisible: true }); return this.loadOrders() },
  closeOrders() { this.setData({ ordersVisible: false }) },

  clearOrders() {
    if (this._clearingOrders || this._orderSubmitting) return
    this._clearingOrders = true
    try { wx.showModal({
      title: '清空订单',
      content: '确定清空全部订单记录吗？',
      success: async (res) => {
        if (!res.confirm) { this._clearingOrders = false; return }
        this._ordersVersion = (this._ordersVersion || 0) + 1
        try {
          await api().delete('/api/comptrain/orders')
          this._ordersVersion = (this._ordersVersion || 0) + 1
          try { wx.removeStorageSync('mall_orders') } catch (e) {}
          this.setData({ orders: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        } catch (e) { showError(e) } finally { this._clearingOrders = false }
      },
      fail: (e) => { this._clearingOrders = false; showError(e) }
    }) } catch (e) { this._clearingOrders = false; showError(e) }
  },

  stopPropagation() {}
})
