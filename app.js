App({
  globalData: {
    city: "东莞",
    latestSharePayload: null,
  },

  onLaunch() {
    this.hydrateSharePayload();
  },

  hydrateSharePayload() {
    try {
      const payload = wx.getStorageSync("latest_share_payload");
      if (payload) {
        this.globalData.latestSharePayload = payload;
      }
    } catch (error) {
      console.warn("hydrateSharePayload failed", error);
    }
  },

  setLatestSharePayload(payload) {
    this.globalData.latestSharePayload = payload;
    try {
      wx.setStorageSync("latest_share_payload", payload);
    } catch (error) {
      console.warn("setLatestSharePayload failed", error);
    }
  },
});
