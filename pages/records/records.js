const { getRecommendations, getBookings, removeRecordsByType } = require("../../utils/storage");
const api = require('../../utils/api');
const session = require('../../utils/session');

const TIME_SLOT_LABELS = {
  morning: "上午 08:00-12:00",
  afternoon: "下午 12:00-18:00",
  evening: "晚上 18:00-22:00",
};

function getModeLabel(mode) {
  return mode === "pro_event" ? "半专业赛事" : "野球约球";
}

function getSlotLabel(value) {
  return TIME_SLOT_LABELS[value] || "";
}

// 推荐记录重点兜底：预算落点 + 方案调性（优先展示当时输入的一句话）
function buildRecommendationHighlight(result) {
  const parts = [];
  if (result.budgetFocus) {
    parts.push(`预算落点 ${result.budgetFocus}`);
  }
  if (result.planTone) {
    parts.push(result.planTone);
  }
  return parts.join(" · ") || result.strategyLine || "";
}

function buildList(list = [], type) {
  return list
    .map((item) => {
      const payload = item.payload || {};
      const demand = payload.demand || {};
      const result = payload.result || {};
      const bookingForm = payload.bookingForm || {};
      const date = (type === "booking" ? bookingForm.expectedDate : demand.playDate) || (item.createdAt || "").slice(0, 10);
      const town = demand.town || "东莞";

      return Object.assign({}, item, {
        payload: Object.assign({}, payload, { planId: item.id }),
        title: type === "booking" ? (item.statusLabel || "预约已提交") : getModeLabel(item.mode),
        town,
        date,
        meta: [town, date].filter(Boolean).join(" · "),
        brief: type === "booking"
          ? (bookingForm.contactName ? `${bookingForm.contactName} · ${bookingForm.phone || "待回访"}` : "已提交场地预约")
          : (result.summaryLead || item.summary || ""),
        highlight: type === "booking"
          ? ((bookingForm.venueName && bookingForm.timeSlot)
              ? `${bookingForm.venueName} · ${getSlotLabel(bookingForm.timeSlot) || "时段待定"}`
              : (bookingForm.remark || (bookingForm.acceptFallback ? "接受同档位替代方案" : "仅接受当前方案")))
          : (demand.sentence || buildRecommendationHighlight(result)),
      });
    });
}

function pickFilterOptions(list, key) {
  const values = Array.from(new Set(list.map((item) => item[key]).filter(Boolean)));
  return ["全部"].concat(values);
}

function applyFilters(list, filters) {
  return list.filter((item) => {
    const townMatch = filters.town === "全部" || item.town === filters.town;
    const dateMatch = filters.date === "全部" || item.date === filters.date;
    return townMatch && dateMatch;
  });
}

Page(session.protectPage({
  data: {
    type: "recommendation",
    title: "推荐记录",
    list: [],
    filteredList: [],
    filters: {
      town: "全部",
      date: "全部",
    },
    townOptions: ["全部"],
    dateOptions: ["全部"],
    // 多选删除管理模式
    manageMode: false,
    selectedIds: [],
    selectedMap: {},
    allSelected: false,
  },

  onLoad(query) {
    const type = query.type === "booking" ? "booking" : "recommendation";
    this.setData({
      type,
      title: type === "booking" ? "预约记录" : "推荐记录",
    });

    wx.setNavigationBarTitle({
      title: type === "booking" ? "预约记录" : "推荐记录",
    });
  },

  async onShow() { await this.refreshRecords(); },

  async refreshRecords() {
    const sequence = this._refreshSequence = (this._refreshSequence || 0) + 1;
    const records = this.data.type === 'booking' ? await getBookings() : await getRecommendations();
    if (this._dead || sequence !== this._refreshSequence) return;
    const source = buildList(records, this.data.type);

    this.setData({
      list: source,
      filteredList: source,
      filters: {
        town: "全部",
        date: "全部",
      },
      townOptions: pickFilterOptions(source, "town"),
      dateOptions: pickFilterOptions(source, "date"),
      manageMode: false,
      selectedIds: [],
      selectedMap: {},
      allSelected: false,
    });
  },

  selectFilter(event) {
    const { key, value } = event.currentTarget.dataset;
    this.setData(
      {
        [`filters.${key}`]: value,
      },
      () => {
        this.setData({
          filteredList: applyFilters(this.data.list, this.data.filters),
        });
      }
    );
  },

  // —— 多选删除 ——

  onCardTap(event) {
    if (this.data.manageMode) {
      this.toggleSelect(event);
      return;
    }
    this.reopenItem(event);
  },

  toggleManage() {
    this.setData({
      manageMode: !this.data.manageMode,
      selectedIds: [],
      selectedMap: {},
      allSelected: false,
    });
  },

  toggleSelect(event) {
    const { id } = event.currentTarget.dataset;
    if (!id) {
      return;
    }
    const selectedMap = Object.assign({}, this.data.selectedMap);
    if (selectedMap[id]) {
      delete selectedMap[id];
    } else {
      selectedMap[id] = true;
    }
    const selectedIds = Object.keys(selectedMap);
    this.setData({
      selectedIds,
      selectedMap,
      allSelected: selectedIds.length > 0 && selectedIds.length === this.data.filteredList.length,
    });
  },

  toggleSelectAll() {
    if (this.data.allSelected) {
      this.setData({ selectedIds: [], selectedMap: {}, allSelected: false });
      return;
    }
    const selectedMap = {};
    this.data.filteredList.forEach((item) => {
      selectedMap[item.id] = true;
    });
    this.setData({
      selectedIds: this.data.filteredList.map((item) => item.id),
      selectedMap,
      allSelected: true,
    });
  },

  deleteSelected() {
    const { selectedIds, type } = this.data;
    if (!selectedIds.length) {
      wx.showToast({ title: "请先选择要删除的记录", icon: "none" });
      return;
    }

    wx.showModal({
      title: "删除所选",
      content: `确定删除选中的 ${selectedIds.length} 条记录吗？删除后不可恢复`,
      confirmColor: "#fa5151",
      success: async (res) => {
        if (!res.confirm || this._deleting) return;
        this._deleting = true;
        try {
          await removeRecordsByType(type, selectedIds);
          wx.showToast({ title: '已删除', icon: 'success' });
          await this.refreshRecords();
        } catch (error) { api.notifyError(error); }
        finally { this._deleting = false; }
      },
    });
  },

  reopenItem(event) {
    const { id, payload, type } = event.currentTarget.dataset;

    // 预约记录 → 预约成功页；推荐记录 → 对应方案页
    if (type === "booking") {
      if (id) {
        wx.navigateTo({
          url: '/pages/booking-success/booking-success?id=' + api.id(id),
        });
      }
      return;
    }

    if (!id) {
      return;
    }

    wx.navigateTo({
      url: '/pages/result/result?id=' + api.id(id),
    });
  },
}));
