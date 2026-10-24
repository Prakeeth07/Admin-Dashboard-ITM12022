/* ================================================================
   SCRIPT.JS – Lanka Fresh Mart Sales Dashboard
   ----------------------------------------------------------------
   • Stores sample sales data in JavaScript objects/arrays.
   • Calculates KPI values (totals, best month, best branch)
     programmatically — nothing is hard-coded in the HTML.
   • Draws a Line chart (monthly revenue, Jan–Dec) and a Bar/Column
     chart (annual revenue by branch) using Chart.js.
   • Handles the hamburger menu toggle and dark/light theme toggle.
   • Uses addEventListener() exclusively — no inline event handlers.
   ================================================================ */

// ======================== DATA ========================
// Monthly revenue (LKR '000) and units sold for each branch,
// January to December.

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Full month names used in controls and detailed records.
const monthNamesFull = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Sales data organised by branch.
 * revenue: monthly revenue in LKR thousands (Jan–Dec).
 * units:   units sold per month (Jan–Dec).
 */
const branchData = {
  Colombo: {
    revenue: [820, 790, 880, 950, 1020, 1100, 960, 1010, 1080, 1150, 1200, 1350],
    units:   [410, 395, 440, 475, 510,  550,  480, 505,  540,  575,  600,  675]
  },
  Kandy: {
    revenue: [540, 510, 580, 620, 670, 720, 640, 660, 710, 750, 790, 850],
    units:   [270, 255, 290, 310, 335, 360, 320, 330, 355, 375, 395, 425]
  },
  Galle: {
    revenue: [430, 410, 460, 500, 550, 600, 520, 540, 570, 610, 640, 700],
    units:   [215, 205, 230, 250, 275, 300, 260, 270, 285, 305, 320, 350]
  }
};

// Branch names for iteration
const branchNames = Object.keys(branchData);

// Declared before theme initialization because theme updates can run on page load.
let salesDetailChart = null;

// ======================== KPI CALCULATIONS ========================

/**
 * Compute the aggregate monthly totals (all branches combined)
 * for both revenue and units.
 */
function computeMonthlyTotals() {
  const totalRevenue = new Array(12).fill(0);
  const totalUnits   = new Array(12).fill(0);

  branchNames.forEach(function (branch) {
    branchData[branch].revenue.forEach(function (val, i) {
      totalRevenue[i] += val;
    });
    branchData[branch].units.forEach(function (val, i) {
      totalUnits[i] += val;
    });
  });

  return { totalRevenue, totalUnits };
}

const { totalRevenue, totalUnits } = computeMonthlyTotals();

// Total Revenue (sum of all months, all branches)
const grandTotalRevenue = totalRevenue.reduce(function (sum, v) { return sum + v; }, 0);

// Total Units Sold
const grandTotalUnits = totalUnits.reduce(function (sum, v) { return sum + v; }, 0);

/**
 * Best Month — the month with the highest combined revenue.
 */
function findBestMonth() {
  let maxVal   = 0;
  let maxIndex = 0;
  totalRevenue.forEach(function (val, i) {
    if (val > maxVal) {
      maxVal   = val;
      maxIndex = i;
    }
  });
  return { name: months[maxIndex], value: maxVal };
}

const bestMonth = findBestMonth();

/**
 * Best Branch — the branch with the highest annual revenue.
 */
function findBestBranch() {
  let best      = "";
  let bestTotal = 0;

  branchNames.forEach(function (branch) {
    const annual = branchData[branch].revenue.reduce(function (s, v) { return s + v; }, 0);
    if (annual > bestTotal) {
      bestTotal = annual;
      best      = branch;
    }
  });

  return { name: best, value: bestTotal };
}

const bestBranch = findBestBranch();

// ======================== DOM MANIPULATION ========================
// Populate KPI card values from computed data.

/**
 * Format a number with commas (e.g. 1234 → "1,234").
 */
function formatNumber(num) {
  return num.toLocaleString("en-LK");
}

document.getElementById("kpi-revenue-value").textContent =
  "LKR " + formatNumber(grandTotalRevenue) + "K";

document.getElementById("kpi-units-value").textContent =
  formatNumber(grandTotalUnits);

document.getElementById("kpi-month-value").textContent =
  bestMonth.name + " (LKR " + formatNumber(bestMonth.value) + "K)";

document.getElementById("kpi-branch-value").textContent =
  bestBranch.name;

// ======================== CHART CONFIGURATION ========================
// Common colour tokens used by both charts.

const chartColors = {
  colombo:  { bg: "rgba(0, 123, 167, 0.25)", border: "#007BA7" },
  kandy:    { bg: "rgba(0, 163, 215, 0.25)", border: "#00A3D7" },
  galle:    { bg: "rgba(115, 115, 115, 0.25)", border: "#A3A3A3" },
  total:    { bg: "rgba(255, 31, 45, 0.15)", border: "#FF1F2D" }
};

/**
 * Chart font, grid, and tooltip colours tailored for light and dark themes.
 */
function getChartTheme() {
  const isDark = document.body.classList.contains("dark");
  return {
    isDark: isDark,
    textColor: isDark ? "#A3A3A3" : "#64748b",
    headingColor: isDark ? "#FFFFFF" : "#111827",
    gridColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    tooltipBg: isDark ? "rgba(23, 23, 23, 0.95)" : "rgba(255, 255, 255, 0.96)",
    tooltipBorder: isDark ? "rgba(0, 123, 167, 0.4)" : "rgba(0, 123, 167, 0.35)",
    tooltipTitle: isDark ? "#FFFFFF" : "#111827",
    tooltipBody: isDark ? "#A3A3A3" : "#64748b"
  };
}

// ---- Line Chart: Monthly Revenue (Jan – Dec) ----

const lineCtx = document.getElementById("revenue-line-chart").getContext("2d");

/**
 * Build the Line chart showing monthly revenue for Jan–Dec
 * for each branch plus the aggregate total.
 */
let lineChart = new Chart(lineCtx, {
  type: "line",
  data: {
    labels: months,
    datasets: [
      {
        label: "Colombo",
        data: branchData.Colombo.revenue,
        borderColor: chartColors.colombo.border,
        backgroundColor: chartColors.colombo.bg,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: chartColors.colombo.border,
        pointBorderColor: "#FFFFFF",
        tension: 0.35,
        fill: false
      },
      {
        label: "Kandy",
        data: branchData.Kandy.revenue,
        borderColor: chartColors.kandy.border,
        backgroundColor: chartColors.kandy.bg,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: chartColors.kandy.border,
        pointBorderColor: "#FFFFFF",
        tension: 0.35,
        fill: false
      },
      {
        label: "Galle",
        data: branchData.Galle.revenue,
        borderColor: chartColors.galle.border,
        backgroundColor: chartColors.galle.bg,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: chartColors.galle.border,
        pointBorderColor: "#FFFFFF",
        tension: 0.35,
        fill: false
      },
      {
        label: "Total",
        data: totalRevenue,
        borderColor: chartColors.total.border,
        backgroundColor: chartColors.total.bg,
        borderWidth: 3,
        borderDash: [6, 4],
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#FF1F2D",
        pointBorderColor: "#FF0000",
        pointHoverBackgroundColor: "#FFFFFF",
        pointHoverBorderColor: "#FF1F2D",
        tension: 0.35,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: "Monthly Revenue — Jan to Dec (LKR '000)",
        font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
        color: "#FFFFFF",
        padding: { bottom: 16 }
      },
      tooltip: {
        enabled: true,                         // tooltip on hover (optional extension)
        backgroundColor: "rgba(23, 23, 23, 0.95)",
        borderColor: "rgba(0, 123, 167, 0.4)",
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "#A3A3A3",
        titleFont: { family: "'Inter', sans-serif", weight: "600" },
        bodyFont:  { family: "'Inter', sans-serif" },
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: function (ctx) {
            return " " + ctx.dataset.label + ": LKR " + formatNumber(ctx.parsed.y) + "K";
          }
        }
      },
      legend: {
        labels: {
          color: getChartTheme().textColor,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: getChartTheme().textColor,
          font: { weight: "600", family: "'Inter', sans-serif" }
        },
        ticks: { color: getChartTheme().textColor },
        grid:  { color: getChartTheme().gridColor }
      },
      y: {
        title: {
          display: true,
          text: "Revenue (LKR '000)",
          color: getChartTheme().textColor,
          font: { weight: "600", family: "'Inter', sans-serif" }
        },
        ticks: { color: getChartTheme().textColor },
        grid:  { color: getChartTheme().gridColor },
        beginAtZero: false
      }
    }
  }
});

// ---- Column / Bar Chart: Annual Revenue by Branch ----

const barCtx = document.getElementById("branch-bar-chart").getContext("2d");

let barChart = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: branchNames,
    datasets: [{
      label: "Annual Revenue (LKR '000)",
      data: branchNames.map(function (b) {
        return branchData[b].revenue.reduce(function (sum, value) { return sum + value; }, 0);
      }),
      backgroundColor: [
        chartColors.colombo.border,
        chartColors.kandy.border,
        chartColors.galle.border
      ],
      borderColor: [
        chartColors.colombo.border,
        chartColors.kandy.border,
        chartColors.galle.border
      ],
      borderWidth: 1.5,
      borderRadius: 8,
      barPercentage: 0.55
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: "Annual Revenue by Branch (LKR '000)",
        font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
        color: "#FFFFFF",
        padding: { bottom: 16 }
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(23, 23, 23, 0.95)",
        borderColor: "rgba(0, 123, 167, 0.4)",
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "#A3A3A3",
        titleFont: { family: "'Inter', sans-serif", weight: "600" },
        bodyFont:  { family: "'Inter', sans-serif" },
        padding: 10,
        callbacks: {
          label: function (ctx) {
            return " Revenue: LKR " + formatNumber(ctx.parsed.y) + "K";
          }
        }
      },
      legend: {
        display: false   // single dataset, legend not necessary
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Branch",
          color: getChartTheme().textColor,
          font: { weight: "600", family: "'Inter', sans-serif" }
        },
        ticks: { color: getChartTheme().textColor },
        grid:  { display: false }
      },
      y: {
        title: {
          display: true,
          text: "Revenue (LKR '000)",
          color: getChartTheme().textColor,
          font: { weight: "600", family: "'Inter', sans-serif" }
        },
        ticks: { color: getChartTheme().textColor },
        grid:  { color: getChartTheme().gridColor },
        beginAtZero: true
      }
    }
  }
});

// ======================== EVENT HANDLERS ========================

// ---- Hamburger Menu Toggle ----
// Clicking the hamburger (☰) toggles the mobile menu open/closed.

const hamburgerBtn = document.getElementById("hamburger-btn");
const navLinks     = document.getElementById("nav-links");

hamburgerBtn.addEventListener("click", function () {
  navLinks.classList.toggle("open");

  // Update aria-expanded for accessibility
  const isOpen = navLinks.classList.contains("open");
  hamburgerBtn.setAttribute("aria-expanded", String(isOpen));

  // Swap hamburger icon ↔ close icon
  const icon = hamburgerBtn.querySelector("i");
  if (isOpen) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-xmark");
  } else {
    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");
  }
});

// ---- Page Navigation & Active Link Highlight ----
// Clicking a nav link switches the active page view (Dashboard, Sales, Reports, Settings)

const allNavLinks = document.querySelectorAll(".navbar__link");
const allPageViews = document.querySelectorAll(".page-view");

/**
 * Switch the visible page view.
 * @param {string} pageName – "dashboard" | "sales" | "reports" | "settings"
 */
function switchPage(pageName) {
  const targetId = "page-" + pageName;
  const targetPage = document.getElementById(targetId);

  // If page doesn't exist, fallback to dashboard
  const activePage = targetPage ? targetId : "page-dashboard";
  const normalizedPage = targetPage ? pageName : "dashboard";

  // Update page view visibility
  allPageViews.forEach(function (view) {
    if (view.id === activePage) {
      view.classList.add("active");
    } else {
      view.classList.remove("active");
    }
  });

  // Update active class on nav links
  allNavLinks.forEach(function (link) {
    if (link.getAttribute("data-page") === normalizedPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Trigger chart resize/rendering when switching views
  if (normalizedPage === "dashboard") {
    if (typeof lineChart !== "undefined" && lineChart) lineChart.resize();
    if (typeof barChart !== "undefined" && barChart) barChart.resize();
  } else if (normalizedPage === "sales") {
    updateSalesPage();
    if (typeof salesDetailChart !== "undefined" && salesDetailChart) {
      salesDetailChart.resize();
    }
  } else if (normalizedPage === "reports") {
    renderReportsTable();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

allNavLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const page = this.getAttribute("data-page");
    switchPage(page);

    // Update URL hash for bookmarking/direct navigation
    if (history.pushState) {
      history.pushState(null, null, "#" + page);
    } else {
      window.location.hash = page;
    }

    // Close mobile menu after selection
    navLinks.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    const icon = hamburgerBtn.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  });
});

// ---- Dark / Light Mode Toggle ----
// Clicking the theme toggle button switches between dark and light themes.

const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon      = document.getElementById("theme-icon");

/**
 * Apply the theme mode (dark or light) and update icon, aria-label, and charts.
 * @param {boolean} isDark
 */
function applyThemeMode(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
    if (themeIcon) {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
      themeToggleBtn.setAttribute("title", "Switch to light mode");
    }
  } else {
    document.body.classList.remove("dark");
    if (themeIcon) {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
      themeToggleBtn.setAttribute("title", "Switch to dark mode");
    }
  }
  updateChartsTheme();
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", function () {
    const willBeDark = !document.body.classList.contains("dark");
    applyThemeMode(willBeDark);
    try {
      localStorage.setItem("lfm-theme", willBeDark ? "dark" : "light");
    } catch (e) {}
  });
}

/**
 * Re-apply text and grid colours on all charts when the theme changes.
 * This ensures axis labels, titles and grid lines remain legible.
 */
function updateChartsTheme() {
  const theme = getChartTheme();

  // Helper: update a chart's scale, tooltip, and plugin colours
  function applyTheme(chart) {
    if (!chart) return;
    // Scales
    ["x", "y", "y1"].forEach(function (axis) {
      if (chart.options.scales && chart.options.scales[axis]) {
        if (chart.options.scales[axis].ticks) {
          chart.options.scales[axis].ticks.color = theme.textColor;
        }
        if (chart.options.scales[axis].title) {
          chart.options.scales[axis].title.color = theme.textColor;
        }
        if (chart.options.scales[axis].grid) {
          chart.options.scales[axis].grid.color = theme.gridColor;
        }
      }
    });
    // Title
    if (chart.options.plugins && chart.options.plugins.title) {
      chart.options.plugins.title.color = theme.headingColor;
    }
    // Legend
    if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
      chart.options.plugins.legend.labels.color = theme.textColor;
    }
    // Tooltips
    if (chart.options.plugins && chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = theme.tooltipBg;
      chart.options.plugins.tooltip.borderColor = theme.tooltipBorder;
      chart.options.plugins.tooltip.titleColor = theme.tooltipTitle;
      chart.options.plugins.tooltip.bodyColor = theme.tooltipBody;
    }
    chart.update();
  }

  applyTheme(lineChart);
  applyTheme(barChart);
  if (typeof salesDetailChart !== "undefined" && salesDetailChart) {
    applyTheme(salesDetailChart);
  }
}

// Initial theme check on script load
try {
  const savedTheme = localStorage.getItem("lfm-theme");
  if (savedTheme === "light") {
    applyThemeMode(false);
  } else {
    applyThemeMode(true);
  }
} catch (e) {
  applyThemeMode(true);
}

// ======================== BRANCH PROGRESS RANKING ========================

/**
 * Compute branch metrics for ranking.
 * Returns an array of objects sorted from best (highest) to worst.
 *
 * @param {string} metric  – "revenue" | "units" | "growth"
 * @returns {Array<{name: string, value: number, label: string, pct: number, delta: number}>}
 */
function computeBranchRanking(metric, periodIndex) {
  const results = [];

  branchNames.forEach(function (branch) {
    const rev   = branchData[branch].revenue;
    const units = branchData[branch].units;

    let value = 0;
    let label = "";

    var delta = 0;

    if (periodIndex !== null) {
      var hasPreviousMonth = periodIndex > 0;
      var valueSeries = metric === "units" ? units : rev;
      var previousValue = hasPreviousMonth ? valueSeries[periodIndex - 1] : 0;
      delta = hasPreviousMonth && previousValue > 0
        ? ((valueSeries[periodIndex] - previousValue) / previousValue) * 100
        : 0;

      if (metric === "revenue") {
        value = rev[periodIndex];
        label = "LKR " + formatNumber(value) + "K";
      } else if (metric === "units") {
        value = units[periodIndex];
        label = formatNumber(value) + " units";
      } else {
        value = delta;
        label = hasPreviousMonth ? delta.toFixed(1) + "% MoM growth" : "No prior month";
      }
    } else {
      if (metric === "revenue") {
        value = rev.reduce(function (s, v) { return s + v; }, 0);
        label = "LKR " + formatNumber(value) + "K";
      } else if (metric === "units") {
        value = units.reduce(function (s, v) { return s + v; }, 0);
        label = formatNumber(value) + " units";
      } else if (metric === "growth") {
        // H1 = Jan–Jun (indices 0–5), H2 = Jul–Dec (indices 6–11)
        var h1 = 0, h2 = 0;
        for (var i = 0; i < 6; i++) { h1 += rev[i]; }
        for (var j = 6; j < 12; j++) { h2 += rev[j]; }
        value = h1 > 0 ? ((h2 - h1) / h1) * 100 : 0;
        label = value.toFixed(1) + "% growth";
      }

      // Annual rankings compare the second half with the first half.
      var h1Value = 0, h2Value = 0;
      var annualSeries = metric === "units" ? units : rev;
      for (var k = 0; k < 6; k++) { h1Value += annualSeries[k]; }
      for (var m = 6; m < 12; m++) { h2Value += annualSeries[m]; }
      delta = h1Value > 0 ? ((h2Value - h1Value) / h1Value) * 100 : 0;
    }

    results.push({
      name:  branch,
      value: value,
      label: label,
      delta: delta
    });
  });

  // Sort descending (best first)
  results.sort(function (a, b) { return b.value - a.value; });

  // Compute percentage relative to the best (top = 100%)
  var maxVal = results.length > 0 ? Math.abs(results[0].value) : 1;
  if (maxVal === 0) maxVal = 1;

  results.forEach(function (item) {
    item.pct = Math.round((Math.abs(item.value) / maxVal) * 100);
  });

  return results;
}

/**
 * Render the ranking cards into the DOM.
 * @param {string} metric
 */
function getRankingPeriodIndex() {
  var periodSelect = document.getElementById("ranking-period");
  return periodSelect && periodSelect.value !== "all" ? Number(periodSelect.value) : null;
}

function updateRankingPeriodSummary(periodIndex) {
  var summary = document.getElementById("ranking-period-summary");
  if (!summary) return;

  summary.textContent = periodIndex === null
    ? "Showing annual branch performance. Select a month to compare its results."
    : "Showing " + monthNamesFull[periodIndex] + " branch performance. Select a branch to open its monthly sales record.";
}

function renderRanking(metric) {
  var container = document.getElementById("ranking-list");
  var periodIndex = getRankingPeriodIndex();
  var ranked    = computeBranchRanking(metric, periodIndex);
  updateRankingPeriodSummary(periodIndex);

  // Build HTML
  var html = "";
  ranked.forEach(function (item, index) {
    var rank = index + 1;

    // Delta arrow
    var deltaClass = item.delta >= 0 ? "ranking-card__delta--up" : "ranking-card__delta--down";
    var deltaIcon  = item.delta >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down";
    var deltaText  = (item.delta >= 0 ? "+" : "") + item.delta.toFixed(1) + "%";

    html += '<article class="ranking-card" data-branch="' + item.name + '" role="button" tabindex="0" aria-label="Open ' + item.name + ' sales details">';
    html += '  <div class="ranking-card__rank ranking-card__rank--' + rank + '">' + rank + '</div>';
    html += '  <div class="ranking-card__body">';
    html += '    <div class="ranking-card__top-row">';
    html += '      <span class="ranking-card__branch-name">' + item.name + '</span>';
    html += '      <span class="ranking-card__value">' + item.label;
    html += '        <span class="ranking-card__delta ' + deltaClass + '">';
    html += '          <i class="fa-solid ' + deltaIcon + '"></i> ' + deltaText;
    html += '        </span>';
    html += '      </span>';
    html += '    </div>';
    html += '    <div class="ranking-card__bar-track">';
    html += '      <div class="ranking-card__bar-fill ranking-card__bar-fill--' + rank + '" data-width="' + item.pct + '"></div>';
    html += '    </div>';
    html += '    <div class="ranking-card__pct">' + item.pct + '% of top</div>';
    html += '    <span class="ranking-card__detail-link">View sales details <i class="fa-solid fa-arrow-right"></i></span>';
    html += '  </div>';
    html += '</article>';
  });

  container.innerHTML = html;

  // Animate progress bars after a tiny delay so the transition triggers
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var bars = container.querySelectorAll(".ranking-card__bar-fill");
      bars.forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-width") + "%";
      });
    });
  });
}

// Initial render with default metric
renderRanking("revenue");

// Listen for metric change
document.getElementById("ranking-metric").addEventListener("change", function () {
  renderRanking(this.value);
});

document.getElementById("ranking-period").addEventListener("change", function () {
  renderRanking(document.getElementById("ranking-metric").value);
});

// ================================================================
// SALES PAGE – BRANCH SELECTION, KPIS, CHART & MONTHLY DETAILS
// ================================================================

// Sales page state
let currentSalesBranch   = "Colombo";
let currentQuarterFilter = "all";
let currentMonthSearch   = "";

/**
 * Retrieve sales data for a specific branch or combined all branches.
 * @param {string} branchKey – "Colombo" | "Kandy" | "Galle" | "all"
 */
function getBranchSalesDetails(branchKey) {
  if (branchKey === "all") {
    return {
      key: "all",
      displayName: "All Branches (Combined)",
      revenue: totalRevenue,
      units: totalUnits
    };
  }
  return {
    key: branchKey,
    displayName: branchKey + " Branch",
    revenue: branchData[branchKey].revenue,
    units: branchData[branchKey].units
  };
}

/**
 * Update the KPI summary cards on the Sales page.
 * @param {Object} sales
 */
function updateSalesKPIs(sales) {
  const revSum   = sales.revenue.reduce(function (s, v) { return s + v; }, 0);
  const unitsSum = sales.units.reduce(function (s, v) { return s + v; }, 0);

  // Peak Month
  let maxRev = 0;
  let maxIdx = 0;
  sales.revenue.forEach(function (val, i) {
    if (val > maxRev) {
      maxRev = val;
      maxIdx = i;
    }
  });

  const avgRev = Math.round(revSum / sales.revenue.length);
  const branchShortName = sales.key === "all" ? "All" : sales.key;

  // DOM elements
  const revLabelEl = document.getElementById("sales-kpi-revenue-label");
  const revValEl   = document.getElementById("sales-kpi-revenue-value");
  const unitsValEl = document.getElementById("sales-kpi-units-value");
  const monthValEl = document.getElementById("sales-kpi-month-value");
  const avgValEl   = document.getElementById("sales-kpi-avg-value");

  if (revLabelEl) revLabelEl.textContent = "Total Revenue (" + branchShortName + ")";
  if (revValEl)   revValEl.textContent   = "LKR " + formatNumber(revSum) + "K";
  if (unitsValEl) unitsValEl.textContent = formatNumber(unitsSum) + " units";
  if (monthValEl) monthValEl.textContent = monthNamesFull[maxIdx] + " (LKR " + formatNumber(maxRev) + "K)";
  if (avgValEl)   avgValEl.textContent   = "LKR " + formatNumber(avgRev) + "K / mo";
}

/**
 * Initialize or update the Sales Detail Chart (Revenue & Units).
 * @param {Object} sales
 */
function renderSalesDetailChart(sales) {
  const canvas = document.getElementById("sales-detail-chart");
  if (!canvas) return;

  const theme = getChartTheme();

  // Branch-specific color accents
  let barColor = "#007BA7";
  let barBg    = "rgba(0, 123, 167, 0.75)";
  if (sales.key === "Kandy") {
    barColor = "#00A3D7";
    barBg    = "rgba(0, 163, 215, 0.75)";
  } else if (sales.key === "Galle") {
    barColor = "#737373";
    barBg    = "rgba(115, 115, 115, 0.75)";
  } else if (sales.key === "all") {
    barColor = "#007BA7";
    barBg    = "rgba(0, 123, 167, 0.85)";
  }

  // Update chart title in HTML
  const chartTitleEl = document.getElementById("sales-chart-title");
  if (chartTitleEl) {
    chartTitleEl.innerHTML = '<i class="fa-solid fa-chart-area"></i> Monthly Sales & Units Trend — ' + sales.displayName;
  }

  if (salesDetailChart) {
    // Update existing chart
    salesDetailChart.data.labels = months;
    salesDetailChart.data.datasets[0].data = sales.revenue;
    salesDetailChart.data.datasets[0].backgroundColor = barBg;
    salesDetailChart.data.datasets[0].borderColor = barColor;
    salesDetailChart.data.datasets[1].data = sales.units;
    salesDetailChart.update();
  } else {
    // Create new chart
    const ctx = canvas.getContext("2d");
    salesDetailChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            type: "bar",
            label: "Monthly Revenue (LKR '000)",
            data: sales.revenue,
            backgroundColor: barBg,
            borderColor: barColor,
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: "y",
            order: 2
          },
          {
            type: "line",
            label: "Units Sold",
            data: sales.units,
            borderColor: "#FF1F2D",
            backgroundColor: "rgba(255, 31, 45, 0.15)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#FF1F2D",
            pointBorderColor: "#FFFFFF",
            pointHoverBackgroundColor: "#FFFFFF",
            pointHoverBorderColor: "#FF0000",
            tension: 0.35,
            fill: false,
            yAxisID: "y1",
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false // Using custom styled HTML legend
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(23, 23, 23, 0.95)",
            borderColor: "rgba(0, 123, 167, 0.4)",
            borderWidth: 1,
            titleColor: "#FFFFFF",
            bodyColor: "#A3A3A3",
            titleFont: { family: "'Inter', sans-serif", size: 13, weight: "600" },
            bodyFont:  { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
            callbacks: {
              label: function (ctx) {
                if (ctx.dataset.yAxisID === "y") {
                  return " Revenue: LKR " + formatNumber(ctx.parsed.y) + "K";
                } else {
                  return " Units Sold: " + formatNumber(ctx.parsed.y) + " units";
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Month",
              color: theme.textColor,
              font: { weight: "600", family: "'Inter', sans-serif" }
            },
            ticks: { color: theme.textColor },
            grid:  { color: theme.gridColor }
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Revenue (LKR '000)",
              color: theme.textColor,
              font: { weight: "600", family: "'Inter', sans-serif" }
            },
            ticks: { color: theme.textColor },
            grid:  { color: theme.gridColor },
            beginAtZero: false
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Units Sold",
              color: theme.textColor,
              font: { weight: "600", family: "'Inter', sans-serif" }
            },
            ticks: { color: theme.textColor },
            grid:  { drawOnChartArea: false }, // Avoid duplicate gridlines
            beginAtZero: false
          }
        }
      }
    });
  }
}

/**
 * Render the Sales Details table with Month, Monthly Revenue, Units Sold,
 * Avg Price per Unit, MoM Growth, and Annual Share %.
 */
function renderSalesTable() {
  const sales = getBranchSalesDetails(currentSalesBranch);
  const tbody = document.getElementById("sales-table-body");
  const tfoot = document.getElementById("sales-table-foot");
  const subtitleEl = document.getElementById("table-subtitle");

  if (!tbody || !tfoot) return;

  const totalAnnualRev = sales.revenue.reduce(function (s, v) { return s + v; }, 0);

  if (subtitleEl) {
    var monthContext = currentMonthSearch
      ? " — filtered by month: " + currentMonthSearch
      : "";
    subtitleEl.textContent = "Showing sales performance for " + sales.displayName + monthContext;
  }

  // Determine quarter index range
  let quarterIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  if (currentQuarterFilter === "Q1") quarterIndices = [0, 1, 2];
  else if (currentQuarterFilter === "Q2") quarterIndices = [3, 4, 5];
  else if (currentQuarterFilter === "Q3") quarterIndices = [6, 7, 8];
  else if (currentQuarterFilter === "Q4") quarterIndices = [9, 10, 11];

  // Filter by search query
  const filteredIndices = quarterIndices.filter(function (idx) {
    if (!currentMonthSearch) return true;
    const shortName = months[idx].toLowerCase();
    const fullName  = monthNamesFull[idx].toLowerCase();
    return shortName.includes(currentMonthSearch) || fullName.includes(currentMonthSearch);
  });

  // Render Table Rows
  let html = "";
  let displayedRevTotal   = 0;
  let displayedUnitsTotal = 0;

  if (filteredIndices.length === 0) {
    html = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--clr-text-muted);">' +
           '<i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>' +
           'No months found matching "' + currentMonthSearch + '"</td></tr>';
  } else {
    filteredIndices.forEach(function (idx) {
      const rev   = sales.revenue[idx];
      const units = sales.units[idx];
      displayedRevTotal   += rev;
      displayedUnitsTotal += units;

      // Avg price per unit (LKR): (rev * 1000) / units
      const avgPrice = units > 0 ? Math.round((rev * 1000) / units) : 0;

      // MoM growth vs previous month
      let momBadge = '<span class="trend-badge trend-badge--neutral">—</span>';
      if (idx > 0) {
        const prevRev = sales.revenue[idx - 1];
        if (prevRev > 0) {
          const delta = ((rev - prevRev) / prevRev) * 100;
          if (delta >= 0) {
            momBadge = '<span class="trend-badge trend-badge--up"><i class="fa-solid fa-arrow-up"></i> +' + delta.toFixed(1) + '%</span>';
          } else {
            momBadge = '<span class="trend-badge trend-badge--down"><i class="fa-solid fa-arrow-down"></i> ' + delta.toFixed(1) + '%</span>';
          }
        }
      }

      // Annual share %
      const sharePct = totalAnnualRev > 0 ? ((rev / totalAnnualRev) * 100).toFixed(1) : "0.0";

      html += '<tr>';
      html += '  <td class="td--num">' + (idx + 1) + '</td>';
      html += '  <td class="td--month"><strong>' + monthNamesFull[idx] + '</strong> <span style="color: var(--clr-text-muted); font-size: 0.8rem;">(' + months[idx] + ')</span></td>';
      html += '  <td class="td--revenue">LKR ' + formatNumber(rev) + 'K</td>';
      html += '  <td class="td--units">' + formatNumber(units) + '</td>';
      html += '  <td class="td--avg">LKR ' + formatNumber(avgPrice) + '</td>';
      html += '  <td class="td--mom">' + momBadge + '</td>';
      html += '  <td class="td--share">';
      html += '    <div class="share-progress">';
      html += '      <div class="share-progress__track"><div class="share-progress__fill" style="width: ' + sharePct + '%"></div></div>';
      html += '      <span class="share-progress__text">' + sharePct + '%</span>';
      html += '    </div>';
      html += '  </td>';
      html += '</tr>';
    });
  }

  tbody.innerHTML = html;

  // Render Footer Summary Row
  const overallAvgPrice = displayedUnitsTotal > 0 ? Math.round((displayedRevTotal * 1000) / displayedUnitsTotal) : 0;
  const displayedShare = totalAnnualRev > 0 ? ((displayedRevTotal / totalAnnualRev) * 100).toFixed(1) : "0.0";

  let footHtml = '<tr>';
  footHtml += '  <td class="td--num"><i class="fa-solid fa-sigma"></i></td>';
  footHtml += '  <td class="td--month">Total / Summary (' + filteredIndices.length + ' mo)</td>';
  footHtml += '  <td class="td--revenue">LKR ' + formatNumber(displayedRevTotal) + 'K</td>';
  footHtml += '  <td class="td--units">' + formatNumber(displayedUnitsTotal) + ' units</td>';
  footHtml += '  <td class="td--avg">LKR ' + formatNumber(overallAvgPrice) + ' avg</td>';
  var tableScope = currentMonthSearch
    ? "Month filter"
    : (currentQuarterFilter === "all" ? "Full Year" : currentQuarterFilter);
  footHtml += '  <td class="td--mom"><span class="badge--pill">' + tableScope + '</span></td>';
  footHtml += '  <td class="td--share">';
  footHtml += '    <div class="share-progress">';
  footHtml += '      <div class="share-progress__track"><div class="share-progress__fill" style="width: ' + displayedShare + '%"></div></div>';
  footHtml += '      <span class="share-progress__text">' + displayedShare + '%</span>';
  footHtml += '    </div>';
  footHtml += '  </td>';
  footHtml += '</tr>';

  tfoot.innerHTML = footHtml;
}

/**
 * Master update function for the Sales page.
 */
function updateSalesPage() {
  const sales = getBranchSalesDetails(currentSalesBranch);
  updateSalesKPIs(sales);
  renderSalesDetailChart(sales);
  renderSalesTable();
}

/**
 * Set the selected branch and synchronize all UI controls.
 * @param {string} branchKey – "Colombo" | "Kandy" | "Galle" | "all"
 */
function setSalesBranch(branchKey) {
  currentSalesBranch = branchKey;

  // Sync Dropdown Select
  const branchSelect = document.getElementById("sales-branch-select");
  if (branchSelect && branchSelect.value !== branchKey) {
    branchSelect.value = branchKey;
  }

  // Sync Pill Buttons
  const pills = document.querySelectorAll("#branch-pills .branch-pill");
  pills.forEach(function (pill) {
    if (pill.getAttribute("data-branch") === branchKey) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  updateSalesPage();
}

// ---- Event Listeners for Branch Selection ----

// 1. Dropdown select change
const branchSelectEl = document.getElementById("sales-branch-select");
if (branchSelectEl) {
  branchSelectEl.addEventListener("change", function () {
    setSalesBranch(this.value);
  });
}

// 2. Quick branch pill buttons
const branchPills = document.querySelectorAll("#branch-pills .branch-pill");
branchPills.forEach(function (pill) {
  pill.addEventListener("click", function () {
    const branch = this.getAttribute("data-branch");
    setSalesBranch(branch);
  });
});

/**
 * Open the detailed monthly record for a branch selected in the dashboard
 * ranking. A chosen dashboard month is carried to the Sales table filter.
 * @param {string} branchKey
 */
function openRankingSalesDetails(branchKey) {
  var periodIndex = getRankingPeriodIndex();

  // Show the selected month alone when the dashboard ranking is month-based.
  currentQuarterFilter = "all";
  quarterPills.forEach(function (pill) {
    pill.classList.toggle("active", pill.getAttribute("data-quarter") === "all");
  });
  currentMonthSearch = periodIndex === null ? "" : monthNamesFull[periodIndex].toLowerCase();

  var searchInput = document.getElementById("sales-month-search");
  if (searchInput) searchInput.value = periodIndex === null ? "" : monthNamesFull[periodIndex];

  setSalesBranch(branchKey);
  switchPage("sales");

  // Keep the URL bookmarkable, just like the main navigation links.
  if (history.pushState) {
    history.pushState(null, null, "#sales");
  } else {
    window.location.hash = "sales";
  }

  // The user selected a details action, so take them to the filtered table.
  var salesTableCard = document.getElementById("sales-table-card");
  if (salesTableCard) {
    requestAnimationFrame(function () {
      salesTableCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// Dashboard ranking cards act as links to their connected Sales Details view.
var rankingList = document.getElementById("ranking-list");
if (rankingList) {
  rankingList.addEventListener("click", function (event) {
    var card = event.target.closest(".ranking-card[data-branch]");
    if (card) openRankingSalesDetails(card.getAttribute("data-branch"));
  });

  rankingList.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    var card = event.target.closest(".ranking-card[data-branch]");
    if (card) {
      event.preventDefault();
      openRankingSalesDetails(card.getAttribute("data-branch"));
    }
  });
}

// 3. Quarter Filter Pills
const quarterPills = document.querySelectorAll("#quarter-filter .filter-pill");
quarterPills.forEach(function (pill) {
  pill.addEventListener("click", function () {
    quarterPills.forEach(function (p) { p.classList.remove("active"); });
    this.classList.add("active");
    currentQuarterFilter = this.getAttribute("data-quarter");
    renderSalesTable();
  });
});

// 4. Month Search Input
const monthSearchInput = document.getElementById("sales-month-search");
if (monthSearchInput) {
  monthSearchInput.addEventListener("input", function () {
    currentMonthSearch = this.value.trim().toLowerCase();
    renderSalesTable();
  });
}

// 5. Export to CSV Button
const exportCsvBtn = document.getElementById("export-csv-btn");
if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", function () {
    const sales = getBranchSalesDetails(currentSalesBranch);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month Number,Month,Full Month,Monthly Revenue (LKR '000),Units Sold,Avg Price per Unit (LKR),MoM Growth (%)\r\n";

    sales.revenue.forEach(function (rev, i) {
      const units = sales.units[i];
      const avgPrice = units > 0 ? Math.round((rev * 1000) / units) : 0;
      let momStr = "N/A";
      if (i > 0 && sales.revenue[i - 1] > 0) {
        momStr = (((rev - sales.revenue[i - 1]) / sales.revenue[i - 1]) * 100).toFixed(1) + "%";
      }
      csvContent += (i + 1) + "," + months[i] + "," + monthNamesFull[i] + "," + rev + "," + units + "," + avgPrice + "," + momStr + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "LankaFreshMart_" + currentSalesBranch + "_Sales_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// 6. Print Button
const printSalesBtn = document.getElementById("print-sales-btn");
if (printSalesBtn) {
  printSalesBtn.addEventListener("click", function () {
    window.print();
  });
}

// ================================================================
// REPORTS PAGE – EXECUTIVE BRANCH SUMMARY
// ================================================================

function renderReportsTable() {
  const tbody = document.getElementById("reports-branch-table-body");
  if (!tbody) return;

  let html = "";
  branchNames.forEach(function (branch) {
    const rev   = branchData[branch].revenue;
    const units = branchData[branch].units;
    const totalRev   = rev.reduce(function (s, v) { return s + v; }, 0);
    const totalUnits = units.reduce(function (s, v) { return s + v; }, 0);

    // Peak month
    let maxVal = 0, maxIdx = 0;
    rev.forEach(function (v, i) {
      if (v > maxVal) { maxVal = v; maxIdx = i; }
    });

    const share = ((totalRev / grandTotalRevenue) * 100).toFixed(1);

    html += '<tr>';
    html += '  <td><strong><i class="fa-solid fa-location-dot" style="color: var(--clr-primary); margin-right: 6px;"></i>' + branch + '</strong></td>';
    html += '  <td>LKR ' + formatNumber(totalRev) + 'K</td>';
    html += '  <td>' + formatNumber(totalUnits) + ' units</td>';
    html += '  <td>' + monthNamesFull[maxIdx] + ' (LKR ' + formatNumber(maxVal) + 'K)</td>';
    html += '  <td><span class="badge--pill">' + share + '% of total</span></td>';
    html += '</tr>';
  });

  // Combined Total Row
  html += '<tr style="font-weight: 800; background: var(--clr-bg); border-top: 2px solid var(--clr-border);">';
  html += '  <td><i class="fa-solid fa-globe" style="color: var(--clr-primary); margin-right: 6px; text-shadow: 0 0 8px rgba(0, 123, 167, 0.5);"></i> All Branches Combined</td>';
  html += '  <td style="color: var(--clr-primary); text-shadow: 0 0 8px rgba(0, 123, 167, 0.5);">LKR ' + formatNumber(grandTotalRevenue) + 'K</td>';
  html += '  <td>' + formatNumber(grandTotalUnits) + ' units</td>';
  html += '  <td>' + bestMonth.name + ' (LKR ' + formatNumber(bestMonth.value) + 'K)</td>';
  html += '  <td><span class="badge--pill">100.0%</span></td>';
  html += '</tr>';

  tbody.innerHTML = html;
}

// ================================================================
// INITIALIZATION
// ================================================================

// Initial setup for the Sales page
updateSalesPage();

// Check URL hash on page load (e.g. index.html#sales)
window.addEventListener("DOMContentLoaded", function () {
  const hash = window.location.hash.replace("#", "");
  if (hash === "sales" || hash === "reports" || hash === "settings") {
    switchPage(hash);
  } else {
    switchPage("dashboard");
  }
});

// Handle browser Back / Forward buttons
window.addEventListener("hashchange", function () {
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    switchPage(hash);
  } else {
    switchPage("dashboard");
  }
});

