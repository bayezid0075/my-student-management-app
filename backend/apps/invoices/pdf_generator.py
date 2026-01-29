"""
Professional PDF invoice generation using ReportLab.
A4 size with proper business layout.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.textlabels import Label
from django.conf import settings
import os
from datetime import datetime


def generate_invoice_pdf(invoice):
    """
    Generate a professional A4 PDF invoice.
    """
    # Create directory if it doesn't exist
    invoice_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
    os.makedirs(invoice_dir, exist_ok=True)

    # Create PDF filename
    filename = f'invoice_{invoice.invoice_number}.pdf'
    filepath = os.path.join(invoice_dir, filename)

    # A4 size: 210mm x 297mm
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )

    elements = []
    styles = getSampleStyleSheet()
    width, height = A4

    # ==================== CUSTOM STYLES ====================

    # Company name style
    company_style = ParagraphStyle(
        'Company',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#9D4EDD'),
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
        spaceAfter=2*mm,
    )

    # Invoice title style
    invoice_title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=36,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica-Bold',
        alignment=TA_RIGHT,
        spaceAfter=5*mm,
    )

    # Section header style
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica-Bold',
        spaceBefore=3*mm,
        spaceAfter=2*mm,
    )

    # Normal text style
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica',
        leading=14,
    )

    # Bold text style
    bold_style = ParagraphStyle(
        'CustomBold',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica-Bold',
        leading=14,
    )

    # Small text style
    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica',
        leading=12,
    )

    # ==================== HEADER SECTION ====================

    # Create header table with company info and invoice title
    header_data = [
        [
            Paragraph("Student Management System", company_style),
            Paragraph("INVOICE", invoice_title_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[90*mm, 80*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(header_table)

    # Company address
    company_address = Paragraph(
        "123 Education Street, Learning City, LC 12345<br/>"
        "Phone: +1 (555) 123-4567 | Email: billing@sms.edu",
        small_style
    )
    elements.append(company_address)

    # Horizontal line
    elements.append(Spacer(1, 5*mm))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#9D4EDD')))
    elements.append(Spacer(1, 5*mm))

    # ==================== INVOICE INFO & BILL TO ====================

    # Invoice details (right side info)
    invoice_info_style = ParagraphStyle(
        'InvoiceInfo',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica',
        alignment=TA_RIGHT,
    )

    # Left side: Bill To
    bill_to_content = f"""
    <b>BILL TO:</b><br/>
    <b>{invoice.student.name}</b><br/>
    {invoice.student.email}<br/>
    {invoice.student.phone}<br/>
    """
    if hasattr(invoice.student, 'present_address') and invoice.student.present_address:
        bill_to_content += f"{invoice.student.present_address}<br/>"

    bill_to = Paragraph(bill_to_content, normal_style)

    # Right side: Invoice details
    invoice_details_content = f"""
    <b>Invoice Number:</b> {invoice.invoice_number}<br/>
    <b>Invoice Date:</b> {invoice.created_at.strftime('%B %d, %Y')}<br/>
    <b>Payment Date:</b> {invoice.payment_date.strftime('%B %d, %Y')}<br/>
    <b>Due Date:</b> {invoice.payment_date.strftime('%B %d, %Y')}<br/>
    """
    invoice_details = Paragraph(invoice_details_content, invoice_info_style)

    # Create two-column layout
    info_table = Table(
        [[bill_to, invoice_details]],
        colWidths=[90*mm, 80*mm]
    )
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8*mm))

    # ==================== ITEMS TABLE ====================

    # Table header
    items_header = ['#', 'Description', 'Duration', 'Rate', 'Amount']

    # Course description
    course_desc = invoice.course.name
    if invoice.batch:
        course_desc += f"\nBatch: {invoice.batch.name}"
    if invoice.course.description:
        # Truncate description if too long
        desc = invoice.course.description[:100]
        if len(invoice.course.description) > 100:
            desc += "..."
        course_desc += f"\n{desc}"

    items_data = [
        items_header,
        [
            '1',
            course_desc,
            f"{invoice.course.duration} months",
            f"৳{invoice.course.fee:,.2f}",
            f"৳{invoice.amount:,.2f}"
        ]
    ]

    # Create items table
    items_table = Table(
        items_data,
        colWidths=[10*mm, 80*mm, 25*mm, 27*mm, 28*mm]
    )

    items_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9D4EDD')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),

        # Body styling
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
        ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 1), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#9D4EDD')),

        # Alternating row colors
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FAFAFA')),
    ]))

    elements.append(items_table)
    elements.append(Spacer(1, 5*mm))

    # ==================== TOTALS SECTION ====================

    # Calculate totals (you can add subtotal, tax if needed)
    subtotal = float(invoice.amount)
    tax = 0  # No tax for now
    total = subtotal + tax

    totals_data = [
        ['', '', 'Subtotal:', f"৳{subtotal:,.2f}"],
        ['', '', 'Tax (0%):', f"৳{tax:,.2f}"],
        ['', '', 'TOTAL:', f"৳{total:,.2f}"],
    ]

    totals_table = Table(
        totals_data,
        colWidths=[80*mm, 25*mm, 35*mm, 30*mm]
    )

    totals_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('FONTNAME', (2, 0), (3, 1), 'Helvetica'),
        ('FONTNAME', (2, 2), (3, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (2, 0), (3, 1), 10),
        ('FONTSIZE', (2, 2), (3, 2), 12),
        ('TEXTCOLOR', (2, 2), (3, 2), colors.HexColor('#9D4EDD')),
        ('LINEABOVE', (2, 2), (3, 2), 2, colors.HexColor('#9D4EDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1, 8*mm))

    # ==================== STUDENT ACCOUNT SUMMARY ====================

    # Calculate student's total fees, paid, and due
    from django.db.models import Sum

    total_fees = invoice.student.enrollments.aggregate(
        total=Sum('course__fee')
    )['total'] or 0
    total_paid = invoice.student.invoices.aggregate(
        total=Sum('amount')
    )['total'] or 0
    due_amount = max(0, float(total_fees) - float(total_paid))

    account_section = Paragraph("<b>STUDENT ACCOUNT SUMMARY</b>", section_style)
    elements.append(account_section)

    account_data = [
        ['Total Course Fees', 'Total Paid', 'Balance Due'],
        [f"৳{float(total_fees):,.2f}", f"৳{float(total_paid):,.2f}", f"৳{due_amount:,.2f}"]
    ]

    account_table = Table(account_data, colWidths=[56*mm, 56*mm, 56*mm])
    account_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F5F5F5')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#666666')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),

        # Values
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 12),
        ('TEXTCOLOR', (0, 1), (0, 1), colors.HexColor('#9D4EDD')),  # Total fees - purple
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor('#00CBA9')),  # Paid - green
        ('TEXTCOLOR', (2, 1), (2, 1), colors.HexColor('#DC3545') if due_amount > 0 else colors.HexColor('#00CBA9')),  # Due - red/green
        ('TOPPADDING', (0, 1), (-1, 1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 10),

        # Border
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E0E0E0')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#E0E0E0')),
    ]))

    elements.append(account_table)
    elements.append(Spacer(1, 8*mm))

    # ==================== PAYMENT STATUS BOX ====================

    status_style = ParagraphStyle(
        'Status',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    )

    # Determine payment status based on due amount
    if due_amount <= 0:
        status_text = "FULLY PAID"
        status_color = colors.HexColor('#00CBA9')  # Green
    else:
        status_text = f"BALANCE DUE: ৳{due_amount:,.2f}"
        status_color = colors.HexColor('#FF6B35')  # Orange

    status_data = [[Paragraph(f"<b>{status_text}</b>", status_style)]]

    status_table = Table(status_data, colWidths=[170*mm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), status_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
    ]))

    elements.append(status_table)
    elements.append(Spacer(1, 10*mm))

    # ==================== PAYMENT DETAILS ====================

    payment_section = Paragraph("<b>PAYMENT INFORMATION</b>", section_style)
    elements.append(payment_section)

    payment_info = """
    <b>Payment Method:</b> Cash/Bank Transfer<br/>
    <b>Account Name:</b> Student Management System<br/>
    <b>Bank:</b> National Education Bank<br/>
    <b>Account Number:</b> 1234-5678-9012-3456<br/>
    """
    elements.append(Paragraph(payment_info, small_style))
    elements.append(Spacer(1, 8*mm))

    # ==================== NOTES & TERMS ====================

    notes_section = Paragraph("<b>NOTES & TERMS</b>", section_style)
    elements.append(notes_section)

    notes_content = """
    1. This invoice is computer generated and does not require a signature.<br/>
    2. Please keep this invoice for your records.<br/>
    3. For any queries regarding this invoice, please contact our billing department.<br/>
    4. Thank you for choosing our educational services!
    """
    elements.append(Paragraph(notes_content, small_style))
    elements.append(Spacer(1, 10*mm))

    # ==================== FOOTER ====================

    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CCCCCC')))
    elements.append(Spacer(1, 3*mm))

    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
    )

    footer_text = f"""
    Student Management System | www.sms.edu | billing@sms.edu<br/>
    Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>
    This is an electronically generated document.
    """
    elements.append(Paragraph(footer_text, footer_style))

    # Build PDF
    doc.build(elements)

    return f'invoices/{filename}'


def generate_custom_invoice_pdf(invoice):
    """
    Generate a professional A4 PDF for custom invoices with multiple items.
    """
    # Create directory if it doesn't exist
    invoice_dir = os.path.join(settings.MEDIA_ROOT, 'invoices', 'custom')
    os.makedirs(invoice_dir, exist_ok=True)

    # Create PDF filename
    filename = f'custom_invoice_{invoice.invoice_number}.pdf'
    filepath = os.path.join(invoice_dir, filename)

    # A4 size: 210mm x 297mm
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )

    elements = []
    styles = getSampleStyleSheet()

    # ==================== CUSTOM STYLES ====================

    company_style = ParagraphStyle(
        'Company',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#9D4EDD'),
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
        spaceAfter=2*mm,
    )

    invoice_title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=36,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica-Bold',
        alignment=TA_RIGHT,
        spaceAfter=5*mm,
    )

    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica-Bold',
        spaceBefore=3*mm,
        spaceAfter=2*mm,
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica',
        leading=14,
    )

    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica',
        leading=12,
    )

    # ==================== HEADER SECTION ====================

    header_data = [
        [
            Paragraph("Student Management System", company_style),
            Paragraph("INVOICE", invoice_title_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[90*mm, 80*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(header_table)

    company_address = Paragraph(
        "123 Education Street, Learning City, LC 12345<br/>"
        "Phone: +1 (555) 123-4567 | Email: billing@sms.edu",
        small_style
    )
    elements.append(company_address)

    elements.append(Spacer(1, 5*mm))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#9D4EDD')))
    elements.append(Spacer(1, 5*mm))

    # ==================== INVOICE INFO & BILL TO ====================

    invoice_info_style = ParagraphStyle(
        'InvoiceInfo',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica',
        alignment=TA_RIGHT,
    )

    bill_to_content = f"""
    <b>BILL TO:</b><br/>
    <b>{invoice.recipient_name}</b><br/>
    """
    if invoice.recipient_email:
        bill_to_content += f"{invoice.recipient_email}<br/>"
    if invoice.recipient_phone:
        bill_to_content += f"{invoice.recipient_phone}<br/>"
    if invoice.recipient_address:
        bill_to_content += f"{invoice.recipient_address}<br/>"

    bill_to = Paragraph(bill_to_content, normal_style)

    invoice_details_content = f"""
    <b>Invoice Number:</b> {invoice.invoice_number}<br/>
    <b>Invoice Date:</b> {invoice.created_at.strftime('%B %d, %Y')}<br/>
    <b>Payment Date:</b> {invoice.payment_date.strftime('%B %d, %Y')}<br/>
    """
    invoice_details = Paragraph(invoice_details_content, invoice_info_style)

    info_table = Table(
        [[bill_to, invoice_details]],
        colWidths=[90*mm, 80*mm]
    )
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8*mm))

    # ==================== ITEMS TABLE ====================

    items_header = ['#', 'Description', 'Qty', 'Unit Price', 'Amount']

    items_data = [items_header]
    for i, item in enumerate(invoice.items, 1):
        qty = float(item.get('quantity', 1))
        unit_price = float(item.get('unit_price', 0))
        amount = qty * unit_price
        items_data.append([
            str(i),
            item.get('name', 'Item'),
            str(int(qty) if qty == int(qty) else qty),
            f"৳{unit_price:,.2f}",
            f"৳{amount:,.2f}"
        ])

    items_table = Table(
        items_data,
        colWidths=[10*mm, 80*mm, 20*mm, 30*mm, 30*mm]
    )

    # Build table style
    table_style = [
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9D4EDD')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),

        # Body styling
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
        ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 1), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#9D4EDD')),
    ]

    # Alternating row colors
    for i in range(1, len(items_data)):
        if i % 2 == 1:
            table_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#FAFAFA')))

    items_table.setStyle(TableStyle(table_style))

    elements.append(items_table)
    elements.append(Spacer(1, 5*mm))

    # ==================== TOTALS SECTION ====================

    subtotal = float(invoice.subtotal)
    tax_amount = float(invoice.tax_amount)
    discount = float(invoice.discount)
    total = float(invoice.total_amount)

    totals_data = [
        ['', '', 'Subtotal:', f"৳{subtotal:,.2f}"],
    ]

    if float(invoice.tax_percentage) > 0:
        totals_data.append(['', '', f'Tax ({invoice.tax_percentage}%):', f"৳{tax_amount:,.2f}"])

    if discount > 0:
        totals_data.append(['', '', 'Discount:', f"-৳{discount:,.2f}"])

    totals_data.append(['', '', 'TOTAL:', f"৳{total:,.2f}"])

    totals_table = Table(
        totals_data,
        colWidths=[80*mm, 25*mm, 35*mm, 30*mm]
    )

    totals_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('FONTNAME', (2, 0), (3, -2), 'Helvetica'),
        ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (2, 0), (3, -2), 10),
        ('FONTSIZE', (2, -1), (3, -1), 12),
        ('TEXTCOLOR', (2, -1), (3, -1), colors.HexColor('#9D4EDD')),
        ('LINEABOVE', (2, -1), (3, -1), 2, colors.HexColor('#9D4EDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1, 10*mm))

    # ==================== PAYMENT STATUS BOX ====================

    status_style = ParagraphStyle(
        'Status',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    )

    status_text = "PAID"
    status_data = [[Paragraph(f"<b>PAYMENT STATUS: {status_text}</b>", status_style)]]

    status_table = Table(status_data, colWidths=[170*mm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#00CBA9')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))

    elements.append(status_table)
    elements.append(Spacer(1, 10*mm))

    # ==================== NOTES ====================

    if invoice.notes:
        notes_section = Paragraph("<b>NOTES</b>", section_style)
        elements.append(notes_section)
        elements.append(Paragraph(invoice.notes.replace('\n', '<br/>'), small_style))
        elements.append(Spacer(1, 8*mm))

    # ==================== PAYMENT DETAILS ====================

    payment_section = Paragraph("<b>PAYMENT INFORMATION</b>", section_style)
    elements.append(payment_section)

    payment_info = """
    <b>Payment Method:</b> Cash/Bank Transfer<br/>
    <b>Account Name:</b> Student Management System<br/>
    <b>Bank:</b> National Education Bank<br/>
    <b>Account Number:</b> 1234-5678-9012-3456<br/>
    """
    elements.append(Paragraph(payment_info, small_style))
    elements.append(Spacer(1, 8*mm))

    # ==================== TERMS ====================

    terms_section = Paragraph("<b>TERMS & CONDITIONS</b>", section_style)
    elements.append(terms_section)

    terms_content = """
    1. This invoice is computer generated and does not require a signature.<br/>
    2. Please keep this invoice for your records.<br/>
    3. For any queries regarding this invoice, please contact our billing department.<br/>
    4. Thank you for your business!
    """
    elements.append(Paragraph(terms_content, small_style))
    elements.append(Spacer(1, 10*mm))

    # ==================== FOOTER ====================

    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CCCCCC')))
    elements.append(Spacer(1, 3*mm))

    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
    )

    footer_text = f"""
    Student Management System | www.sms.edu | billing@sms.edu<br/>
    Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>
    This is an electronically generated document.
    """
    elements.append(Paragraph(footer_text, footer_style))

    # Build PDF
    doc.build(elements)

    return f'invoices/custom/{filename}'
