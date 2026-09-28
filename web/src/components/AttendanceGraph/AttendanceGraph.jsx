import React, { useState, useMemo } from "react";
import "./AttendanceGraph.css";

export const AttendanceGraph = ({
  trendsData,
  selectedDays = 14,
  onDaysChange,
}) => {
  const [chartType, setChartType] = useState("area"); // 'area' | 'bar'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const trends = useMemo(() => {
    return trendsData?.trend || [];
  }, [trendsData]);

  // Summary Metrics
  const summary = useMemo(() => {
    if (!trends.length) {
      return { totalPresent: 0, totalAbsent: 0, avgRate: 0, highestDay: null };
    }
    const totalPresent = trends.reduce((acc, curr) => acc + (curr.present || 0), 0);
    const totalAbsent = trends.reduce((acc, curr) => acc + (curr.absent || 0), 0);
    const avgRate = (
      trends.reduce((acc, curr) => acc + (curr.attendanceRate || 0), 0) / trends.length
    ).toFixed(1);

    let highest = trends[0];
    trends.forEach((t) => {
      if ((t.attendanceRate || 0) > (highest.attendanceRate || 0)) {
        highest = t;
      }
    });

    return { totalPresent, totalAbsent, avgRate, highestDay: highest };
  }, [trends]);

  // Coordinate calculations for SVG
  const svgWidth = 840;
  const svgHeight = 240;
  const padLeft = 55;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 40;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Max student total across all days for bar chart scale
  const maxBarTotal = useMemo(() => {
    const max = trends.reduce((m, item) => {
      const tot = (item.present || 0) + (item.absent || 0);
      return tot > m ? tot : m;
    }, 0);
    return max > 0 ? max : 30;
  }, [trends]);

  // Calculate points for Area / Line Chart
  const points = useMemo(() => {
    if (!trends.length) return [];
    const step = trends.length > 1 ? chartWidth / (trends.length - 1) : chartWidth / 2;

    return trends.map((item, idx) => {
      const x = padLeft + idx * step;
      const rate = Math.min(100, Math.max(0, item.attendanceRate || 0));
      // Y is inverted: rate 100% -> padTop, rate 0% -> padTop + chartHeight
      const y = padTop + chartHeight - (rate / 100) * chartHeight;
      return { x, y, rate, ...item, idx };
    });
  }, [trends, chartWidth, chartHeight, padLeft, padTop]);

  // Generate SVG path for Smooth Bézier Line and Area
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "" };
    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${padLeft} ${p.y} L ${padLeft + chartWidth} ${p.y}`,
        areaPath: `M ${padLeft} ${p.y} L ${padLeft + chartWidth} ${p.y} L ${padLeft + chartWidth} ${padTop + chartHeight} L ${padLeft} ${padTop + chartHeight} Z`,
      };
    }

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padTop + chartHeight;
    const aPath = `${d} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    return { linePath: d, areaPath: aPath };
  }, [points, padLeft, padTop, chartHeight, chartWidth]);

  // 75% target threshold Y coordinate
  const target75Y = padTop + chartHeight - 0.75 * chartHeight;

  return (
    <section className="attendance-graph-card">
      {/* Header with Title and Controls */}
      <div className="attendance-graph-header">
        <div className="graph-title-group">
          <div className="graph-icon-badge">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h3 className="graph-title">Campus Attendance History &amp; Turnout Trends</h3>
            <p className="graph-subtitle">
              Interactive timeline of daily student attendance rates, physical turnout, and 75% compliance threshold
            </p>
          </div>
        </div>

        {/* View Mode and Day Selection Controls */}
        <div className="graph-controls-cluster">
          {/* Chart View Toggle */}
          <div className="graph-view-toggle">
            <button
              className={`view-toggle-btn ${chartType === "area" ? "active" : ""}`}
              onClick={() => setChartType("area")}
              title="Attendance Percentage Rate Line"
            >
              <i className="fa-solid fa-chart-area"></i>
              <span>Rate Trend</span>
            </button>
            <button
              className={`view-toggle-btn ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}
              title="Present vs Absent Bar Breakdown"
            >
              <i className="fa-solid fa-chart-column"></i>
              <span>Turnout Bars</span>
            </button>
          </div>

          {/* Day Range Selector */}
          <div className="graph-day-toggles">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                className={`day-toggle-btn ${selectedDays === days ? "active" : ""}`}
                onClick={() => onDaysChange && onDaysChange(days)}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="graph-kpi-ribbon">
        <div className="graph-kpi-item">
          <span className="dot dot-present"></span>
          <span className="label">Present Attendance:</span>
          <strong>{summary.totalPresent.toLocaleString()}</strong>
        </div>
        <div className="graph-kpi-item">
          <span className="dot dot-absent"></span>
          <span className="label">Absences Logged:</span>
          <strong>{summary.totalAbsent.toLocaleString()}</strong>
        </div>
        <div className="graph-kpi-item">
          <span className="dot dot-rate"></span>
          <span className="label">Period Average:</span>
          <strong className={Number(summary.avgRate) >= 75 ? "text-good" : "text-low"}>
            {summary.avgRate}%
          </strong>
        </div>
        {summary.highestDay && (
          <div className="graph-kpi-item">
            <span className="dot dot-peak"></span>
            <span className="label">Peak Day:</span>
            <strong>
              {summary.highestDay.day} ({summary.highestDay.attendanceRate}%)
            </strong>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="chart-svg-container">
        {trends.length === 0 ? (
          <div className="chart-empty-state">
            <i className="fa-solid fa-chart-simple fa-spin"></i>
            <span>Loading time-series attendance records...</span>
          </div>
        ) : (
          <div className="svg-wrapper">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="attendance-svg-chart"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.38" />
                  <stop offset="60%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>

                {/* Bar Gradients */}
                <linearGradient id="presentBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="absentBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>

                {/* Filter shadow for hover dots */}
                <filter id="dotShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1e40af" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {[100, 75, 50, 25, 0].map((pct) => {
                const y = padTop + chartHeight - (pct / 100) * chartHeight;
                const isTarget75 = pct === 75;
                return (
                  <g key={pct} className="y-grid-group">
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartWidth}
                      y2={y}
                      className={isTarget75 ? "grid-line-target" : "grid-line"}
                      strokeDasharray={isTarget75 ? "5,4" : "none"}
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className={`y-label ${isTarget75 ? "y-label-target" : ""}`}
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {/* 75% Target Badge */}
              <g transform={`translate(${padLeft + chartWidth - 80}, ${target75Y - 8})`}>
                <rect width="80" height="18" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
                <text x="40" y="12" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="700">
                  75% Required
                </text>
              </g>

              {/* AREA & LINE VIEW */}
              {chartType === "area" && (
                <>
                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#trendGradient)" />

                  {/* Trend Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points and Hover Vertical Guides */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const isGood = p.rate >= 75;

                    return (
                      <g key={p.date || idx}>
                        {/* Hover vertical guide line */}
                        {isHovered && (
                          <line
                            x1={p.x}
                            y1={padTop}
                            x2={p.x}
                            y2={padTop + chartHeight}
                            stroke="#94a3b8"
                            strokeWidth="1.2"
                            strokeDasharray="3,3"
                          />
                        )}

                        {/* Interactive Data Point Circle */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 7.5 : 4.5}
                          fill={isGood ? "#2563eb" : "#ef4444"}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 2.8 : 2}
                          filter={isHovered ? "url(#dotShadow)" : "none"}
                          className="data-point-circle"
                        />

                        {/* Transparent hover capture zone */}
                        <rect
                          x={p.x - chartWidth / (points.length * 2)}
                          y={padTop}
                          width={chartWidth / points.length}
                          height={chartHeight}
                          fill="transparent"
                          className="hover-capture-rect"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* BAR VIEW (Present vs Absent Stacked Bars) */}
              {chartType === "bar" && (
                <>
                  {trends.map((item, idx) => {
                    const totalCount = (item.present || 0) + (item.absent || 0);
                    const slotWidth = chartWidth / trends.length;
                    const barWidth = Math.min(32, Math.max(12, slotWidth * 0.55));
                    const xCenter = padLeft + idx * slotWidth + slotWidth / 2;
                    const x = xCenter - barWidth / 2;

                    const totalHeight = maxBarTotal > 0 ? (totalCount / maxBarTotal) * chartHeight : 0;
                    const presentHeight =
                      totalCount > 0 ? ((item.present || 0) / totalCount) * totalHeight : 0;
                    const absentHeight = totalHeight - presentHeight;

                    const yBase = padTop + chartHeight;
                    const yPresent = yBase - presentHeight;
                    const yAbsent = yPresent - absentHeight;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <g
                        key={item.date || idx}
                        className="bar-group"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Bar Background Track */}
                        <rect
                          x={x}
                          y={padTop}
                          width={barWidth}
                          height={chartHeight}
                          rx="4"
                          fill="#f1f5f9"
                          opacity="0.6"
                        />

                        {/* Present Segment (Bottom) */}
                        {presentHeight > 0 && (
                          <rect
                            x={x}
                            y={yPresent}
                            width={barWidth}
                            height={presentHeight}
                            rx={absentHeight <= 0 ? "4" : "0"}
                            fill="url(#presentBarGrad)"
                            opacity={isHovered ? 1 : 0.9}
                          />
                        )}

                        {/* Absent Segment (Top) */}
                        {absentHeight > 0 && (
                          <rect
                            x={x}
                            y={yAbsent}
                            width={barWidth}
                            height={absentHeight}
                            rx="4"
                            fill="url(#absentBarGrad)"
                            opacity={isHovered ? 1 : 0.9}
                          />
                        )}

                        {/* Percentage Label on Top of Bar */}
                        <text
                          x={xCenter}
                          y={Math.max(padTop + 12, yAbsent - 5)}
                          textAnchor="middle"
                          fontSize={selectedDays > 14 ? "9" : "10"}
                          fontWeight="700"
                          fill={(item.attendanceRate || 0) >= 75 ? "#059669" : "#dc2626"}
                        >
                          {Math.round(item.attendanceRate || 0)}%
                        </text>

                        {/* Transparent capture rect */}
                        <rect
                          x={padLeft + idx * slotWidth}
                          y={padTop}
                          width={slotWidth}
                          height={chartHeight}
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* X-Axis Labels (Date & Day Name) */}
              {trends.map((item, idx) => {
                let xCenter;
                if (chartType === "area") {
                  xCenter = points[idx] ? points[idx].x : padLeft;
                } else {
                  const slotWidth = chartWidth / trends.length;
                  xCenter = padLeft + idx * slotWidth + slotWidth / 2;
                }

                // In 30-day mode, show every 2nd or 3rd label to prevent crowding
                const showDetail =
                  selectedDays <= 14 || idx === 0 || idx === trends.length - 1 || idx % 2 === 0;

                return (
                  <g key={`x-${item.date || idx}`} className="x-axis-group">
                    {showDetail && (
                      <>
                        <text
                          x={xCenter}
                          y={padTop + chartHeight + 16}
                          textAnchor="middle"
                          className="x-label-day"
                        >
                          {item.day}
                        </text>
                        <text
                          x={xCenter}
                          y={padTop + chartHeight + 28}
                          textAnchor="middle"
                          className="x-label-date"
                        >
                          {item.date ? item.date.slice(5) : ""}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Popup Overlay */}
            {hoveredIndex !== null && trends[hoveredIndex] && (
              <div
                className="chart-floating-tooltip"
                style={{
                  left: `${
                    chartType === "area" && points[hoveredIndex]
                      ? (points[hoveredIndex].x / svgWidth) * 100
                      : ((padLeft +
                          hoveredIndex * (chartWidth / trends.length) +
                          chartWidth / trends.length / 2) /
                          svgWidth) *
                        100
                  }%`,
                }}
              >
                <div className="tooltip-header">
                  <i className="fa-solid fa-calendar-day"></i>
                  <span>
                    {trends[hoveredIndex].day}, {trends[hoveredIndex].date}
                  </span>
                </div>
                <div className="tooltip-body">
                  <div className="tooltip-row">
                    <span className="tooltip-dot present"></span>
                    <span className="tooltip-label">Present:</span>
                    <strong>{trends[hoveredIndex].present || 0} students</strong>
                  </div>
                  <div className="tooltip-row">
                    <span className="tooltip-dot absent"></span>
                    <span className="tooltip-label">Absent:</span>
                    <strong>{trends[hoveredIndex].absent || 0} students</strong>
                  </div>
                  <div className="tooltip-divider"></div>
                  <div className="tooltip-row rate-row">
                    <span className="tooltip-label">Attendance Rate:</span>
                    <strong
                      className={
                        (trends[hoveredIndex].attendanceRate || 0) >= 75
                          ? "rate-high"
                          : "rate-low"
                      }
                    >
                      {trends[hoveredIndex].attendanceRate}%
                    </strong>
                  </div>
                  <div className="tooltip-status-tag">
                    {(trends[hoveredIndex].attendanceRate || 0) >= 75 ? (
                      <span className="tag-optimal">
                        <i className="fa-solid fa-circle-check"></i> Meets 75% Requirement
                      </span>
                    ) : (
                      <span className="tag-warning">
                        <i className="fa-solid fa-triangle-exclamation"></i> Below 75% Threshold
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="graph-footer-legend">
        <div className="legend-item">
          <span className="legend-box present-box"></span>
          <span>Present Turnout</span>
        </div>
        <div className="legend-item">
          <span className="legend-box absent-box"></span>
          <span>Absences</span>
        </div>
        <div className="legend-item">
          <span className="legend-line target-line"></span>
          <span>75% Compliance Target</span>
        </div>
        <div className="legend-item">
          <span className="legend-badge good-badge">&ge;75% Safe</span>
        </div>
        <div className="legend-item">
          <span className="legend-badge low-badge">&lt;75% Defaulter Alert</span>
        </div>
      </div>
    </section>
  );
};

export default AttendanceGraph;
