"""
Professional Academic Certificate PDF Generation using ReportLab.
Landscape A4 with elegant borders, gold accents, and modern typography.
"""
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas
from django.conf import settings
import os


# ==================== COLOR PALETTE ====================
DARK_NAVY = colors.HexColor('#1B2A4A')
GOLD = colors.HexColor('#C8A951')
GOLD_LIGHT = colors.HexColor('#E8D5A3')
DARK_GOLD = colors.HexColor('#A08030')
WHITE = colors.white
SOFT_CREAM = colors.HexColor('#FFF9F0')
CHARCOAL = colors.HexColor('#2C2C2C')
GRAY_TEXT = colors.HexColor('#555555')
LIGHT_GRAY = colors.HexColor('#888888')
BORDER_OUTER = colors.HexColor('#1B2A4A')
BORDER_INNER = colors.HexColor('#C8A951')


class CertificateCanvas(canvas.Canvas):
    """Custom canvas to draw decorative borders and background."""

    def __init__(self, *args, **kwargs):
        self.certificate_data = kwargs.pop('certificate_data', {})
        super().__init__(*args, **kwargs)

    def showPage(self):
        self._draw_background()
        self._draw_borders()
        self._draw_corner_ornaments()
        self._draw_watermark()
        super().showPage()

    def save(self):
        self.showPage()
        super().save()

    def _draw_background(self):
        """Draw subtle cream background."""
        w, h = landscape(A4)
        # Cream background
        self.setFillColor(SOFT_CREAM)
        self.rect(0, 0, w, h, fill=1, stroke=0)

    def _draw_borders(self):
        """Draw elegant multi-layer border."""
        w, h = landscape(A4)

        # Outer border - dark navy thick
        self.setStrokeColor(BORDER_OUTER)
        self.setLineWidth(4)
        self.rect(15*mm, 12*mm, w - 30*mm, h - 24*mm, fill=0, stroke=1)

        # Second border - gold
        self.setStrokeColor(BORDER_INNER)
        self.setLineWidth(2)
        self.rect(19*mm, 16*mm, w - 38*mm, h - 32*mm, fill=0, stroke=1)

        # Third border - thin navy
        self.setStrokeColor(BORDER_OUTER)
        self.setLineWidth(0.5)
        self.rect(21*mm, 18*mm, w - 42*mm, h - 36*mm, fill=0, stroke=1)

        # Inner decorative border - gold dashed-like pattern with corner breaks
        self.setStrokeColor(GOLD_LIGHT)
        self.setLineWidth(0.8)
        self.rect(23*mm, 20*mm, w - 46*mm, h - 40*mm, fill=0, stroke=1)

        # Top decorative gold line (header separator)
        top_line_y = h - 58*mm
        self.setStrokeColor(GOLD)
        self.setLineWidth(1.5)
        # Left ornamental line
        self.line(50*mm, top_line_y, w/2 - 40*mm, top_line_y)
        # Right ornamental line
        self.line(w/2 + 40*mm, top_line_y, w - 50*mm, top_line_y)
        # Center diamond
        cx = w / 2
        self.setFillColor(GOLD)
        self.setStrokeColor(GOLD)
        self.setLineWidth(1)
        diamond_size = 3*mm
        p = self.beginPath()
        p.moveTo(cx, top_line_y + diamond_size)
        p.lineTo(cx + diamond_size, top_line_y)
        p.lineTo(cx, top_line_y - diamond_size)
        p.lineTo(cx - diamond_size, top_line_y)
        p.close()
        self.drawPath(p, fill=1, stroke=1)

    def _draw_corner_ornaments(self):
        """Draw elegant corner decorations."""
        w, h = landscape(A4)
        ornament_size = 12*mm
        offset = 26*mm

        self.setStrokeColor(GOLD)
        self.setLineWidth(1.2)

        corners = [
            (offset, h - offset, 1, -1),        # Top-left
            (w - offset, h - offset, -1, -1),   # Top-right
            (offset, offset, 1, 1),              # Bottom-left
            (w - offset, offset, -1, 1),         # Bottom-right
        ]

        for cx, cy, dx, dy in corners:
            # L-shaped corner ornament
            self.line(cx, cy, cx + dx * ornament_size, cy)
            self.line(cx, cy, cx, cy + dy * ornament_size)
            # Small inner L
            inner_offset = 3*mm
            inner_size = 7*mm
            self.setLineWidth(0.7)
            self.line(cx + dx * inner_offset, cy + dy * inner_offset,
                      cx + dx * (inner_offset + inner_size), cy + dy * inner_offset)
            self.line(cx + dx * inner_offset, cy + dy * inner_offset,
                      cx + dx * inner_offset, cy + dy * (inner_offset + inner_size))
            self.setLineWidth(1.2)

    def _draw_watermark(self):
        """Draw subtle watermark pattern."""
        w, h = landscape(A4)
        self.saveState()
        self.setFillColor(colors.Color(0.92, 0.88, 0.78, alpha=0.15))
        self.setFont('Helvetica-Bold', 80)
        self.translate(w/2, h/2)
        self.rotate(30)
        self.drawCentredString(0, 0, "CERTIFIED")
        self.restoreState()


def generate_certificate_pdf(certificate):
    """
    Generate a professional academic certificate PDF.
    Landscape A4 with elegant borders, gold accents, and modern typography.
    """
    # Create directory if it doesn't exist
    cert_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
    os.makedirs(cert_dir, exist_ok=True)

    filename = f'certificate_{certificate.certificate_id}.pdf'
    filepath = os.path.join(cert_dir, filename)

    w, h = landscape(A4)

    # Prepare certificate data
    cert_data = {
        'student_name': certificate.student.name,
        'course_name': certificate.course.name,
        'batch_name': certificate.batch.name if certificate.batch else None,
        'duration': certificate.course.duration,
        'completion_date': certificate.completion_date.strftime('%B %d, %Y'),
        'certificate_id': certificate.certificate_id,
        'issued_at': certificate.issued_at.strftime('%B %d, %Y'),
    }

    # Create canvas with custom drawing
    c = CertificateCanvas(filepath, pagesize=landscape(A4), certificate_data=cert_data)

    # ==================== INSTITUTION HEADER ====================

    # Institution name
    c.setFont('Helvetica-Bold', 13)
    c.setFillColor(DARK_NAVY)
    c.drawCentredString(w/2, h - 42*mm, "STUDENT MANAGEMENT SYSTEM")

    # Thin gold line under institution name
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(w/2 - 50*mm, h - 44*mm, w/2 + 50*mm, h - 44*mm)

    # Tagline
    c.setFont('Helvetica', 8)
    c.setFillColor(LIGHT_GRAY)
    c.drawCentredString(w/2, h - 49*mm, "Excellence in Education | Empowering Future Leaders")

    # ==================== CERTIFICATE TITLE ====================

    # "Certificate" word in large elegant font
    c.setFont('Helvetica-Bold', 40)
    c.setFillColor(DARK_NAVY)
    c.drawCentredString(w/2, h - 75*mm, "Certificate")

    # "of Completion" subtitle
    c.setFont('Helvetica', 18)
    c.setFillColor(GOLD)
    c.drawCentredString(w/2, h - 85*mm, "of Completion")

    # ==================== PRESENTED TO LINE ====================

    c.setFont('Helvetica', 11)
    c.setFillColor(GRAY_TEXT)
    c.drawCentredString(w/2, h - 100*mm, "This certificate is proudly presented to")

    # ==================== STUDENT NAME ====================

    # Gold decorative line above name
    name_y = h - 118*mm
    line_width = 90*mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(w/2 - line_width, name_y - 2*mm, w/2 + line_width, name_y - 2*mm)

    # Student name - large and prominent
    c.setFont('Helvetica-Bold', 32)
    c.setFillColor(DARK_NAVY)
    c.drawCentredString(w/2, name_y + 4*mm, certificate.student.name)

    # Gold decorative line below name
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    c.line(w/2 - line_width, name_y - 4*mm, w/2 + line_width, name_y - 4*mm)

    # ==================== COMPLETION TEXT ====================

    c.setFont('Helvetica', 11)
    c.setFillColor(GRAY_TEXT)
    c.drawCentredString(w/2, h - 132*mm, "for successfully completing the course")

    # ==================== COURSE NAME ====================

    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(GOLD)
    c.drawCentredString(w/2, h - 145*mm, certificate.course.name)

    # ==================== DETAILS LINE ====================

    details_y = h - 158*mm
    details_parts = []
    if certificate.batch:
        details_parts.append(f"Batch: {certificate.batch.name}")
    details_parts.append(f"Duration: {certificate.course.duration} months")
    details_parts.append(f"Completed: {cert_data['completion_date']}")

    c.setFont('Helvetica', 10)
    c.setFillColor(LIGHT_GRAY)
    c.drawCentredString(w/2, details_y, "  |  ".join(details_parts))

    # ==================== SIGNATURES SECTION ====================

    sig_y = 42*mm
    sig_line_width = 55*mm

    # Left signature - Director
    left_x = w/2 - 80*mm
    c.setStrokeColor(CHARCOAL)
    c.setLineWidth(0.8)
    c.line(left_x - sig_line_width/2, sig_y, left_x + sig_line_width/2, sig_y)

    c.setFont('Helvetica-Bold', 10)
    c.setFillColor(DARK_NAVY)
    c.drawCentredString(left_x, sig_y - 6*mm, "Program Director")

    c.setFont('Helvetica', 8)
    c.setFillColor(LIGHT_GRAY)
    c.drawCentredString(left_x, sig_y - 12*mm, "Student Management System")

    # Center - Seal area
    seal_x = w / 2
    seal_y = sig_y + 2*mm
    seal_r = 14*mm

    # Outer circle
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.circle(seal_x, seal_y, seal_r, fill=0, stroke=1)
    # Inner circle
    c.setLineWidth(0.8)
    c.circle(seal_x, seal_y, seal_r - 3*mm, fill=0, stroke=1)

    # Seal text
    c.setFont('Helvetica-Bold', 7)
    c.setFillColor(GOLD)
    c.drawCentredString(seal_x, seal_y + 5*mm, "OFFICIAL")
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(seal_x, seal_y - 1*mm, "SEAL")
    c.setFont('Helvetica', 6)
    c.drawCentredString(seal_x, seal_y - 7*mm, "VERIFIED")

    # Right signature - Chairman
    right_x = w/2 + 80*mm
    c.setStrokeColor(CHARCOAL)
    c.setLineWidth(0.8)
    c.line(right_x - sig_line_width/2, sig_y, right_x + sig_line_width/2, sig_y)

    c.setFont('Helvetica-Bold', 10)
    c.setFillColor(DARK_NAVY)
    c.drawCentredString(right_x, sig_y - 6*mm, "Chairman")

    c.setFont('Helvetica', 8)
    c.setFillColor(LIGHT_GRAY)
    c.drawCentredString(right_x, sig_y - 12*mm, "Board of Education")

    # ==================== FOOTER ====================

    footer_y = 25*mm

    # Certificate ID - left
    c.setFont('Helvetica', 8)
    c.setFillColor(LIGHT_GRAY)
    c.drawString(30*mm, footer_y, f"Certificate ID: {certificate.certificate_id}")

    # Issue date - right
    c.drawRightString(w - 30*mm, footer_y, f"Date of Issue: {cert_data['issued_at']}")

    # Verification note - center
    c.setFont('Helvetica', 7)
    c.setFillColor(colors.HexColor('#AAAAAA'))
    c.drawCentredString(w/2, footer_y - 6*mm, "This is a computer-generated certificate. Verify authenticity at www.sms.edu/verify")

    # Save
    c.save()

    return f'certificates/{filename}'
