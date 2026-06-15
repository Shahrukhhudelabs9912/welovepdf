"""Add missing i18n keys identified by check-i18n.py."""
import json, sys, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN_ADDS = {
    "add_watermark": {
        "pdf_preview_failed_error": "Failed to load PDF preview.",
    },
    "pdf_to_word":  {"downloading_file": "Downloading {filename}..."},
    "pdf_to_excel": {"downloading_file": "Downloading {filename}..."},
    "excel_to_pdf": {"downloading_file": "Downloading {filename}..."},
    "pdf_to_jpg": {
        "settings_title": "Conversion Settings",
        "show_settings": "Show Settings",
        "hide_settings": "Hide Settings",
        "quality_label": "Image Quality",
        "quality_hint": "Higher quality means larger file size.",
        "dpi_label": "DPI (Resolution)",
        "dpi_hint": "Higher DPI = sharper images, bigger files.",
        "dpi_value": "{dpi} DPI",
        "page_number_label": "Page Number (0 = all pages)",
        "page_number_hint": "Enter 0 to convert every page (downloaded as ZIP).",
        "jpg_label": "JPG",
        "page_label_with_number": "Page {page}",
        "auto_downloaded_hint": "File downloaded automatically.",
        "sample_output_title": "Sample Output Preview",
        "sample_output_desc": "Each page becomes a separate JPG image.",
        "sample_output_footer": "Upload a PDF to convert it to JPG images.",
        "single_result_title": "Image Ready",
        "single_result_desc": "Your PDF page has been converted to JPG.",
        "zip_result_title": "ZIP Archive Ready",
        "zip_result_desc": "All pages converted and bundled in a ZIP file.",
        "zip_check_item1": "All pages converted to JPG.",
        "zip_check_item2": "Quality: {quality}% at {dpi} DPI.",
        "zip_check_item3": "Bundled in a single ZIP file.",
        "zip_extract_hint": "Extract the ZIP to access individual JPG files.",
        "download_zip_again": "Download ZIP again",
    },
}

HI_ADDS = {
    "add_watermark": {
        "pdf_preview_failed_error": "PDF प्रीव्यू लोड नहीं हो सका।",
    },
    "pdf_to_word":  {"downloading_file": "{filename} डाउनलोड हो रहा है..."},
    "pdf_to_excel": {"downloading_file": "{filename} डाउनलोड हो रहा है..."},
    "excel_to_pdf": {"downloading_file": "{filename} डाउनलोड हो रहा है..."},
    "pdf_to_jpg": {
        "settings_title": "कन्वर्शन सेटिंग्स",
        "show_settings": "सेटिंग्स दिखाएँ",
        "hide_settings": "सेटिंग्स छुपाएँ",
        "quality_label": "इमेज क्वालिटी",
        "quality_hint": "ज़्यादा क्वालिटी = बड़ी फ़ाइल साइज़।",
        "dpi_label": "DPI (रिज़ॉल्यूशन)",
        "dpi_hint": "ज़्यादा DPI = शार्प इमेज, बड़ी फ़ाइलें।",
        "dpi_value": "{dpi} DPI",
        "page_number_label": "पेज नंबर (0 = सभी पेज)",
        "page_number_hint": "हर पेज कन्वर्ट करने के लिए 0 डालें (ZIP के रूप में डाउनलोड)।",
        "jpg_label": "JPG",
        "page_label_with_number": "पेज {page}",
        "auto_downloaded_hint": "फ़ाइल अपने आप डाउनलोड हो गई।",
        "sample_output_title": "सैंपल आउटपुट प्रीव्यू",
        "sample_output_desc": "हर पेज एक अलग JPG इमेज बनेगा।",
        "sample_output_footer": "JPG में कन्वर्ट करने के लिए PDF अपलोड करें।",
        "single_result_title": "इमेज तैयार है",
        "single_result_desc": "आपका PDF पेज JPG में कन्वर्ट हो गया है।",
        "zip_result_title": "ZIP आर्काइव तैयार",
        "zip_result_desc": "सभी पेज कन्वर्ट होकर ZIP फ़ाइल में बंडल किए गए हैं।",
        "zip_check_item1": "सभी पेज JPG में कन्वर्ट हुए।",
        "zip_check_item2": "क्वालिटी: {quality}% पर {dpi} DPI।",
        "zip_check_item3": "एक ZIP फ़ाइल में बंडल किए गए।",
        "zip_extract_hint": "अलग-अलग JPG फ़ाइलें पाने के लिए ZIP एक्सट्रैक्ट करें।",
        "download_zip_again": "ZIP दोबारा डाउनलोड करें",
    },
}

def apply(path: str, adds: dict) -> int:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    added = 0
    for ns, kvs in adds.items():
        section = data.setdefault(ns, {})
        for k, v in kvs.items():
            if k not in section:
                section[k] = v
                added += 1
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return added

print(f"messages/en.json: added {apply('messages/en.json', EN_ADDS)} keys")
print(f"messages/hi.json: added {apply('messages/hi.json', HI_ADDS)} keys")
