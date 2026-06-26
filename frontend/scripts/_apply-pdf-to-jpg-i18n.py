"""Add new pdf_to_jpg keys for DPI labels, heavy-render confirm, auto-cap notice."""
import json, sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "dpi_recommended": "Recommended",
    "dpi_speed_fast": "Fast (~5s)",
    "dpi_speed_balanced": "Balanced (~30s)",
    "dpi_speed_slow": "Print quality (~3-7 min for large files)",
    "dpi_slow_warning": "300 DPI on large PDFs can take several minutes. Use Balanced (150 DPI) unless you need print-quality output.",
    "heavy_render_confirm": "This {sizeMb} MB PDF at 300 DPI may take 3-7 minutes to convert. Continue anyway?",
    "dpi_capped_title": "DPI was reduced to prevent timeout",
    "dpi_capped_body": "Your PDF was too large to render at {requested} DPI safely. We auto-adjusted to {used} DPI so the conversion could finish.",
    "dpi_capped_toast": "DPI auto-adjusted to {used} (requested {requested}) — file too large for the requested resolution.",
}

HI = {
    "dpi_recommended": "अनुशंसित",
    "dpi_speed_fast": "तेज़ (~5 सेकंड)",
    "dpi_speed_balanced": "संतुलित (~30 सेकंड)",
    "dpi_speed_slow": "प्रिंट क्वालिटी (बड़ी फ़ाइलों के लिए ~3-7 मिनट)",
    "dpi_slow_warning": "बड़ी PDF पर 300 DPI में कई मिनट लग सकते हैं। प्रिंट-क्वालिटी आउटपुट की ज़रूरत न हो तो संतुलित (150 DPI) इस्तेमाल करें।",
    "heavy_render_confirm": "इस {sizeMb} MB की PDF को 300 DPI पर कन्वर्ट करने में 3-7 मिनट लग सकते हैं। फिर भी जारी रखें?",
    "dpi_capped_title": "टाइमआउट रोकने के लिए DPI कम किया गया",
    "dpi_capped_body": "आपकी PDF {requested} DPI पर सुरक्षित रूप से रेंडर करने के लिए बहुत बड़ी थी। कन्वर्शन पूरा हो सके इसलिए हमने इसे {used} DPI पर ऑटो-एडजस्ट कर दिया।",
    "dpi_capped_toast": "DPI ऑटो-एडजस्ट होकर {used} पर सेट हुई (अनुरोध {requested} का था) — अनुरोधित रेज़ोल्यूशन के लिए फ़ाइल बहुत बड़ी है।",
}


def patch(path: str, patches: dict) -> int:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    section = data.setdefault("pdf_to_jpg", {})
    added = 0
    for k, v in patches.items():
        if k not in section:
            added += 1
        section[k] = v
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return added


print(f"messages/en.json: +{patch('messages/en.json', EN)} keys")
print(f"messages/hi.json: +{patch('messages/hi.json', HI)} keys")
