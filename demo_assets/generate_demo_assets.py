from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_DIR = Path(__file__).resolve().parent
PPTX_PATH = OUTPUT_DIR / "Green_Campus_Demo_Deck.pptx"
PDF_PATH = OUTPUT_DIR / "Green_Campus_Demo_Guide.pdf"
MARKDOWN_PATH = OUTPUT_DIR / "DEMO_TALK_TRACK.md"

TITLE = "Green Campus Sustainability Intelligence Platform"
SUBTITLE = "Demo deck and explanation guide"

THEME = {
    "green": RGBColor(27, 127, 98),
    "dark": RGBColor(23, 52, 45),
    "muted": RGBColor(96, 117, 111),
    "blue": RGBColor(2, 132, 199),
    "bg": RGBColor(244, 251, 247),
}


SLIDES = [
    {
        "title": "Project Overview",
        "bullets": [
            "Green Campus helps monitor energy, water, waste, and solar performance in one dashboard.",
            "It is designed for college or university campuses where usage changes with occupancy, seasons, and academic schedules.",
            "The system supports daily operations, future forecasting, sustainability scoring, and dataset import/export.",
        ],
    },
    {
        "title": "Problem We Are Solving",
        "bullets": [
            "Campus utility information is often spread across Excel files and separate teams.",
            "It is hard to understand current consumption, compare buildings, and plan for upcoming months.",
            "This platform brings all resource data into one place and converts it into decisions.",
        ],
    },
    {
        "title": "How The System Works",
        "bullets": [
            "Frontend: React dashboard for login, filters, charts, AI panels, simulator, import, reset, and export.",
            "Backend: FastAPI service that reads campus data, calculates metrics, and returns APIs for the frontend.",
            "Database: Stores raw energy, water, waste, solar, and user records.",
            "Deployment: Frontend and backend are both live, while local development is still available for new features.",
        ],
    },
    {
        "title": "Main Website Flow",
        "bullets": [
            "Step 1: User logs in to the platform.",
            "Step 2: Dashboard loads campus summary, alerts, risk, forecasts, charts, and assumptions.",
            "Step 3: User can filter by building and forecast mode.",
            "Step 4: User can import a fresh Excel file, export the current workbook, or reset data.",
            "Step 5: User reviews AI insights and runs what-if simulations.",
        ],
    },
    {
        "title": "What Data The Platform Stores",
        "bullets": [
            "Energy sheet: date, building, energy_kwh",
            "Water sheet: date, building, water_kl",
            "Waste sheet: date, building, waste_kg",
            "Solar sheet: date, building, solar_kwh",
            "User table: username, password hash, role",
        ],
    },
    {
        "title": "Dashboard Sections",
        "bullets": [
            "Operations snapshot: current scope, forecast mode, import/export controls, KPI cards, seasonal outlook",
            "Performance intelligence: carbon footprint, solar operations, resource mix, trends, alerts",
            "AI planning studio: insights, risk, forecasts, scenario simulator",
            "Governance and reference: building ranking and assumptions glossary",
        ],
    },
    {
        "title": "Calculation Logic: Summary Metrics",
        "bullets": [
            "Gross Energy = sum of electricity consumption in the selected scope",
            "Solar = sum of solar generation in the selected scope",
            "Net Energy = max(Gross Energy - Solar, 0)",
            "Export to Grid = max(Solar - Gross Energy, 0)",
            "Water = sum of water records",
            "Waste = sum of waste records",
        ],
    },
    {
        "title": "Calculation Logic: Carbon Metrics",
        "bullets": [
            "Emission factor used in the project = 0.82 kg CO2 per kWh",
            "Net Carbon = Net Energy x 0.82",
            "Gross Carbon = Gross Energy x 0.82",
            "Solar Avoided Carbon = min(Solar, Gross Energy) x 0.82",
            "This makes the carbon section easy to explain in both operational and sustainability terms.",
        ],
    },
    {
        "title": "Calculation Logic: Green Index",
        "bullets": [
            "Benchmarks: Energy 100000, Water 20000, Waste 30000",
            "Energy Score = min(Net Energy / 100000, 1)",
            "Water Score = min(Water / 20000, 1)",
            "Waste Score = min(Waste / 30000, 1)",
            "Weighted Efficiency = 0.5 x Energy Score + 0.3 x Water Score + 0.2 x Waste Score",
            "Green Index = (1 - Weighted Efficiency) x 100",
            "Higher Green Index means better sustainability performance.",
        ],
    },
    {
        "title": "How Forecasting Works",
        "bullets": [
            "Forecast modes available: daily, monthly, yearly, and seasonal.",
            "Historical records are grouped by the selected granularity.",
            "The system finds recurring cycle averages from past periods.",
            "Future values are created by repeating those cycle averages in the next periods.",
            "This gives practical operational forecasting even without heavy ML infrastructure.",
        ],
    },
    {
        "title": "Seasonal and Occupancy Logic",
        "bullets": [
            "The project includes academic occupancy factors by month.",
            "Lower occupancy months like June and July reduce expected campus demand.",
            "The seasonal panel compares current month occupancy with the next month.",
            "It also estimates when solar may offset most of the load or become export-ready.",
        ],
    },
    {
        "title": "AI Features In Plain Language",
        "bullets": [
            "Risk Engine: estimates whether upcoming usage is low, medium, or high risk.",
            "Insights: identifies anomalies, opportunities, and recommendations.",
            "Alert Center: highlights unusual changes and export-ready days.",
            "Scenario Simulator: tests what happens if energy, water, and waste reduce or solar increases.",
        ],
    },
    {
        "title": "Excel Import and Export Workflow",
        "bullets": [
            "Import Excel: uploads a fresh workbook and replaces old campus resource data.",
            "Export Excel: downloads a workbook with summary, building performance, and all raw sheets.",
            "Reset Data: clears current solar, energy, water, and waste records for a fresh view.",
            "This makes the platform practical for demos, audits, and management sharing.",
        ],
    },
    {
        "title": "Live Demo Script",
        "bullets": [
            "1. Open login page and log in",
            "2. Show dashboard overview and explain KPI cards",
            "3. Change building and forecast granularity",
            "4. Open carbon, solar, alerts, and resource charts",
            "5. Explain AI insights, seasonal outlook, and scenario simulator",
            "6. Import the sample workbook and show how data refreshes",
            "7. Export the workbook and explain the generated sheets",
        ],
    },
    {
        "title": "Why This Project Is Useful",
        "bullets": [
            "Easy for campus administrators to understand current performance.",
            "Helps compare buildings and detect wasteful patterns early.",
            "Supports planning for low-occupancy periods, solar contribution, and carbon reduction.",
            "Provides a strong base for future features like reports, alerts, optimization, and occupancy-aware forecasting.",
        ],
    },
]


GUIDE_SECTIONS = [
    (
        "1. What this project does",
        [
            "Green Campus is a sustainability dashboard for educational campuses.",
            "It combines electricity, water, waste, and solar information in one place.",
            "The platform helps a user see the current situation, compare buildings, understand carbon impact, and plan future usage.",
        ],
    ),
    (
        "2. How to explain the website to someone else",
        [
            "Start from the top hero section and explain that this is the command center.",
            "Then show the current scope, forecast mode, and data controls.",
            "Next explain that the first cards are quick KPI summaries, the next sections explain carbon and solar, and the lower sections provide AI-style planning support.",
        ],
    ),
    (
        "3. Website demo flow step by step",
        [
            "Step 1: Login to the application.",
            "Step 2: Explain that the dashboard is filter-based and can be viewed for the whole campus or a single building.",
            "Step 3: Show KPI cards for energy, water, waste, solar, net energy, and Green Index.",
            "Step 4: Open carbon and solar sections and explain how solar reduces grid demand.",
            "Step 5: Show alerts, trends, and the resource mix chart.",
            "Step 6: Show AI insights, risk, forecast, and scenario simulation.",
            "Step 7: Show assumptions and terminology so non-technical users understand the values.",
            "Step 8: Show import, export, and reset workflow.",
        ],
    ),
    (
        "4. Exact calculation logic used in the system",
        [
            "Gross Energy = total of all energy_kwh records in the selected scope.",
            "Solar = total of all solar_kwh records in the selected scope.",
            "Net Energy = max(Gross Energy - Solar, 0).",
            "Export to Grid = max(Solar - Gross Energy, 0).",
            "Carbon = Net Energy x 0.82 kg CO2 per kWh.",
            "Gross Carbon = Gross Energy x 0.82.",
            "Solar Avoided Carbon = min(Solar, Gross Energy) x 0.82.",
        ],
    ),
    (
        "4A. Simple meaning of important terms",
        [
            "KPI means Key Performance Indicator. It is a quick important number shown on the dashboard card so a user can understand the situation fast.",
            "Gross Energy means the total electricity used before subtracting solar power.",
            "Net Energy means the electricity still needed after using solar power.",
            "Solar Offset means how much electricity demand was covered by solar instead of the grid.",
            "Gross Carbon means carbon linked to full electricity demand before solar benefit is considered.",
            "Net Carbon means carbon linked only to the remaining grid electricity after solar support.",
            "Solar Avoided Carbon means the carbon saved because solar reduced the amount of grid electricity needed.",
            "Benchmark means a reference target or comparison value. It helps the system decide whether current usage is low, acceptable, or high.",
            "Efficiency Score or Weighted Efficiency means the combined pressure from energy, water, and waste after giving each one a fixed importance.",
            "Green Index means the final sustainability score shown in an easy percentage form. Higher is better.",
            "Forecast Granularity means the time level used in prediction, such as daily, monthly, yearly, or seasonal.",
            "Scenario Simulator means a what-if tool that shows what may happen if energy, water, waste, or solar values change.",
            "Alert Threshold means the change percentage after which the system starts calling something unusual.",
            "Export Potential means solar generation that may remain after meeting campus demand and could be sent to storage or the grid.",
        ],
    ),
    (
        "5. Green Index calculation step by step",
        [
            "Energy benchmark = 100000",
            "Water benchmark = 20000",
            "Waste benchmark = 30000",
            "Energy Score = min(Net Energy / 100000, 1)",
            "Water Score = min(Water / 20000, 1)",
            "Waste Score = min(Waste / 30000, 1)",
            "Weighted Efficiency = 0.5 x Energy Score + 0.3 x Water Score + 0.2 x Waste Score",
            "Green Index = (1 - Weighted Efficiency) x 100",
        ],
    ),
    (
        "6. Forecast logic in easy words",
        [
            "The system supports daily, monthly, yearly, and seasonal views.",
            "It groups historical records according to the selected mode.",
            "Then it looks for recurring patterns in that grouping and uses average cycle behavior to generate the next periods.",
            "This is practical and easy to explain during a demo because it uses historical campus behavior directly.",
        ],
    ),
    (
        "7. Seasonal logic and college-specific example",
        [
            "The platform knows that some months have lower occupancy.",
            "For example, June has lower academic activity, so demand is expected to reduce.",
            "That means energy and water can fall, while solar can cover a larger percentage of demand.",
            "If solar becomes greater than demand, the dashboard shows export potential.",
        ],
    ),
    (
        "8. Import, export, and reset",
        [
            "Import Excel replaces the current workbook data with a fresh dataset.",
            "Export Excel downloads the live system data with summary and raw sheets.",
            "Reset Data clears resource records when a fresh demo or new dataset is needed.",
        ],
    ),
    (
        "9. Current strengths of the project",
        [
            "Strong end-to-end flow from login to dashboard to data actions.",
            "Good campus-specific logic for occupancy, solar offset, and utility planning.",
            "Useful mix of operational metrics and AI-style recommendation features.",
        ],
    ),
    (
        "10. Current improvement opportunities",
        [
            "The frontend can still be improved further by moving more repeated card styles into reusable UI building blocks.",
            "The backend can be split more cleanly into service-layer calculations and thinner routers.",
            "Future versions can add PDF management reports, smarter anomaly detection, and occupancy-linked forecasting.",
        ],
    ),
]


def add_bullets(text_frame, bullets):
    text_frame.clear()
    for index, bullet in enumerate(bullets):
        paragraph = text_frame.paragraphs[0] if index == 0 else text_frame.add_paragraph()
        paragraph.text = bullet
        paragraph.level = 0
        paragraph.font.size = Pt(20)
        paragraph.font.color.rgb = THEME["dark"]
        paragraph.space_after = Pt(10)


def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    title_slide = prs.slides.add_slide(prs.slide_layouts[6])
    title_slide.background.fill.solid()
    title_slide.background.fill.fore_color.rgb = THEME["bg"]

    title_box = title_slide.shapes.add_textbox(Inches(0.8), Inches(1.1), Inches(11.5), Inches(1.4))
    title_tf = title_box.text_frame
    title_p = title_tf.paragraphs[0]
    title_p.text = TITLE
    title_p.font.size = Pt(28)
    title_p.font.bold = True
    title_p.font.color.rgb = THEME["dark"]

    subtitle_box = title_slide.shapes.add_textbox(Inches(0.8), Inches(2.35), Inches(10.8), Inches(0.8))
    subtitle_tf = subtitle_box.text_frame
    subtitle_p = subtitle_tf.paragraphs[0]
    subtitle_p.text = "Simple explanation of the system, website flow, calculations, and demo narrative"
    subtitle_p.font.size = Pt(18)
    subtitle_p.font.color.rgb = THEME["muted"]

    footer_box = title_slide.shapes.add_textbox(Inches(0.8), Inches(5.8), Inches(8), Inches(0.6))
    footer_p = footer_box.text_frame.paragraphs[0]
    footer_p.text = SUBTITLE
    footer_p.font.size = Pt(16)
    footer_p.font.color.rgb = THEME["green"]

    for slide_data in SLIDES:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = RGBColor(255, 255, 255)

        top_band = slide.shapes.add_shape(
            1, Inches(0), Inches(0), prs.slide_width, Inches(0.4)
        )
        top_band.fill.solid()
        top_band.fill.fore_color.rgb = THEME["green"]
        top_band.line.color.rgb = THEME["green"]

        title_box = slide.shapes.add_textbox(Inches(0.7), Inches(0.65), Inches(12), Inches(0.7))
        title_frame = title_box.text_frame
        title_p = title_frame.paragraphs[0]
        title_p.text = slide_data["title"]
        title_p.font.size = Pt(26)
        title_p.font.bold = True
        title_p.font.color.rgb = THEME["dark"]

        body_box = slide.shapes.add_textbox(Inches(0.85), Inches(1.55), Inches(11.7), Inches(5.35))
        add_bullets(body_box.text_frame, slide_data["bullets"])

    prs.save(PPTX_PATH)


def build_pdf():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=colors.HexColor("#17342d"),
        spaceAfter=16,
    )
    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        textColor=colors.HexColor("#1b7f62"),
        spaceAfter=8,
        spaceBefore=8,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#263c37"),
        spaceAfter=5,
    )

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )

    story = []
    story.append(Paragraph(TITLE, title_style))
    story.append(Paragraph("Easy explanation guide for demo presentation and stakeholder walkthrough", body_style))
    story.append(Spacer(1, 12))

    assumptions_table = Table(
        [
            ["Parameter", "Value"],
            ["Emission factor", "0.82 kg CO2 per kWh"],
            ["Energy cost", "8.0 per kWh"],
            ["Energy benchmark", "100000"],
            ["Water benchmark", "20000"],
            ["Waste benchmark", "30000"],
            ["Green Index weights", "Energy 0.5, Water 0.3, Waste 0.2"],
            ["Alert thresholds", "15% standard, 30% high"],
        ],
        colWidths=[2.2 * inch, 3.9 * inch],
    )
    assumptions_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1b7f62")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c8d7d2")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f6faf8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("LEADING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.append(assumptions_table)
    story.append(Spacer(1, 14))

    for heading, bullets in GUIDE_SECTIONS:
        story.append(Paragraph(heading, heading_style))
        for bullet in bullets:
            story.append(Paragraph(f"• {bullet}", body_style))
        story.append(Spacer(1, 6))

    doc.build(story)


def build_markdown():
    lines = [f"# {TITLE}", "", "## Demo talking track", ""]
    for slide in SLIDES:
        lines.append(f"## {slide['title']}")
        lines.extend([f"- {bullet}" for bullet in slide["bullets"]])
        lines.append("")

    MARKDOWN_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_presentation()
    build_pdf()
    build_markdown()
    print(f"Created: {PPTX_PATH}")
    print(f"Created: {PDF_PATH}")
    print(f"Created: {MARKDOWN_PATH}")
