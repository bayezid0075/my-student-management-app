"""
PDF generation for invoices using ReportLab.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from django.conf import settings
import os


def generate_invoice_pdf(invoice):
    """
    Generate a PDF invoice with retro styling.
    """
    # Create directory if it doesn't exist
    invoice_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
    os.makedirs(invoice_dir, exist_ok=True)

    # Create PDF filename
    filename = f'invoice_{invoice.invoice_number}.pdf'
    filepath = os.path.join(invoice_dir, filename)

    # Create PDF
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles for retro look
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#D4C5F9'),  # Lavender
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#B4E7CE'),  # Mint green
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    # Title
    title = Paragraph("INVOICE", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.3 * inch))

    # Invoice details
    invoice_info = [
        ['Invoice Number:', invoice.invoice_number],
        ['Payment Date:', invoice.payment_date.strftime('%B %d, %Y')],
        ['Issue Date:', invoice.created_at.strftime('%B %d, %Y')],
    ]

    invoice_table = Table(invoice_info, colWidths=[2 * inch, 4 * inch])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.4 * inch))

    # Student details section
    student_heading = Paragraph("Bill To:", heading_style)
    elements.append(student_heading)

    student_info = [
        ['Student Name:', invoice.student.name],
        ['Email:', invoice.student.email],
        ['Phone:', invoice.student.phone],
    ]

    student_table = Table(student_info, colWidths=[2 * inch, 4 * inch])
    student_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(student_table)
    elements.append(Spacer(1, 0.4 * inch))

    # Course details section
    course_heading = Paragraph("Course Details:", heading_style)
    elements.append(course_heading)

    course_data = [
        ['Description', 'Duration', 'Amount'],
        [
            invoice.course.name,
            f"{invoice.course.duration} months",
            f"${invoice.amount}"
        ],
    ]

    if invoice.batch:
        course_data[1][0] += f"\nBatch: {invoice.batch.name}"

    course_table = Table(course_data, colWidths=[3.5 * inch, 1.5 * inch, 1.5 * inch])
    course_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FFB3D9')),  # Soft pink
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(course_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Total section
    total_data = [
        ['Total Amount:', f"${invoice.amount}"],
    ]

    total_table = Table(total_data, colWidths=[5 * inch, 1.5 * inch])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
        ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#FFB3D9')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(total_table)
    elements.append(Spacer(1, 0.5 * inch))

    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
    )
    footer = Paragraph("Thank you for your payment!", footer_style)
    elements.append(footer)

    # Build PDF
    doc.build(elements)

    return f'invoices/{filename}'
