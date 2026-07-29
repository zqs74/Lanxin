Component({
  data: {
    active: "home",
    hidden: false,
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
        history: "/pages/history/history",
        home: "/pages/index/index",
        library: "/pages/library/library",
      };

      this.setData({
        active: key,
        switchingKey: key,
      });

      wx.switchTab({
        url: routes[key],
        complete: () => {
          setTimeout(() => {
            this.setData({
              switchingKey: "",
            });
          }, 180);
        },
      });
    },
  },
});
