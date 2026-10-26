from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "MGCD_Feature_Guide_For_Management.pdf"


def p(text, style):
    return Paragraph(text, style)


def bullets(items, style):
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=12) for item in items],
        bulletType="bullet",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=colors.HexColor("#1b7f62"),
    )


def numbered(items, style):
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=14) for item in items],
        bulletType="1",
        leftIndent=20,
    )


def formula(text, styles):
    table = Table([[Paragraph(text, styles["Formula"])]], colWidths=[6.55 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef7f3")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#bdd8ce")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def example_box(title, body, styles):
    table = Table(
        [[Paragraph(f"<b>{title}</b><br/>{body}", styles["Example"])]],
        colWidths=[6.55 * inch],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f7fbff")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#c8ddff")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def section(title, body, styles, items=None, examples=None):
    flow = [Paragraph(title, styles["Heading2"])]
    for paragraph in body:
        flow.append(Paragraph(paragraph, styles["Body"]))
    if items:
        flow.append(bullets(items, styles["Body"]))
    if examples:
        for example_title, example_body in examples:
            flow.append(Spacer(1, 6))
            flow.append(example_box(example_title, example_body, styles))
    flow.append(Spacer(1, 12))
    return KeepTogether(flow)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#d7e5df"))
    canvas.line(doc.leftMargin, 0.55 * inch, A4[0] - doc.rightMargin, 0.55 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#5f756f"))
    canvas.drawString(doc.leftMargin, 0.35 * inch, "MAHE Green Campus Dashboard (MGCD) - Feature Guide")
    canvas.drawRightString(A4[0] - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_styles():
    base = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=30,
            textColor=colors.HexColor("#17342d"),
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "Subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=11,
            leading=17,
            textColor=colors.HexColor("#5f756f"),
            alignment=TA_CENTER,
            spaceAfter=18,
        ),
        "Heading2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#17342d"),
            spaceBefore=10,
            spaceAfter=7,
        ),
        "Heading3": ParagraphStyle(
            "Heading3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1b7f62"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "Body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.6,
            leading=14.2,
            textColor=colors.HexColor("#2f4a43"),
            spaceAfter=6,
            alignment=TA_LEFT,
        ),
        "Example": ParagraphStyle(
            "Example",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=13.2,
            textColor=colors.HexColor("#24443c"),
        ),
        "Formula": ParagraphStyle(
            "Formula",
            parent=base["BodyText"],
            fontName="Courier",
            fontSize=9.2,
            leading=13,
            textColor=colors.HexColor("#17342d"),
        ),
    }


def build_pdf():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.75 * inch,
        title="MGCD Feature Guide For Management",
    )

    story = [
        Paragraph("MAHE Green Campus Dashboard (MGCD)", styles["Title"]),
        Paragraph(
            "Simple feature guide for management, faculty, facilities teams, reviewers, and non-technical users.",
            styles["Subtitle"],
        ),
        HRFlowable(width="100%", color=colors.HexColor("#bdd8ce"), thickness=1),
        Spacer(1, 14),
    ]

    sections = [
        (
            "1. What Is MGCD?",
            [
                "MGCD means MAHE Green Campus Dashboard. It is a web dashboard that helps a campus monitor electricity, water, waste, solar generation, carbon footprint, building performance, AI-style prediction, and management reporting.",
                "In simple words, MGCD converts campus utility data into clear charts, scores, alerts, forecasts, and action points. Instead of checking many Excel sheets separately, the user can understand the campus sustainability picture from one place.",
            ],
            [
                "Electricity usage",
                "Water usage",
                "Waste generation",
                "Solar generation",
                "Carbon footprint",
                "Building-wise sustainability performance",
                "Future demand prediction",
                "Management reporting",
            ],
            [
                (
                    "Example",
                    "If management asks which building needs attention, MGCD can show building ranking, carbon impact, and recommended action from one dashboard.",
                )
            ],
        ),
        (
            "2. Why This Project Is Useful",
            [
                "In many campuses, electricity, water, waste, and solar data are stored separately. This makes decision-making slow and makes abnormal consumption harder to notice early.",
                "MGCD brings this information together and converts it into a decision-support system.",
            ],
            [
                "Management can see the full picture quickly.",
                "Solar benefit becomes visible.",
                "Building-wise comparison becomes easier.",
                "Reports can be prepared faster.",
                "Future planning becomes data-assisted instead of guesswork.",
            ],
            [
                (
                    "Example",
                    "If water use suddenly increases in one hostel block, the dashboard can help the team notice it faster and review possible leakage or operational reasons.",
                )
            ],
        ),
        (
            "3. Main User Flow",
            [
                "The user opens the website, registers or logs in, imports Excel data, and then reviews dashboard sections such as Overview, Intelligence, Planning Studio, Governance, and Executive Report.",
            ],
            [
                "Open website",
                "Register or log in",
                "Import Excel data",
                "Review KPIs, charts, rankings, alerts, and forecasts",
                "Change assumptions when needed",
                "Export data or print report",
            ],
            None,
        ),
        (
            "4. Login And Register",
            [
                "Register creates a new user account. Login checks username and password before opening the dashboard. The password field also has a show/hide option to reduce typing mistakes.",
            ],
            [
                "Register is used for new users.",
                "Login is used for existing users.",
                "Show password helps during mobile use and demos.",
            ],
            [
                (
                    "Example",
                    "After a new database is created, old users may not exist. In that case, register again and then log in.",
                )
            ],
        ),
        (
            "5. Dashboard Navigation",
            [
                "The dashboard is divided into focused sections so the user does not need to scroll through one very long mixed page.",
            ],
            [
                "Overview - current condition and quick decision view",
                "Intelligence - carbon, solar, alerts, quality, and visual trends",
                "Planning Studio - forecasts, risk, insights, and scenario testing",
                "Governance - ranking, assumptions, audit trail, and settings",
                "Executive Report - clean report-style view for meetings",
            ],
            None,
        ),
        (
            "6. Overview Section",
            [
                "Overview gives the fastest understanding of the campus condition. It is the best first section during a demo or management discussion.",
            ],
            [
                "Selected campus or building",
                "Selected forecast mode",
                "Selected date range",
                "Campus Pulse",
                "Comparison Analytics",
                "KPI cards",
                "Seasonal Intelligence",
                "Strategic Goals",
                "Action Board",
            ],
            [
                (
                    "Example",
                    "If someone asks, 'What is the current sustainability condition?', open Overview and explain the Campus Pulse, Green Index, KPIs, and recommended actions.",
                )
            ],
        ),
        (
            "7. Campus Pulse",
            [
                "Campus Pulse is a short summary near the top of the Overview section. It gives a quick health check of the campus.",
            ],
            [
                "Current Green Index",
                "Current risk level",
                "Selected scope",
                "Forecast occupancy",
                "Short summary sentence",
            ],
            [
                (
                    "Example",
                    "If Campus Pulse says risk is high, the selected campus or building needs closer attention in the current or forecast period.",
                )
            ],
        ),
        (
            "8. KPI Cards",
            [
                "KPI means Key Performance Indicator. KPI cards show important numbers in a quick, readable format.",
            ],
            [
                "Gross Energy - total electricity before solar offset",
                "Water Consumption - total water usage",
                "Waste Generated - total waste tracked",
                "Solar Generated - solar electricity produced",
                "Net Grid Energy - electricity still needed from grid",
                "Carbon Footprint - estimated emissions",
                "Green Index - combined sustainability score",
                "Estimated Cost - estimated energy cost",
            ],
            [
                (
                    "Example",
                    "If gross energy is 100,000 kWh and solar is 30,000 kWh, net grid energy is 70,000 kWh.",
                )
            ],
        ),
        (
            "9. Comparison Analytics",
            [
                "Comparison Analytics compares the selected date range with the immediately previous period of the same length. This tells whether performance is improving or worsening.",
            ],
            [
                "Net energy change",
                "Water change",
                "Waste change",
                "Carbon change",
                "Green Index change",
                "Energy cost change",
            ],
            [
                (
                    "Example",
                    "If April to June is selected, the dashboard can compare it with January to March and show whether energy or carbon increased.",
                )
            ],
        ),
        (
            "10. Strategic Goals",
            [
                "Strategic Goals help the campus define targets and track progress. This makes the dashboard a planning tool, not only a monitoring screen.",
            ],
            [
                "Target Green Index",
                "Target solar offset",
                "Target water usage per student",
                "Target monthly energy cost",
            ],
            [
                (
                    "Example",
                    "If target Green Index is 85 and current score is 78, management can see that more improvement is required.",
                )
            ],
        ),
        (
            "11. Action Board",
            [
                "Action Board turns AI recommendations into trackable work. It helps the team move from insight to action.",
            ],
            [
                "Suggested - system has recommended the action",
                "Planned - team has accepted the action",
                "In Progress - work has started",
                "Completed - work is finished",
            ],
            [
                (
                    "Example",
                    "If the system recommends shifting non-critical electrical loads to daytime, the team can mark it Planned and later Completed after implementation.",
                )
            ],
        ),
        (
            "12. Intelligence Section",
            [
                "Intelligence gives deeper analysis. It helps explain why the numbers are changing and where the important risks or opportunities are.",
            ],
            [
                "Advanced Carbon Footprint",
                "Solar Operations",
                "Resource Flow and Trend Interpretation",
                "Data Quality and Forecast Trust",
                "Alert Center",
            ],
            None,
        ),
        (
            "13. Advanced Carbon Footprint",
            [
                "This section explains the carbon impact of electricity usage after considering solar generation.",
            ],
            [
                "Gross Carbon - emissions if all electricity came from grid",
                "Solar Avoided Carbon - emissions saved due to solar",
                "Net Carbon - estimated emissions after solar benefit",
            ],
            [
                (
                    "Example",
                    "If net grid energy is 70,000 kWh and carbon factor is 0.82 kg CO2/kWh, carbon is 57,400 kg CO2.",
                )
            ],
        ),
        (
            "14. Solar Operations",
            [
                "Solar Operations shows how much solar is helping the campus in energy, cost, and carbon terms.",
            ],
            [
                "Solar contribution",
                "Carbon avoided",
                "Cost shielding",
                "Grid export potential",
            ],
            [
                (
                    "Example",
                    "If solar generation is lower than campus demand, grid export is zero. This is normal because all solar is used inside the campus.",
                )
            ],
        ),
        (
            "15. Resource Visualization",
            [
                "Resource Visualization explains electricity, water, waste, and solar through charts. It helps users understand patterns quickly.",
            ],
            [
                "Resource Comparison Chart compares the main streams side by side.",
                "Resource Mix Chart shows the share of each resource visually.",
                "Trend Chart shows energy, solar, and net grid demand over time.",
                "Summary cards show solar coverage and latest trend reading.",
            ],
            [
                (
                    "Example",
                    "If solar is rising while net grid energy is falling, it means campus operations are getting more support from renewable generation.",
                )
            ],
        ),
        (
            "16. Data Quality And Forecast Trust",
            [
                "This section checks whether imported data is reliable enough for charts, forecasts, and reports. Good predictions need good data.",
            ],
            [
                "Records available",
                "Missing months",
                "Duplicate records",
                "Unusual zero values",
                "Forecast readiness",
            ],
            [
                (
                    "Example",
                    "If energy has 12 months of clean data, trust can be high. If many months are missing, trust may become medium or low.",
                )
            ],
        ),
        (
            "17. Alert Center",
            [
                "Alert Center highlights important warnings and opportunities so the user does not need to manually inspect every chart.",
            ],
            [
                "Energy demand increase",
                "Possible water abnormality",
                "Waste increase",
                "Forecast risk",
                "Solar export-ready days",
            ],
            None,
        ),
        (
            "18. Planning Studio",
            [
                "Planning Studio is the AI and future planning section. It helps the campus plan before problems happen.",
            ],
            [
                "AI Forecast Studio",
                "AI Risk Analysis",
                "AI Insights",
                "Scenario Simulator",
            ],
            None,
        ),
        (
            "19. AI Forecast Studio",
            [
                "AI Forecast Studio predicts future electricity, water, waste, and solar values. It supports daily, monthly, yearly, and seasonal modes.",
            ],
            [
                "Daily forecast - useful for short-term operations",
                "Monthly forecast - useful for management planning",
                "Yearly forecast - useful for long-term direction",
                "Seasonal forecast - useful for climate and academic cycle planning",
            ],
            [
                (
                    "Example",
                    "June may show lower energy and water demand if student occupancy is low during vacation.",
                )
            ],
        ),
        (
            "20. Confidence Range",
            [
                "A forecast should not be treated as one exact fixed number. Confidence Range gives a likely lower and upper range.",
            ],
            None,
            [
                (
                    "Example",
                    "If expected energy is 50,000 kWh and range is 47,000 to 53,000 kWh, actual usage may likely fall near that band.",
                )
            ],
        ),
        (
            "21. AI Risk Analysis",
            [
                "AI Risk Analysis tells whether future resource demand may become risky. It looks at trend, variation, occupancy, and forecast range.",
            ],
            [
                "Low risk",
                "Medium risk",
                "High risk",
            ],
            [
                (
                    "Example",
                    "If energy is increasing quickly and monthly usage is unstable, the system can mark energy risk as high.",
                )
            ],
        ),
        (
            "22. AI Insights",
            [
                "AI Insights gives interpretation of data through anomalies, opportunities, and recommendations.",
            ],
            [
                "Anomalies are unusual changes.",
                "Opportunities show possible savings or improvement areas.",
                "Recommendations suggest practical actions.",
            ],
            [
                (
                    "Example",
                    "If one building uses much more energy than similar buildings, the system may recommend checking operating schedule or equipment load.",
                )
            ],
        ),
        (
            "23. Scenario Simulator",
            [
                "Scenario Simulator is a what-if tool. It helps estimate the possible benefit before taking real action.",
            ],
            [
                "Energy reduction",
                "Water reduction",
                "Waste reduction",
                "Solar increase",
                "Impact on carbon, cost, and Green Index",
            ],
            [
                (
                    "Example",
                    "If management wants to reduce energy by 10 percent and increase solar by 20 percent, the simulator can estimate cost and carbon savings.",
                )
            ],
        ),
        (
            "24. Governance Section",
            [
                "Governance explains how the dashboard is calculated and controlled. It builds trust because assumptions and settings are visible.",
            ],
            [
                "Building Ranking",
                "Occupancy Settings",
                "Editable Calculation Settings",
                "Formula Guide",
                "Audit Trail",
                "Device Readiness Layer",
            ],
            None,
        ),
        (
            "25. Building Ranking",
            [
                "Building Ranking compares buildings based on sustainability performance. It helps identify the top performer and the building needing attention.",
            ],
            [
                "Rank",
                "Building name",
                "Energy",
                "Solar",
                "Net energy",
                "Water",
                "Waste",
                "Carbon",
                "Efficiency",
            ],
            [
                (
                    "Example",
                    "If Boys Hostel has high net energy and carbon compared with other buildings, it may need energy audit or operational review first.",
                )
            ],
        ),
        (
            "26. Occupancy And Campus Context",
            [
                "This section lets the user change campus activity assumptions. Values such as 1.0, 0.9, 0.5, and 0.2 are activity multipliers, not exact attendance counts.",
            ],
            [
                "1.0 means normal or full campus activity.",
                "0.9 means slightly reduced activity.",
                "0.5 means partial activity or vacation period.",
                "0.2 means very low campus activity.",
            ],
            [
                (
                    "Example",
                    "If students are mostly away in June, setting June occupancy lower helps the forecast show lower expected demand.",
                )
            ],
        ),
        (
            "27. Editable Calculation Settings",
            [
                "Different campuses may use different assumptions. MGCD allows important calculation values to be changed from the UI.",
            ],
            [
                "Carbon factor per kWh",
                "Electricity cost per unit",
                "Energy benchmark",
                "Water benchmark",
                "Waste benchmark",
                "Anomaly threshold",
                "Green Index weights",
            ],
            [
                (
                    "Example",
                    "If electricity cost changes from Rs 8 to Rs 9 per kWh, the user can update the value and cost calculations will reflect the new assumption.",
                )
            ],
        ),
        (
            "28. Audit Trail",
            [
                "Audit Trail records important actions so changes are easier to review later.",
            ],
            [
                "Settings changed",
                "Excel imported",
                "Data reset",
                "Device registry updated",
            ],
            [
                (
                    "Example",
                    "If someone changes the carbon factor before a report, Audit Trail helps show that the assumption was changed.",
                )
            ],
        ),
        (
            "29. Device Readiness Layer",
            [
                "Device Readiness is a planning layer for future real-time implementation. It tracks whether meters and data sources are ready.",
            ],
            [
                "Device name",
                "Category",
                "Building or scope",
                "Source type",
                "Sync status",
                "Last sync time",
                "Readiness score",
            ],
            [
                (
                    "Example",
                    "Before installing IoT meters in a building, the team can track which meters are ready, manual, delayed, or critical.",
                )
            ],
        ),
        (
            "30. Executive Report",
            [
                "Executive Report is a clean report-style view for meetings, screenshots, PDF printing, and quick review.",
            ],
            [
                "Summary",
                "Important KPIs",
                "Carbon and solar view",
                "Important risks",
                "Major recommendations",
            ],
            None,
        ),
        (
            "31. Screenshot Mode",
            [
                "Screenshot Mode makes the dashboard cleaner for presentation screenshots. It reduces visual clutter and makes the page easier to capture for slides or reports.",
            ],
            None,
            None,
        ),
        (
            "32. Import, Workbook Check, Export, And Reset",
            [
                "These features manage the dataset used by the dashboard. They are useful for testing, demos, audits, and fresh database setup.",
            ],
            [
                "Import Excel uploads campus data.",
                "Workbook Check validates sheets, rows, and columns before import.",
                "Export Excel downloads the current stored data.",
                "Reset Data clears current resource records before fresh import.",
            ],
            [
                (
                    "Example",
                    "After creating a new database, register again and import the Excel workbook so the dashboard has fresh data.",
                )
            ],
        ),
        (
            "33. What Makes This Project Smart",
            [
                "MGCD is smarter than a normal dashboard because it gives interpretation, forecast, risk, recommended action, and report-ready outputs.",
            ],
            [
                "AI-style forecasting",
                "Occupancy-aware planning",
                "Confidence range",
                "Anomaly detection",
                "Risk scoring",
                "Recommendation generation",
                "Action tracking",
                "Scenario simulation",
                "Editable assumptions",
                "Data quality scoring",
                "Executive reporting",
            ],
            None,
        ),
        (
            "34. Future Features That Can Be Added",
            [
                "The project can be expanded further for real campus implementation and deeper automation.",
            ],
            [
                "Real-time smart meter integration",
                "Weather-aware prediction",
                "Holiday and exam schedule planning",
                "Hostel-wise occupancy data",
                "Water leakage detection",
                "Solar underperformance diagnosis",
                "Automated monthly PDF reports",
                "Role-based access for admin and viewers",
                "Email or WhatsApp alerts",
                "Maintenance ticket creation from recommendations",
                "Battery and grid export simulation",
                "Department-wise sustainability comparison",
            ],
            None,
        ),
    ]

    for title, body, items, examples in sections:
        story.append(section(title, body, styles, items, examples))

    story.append(PageBreak())
    story.append(Paragraph("Main Calculations In Simple Words", styles["Heading2"]))
    story.append(Paragraph("These formulas explain the main dashboard numbers in an easy way.", styles["Body"]))
    for text in [
        "Net Energy = Gross Energy - Solar Energy",
        "Grid Export = Solar Energy - Gross Energy",
        "Carbon = Net Grid Energy x Carbon Factor",
        "Energy Cost = Net Grid Energy x Cost Per kWh",
        "Green Index = Combined score based on energy, water, and waste performance",
    ]:
        story.append(formula(text, styles))
        story.append(Spacer(1, 8))

    story.append(Paragraph("Important Terms", styles["Heading2"]))
    terms = [
        ("Benchmark", "A reference value used for comparison. If actual usage is below a suitable benchmark, performance is usually better."),
        ("Weighted Efficiency", "A combined performance idea where energy, water, and waste can have different importance."),
        ("KPI", "Key Performance Indicator. It is an important number used to measure performance."),
        ("Forecast", "A future prediction based on past data and assumptions."),
        ("Anomaly", "Unusual behavior in data."),
        ("Occupancy", "How active the campus is in a month."),
        ("Carbon Factor", "How much carbon is counted for each unit of grid electricity."),
    ]
    term_table = Table(
        [[Paragraph(f"<b>{name}</b>", styles["Body"]), Paragraph(desc, styles["Body"])] for name, desc in terms],
        colWidths=[1.8 * inch, 4.75 * inch],
        repeatRows=0,
    )
    term_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d7e5df")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eef7f3")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(term_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Best Demo Order", styles["Heading2"]))
    story.append(
        numbered(
            [
                "Start with login and dashboard access.",
                "Show Overview and Campus Pulse.",
                "Show KPI cards.",
                "Show Comparison Analytics.",
                "Show Carbon and Solar sections.",
                "Show Resource Visualization.",
                "Show AI Forecast and Risk.",
                "Show Scenario Simulator.",
                "Show Governance settings.",
                "Show Executive Report.",
                "Show Import, Export, and Reset options.",
            ],
            styles["Body"],
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        example_box(
            "Simple opening line",
            "This project is a smart sustainability dashboard for campus operations. It brings electricity, water, waste, and solar data into one place and converts it into useful insights, forecasts, and management reports.",
            styles,
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        example_box(
            "Simple closing line",
            "The main value is that management can understand current performance, future risk, and recommended actions from one dashboard instead of manually analyzing multiple Excel files.",
            styles,
        )
    )

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_pdf()
