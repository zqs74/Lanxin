const { APP_MODE } = require("./constants");
const {
  venues,
  referees,
  materials,
  rentalItems,
  suppliers,
  mediaResources,
} = require("./data/resources");

function getBudgetLabel(value) {
  const labels = {
    low: "轻量预算",
    mid: "标准预算",
    high: "高配预算",
  };
  return labels[value] || "预算待定";
}

function getVenueLabel(value) {
  if (value === "outdoor") {
    return "室外优先";
  }
  if (value === "indoor") {
    return "室内优先";
  }
  return "场地灵活";
}

function scoreBudget(resourceBudget, demandBudget) {
  if (!demandBudget || resourceBudget === demandBudget) {
    return 20;
  }

  const levels = ["low", "mid", "high"];
  const resourceIndex = levels.indexOf(resourceBudget);
  const demandIndex = levels.indexOf(demandBudget);
  const distance = Math.abs(resourceIndex - demandIndex);
  return Math.max(6, 18 - distance * 6);
}

function scoreTown(resourceTown, demandTown) {
  if (!demandTown) {
    return 10;
  }
  return resourceTown === demandTown ? 22 : 8;
}

function scoreVenue(venue, demand) {
  let score = venue.priority;
  score += scoreBudget(venue.budgetLevel, demand.budgetLevel);
  score += scoreTown(venue.town, demand.town);

  if (demand.venuePreference === "indoor" && venue.indoor) {
    score += 18;
  }
  if (demand.venuePreference === "outdoor" && !venue.indoor) {
    score += 18;
  }
  if (
    demand.peopleCount &&
    venue.peopleRange[0] <= demand.peopleCount &&
    venue.peopleRange[1] >= demand.peopleCount
  ) {
    score += 16;
  }
  if (venue.scene.includes(demand.mode)) {
    score += 16;
  }

  return score;
}

function getVenueCandidates(demand) {
  return venues
    .filter((item) => item.scene.includes(demand.mode))
    .map((item) => ({
      ...item,
      score: scoreVenue(item, demand),
    }))
    .sort((left, right) => right.score - left.score);
}

function scoreReferee(referee, demand, targetTown) {
  let score = referee.priority + scoreBudget(referee.budgetLevel, demand.budgetLevel);
  score += scoreTown(referee.town, targetTown || demand.town);

  if (referee.scene.includes(demand.mode)) {
    score += 18;
  }
  if (demand.mode === APP_MODE.PRO_EVENT && referee.level.includes("国家级")) {
    score += 14;
  }
  if (demand.mode === APP_MODE.CASUAL_GAME && referee.level.includes("二级")) {
    score += 8;
  }

  return score;
}

function pickReferees(demand, venue) {
  if (!demand.needReferee) {
    return [];
  }

  const sorted = referees
    .filter((item) => item.scene.includes(demand.mode))
    .map((item) => ({
      ...item,
      score: scoreReferee(item, demand, venue.town),
    }))
    .sort((left, right) => right.score - left.score);

  return demand.mode === APP_MODE.PRO_EVENT ? sorted.slice(0, 3) : sorted.slice(0, 1);
}

function pickMaterials(demand) {
  if (!demand.needMaterials && demand.mode === APP_MODE.CASUAL_GAME) {
    return materials.filter((item) => item.id === "mat-jersey").slice(0, 1);
  }

  return materials
    .filter((item) => item.scene.includes(demand.mode))
    .slice(0, demand.mode === APP_MODE.PRO_EVENT ? 4 : 2);
}

function pickRentals(demand) {
  return rentalItems
    .filter((item) => item.scene.includes(demand.mode))
    .slice(0, demand.mode === APP_MODE.PRO_EVENT ? 4 : 3);
}

function pickSuppliers(demand) {
  if (demand.mode !== APP_MODE.PRO_EVENT) {
    return [];
  }
  return suppliers.slice(0, demand.needSupplier ? 2 : 1);
}

function pickMedia(demand) {
  if (demand.mode !== APP_MODE.PRO_EVENT) {
    return [];
  }
  return mediaResources.slice(0, demand.needMedia ? 2 : 1);
}

function buildSummary(demand, venue) {
  const modeLabel = demand.mode === APP_MODE.PRO_EVENT ? "半专业赛事" : "野球约球";
  const dateLabel = demand.playDate || "日期待定";
  const townLabel = demand.town || venue.town;
  return `${modeLabel} · ${townLabel} · ${dateLabel}`;
}

function buildBudgetHint(demand, venue) {
  const base = venue.priceLevel;

  if (demand.mode === APP_MODE.PRO_EVENT) {
    if (demand.budgetLevel === "high") {
      return `预计整套方案约 ${base + 9000} 元，可覆盖场馆、裁判、物料、执行和传播。`;
    }
    if (demand.budgetLevel === "mid") {
      return `预计整套方案约 ${base + 4200} 元，正式感和性价比比较平衡。`;
    }
    return `当前预算偏紧，建议控制在 ${base + 2500} 元左右，并精简传播和装饰配置。`;
  }

  if (demand.budgetLevel === "high") {
    return `预计约 ${base + 1800} 元，可以升级场馆并加配裁判或计分设备。`;
  }
  if (demand.budgetLevel === "mid") {
    return `预计约 ${base + 800} 元，覆盖场馆和基础比赛物料。`;
  }
  return `预计约 ${base} 元起，更适合轻量组局。`;
}

function buildAlternatives(candidates) {
  return candidates.slice(1, 3).map((item) => ({
    id: item.id,
    title: item.name,
    subtitle: `${item.town} · ${item.indoor ? "室内" : "室外"} · ${item.tags.join(" / ")}`,
    reason: item.fallbackHint,
  }));
}

function buildEmptyResult(demand) {
  return {
    mode: demand.mode,
    summary: "暂时没有完全匹配的方案",
    fallbackMessage: "当前条件下没有完全匹配的资源，建议放宽预算、切换室内外，或扩大到周边镇区再试。",
    sections: [],
    alternatives: [],
    matchScore: 0,
    topReason: "",
    reasonLines: [],
    budgetHint: "",
    posterPayload: null,
    sharePayload: {
      city: demand.city,
      mode: demand.mode,
      sentence: demand.sentence,
      town: demand.town,
      budgetLevel: demand.budgetLevel,
      playDate: demand.playDate,
      venuePreference: demand.venuePreference,
      peopleCount: demand.peopleCount,
      teamCount: demand.teamCount,
    },
  };
}

function joinItemNames(items, limit) {
  if (!items || !items.length) {
    return "";
  }

  return items
    .slice(0, limit)
    .map((item) => item.name)
    .join(" / ");
}

function createRecommendation(demand) {
  const venueCandidates = getVenueCandidates(demand);
  const venue = venueCandidates[0];

  if (!venue) {
    return buildEmptyResult(demand);
  }

  const pickedRefs = pickReferees(demand, venue);
  const pickedMaterials = pickMaterials(demand);
  const pickedRentals = pickRentals(demand);
  const pickedSuppliers = pickSuppliers(demand);
  const pickedMedia = pickMedia(demand);
  const summary = buildSummary(demand, venue);
  const alternatives = buildAlternatives(venueCandidates);

  const sections = [
    {
      key: "venue",
      title: "推荐场馆",
      items: [venue],
    },
    {
      key: "referees",
      title: demand.mode === APP_MODE.PRO_EVENT ? "主裁与边裁" : "裁判建议",
      items: pickedRefs,
    },
    {
      key: "materials",
      title: demand.mode === APP_MODE.PRO_EVENT ? "物料清单" : "基础物料",
      items: pickedMaterials,
    },
    {
      key: "rentals",
      title: demand.mode === APP_MODE.PRO_EVENT ? "租赁建议" : "基础租赁",
      items: pickedRentals,
    },
  ].filter((section) => section.items.length);

  if (demand.mode === APP_MODE.PRO_EVENT) {
    if (pickedSuppliers.length) {
      sections.push({
        key: "suppliers",
        title: "供应商建议",
        items: pickedSuppliers,
      });
    }
    if (pickedMedia.length) {
      sections.push({
        key: "media",
        title: "媒体建议",
        items: pickedMedia,
      });
    }
  }

  const reasonLines = [
    `${venue.name} 和你的镇区、预算、人数更接近，整体匹配度最高。`,
    `${getVenueLabel(demand.venuePreference)}的需求已经优先纳入匹配。`,
    demand.mode === APP_MODE.PRO_EVENT
      ? "这套方案已经把场馆、裁判、物料和执行链路一起补齐，适合直接推进落地。"
      : "这套方案更偏轻量和快速组局，不会给约球增加太多负担。",
  ];

  return {
    mode: demand.mode,
    summary,
    town: venue.town,
    matchScore: Math.min(98, Math.round(venue.score / 2)),
    topReason: reasonLines[0],
    reasonLines,
    budgetHint: buildBudgetHint(demand, venue),
    sections,
    alternatives,
    fallbackMessage: "",
    posterPayload: {
      title: demand.mode === APP_MODE.PRO_EVENT ? "东莞赛事方案已生成" : "东莞约球方案已生成",
      modeLabel: demand.mode === APP_MODE.PRO_EVENT ? "半专业赛事" : "野球约球",
      summary,
      date: demand.playDate,
      town: venue.town,
      matchScore: Math.min(98, Math.round(venue.score / 2)),
      venue: venue.name,
      budgetHint: buildBudgetHint(demand, venue),
      tags: venue.tags.slice(0, 3),
      refereeLine: joinItemNames(pickedRefs, demand.mode === APP_MODE.PRO_EVENT ? 2 : 1),
      materialLine: joinItemNames(pickedMaterials, 2),
      rentalLine: joinItemNames(pickedRentals, 2),
      supplierLine: joinItemNames(pickedSuppliers, 1),
      mediaLine: joinItemNames(pickedMedia, 1),
    },
    sharePayload: {
      city: demand.city,
      mode: demand.mode,
      sentence: demand.sentence,
      town: demand.town,
      budgetLevel: demand.budgetLevel,
      playDate: demand.playDate,
      venuePreference: demand.venuePreference,
      peopleCount: demand.peopleCount,
      teamCount: demand.teamCount,
    },
    demandMeta: {
      budgetLabel: getBudgetLabel(demand.budgetLevel),
      venueLabel: getVenueLabel(demand.venuePreference),
    },
  };
}

module.exports = {
  createRecommendation,
  getBudgetLabel,
  getVenueLabel,
};
