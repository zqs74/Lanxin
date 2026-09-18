const api = require('../../utils/api');
const session = require('../../utils/session');
const CATEGORY_LABELS = { venues: '场馆', referees: '裁判', materials: '物料', rentals: '租赁', suppliers: '供应商', media: '媒体' };

Page(session.protectPage({
  data: {
    categories: [],
    activeCategory: "venues",
    list: [],
    resourceCount: 0,
    activeCategoryLabel: "场馆",
    townFilter: "全部",
    emptyText: "",
    towns: ["全部"],
    // A1 详情访问控制：点击详情 → 居中弹窗展示客服二维码
    guideVisible: false,
  },

  async onLoad() {
    const config = await api.getConfig();
    const taxonomy = config.taxonomy || {};
    const raw = Array.isArray(taxonomy) ? taxonomy : (taxonomy.categories || taxonomy.libraryCategories || taxonomy.resourceCategories);
    // These are navigation labels for the contracted endpoints, never resource cards.
    const source = Array.isArray(raw) ? raw : Object.keys(raw || CATEGORY_LABELS)
      .map(key => ({ key, label: (raw && typeof raw[key] === 'string' && raw[key]) || CATEGORY_LABELS[key] || key }));
    const categories = source.map(item => typeof item === 'string' ? { key: item, label: CATEGORY_LABELS[item] || item } :
      Object.assign({}, item, { key: item.key || item.value }));
    this.setData({ categories, activeCategory: categories.some(item => item.key === this.data.activeCategory)
      ? this.data.activeCategory : (categories[0] && categories[0].key) || 'venues', towns: ['全部'].concat(config.towns || []) });
  },

  async onShow() {
    await this.refreshList();
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "library",
        hidden: false,
      });
    }
  },

  selectCategory(event) {
    const { key } = event.currentTarget.dataset;
    this.setData(
      {
        activeCategory: key,
      },
      () => {
        this.refreshList();
      }
    );
  },

  selectTown(event) {
    const { town } = event.currentTarget.dataset;
    this.setData(
      {
        townFilter: town,
      },
      () => {
        this.refreshList();
      }
    );
  },

  async refreshList() {
    const sequence = this._listSequence = (this._listSequence || 0) + 1;
    const { activeCategory, townFilter } = this.data;
    this.setData({ list: [], resourceCount: 0, emptyText: '正在加载资源' });
    try {
      const items = await api.listAll('/api/resources', { category: activeCategory, town: townFilter === '全部' ? '' : townFilter });
      if (this._dead || sequence !== this._listSequence) return;
      const category = this.data.categories.find(item => item.key === activeCategory || item.value === activeCategory);
      // Public listings have no featured entry: every item uses the same card.
      this.setData({ list: items, resourceCount: items.length,
        activeCategoryLabel: category ? category.label : '资源', emptyText: items.length ? '' : '当前筛选暂无资源，可以换个筛选试试' });
    } catch (error) {
      if (sequence === this._listSequence && !this._dead) this.setData({ list: [], resourceCount: 0, emptyText: '资源加载失败，请稍后重试' });
      throw error;
    }
  },

  // —— A1：详情访问控制（点击详情 → 居中弹窗展示客服二维码，详情不对外展示）——

  onResourceTap() {
    this.showGuide();
  },

  showGuide() {
    api.applyContact(this);
    this.setData(
      {
        guideVisible: true,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({ hidden: true });
        }
      }
    );
  },

  closeGuide() {
    this.setData(
      {
        guideVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({ hidden: false });
        }
      }
    );
  },

  // —— A2：联系客服入口（独立打开开通引导弹窗）——
  openContact() {
    this.showGuide();
  },
}));
