const {
  APP_MODE,
  MODE_OPTIONS,
  MODE_EXAMPLES,
  TOWN_OPTIONS,
  BUDGET_OPTIONS,
  VENUE_OPTIONS,
  DATE_OPTIONS,
} = require("../../utils/constants");
const { parseDemand, getMissingFields } = require("../../utils/parser");
const { createRecommendation } = require("../../utils/recommender");
const { saveLatestDemand, saveRecommendation } = require("../../utils/storage");
const { encodePayload } = require("../../utils/share");

function buildMissingConfig(fields) {
  return fields
    .map((field) => {
      switch (field) {
        case "town":
          return {
            key: "town",
            label: "优先在哪个镇区？",
            type: "chips",
            options: TOWN_OPTIONS,
          };
        case "playDate":
          return {
            key: "playDate",
            label: "预计什么时候打？",
            type: "chips",
            options: DATE_OPTIONS,
          };
        case "venuePreference":
          return {
            key: "venuePreference",
            label: "更想要什么场地？",
            type: "chips",
            options: VENUE_OPTIONS,
          };
        case "budgetLevel":
          return {
            key: "budgetLevel",
            label: "预算大概在哪一档？",
            type: "chips",
            options: BUDGET_OPTIONS,
          };
        case "peopleCount":
          return {
            key: "peopleCount",
            label: "大概多少人参加？",
            type: "number",
          };
        case "teamCount":
          return {
            key: "teamCount",
            label: "预计几支队伍？",
            type: "number",
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
}

Page({
  data: {
    mode: "",
    city: "东莞",
    sentence: "",
    examples: [],
    modeOptions: MODE_OPTIONS,
    popupVisible: false,
    missingPrompts: [],
    pendingDemand: null,
    formValues: {
      town: "",
      playDate: "",
      venuePreference: "",
      budgetLevel: "",
      peopleCount: "",
      teamCount: "",
    },
  },

  onLoad(query) {
    if (query && query.scene) {
      try {
        const payload = JSON.parse(decodeURIComponent(query.scene));
        this.restoreSharedDemand(payload);
      } catch (error) {
        console.warn("restore scene failed", error);
      }
    }
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        active: "home",
        hidden: this.data.popupVisible,
      });
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.sentence || "一句话生成东莞篮球约战方案",
      path: "/pages/index/index",
    };
  },

  switchMode(event) {
    const { mode } = event.currentTarget.dataset;
    this.setData({
      mode,
      sentence: "",
      examples: MODE_EXAMPLES[mode] || [],
    });
  },

  onSentenceChange(event) {
    this.setData({
      sentence: event.detail,
    });
  },

  applyExample(event) {
    const { example } = event.currentTarget.dataset;
    this.setData({
      sentence: example,
    });
  },

  handlePrimaryAction() {
    const sentence = (this.data.sentence || "").trim();

    if (!this.data.mode) {
      wx.showToast({
        title: "先选一个约战模式",
        icon: "none",
      });
      return;
    }

    if (!sentence) {
      wx.showToast({
        title: "先写一句你的需求",
        icon: "none",
      });
      return;
    }

    const demand = parseDemand(this.data.mode, sentence);
    const missingFields = getMissingFields(demand);
    saveLatestDemand(demand);

    if (missingFields.length) {
      this.setData(
        {
          popupVisible: true,
          pendingDemand: demand,
          missingPrompts: buildMissingConfig(missingFields),
          formValues: {
            town: demand.town || "",
            playDate: demand.playDate || "",
            venuePreference: demand.venuePreference || "",
            budgetLevel: demand.budgetLevel || "",
            peopleCount: demand.peopleCount || "",
            teamCount: demand.teamCount || "",
          },
        },
        () => {
          const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
          if (tabBar) {
            tabBar.setData({
              hidden: true,
            });
          }
        }
      );
      return;
    }

    this.generateResult(demand);
  },

  closePopup() {
    this.setData(
      {
        popupVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );
  },

  selectPromptOption(event) {
    const { key, value } = event.currentTarget.dataset;
    this.setData({
      [`formValues.${key}`]: value,
    });
  },

  onNumberChange(event) {
    const { key } = event.currentTarget.dataset;
    this.setData({
      [`formValues.${key}`]: event.detail,
    });
  },

  confirmPrompt() {
    const demand = Object.assign({}, this.data.pendingDemand, this.data.formValues);
    const stillMissing = getMissingFields(demand);

    if (stillMissing.length) {
      wx.showToast({
        title: "还有关键信息没补全",
        icon: "none",
      });
      return;
    }

    this.setData(
      {
        popupVisible: false,
      },
      () => {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar) {
          tabBar.setData({
            hidden: false,
          });
        }
      }
    );

    this.generateResult(demand);
  },

  generateResult(demand) {
    const result = createRecommendation(demand);
    const record = {
      id: `rec_${Date.now()}`,
      type: "recommendation",
      mode: demand.mode,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      payload: {
        demand,
        result,
      },
    };

    saveLatestDemand(demand);
    saveRecommendation(record);
    getApp().setLatestSharePayload(result.sharePayload);

    const encoded = encodePayload(result.sharePayload);
    wx.navigateTo({
      url: `/pages/result/result?payload=${encoded}`,
    });
  },

  restoreSharedDemand(payload) {
    const mode = payload.mode || APP_MODE.PRO_EVENT;
    this.setData({
      mode,
      sentence: payload.sentence || "",
      examples: MODE_EXAMPLES[mode] || [],
    });
  },
});
