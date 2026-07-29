const { APP_MODE, TOWN_OPTIONS } = require("./constants");

function detectTown(sentence = "") {
  return TOWN_OPTIONS.find((town) => sentence.includes(town)) || "";
}

function detectBudget(sentence = "") {
  if (
    sentence.includes("1万") ||
    sentence.includes("10000") ||
    sentence.includes("高配") ||
    sentence.includes("品牌")
  ) {
    return "high";
  }

  if (
    sentence.includes("预算") ||
    sentence.includes("企业赛") ||
    sentence.includes("联赛") ||
    sentence.includes("标准")
  ) {
    return "mid";
  }

  if (
    sentence.includes("别太高") ||
    sentence.includes("便宜") ||
    sentence.includes("低预算") ||
    sentence.includes("轻量")
  ) {
    return "low";
  }

  return "";
}

function detectPeopleCount(sentence = "") {
  const teamMatch = sentence.match(/(\d+)\s*支/);
  if (teamMatch) {
    const teamCount = Number(teamMatch[1]);
    return {
      teamCount,
      peopleCount: teamCount * 10,
    };
  }

  const versusMatch = sentence.match(/(\d+)\s*v\s*(\d+)/i);
  if (versusMatch) {
    const left = Number(versusMatch[1]);
    const right = Number(versusMatch[2]);
    return {
      teamCount: 2,
      peopleCount: left + right,
    };
  }

  const playerMatch = sentence.match(/(\d+)\s*人/);
  if (playerMatch) {
    return {
      teamCount: "",
      peopleCount: Number(playerMatch[1]),
    };
  }

  return {
    teamCount: "",
    peopleCount: "",
  };
}

function detectVenuePreference(sentence = "") {
  if (sentence.includes("室内")) {
    return "indoor";
  }
  if (sentence.includes("室外")) {
    return "outdoor";
  }
  return "";
}

function detectDate(sentence = "") {
  if (sentence.includes("今天")) {
    return "2026-07-29";
  }
  if (sentence.includes("明天") || sentence.includes("明晚")) {
    return "2026-07-30";
  }
  if (sentence.includes("周五")) {
    return "2026-07-31";
  }
  if (sentence.includes("本周六") || (sentence.includes("周六") && !sentence.includes("下周六"))) {
    return "2026-08-01";
  }
  if (sentence.includes("周日")) {
    return "2026-08-02";
  }
  if (sentence.includes("下周六")) {
    return "2026-08-08";
  }
  if (sentence.includes("月底")) {
    return "2026-07-31";
  }
  return "";
}

function parseDemand(mode, sentence = "") {
  const { teamCount, peopleCount } = detectPeopleCount(sentence);

  return {
    mode,
    sentence,
    city: "东莞",
    town: detectTown(sentence),
    peopleCount,
    teamCount,
    budgetLevel: detectBudget(sentence),
    playDate: detectDate(sentence),
    venuePreference: detectVenuePreference(sentence),
    needReferee: !sentence.includes("不用裁判"),
    needMaterials:
      sentence.includes("物料") ||
      sentence.includes("奖牌") ||
      sentence.includes("球衣") ||
      sentence.includes("计分"),
    needMedia:
      mode === APP_MODE.PRO_EVENT &&
      (sentence.includes("摄影") ||
        sentence.includes("直播") ||
        sentence.includes("媒体") ||
        sentence.includes("曝光")),
    needSupplier:
      mode === APP_MODE.PRO_EVENT &&
      (sentence.includes("执行") ||
        sentence.includes("主持") ||
        sentence.includes("赛事")),
  };
}

function getMissingFields(demand) {
  const fields = [];

  if (!demand.town) {
    fields.push("town");
  }
  if (!demand.playDate) {
    fields.push("playDate");
  }
  if (!demand.budgetLevel) {
    fields.push("budgetLevel");
  }
  if (!demand.peopleCount) {
    fields.push("peopleCount");
  }
  if (demand.mode === APP_MODE.PRO_EVENT && !demand.teamCount) {
    fields.push("teamCount");
  }

  return fields;
}

module.exports = {
  parseDemand,
  getMissingFields,
};
