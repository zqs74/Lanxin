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

      this.setData({
        switchingKey: key,
      });

      setTimeout(() => {
        this.setData({
          switchingKey: "",
        });

        wx.reLaunch({
          url: routes[key],
        });
      }, 140);
    },
  },
});
