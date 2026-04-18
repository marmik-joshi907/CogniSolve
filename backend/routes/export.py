"""
CogniSol - Export Routes (Layer 8)
PDF and CSV export endpoints for complaint reports.
"""

import io
import csv
from datetime import datetime
from flask import Blueprint, Response, jsonify
from db.connection import execute_query, execute_query_one

export_bp = Blueprint("export", __name__)


@export_bp.route("/api/export/csv", methods=["GET"])
def export_csv():
    """
    Export all complaints as CSV file download.
    
    Returns:
        CSV file attachment
    """
    try:
        complaints = execute_query("""
            SELECT id, complaint_text, channel, status, category, priority,
                   confidence_score, resolution_text, sla_deadline, sla_breached,
                   created_at, updated_at
            FROM complaints
            ORDER BY created_at DESC
        """)
        
        # Build CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header row
        writer.writerow([
            'Complaint ID', 'Text', 'Channel', 'Status', 'Category',
            'Priority', 'Confidence Score', 'Resolution', 'SLA Deadline',
            'SLA Breached', 'Created At', 'Updated At'
        ])
        
        # Data rows
        for c in complaints:
            writer.writerow([
                f"CGN-{c['id']}",
                c['complaint_text'],
                c['channel'],
                c['status'],
                c['category'],
                c['priority'],
                c['confidence_score'],
                c.get('resolution_text', ''),
                c['sla_deadline'],
                'Yes' if c['sla_breached'] else 'No',
                c['created_at'],
                c['updated_at'],
            ])
        
        csv_data = output.getvalue()
        output.close()
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"cognisolve_complaints_{timestamp}.csv"
        
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Access-Control-Expose-Headers': 'Content-Disposition',
            }
        )
        
    except Exception as e:
        return jsonify({"error": f"Export failed: {str(e)}"}), 500


@export_bp.route("/api/export/pdf", methods=["GET"])
def export_pdf():
    """
    Export complaint report as PDF file download.
    
    Returns:
        PDF file attachment
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch, cm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        
        # Fetch data
        complaints = execute_query("""
            SELECT id, complaint_text, channel, status, category, priority,
                   confidence_score, sla_breached, created_at
            FROM complaints
            ORDER BY created_at DESC
        """)
        
        stats = _get_stats()
        
        # Build PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=landscape(A4),
            leftMargin=1*cm, rightMargin=1*cm,
            topMargin=1.5*cm, bottomMargin=1.5*cm
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Title'],
            fontSize=20, spaceAfter=12, textColor=colors.HexColor('#142175')
        )
        heading_style = ParagraphStyle(
            'CustomHeading', parent=styles['Heading2'],
            fontSize=14, spaceAfter=8, textColor=colors.HexColor('#142175')
        )
        body_style = ParagraphStyle(
            'CustomBody', parent=styles['Normal'],
            fontSize=9, leading=12
        )
        
        elements = []
        
        # ── Title ──
        elements.append(Paragraph("CogniSolve - Complaint Analysis Report", title_style))
        elements.append(Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            body_style
        ))
        elements.append(Spacer(1, 20))
        
        # ── Summary Stats ──
        elements.append(Paragraph("Executive Summary", heading_style))
        
        summary_data = [
            ['Total Complaints', 'By Category', 'By Priority', 'SLA Status'],
            [
                str(stats.get('total_complaints', 0)),
                '\n'.join([f"{k}: {v}" for k, v in stats.get('by_category', {}).items()]),
                '\n'.join([f"{k}: {v}" for k, v in stats.get('by_priority', {}).items()]),
                f"Breached: {stats.get('sla_breached', 0)}\nCompliant: {stats.get('total_complaints', 0) - stats.get('sla_breached', 0)}"
            ],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*cm, 6*cm, 5*cm, 5*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#142175')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d0d5dd')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # ── Complaints Table ──
        elements.append(Paragraph("Complaint Details", heading_style))
        
        table_data = [['ID', 'Complaint', 'Channel', 'Category', 'Priority', 'Status', 'Confidence', 'SLA', 'Date']]
        
        for c in complaints[:50]:  # Limit to 50 for PDF
            text = c['complaint_text'][:60] + '...' if len(c['complaint_text']) > 60 else c['complaint_text']
            conf = f"{float(c['confidence_score'])*100:.0f}%" if c['confidence_score'] else 'N/A'
            sla = 'BREACHED' if c['sla_breached'] else 'OK'
            date = c['created_at'].strftime('%m/%d/%Y') if hasattr(c['created_at'], 'strftime') else str(c['created_at'])[:10]
            
            table_data.append([
                f"CGN-{c['id']}",
                text,
                c['channel'].upper(),
                c['category'],
                c['priority'].upper(),
                c['status'].upper(),
                conf,
                sla,
                date,
            ])
        
        col_widths = [2*cm, 8*cm, 2*cm, 2.5*cm, 2*cm, 2.5*cm, 2*cm, 2*cm, 2.5*cm]
        complaint_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        complaint_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#142175')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d0d5dd')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('WORDWRAP', (1, 0), (1, -1), True),
        ]))
        elements.append(complaint_table)
        
        # Build PDF
        doc.build(elements)
        
        pdf_data = buffer.getvalue()
        buffer.close()
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"cognisolve_report_{timestamp}.pdf"
        
        return Response(
            pdf_data,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Access-Control-Expose-Headers': 'Content-Disposition',
            }
        )
        
    except Exception as e:
        return jsonify({"error": f"PDF export failed: {str(e)}"}), 500


def _get_stats():
    """Helper to get dashboard stats for PDF report."""
    total = execute_query_one("SELECT COUNT(*) as count FROM complaints")
    total_count = total["count"] if total else 0
    
    cat_rows = execute_query("SELECT category, COUNT(*) as count FROM complaints GROUP BY category")
    by_cat = {r["category"]: r["count"] for r in cat_rows}
    
    pri_rows = execute_query("SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority")
    by_pri = {r["priority"]: r["count"] for r in pri_rows}
    
    breached = execute_query_one("SELECT COUNT(*) as count FROM complaints WHERE sla_breached = TRUE")
    
    return {
        "total_complaints": total_count,
        "by_category": by_cat,
        "by_priority": by_pri,
        "sla_breached": breached["count"] if breached else 0,
    }
