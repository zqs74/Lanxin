const { MODE_EXAMPLES } = require('../../utils/constants');
const { parseDemand, getMissingFields } = require('../../utils/parser');
const { createRecommendation } = require('../../utils/recommender');
const api = require('../../utils/api');
const session = require('../../utils/session');

function buildMissingConfig(fields, config) {
  return fields
    .map((field) => {
      switch (field) {
        case "town":
          return {
            key: "town",
            label: "优先在哪个镇区？",
            type: "chips",
            options: config.towns || [],
          };
        case "playDate":
          return {
            key: "playDate",
            label: "预计什么时候打？",
            type: "chips",
            options: config.dateOptions || [],
          };
        case "venuePreference":
          return {
            key: "venuePreference",
            label: "更想要什么场地？",
            type: "chips",
            options: config.venueOptions || [],
          };
        case "budgetLevel":
          return {
            key: "budgetLevel",
            label: "预算大概在哪一档？",
            type: "chips",
            options: config.budgetOptions || [],
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

Page(session.protectPage({
  data: {
    mode: "",
    city: "东莞",
    sentence: "",
    examples: [],
    modeOptions: [],
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

  async onLoad() {
    this._config = await api.getConfig();
    this.setData({ city: this._config.city || '', modeOptions: this._config.modeOptions || [] });
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

  async handlePrimaryAction() {
    if (this._parsing || this._generating) return;
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

    this._parsing = true;
    const mode = this.data.mode;
    try {
      if (!this._config) this._config = await api.getConfig();
      const parsed = await parseDemand(mode, sentence);
      if (this._dead || mode !== this.data.mode || sentence !== this.data.sentence.trim()) return;
      const { demand, missingFields = [] } = parsed;
      this._requiredFields = missingFields || [];

      if (missingFields.length) {
        this.setData(
          {
            popupVisible: true,
            pendingDemand: demand,
            missingPrompts: buildMissingConfig(missingFields, this._config),
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

      await this.generateResult(demand);
    } finally { this._parsing = false; }
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

  async confirmPrompt() {
    if (this._generating) return;
    const demand = Object.assign({}, this.data.pendingDemand, this.data.formValues);
    const stillMissing = getMissingFields(demand, this._requiredFields);

    if (stillMissing.length) {
      wx.showToast({
        title: "还有关键信息没补全",
        icon: "none",
      });
      return;
    }

    await this.generateResult(demand);
  },

  async generateResult(demand) {
    if (this._generating) return;
    this._generating = true;
    try {
      const record = await api.submitOnce('plan', demand, requestId => createRecommendation(demand, requestId));
      if (this._dead) return;
      const recordId = api.id(record.id);
      this.closePopup();
      wx.navigateTo({ url: '/pages/result/result?id=' + recordId });
    } finally { this._generating = false; }
  },

}));
