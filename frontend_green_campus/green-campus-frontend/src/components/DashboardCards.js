import React, { useEffect, useRef, useState } from "react";
import { dashboardCopy } from "../config/dashboardConfig";
import { greenIndexNote } from "./assessmentPresentation";

const { theme } = dashboardCopy;

function useAnimatedNumber(value) {
  const nextNumericValue = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(nextNumericValue);
  const previousValueRef = useRef(nextNumericValue);

  useEffect(() => {
    const nextValue = nextNumericValue;
    const startValue = previousValueRef.current;
    const duration = 650;
    const startTime = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + ((nextValue - startValue) * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        previousValueRef.current = nextValue;
      }
    };

    requestAnimationFrame(tick);
  }, [nextNumericValue]);

  return displayValue;
}

function Card({ title, value, suffix = "", subtitle, accent, featured = false, onOpenDetail, unavailable = false }) {
  const animatedValue = useAnimatedNumber(value);

  return (
    <button
      type="button"
      style={{
        ...styles.card,
        ...(featured ? styles.cardFeatured : {}),
        borderTop: `5px solid ${accent}`,
      }}
      className="premium-card lift-card stagger-in"
      onClick={onOpenDetail}
    >
      <span style={{ ...styles.accentOrb, background: `radial-gradient(circle, ${accent}55, transparent 70%)` }} />
      <div style={styles.cardEyebrow}>Campus KPI</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>
        {unavailable ? "Not available" : <>{animatedValue.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: animatedValue % 1 === 0 ? 0 : 2,
        })}{" "}
        {suffix}</>}
      </div>
      <div style={styles.cardSubtitle}>{subtitle}</div>
    </button>
  );
}

export default function DashboardCards({ data, onOpenDetail }) {
  const indexNote = greenIndexNote(data);
  const indexUnavailable = data.green_index_details?.assessment === "unavailable";
  const wasteUnavailable = data.resource_availability?.waste === false;
  const solarImpact =
    data.energy > 0 ? ((data.solar / data.energy) * 100).toFixed(1) : 0;

  return (
    <div style={styles.grid}>
      <Card
        title={dashboardCopy.kpis.grossEnergy.title}
        value={data.energy}
        suffix="kWh"
        subtitle={dashboardCopy.kpis.grossEnergy.subtitle}
        accent="#f59e0b"
        featured
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.grossEnergy.title,
            category: "KPI",
            summary: "Gross energy shows the full electricity demand before solar contribution is removed.",
            points: [
              `Current gross energy: ${data.energy} kWh`,
              "Use this to understand total demand pressure on the campus.",
            ],
          })
        }
      />
      <Card
        title={dashboardCopy.kpis.water.title}
        value={data.water}
        suffix="kl"
        subtitle={dashboardCopy.kpis.water.subtitle}
        accent="#0284c7"
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.water.title,
            category: "KPI",
            summary: "Water consumption shows the total imported water usage for the current filtered scope.",
            points: [
              `Current water consumption: ${data.water} kl`,
              `Water per student: ${data.water_per_student_kl ?? "N/A"} kl`,
            ],
          })
        }
      />
      <Card
        title={dashboardCopy.kpis.waste.title}
        value={data.waste}
        unavailable={wasteUnavailable}
        suffix="kg"
        subtitle={wasteUnavailable ? "No waste readings in this scope; not a confirmed zero." : dashboardCopy.kpis.waste.subtitle}
        accent="#14b8a6"
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.waste.title,
            category: "KPI",
            summary: wasteUnavailable ? "Waste is unavailable for this scope, not confirmed zero waste performance." : "Waste generated shows the total tracked waste load for the selected data window.",
            points: wasteUnavailable ? ["Add waste readings to assess waste performance."] : [
              `Current waste load: ${data.waste} kg`,
              `Waste per student: ${data.waste_per_student_kg ?? "N/A"} kg`,
            ],
          })
        }
      />
      <Card
        title={dashboardCopy.kpis.solar.title}
        value={data.solar}
        suffix="kWh"
        subtitle={`${solarImpact}% ${dashboardCopy.kpis.solar.subtitleSuffix}`}
        accent="#84cc16"
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.solar.title,
            category: "KPI",
            summary: "Solar generated shows how much on-campus renewable generation is helping cover campus demand.",
            points: [
              `Current solar generation: ${data.solar} kWh`,
              `Solar offset: ${solarImpact}% of gross energy`,
            ],
          })
        }
      />
      <Card
        title={dashboardCopy.kpis.net.title}
        value={data.net_energy}
        suffix="kWh"
        subtitle={<>{dashboardCopy.kpis.net.subtitle}{data.accounting_note ? <span style={{ display: "block", marginTop: "8px" }}>{data.accounting_note}</span> : null}</>}
        accent="#2563eb"
        featured
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.net.title,
            category: "KPI",
            summary: "Net grid energy is the electricity still required after solar generation offsets gross demand.",
            points: [
              `Current net energy: ${data.net_energy} kWh`,
              `Estimated monthly cost: Rs ${data.monthly_energy_cost_rs ?? "N/A"}`,
              ...(data.accounting_note ? [data.accounting_note] : []),
            ],
          })
        }
      />
      <Card
        title={dashboardCopy.kpis.greenIndex.title}
        value={data.green_index}
        unavailable={indexUnavailable}
        suffix="%"
        subtitle={indexNote || dashboardCopy.kpis.greenIndex.subtitle}
        accent="#1b7f62"
        featured
        onOpenDetail={() =>
          onOpenDetail?.({
            title: dashboardCopy.kpis.greenIndex.title,
            category: "KPI",
            summary: "Green Index is the dashboard’s combined sustainability score across energy, water, and waste behavior.",
            points: [
              indexUnavailable ? "Green Index: Not available" : `Current Green Index: ${data.green_index}%`,
              ...(indexNote ? [indexNote] : []),
              ...(data.green_index_details?.assessed_resources ? [`Assessed resources: ${data.green_index_details.assessed_resources.join(", ")}`] : []),
              "Higher values are better because they indicate more efficient overall campus behavior.",
            ],
          })
        }
      />
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    position: "relative",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.94))",
    borderRadius: theme.radius.card,
    padding: "20px 18px 18px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    overflow: "hidden",
  },
  cardFeatured: {
    background: "linear-gradient(180deg, #ffffff 0%, #f4fbf8 55%, #eef6ff 100%)",
    boxShadow: "0 24px 46px rgba(12, 24, 21, 0.11)",
  },
  accentOrb: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    top: "-24px",
    right: "-20px",
    pointerEvents: "none",
  },
  cardEyebrow: {
    color: theme.colors.tertiaryText,
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  cardTitle: {
    color: theme.colors.secondaryText,
    fontSize: theme.fontSizes.cardTitle,
    fontWeight: "600",
    marginTop: "10px",
  },
  cardValue: {
    color: theme.colors.primaryText,
    fontSize: "32px",
    fontWeight: "800",
    marginTop: "8px",
    letterSpacing: "-0.04em",
  },
  cardSubtitle: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
    lineHeight: 1.5,
    fontSize: theme.fontSizes.cardSubtitle,
  },
};
