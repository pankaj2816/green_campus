from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_PATH = "UNIVERSITY_FEE_PROPOSAL_FINAL_V2.pdf"


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCustom",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=19,
            leading=23,
            textColor=colors.HexColor("#17342d"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HeadingCustom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#17342d"),
            spaceBefore=8,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=14,
            textColor=colors.HexColor("#2f4741"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallMuted",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12,
            textColor=colors.HexColor("#5f756f"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHead",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.8,
            leading=11,
            textColor=colors.HexColor("#17342d"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.5,
            textColor=colors.HexColor("#2f4741"),
        )
    )

    story = []

    story.append(Paragraph("PROFESSIONAL FEE PROPOSAL", styles["TitleCustom"]))
    story.append(
        Paragraph(
            "Proposal for sitting, consultation, site visit, online review, and software enhancement charges",
            styles["BodyCustom"],
        )
    )
    story.append(
        Paragraph(
            "Submitted by: <b>Pankaj Gupta</b> | Senior FPGA Design Engineer, Keysight Technology | +91-8219352125 | guptapan25@gmail.com",
            styles["SmallMuted"],
        )
    )
    story.append(Spacer(1, 4))

    story.append(Paragraph("1. Purpose", styles["HeadingCustom"]))
    story.append(
        Paragraph(
            "This proposal is submitted for kind consideration and approval of professional charges for expert consultation, official meeting participation, site visit support, online review sessions, and future software enhancement or customization work requested by the university.",
            styles["BodyCustom"],
        )
    )

    story.append(Paragraph("2. Final Proposed Charges", styles["HeadingCustom"]))
    fee_rows = [
        [
            Paragraph("Charge Head", styles["TableHead"]),
            Paragraph("Final Proposed Amount", styles["TableHead"]),
            Paragraph("Remarks", styles["TableHead"]),
        ],
        [
            Paragraph("Sitting Charges", styles["TableCell"]),
            Paragraph("Rs 7,500 per sitting", styles["TableCell"]),
            Paragraph(
                "For official meeting, advisory sitting, review committee meeting, or formal discussion attendance.",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph("Consultation Charges", styles["TableCell"]),
            Paragraph("Rs 3,000 per hour", styles["TableCell"]),
            Paragraph(
                "For technical consultation, planning support, expert guidance, and discussion-based advisory work.",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph("Site Visit Charges", styles["TableCell"]),
            Paragraph("Rs 12,000 per visit", styles["TableCell"]),
            Paragraph(
                "For physical campus visit, inspection, verification, technical review, or on-site support.",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph("Online Review Charges", styles["TableCell"]),
            Paragraph("Rs 4,000 per session", styles["TableCell"]),
            Paragraph(
                "For virtual meeting, remote review, dashboard discussion, or presentation session.",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph("Custom Written Report", styles["TableCell"]),
            Paragraph("Rs 10,000 to Rs 15,000 per report", styles["TableCell"]),
            Paragraph(
                "Only if a separate custom written report is requested outside the software-generated reporting features.",
                styles["TableCell"],
            ),
        ],
    ]
    fee_table = Table(fee_rows, colWidths=[40 * mm, 38 * mm, 92 * mm], repeatRows=1)
    fee_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f6f1")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#17342d")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cfe1da")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fbfa")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(fee_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. Clarification Regarding Report Charges", styles["HeadingCustom"]))
    story.append(
        Paragraph(
            "Software-generated reports already available in the application are considered part of the software workflow and normal usage. Therefore, a separate high report charge is not being proposed for routine use of the in-app reporting features.",
            styles["BodyCustom"],
        )
    )
    story.append(
        Paragraph(
            "However, if the university separately requests a custom written technical note, inspection summary, compliance note, recommendation document, or additional special report outside the software-generated reports, the same may be charged separately.",
            styles["BodyCustom"],
        )
    )

    story.append(Paragraph("4. Software Enhancement / Additional Development", styles["HeadingCustom"]))
    story.append(
        Paragraph(
            "Any future addition, modification, customization, or enhancement in the software requested by the university shall be charged separately based on scope, complexity, time, and implementation effort.",
            styles["BodyCustom"],
        )
    )
    story.append(
        Paragraph(
            "In addition, if any software-related professional service is required by the university beyond the present scope, support may also be provided on mutually agreed commercial terms.",
            styles["BodyCustom"],
        )
    )
    enhancement_rows = [
        [Paragraph("Scope Type", styles["TableHead"]), Paragraph("Suggested Charge", styles["TableHead"])],
        [Paragraph("Minor software changes", styles["TableCell"]), Paragraph("Rs 5,000 to Rs 15,000", styles["TableCell"])],
        [Paragraph("Medium feature additions", styles["TableCell"]), Paragraph("Rs 15,000 to Rs 40,000", styles["TableCell"])],
        [Paragraph("Major module / advanced enhancement / integration", styles["TableCell"]), Paragraph("Separate project-based quotation", styles["TableCell"])],
    ]
    enhancement_table = Table(enhancement_rows, colWidths=[92 * mm, 78 * mm], repeatRows=1)
    enhancement_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef3ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#17342d")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4deef")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fbff")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(enhancement_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("5. Travel and Accommodation", styles["HeadingCustom"]))
    story.append(
        Paragraph(
            "Travel, local conveyance, accommodation, and boarding, wherever applicable, may be reimbursed separately on actual basis or may be arranged directly by the university.",
            styles["BodyCustom"],
        )
    )

    story.append(Paragraph("6. Summary for Approval", styles["HeadingCustom"]))
    summary_points = [
        "Sitting charges: Rs 7,500 per sitting",
        "Consultation charges: Rs 3,000 per hour",
        "Site visit charges: Rs 12,000 per visit",
        "Online review charges: Rs 4,000 per session",
        "Custom written report, if separately requested: Rs 10,000 to Rs 15,000 per report",
        "Software enhancement / additional development: chargeable separately as per scope",
        "Travel and accommodation: Actual basis",
    ]
    for point in summary_points:
        story.append(Paragraph(f"• {point}", styles["BodyCustom"]))

    story.append(Paragraph("7. Closing Note", styles["HeadingCustom"]))
    story.append(
        Paragraph(
            "The above proposed charges are submitted for kind consideration and approval. I shall be pleased to extend professional support to the university as required for consultation, review, monitoring, and future software-related work.",
            styles["BodyCustom"],
        )
    )

    story.append(Spacer(1, 12))
    story.append(Paragraph("Yours sincerely,", styles["BodyCustom"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Pankaj Gupta", styles["BodyCustom"]))
    story.append(Paragraph("Senior FPGA Design Engineer, Keysight Technology", styles["SmallMuted"]))
    story.append(Paragraph("+91-8219352125", styles["SmallMuted"]))
    story.append(Paragraph("guptapan25@gmail.com", styles["SmallMuted"]))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
