"""Apply Cookies i18n keys to en+hi."""
import json, sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Cookie Policy",
    "subtitle": "We use the bare minimum cookies needed for the service to work.",
    "last_updated_label": "Last updated: {date}",

    "dont_use_title": "What we don't use",
    "dont_use_li1": "No Google Analytics or Facebook Pixel",
    "dont_use_li2": "No advertising trackers",
    "dont_use_li3": "No cross-site tracking cookies",
    "dont_use_li4": "No third-party marketing cookies",

    "s1_title": "1. What is a cookie?",
    "s1_p1": "A cookie is a small piece of data a website stores in your browser. We use cookies (and similar technologies like browser localStorage) only where they are strictly necessary for the Service to function — for example, to keep you logged in between page loads.",

    "s2_title": "2. Cookies we use",
    "th_name": "Name",
    "th_category": "Category",
    "th_purpose": "Purpose",
    "th_duration": "Duration",
    "th_set_by": "Set by",

    "row1_category": "Essential",
    "row1_purpose": "Keeps you logged in across page loads.",
    "row1_duration": "30 minutes",
    "row1_set_by": "WeLovePDF",

    "row2_category": "Essential",
    "row2_purpose": "Renews your login session without re-entering password.",
    "row2_duration": "7 days",
    "row2_set_by": "WeLovePDF",

    "row3_category": "Essential",
    "row3_purpose": "Remembers your language preference (English / Hindi).",
    "row3_duration": "1 year",
    "row3_set_by": "WeLovePDF",

    "row4_category": "Preference",
    "row4_purpose": "Remembers your light / dark theme choice.",
    "row4_duration": "1 year",
    "row4_set_by": "WeLovePDF (browser localStorage)",

    "row5_category": "Essential",
    "row5_purpose": "Cloudflare bot management; distinguishes humans from bots.",
    "row5_duration": "30 minutes",
    "row5_set_by": "Cloudflare",

    "s3_title": "3. How to disable cookies",
    "s3_p1": "You can block or delete cookies via your browser settings. Disabling essential cookies will break login and language preferences — the rest of the site will still work for anonymous usage.",
    "s3_p2": "Quick links:",

    "s4_title": "4. Changes to this policy",
    "s4_p1": "If we add new cookies (for example, payment processor cookies when we launch paid plans), we will update this page and notify registered users by email.",

    "s5_title": "5. Contact",
    "s5_email_pre": "Privacy questions: ",

    "see_privacy_pre": "For details on how we handle your personal data overall, see our ",
    "see_privacy_link": "Privacy Policy",
    "see_privacy_post": ".",

    "lang_disclaimer": "This policy is offered in English and Hindi. The English version is the canonical legal text; the Hindi translation is provided for convenience.",
}

HI = {
    "title": "कुकी नीति",
    "subtitle": "हम सेवा को चलाने के लिए केवल आवश्यक न्यूनतम कुकीज़ का इस्तेमाल करते हैं।",
    "last_updated_label": "अंतिम अपडेट: {date}",

    "dont_use_title": "हम क्या इस्तेमाल नहीं करते",
    "dont_use_li1": "कोई Google Analytics या Facebook Pixel नहीं",
    "dont_use_li2": "कोई विज्ञापन ट्रैकर नहीं",
    "dont_use_li3": "कोई क्रॉस-साइट ट्रैकिंग कुकीज़ नहीं",
    "dont_use_li4": "कोई थर्ड-पार्टी मार्केटिंग कुकीज़ नहीं",

    "s1_title": "1. कुकी क्या है?",
    "s1_p1": "कुकी डेटा का एक छोटा टुकड़ा है जिसे वेबसाइट आपके ब्राउज़र में स्टोर करती है। हम कुकीज़ (और ब्राउज़र localStorage जैसी समान तकनीकों) का इस्तेमाल केवल वहाँ करते हैं जहाँ वे सेवा को चलाने के लिए सख्ती से आवश्यक हैं — उदाहरण के लिए, पेज लोड के बीच आपको लॉग इन रखने के लिए।",

    "s2_title": "2. हम जो कुकीज़ इस्तेमाल करते हैं",
    "th_name": "नाम",
    "th_category": "श्रेणी",
    "th_purpose": "उद्देश्य",
    "th_duration": "अवधि",
    "th_set_by": "किसने सेट की",

    "row1_category": "आवश्यक",
    "row1_purpose": "पेज लोड के बीच आपको लॉग इन रखती है।",
    "row1_duration": "30 मिनट",
    "row1_set_by": "WeLovePDF",

    "row2_category": "आवश्यक",
    "row2_purpose": "पासवर्ड दोबारा दर्ज किए बिना आपका लॉगिन सेशन रिन्यू करती है।",
    "row2_duration": "7 दिन",
    "row2_set_by": "WeLovePDF",

    "row3_category": "आवश्यक",
    "row3_purpose": "आपकी भाषा प्राथमिकता (अंग्रेज़ी / हिंदी) याद रखती है।",
    "row3_duration": "1 साल",
    "row3_set_by": "WeLovePDF",

    "row4_category": "प्राथमिकता",
    "row4_purpose": "आपकी लाइट / डार्क थीम पसंद याद रखती है।",
    "row4_duration": "1 साल",
    "row4_set_by": "WeLovePDF (ब्राउज़र localStorage)",

    "row5_category": "आवश्यक",
    "row5_purpose": "Cloudflare बॉट प्रबंधन; मानव और बॉट्स के बीच अंतर करता है।",
    "row5_duration": "30 मिनट",
    "row5_set_by": "Cloudflare",

    "s3_title": "3. कुकीज़ कैसे डिसेबल करें",
    "s3_p1": "आप अपनी ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को ब्लॉक या डिलीट कर सकते हैं। आवश्यक कुकीज़ को डिसेबल करने से लॉगिन और भाषा प्राथमिकताएँ टूट जाएँगी — साइट का बाकी हिस्सा अनॉनिमस उपयोग के लिए काम करता रहेगा।",
    "s3_p2": "त्वरित लिंक:",

    "s4_title": "4. इस नीति में बदलाव",
    "s4_p1": "अगर हम नई कुकीज़ जोड़ते हैं (उदाहरण के लिए, पेड प्लान्स लॉन्च करने पर पेमेंट प्रोसेसर कुकीज़), तो हम इस पेज को अपडेट करेंगे और रजिस्टर्ड यूज़र्स को ईमेल से सूचित करेंगे।",

    "s5_title": "5. संपर्क",
    "s5_email_pre": "गोपनीयता प्रश्न: ",

    "see_privacy_pre": "हम आपके व्यक्तिगत डेटा को कुल मिलाकर कैसे संभालते हैं, इसके विवरण के लिए हमारी ",
    "see_privacy_link": "गोपनीयता नीति",
    "see_privacy_post": " देखें।",

    "lang_disclaimer": "यह नीति अंग्रेज़ी और हिंदी में उपलब्ध है। अंग्रेज़ी संस्करण कैनोनिकल कानूनी पाठ है; हिंदी अनुवाद सुविधा के लिए दिया गया है।",
}


def patch(path: str, ns: str, keys: dict) -> None:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    data[ns] = keys
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path}: {ns} = {len(keys)} keys")


patch("messages/en.json", "cookies", EN)
patch("messages/hi.json", "cookies", HI)
