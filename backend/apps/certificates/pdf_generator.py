"""
PDF generation for certificates using ReportLab.
"""
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER
from django.conf import settings
import os


def generate_certificate_pdf(certificate):
    """
    Generate a certificate PDF with retro styling.
    """
    # Create directory if it doesn't exist
    cert_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
    os.makedirs(cert_dir, exist_ok=True)

    # Create PDF filename
    filename = f'certificate_{certificate.certificate_id}.pdf'
    filepath = os.path.join(cert_dir, filename)

    # Create PDF in landscape mode for certificate
    doc = SimpleDocTemplate(filepath, pagesize=landscape(letter))
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles for retro certificate look
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading1'],
        fontSize=36,
        textColor=colors.HexColor('#D4C5F9'),  # Lavender
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CertSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#B4E7CE'),  # Mint green
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )

    name_style = ParagraphStyle(
        'StudentName',
        parent=styles['Normal'],
        fontSize=28,
        textColor=colors.HexColor('#FFB3D9'),  # Soft pink
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CertBody',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )

    # Add top spacing
    elements.append(Spacer(1, 1 * inch))

    # Title
    title = Paragraph("CERTIFICATE OF COMPLETION", title_style)
    elements.append(title)

    # Subtitle
    subtitle = Paragraph("This is to certify that", subtitle_style)
    elements.append(subtitle)

    # Student name
    student_name = Paragraph(certificate.student.name, name_style)
    elements.append(student_name)

    # Completion text
    completion_text = f"has successfully completed the course"
    completion = Paragraph(completion_text, body_style)
    elements.append(completion)
    elements.append(Spacer(1, 0.2 * inch))

    # Course name
    course_style = ParagraphStyle(
        'CourseName',
        parent=styles['Normal'],
        fontSize=20,
        textColor=colors.HexColor('#FFDAB9'),  # Peach
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    course_name = Paragraph(certificate.course.name, course_style)
    elements.append(course_name)

    # Batch info if available
    if certificate.batch:
        batch_text = f"Batch: {certificate.batch.name}"
        batch = Paragraph(batch_text, body_style)
        elements.append(batch)
        elements.append(Spacer(1, 0.1 * inch))

    # Duration
    duration_text = f"Duration: {certificate.course.duration} months"
    duration = Paragraph(duration_text, body_style)
    elements.append(duration)
    elements.append(Spacer(1, 0.3 * inch))

    # Completion date
    date_text = f"Completed on {certificate.completion_date.strftime('%B %d, %Y')}"
    date = Paragraph(date_text, body_style)
    elements.append(date)
    elements.append(Spacer(1, 0.4 * inch))

    # Certificate ID and issue date
    footer_data = [
        [f'Certificate ID: {certificate.certificate_id}', f'Issued: {certificate.issued_at.strftime("%B %d, %Y")}']
    ]

    footer_table = Table(footer_data, colWidths=[4.5 * inch, 4.5 * inch])
    footer_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#999999')),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(footer_table)

    # Border decoration
    # You can add decorative elements here if needed

    # Build PDF
    doc.build(elements)

    return f'certificates/{filename}'
