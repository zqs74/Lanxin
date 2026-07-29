const {
  libraryCategories,
  venues,
  referees,
  materials,
  rentalItems,
  suppliers,
  mediaResources,
} = require("../../utils/data/resources");

const sourceMap = {
  venues,
  referees,
  materials,
  rentals: rentalItems,
  suppliers,
  media: mediaResources,
};

Page({
  data: {
    categories: libraryCategories,
    activeCategory: "venues",
    list: venues.slice(1),
    featuredItem: venues[0],
    resourceCount: venues.length,
    activeCategoryLabel: "场馆",
    townFilter: "全部",
    emptyText: "",
    towns: ["全部", "南城", "东城", "松山湖", "大朗", "黄江", "虎门"],
  },

  onLoad() {
    this.refreshList();
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "library",
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

  refreshList() {
    const raw = sourceMap[this.data.activeCategory] || [];
    const sourceList =
      this.data.townFilter === "全部"
        ? raw
        : raw.filter((item) => !item.town || item.town === this.data.townFilter);
    const featuredItem = sourceList[0] || null;
    const list = featuredItem ? sourceList.slice(1) : [];
    const currentCategory = this.data.categories.find((item) => item.key === this.data.activeCategory);

    let emptyText = "";
    if (!sourceList.length) {
      emptyText =
        this.data.activeCategory === "venues"
          ? "当前镇区暂无匹配场馆，可以试试周边镇区"
          : "当前镇区暂无这类资源，可以换个筛选试试";
    }

    this.setData({
      list,
      featuredItem,
      resourceCount: sourceList.length,
      activeCategoryLabel: currentCategory ? currentCategory.label : "资源",
      emptyText,
    });
  },
});
