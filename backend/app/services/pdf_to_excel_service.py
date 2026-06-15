"""
PDF to Excel conversion service for WeLovePDF.
Uses pdfplumber for table extraction and pandas/openpyxl for Excel generation.
"""
import io
import uuid
import logging
import tempfile
import os
from typing import List, Optional

import pdfplumber
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils.dataframe import dataframe_to_rows

logger = logging.getLogger(__name__)


class PdfToExcelService:
    """Service to convert PDF files containing tables to Excel (.xlsx) format."""

    # Maximum number of pages to process (safety limit)
    MAX_PAGES = 200

    @staticmethod
    def extract_tables_from_pdf(pdf_bytes: bytes) -> List[pd.DataFrame]:
        """
        Extract tables from a PDF file using pdfplumber.

        Args:
            pdf_bytes: Raw PDF file content as bytes.

        Returns:
            List of pandas DataFrames, one per detected table.

        Raises:
            ValueError: If no tables are detected in the PDF.
        """
        tables: List[pd.DataFrame] = []
        total_pages = 0

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)
            logger.info(f"PDF has {total_pages} pages. Extracting tables...")

            if total_pages > PdfToExcelService.MAX_PAGES:
                logger.warning(
                    f"PDF has {total_pages} pages, limiting to {PdfToExcelService.MAX_PAGES}"
                )

            for page_num, page in enumerate(pdf.pages[:PdfToExcelService.MAX_PAGES], start=1):
                page_tables = page.extract_tables()

                if not page_tables:
                    logger.debug(f"Page {page_num}: No tables found.")
                    continue

                logger.info(
                    f"Page {page_num}: Found {len(page_tables)} table(s)"
                )

                for table_idx, table in enumerate(page_tables):
                    if not table or len(table) == 0:
                        continue

                    # Clean up table data: replace None with empty string
                    cleaned_table = []
                    for row in table:
                        cleaned_row = [
                            (cell if cell is not None else "") for cell in row
                        ]
                        # Skip completely empty rows
                        if any(cell != "" for cell in cleaned_row):
                            cleaned_table.append(cleaned_row)

                    if not cleaned_table:
                        continue

                    # Use first row as header
                    header = cleaned_table[0]
                    data_rows = cleaned_table[1:] if len(cleaned_table) > 1 else []

                    # Ensure all rows have same number of columns as header
                    num_cols = len(header)
                    normalized_rows = []
                    for row in data_rows:
                        if len(row) < num_cols:
                            row = row + [""] * (num_cols - len(row))
                        elif len(row) > num_cols:
                            row = row[:num_cols]
                        normalized_rows.append(row)

                    df = pd.DataFrame(normalized_rows, columns=header)
                    df.name = f"Page{page_num}_Table{table_idx + 1}"
                    tables.append(df)

        if not tables:
            raise ValueError(
                "Unable to detect table in PDF. The PDF may not contain any table data, "
                "or the tables may be embedded as images. Please try a PDF with clear table structures."
            )

        logger.info(f"Total tables extracted: {len(tables)}")
        return tables

    @staticmethod
    def convert_to_excel(
        pdf_bytes: bytes,
        original_filename: str = "document.pdf",
    ) -> tuple[bytes, str]:
        """
        Convert a PDF file to an Excel workbook.

        Args:
            pdf_bytes: Raw PDF file content.
            original_filename: Original PDF filename for deriving output name.

        Returns:
            Tuple of (excel_bytes, output_filename).

        Raises:
            ValueError: If conversion fails (e.g., no tables found).
            Exception: For unexpected errors.
        """
        logger.info(f"Starting PDF to Excel conversion for: {original_filename}")

        try:
            # Step 1: Extract tables
            tables = PdfToExcelService.extract_tables_from_pdf(pdf_bytes)

            # Step 2: Build Excel workbook
            wb = Workbook()
            # Remove default sheet
            default_sheet = wb.active
            if default_sheet:
                wb.remove(default_sheet)

            thin_border = Border(
                left=Side(style="thin"),
                right=Side(style="thin"),
                top=Side(style="thin"),
                bottom=Side(style="thin"),
            )
            header_fill = PatternFill(
                start_color="4472C4", end_color="4472C4", fill_type="solid"
            )
            header_font = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
            cell_font = Font(name="Calibri", size=11)
            header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell_alignment = Alignment(vertical="top", wrap_text=True)

            sheet_names_used: set = set()

            for idx, df in enumerate(tables):
                # Generate unique sheet name
                base_name = f"Table_{idx + 1}"
                if hasattr(df, "name") and df.name:
                    # Sanitize sheet name (max 31 chars, no special chars)
                    sanitized = "".join(
                        c for c in str(df.name) if c.isalnum() or c in (" ", "_", "-")
                    )[:31]
                    if sanitized:
                        base_name = sanitized

                sheet_name = base_name
                counter = 1
                while sheet_name in sheet_names_used:
                    sheet_name = f"{base_name[:28]}_{counter}"
                    counter += 1
                sheet_names_used.add(sheet_name)

                ws = wb.create_sheet(title=sheet_name)

                # Write DataFrame to worksheet using openpyxl for formatting
                for r_idx, row in enumerate(
                    dataframe_to_rows(df, index=False, header=True), start=1
                ):
                    for c_idx, value in enumerate(row, start=1):
                        cell = ws.cell(row=r_idx, column=c_idx, value=value)
                        cell.border = thin_border

                        if r_idx == 1:  # Header row
                            cell.font = header_font
                            cell.fill = header_fill
                            cell.alignment = header_alignment
                        else:
                            cell.font = cell_font
                            cell.alignment = cell_alignment

                # Auto-fit column widths (approximate)
                for col_cells in ws.columns:
                    max_length = 0
                    col_letter = col_cells[0].column_letter
                    for cell in col_cells:
                        if cell.value:
                            max_length = max(max_length, len(str(cell.value)))
                    # Cap at 50 characters to avoid overly wide columns
                    adjusted_width = min(max_length + 4, 50)
                    ws.column_dimensions[col_letter].width = max(adjusted_width, 10)

                # Freeze header row
                ws.freeze_panes = "A2"

            # If only one table, name the file nicely
            base_filename = os.path.splitext(original_filename)[0]
            output_filename = f"{base_filename}_converted.xlsx"

            # Save workbook to bytes
            output = io.BytesIO()
            wb.save(output)
            output.seek(0)
            excel_bytes = output.getvalue()

            logger.info(
                f"PDF to Excel conversion complete: {len(tables)} table(s), "
                f"{len(excel_bytes)} bytes output"
            )
            return excel_bytes, output_filename

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"PDF to Excel conversion failed: {str(e)}", exc_info=True)
            raise Exception(f"Conversion failed: {str(e)}")