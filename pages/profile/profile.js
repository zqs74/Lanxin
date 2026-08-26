// profile.js - 昇梦体育 商城（原个人中心已迁入首页头像弹层）
const app = getApp()

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'jersey', label: '球服' },
  { key: 'ball', label: '篮球' },
  { key: 'guard', label: '护具' },
  { key: 'gear', label: '配件' }
]

const PRODUCTS = [
  { id: 1, name: '昇梦定制球服（红）', category: 'jersey', price: 129, emoji: '👕', tag: '热卖', desc: '透气速干面料，专业赛事级剪裁，支持号码定制' },
  { id: 2, name: '昇梦定制球服（蓝）', category: 'jersey', price: 129, emoji: '👕', tag: '经典', desc: '透气速干面料，深蓝配色，适合球队统一着装' },
  { id: 3, name: '昇梦定制球服（金）', category: 'jersey', price: 139, emoji: '👕', tag: '限定', desc: '冠军金配色，吸湿排汗，联赛官方同款' },
  { id: 4, name: '专业比赛篮球 7 号', category: 'ball', price: 89, emoji: '🏀', tag: '热卖', desc: '标准比赛用球，PU 材质，室内外通用' },
  { id: 5, name: '小篮球 5 号（青少年）', category: 'ball', price: 69, emoji: '🏀', tag: 'U12', desc: '符合小篮球联赛标准，适合 U8/U10/U12 组别' },
  { id: 6, name: '训练用篮球 6 号', category: 'ball', price: 79, emoji: '🏀', tag: '', desc: '耐磨训练球，手感舒适，适合日常训练' },
  { id: 7, name: '吸汗护腕（双只装）', category: 'guard', price: 29, emoji: '🧤', tag: '实惠', desc: '加厚吸汗，防滑耐磨，多色可选' },
  { id: 8, name: '运动护膝', category: 'guard', price: 59, emoji: '🦿', tag: '', desc: '弹簧支撑，减压缓冲，保护膝盖' },
  { id: 9, name: '运动护踝', category: 'guard', price: 49, emoji: '🦶', tag: '', desc: '轻薄透气，防崴脚，实战必备' },
  { id: 10, name: '便携运动水壶', category: 'gear', price: 25, emoji: '🥤', tag: '', desc: '大容量 750ml，食品级材质，一键开合' },
  { id: 11, name: '运动速干毛巾', category: 'gear', price: 19, emoji: '🧣', tag: '', desc: '超强吸水，柔软亲肤，训练擦汗好帮手' },
  { id: 12, name: '篮球收纳网袋', category: 'gear', price: 15, emoji: '👜', tag: '', desc: '加粗网绳，可装 2-3 颗篮球，方便携带' }
]

Page({
  data: {
    themeClass: '',
    pageBg: '#f8f7f4',
    categories: CATEGORIES,
    activeCategory: 'all',
    products: PRODUCTS,
    filteredProducts: PRODUCTS,
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
    this.loadOrders()
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
    this.loadOrders()
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
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(p => p.id === id)
    if (!product) return
    this.setData({ currentProduct: product, detailVisible: true, buyCount: 1 })
  },

  closeDetail() { this.setData({ detailVisible: false }) },

  increase() {
    if (this.data.buyCount >= 99) return
    this.setData({ buyCount: this.data.buyCount + 1 })
  },

  decrease() {
    if (this.data.buyCount <= 1) return
    this.setData({ buyCount: this.data.buyCount - 1 })
  },

  // ===== 模拟下单 =====
  submitOrder() {
    const product = this.data.currentProduct
    if (!product) return
    const count = this.data.buyCount
    const order = {
      id: 'ord_' + Date.now(),
      productId: product.id,
      productName: product.name,
      emoji: product.emoji,
      price: product.price,
      count,
      total: product.price * count,
      createdAt: new Date().toISOString()
    }
    try {
      const list = wx.getStorageSync('mall_orders') || []
      list.unshift(order)
      wx.setStorageSync('mall_orders', list.slice(0, 50))
      this.setData({ orders: list.slice(0, 50) })
    } catch (e) { console.error('保存订单失败', e) }

    this.setData({ detailVisible: false })
    wx.showToast({ title: '下单成功（演示）', icon: 'success' })
  },

  // ===== 订单 =====
  loadOrders() {
    try {
      const list = wx.getStorageSync('mall_orders') || []
      this.setData({ orders: list })
    } catch (e) { this.setData({ orders: [] }) }
  },

  showOrders() { this.loadOrders(); this.setData({ ordersVisible: true }) },
  closeOrders() { this.setData({ ordersVisible: false }) },

  clearOrders() {
    wx.showModal({
      title: '清空订单',
      content: '确定清空全部订单记录吗？',
      success: (res) => {
        if (res.confirm) {
          try { wx.removeStorageSync('mall_orders') } catch (e) {}
          this.setData({ orders: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  stopPropagation() {}
})
