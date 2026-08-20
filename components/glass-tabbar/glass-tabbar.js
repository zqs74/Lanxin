Component({
  properties: {
    active: {
      type: String,
      value: "home",
    },
  },

  data: {
    switchingKey: "",
    tabs: [
      { key: "history", label: "历史方案" },
      { key: "home", label: "首页", center: true },
      { key: "library", label: "资源库" },
    ],
  },

  methods: {
    handleTap(event) {
      const { key } = event.currentTarget.dataset;
      if (!key || key === this.data.active || key === this.data.switchingKey) {
        return;
      }

      const routes = {
        home: "/pages/index/index",
        history: "/pages/history/history",
        library: "/pages/library/library",
      };
      const pages = getCurrentPages();
      const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";

      this.setData({
        switchingKey: key,
      });

      if (currentRoute === routes.home || currentRoute === routes.history || currentRoute === routes.library) {
        wx.switchTab({
          url: routes[key],
          complete: () => {
            this.setData({
              switchingKey: "",
            });
          },
        });
        return;
      }

      wx.redirectTo({
        url: routes[key],
        complete: () => {
          this.setData({
            switchingKey: "",
          });
        },
      });
    },
  },
});
