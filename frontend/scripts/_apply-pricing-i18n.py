"""Pricing page i18n — replace plan-grid keys with coming-soon keys."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Pricing",
    "description": "WeLovePDF is free today. Pro plans launching soon — every essential tool stays free, always.",
    "badge": "Coming soon",
    "hero_heading": "Free today, fair Pro plans tomorrow",
    "hero_description": "Every core PDF tool is currently free for everyone with sensible limits. We're building a Pro tier for people who need bigger files and priority processing — but the essentials will always stay free.",
    "free_now_title": "What's free today",
    "free_now_subtitle": "No signup wall, no nag screens",
    "free_now_point_1": "All 14+ PDF tools (merge, split, compress, convert, OCR, AI summary, etc.)",
    "free_now_point_2": "Up to 25 MB per file, sensible daily rate limits",
    "free_now_point_3": "Hindi & English interface, no third-party trackers",
    "free_now_point_4": "Files auto-deleted within 1 hour — privacy by default",
    "free_now_cta": "Use a tool now",
    "pro_soon_title": "Pro plan (in development)",
    "pro_soon_subtitle": "For power users and small teams",
    "pro_soon_intro": "We're shaping Pro based on what users actually ask for. Want to influence what ships? Drop us a line.",
    "pro_soon_feature_1": "Larger files — up to 100 MB per upload",
    "pro_soon_feature_2": "Priority processing queue (no waiting during peak hours)",
    "pro_soon_feature_3": "Higher daily limits and unlimited AI analyses",
    "pro_soon_feature_4": "Pricing in INR via Razorpay, fair monthly rates",
    "pro_soon_cta": "Tell us what you need",
    "footnote": "Pricing details, exact limits, and launch date will be announced via email to subscribed users before Pro goes live.",
}

HI = {
    "title": "मूल्य निर्धारण",
    "description": "WeLovePDF आज मुफ़्त है। Pro प्लान जल्द लॉन्च होंगे — हर ज़रूरी टूल हमेशा मुफ़्त रहेगा।",
    "badge": "जल्द आ रहा है",
    "hero_heading": "आज मुफ़्त, कल फ़ेयर Pro प्लान",
    "hero_description": "हर ज़रूरी PDF टूल अभी सभी के लिए मुफ़्त है, उचित सीमाओं के साथ। हम उन लोगों के लिए Pro टियर बना रहे हैं जिन्हें बड़ी फ़ाइलें और प्रायोरिटी प्रोसेसिंग चाहिए — लेकिन ज़रूरी सब हमेशा मुफ़्त रहेगा।",
    "free_now_title": "आज क्या मुफ़्त है",
    "free_now_subtitle": "कोई साइनअप नहीं, कोई परेशान करने वाले मेसेज नहीं",
    "free_now_point_1": "सभी 14+ PDF टूल्स (मर्ज, स्प्लिट, कम्प्रेस, कन्वर्ट, OCR, AI समराइज़ेशन आदि)",
    "free_now_point_2": "प्रति फ़ाइल 25 MB तक, उचित दैनिक रेट लिमिट",
    "free_now_point_3": "हिंदी और अंग्रेज़ी इंटरफ़ेस, कोई थर्ड-पार्टी ट्रैकर नहीं",
    "free_now_point_4": "फ़ाइलें 1 घंटे के अंदर ऑटो-डिलीट — डिफ़ॉल्ट रूप से प्राइवेसी",
    "free_now_cta": "अभी टूल इस्तेमाल करें",
    "pro_soon_title": "Pro प्लान (विकास में)",
    "pro_soon_subtitle": "पावर यूज़र्स और छोटी टीमों के लिए",
    "pro_soon_intro": "हम Pro को उसी हिसाब से बना रहे हैं जो यूज़र्स वास्तव में माँगते हैं। क्या लॉन्च हो, इस पर असर डालना चाहते हैं? हमें मेसेज भेजिए।",
    "pro_soon_feature_1": "बड़ी फ़ाइलें — प्रति अपलोड 100 MB तक",
    "pro_soon_feature_2": "प्रायोरिटी प्रोसेसिंग क्यू (पीक आवर्स में कोई इंतज़ार नहीं)",
    "pro_soon_feature_3": "ज़्यादा दैनिक सीमा और असीमित AI एनालिसिस",
    "pro_soon_feature_4": "Razorpay के ज़रिए INR में मूल्य, उचित मासिक दरें",
    "pro_soon_cta": "हमें बताइए आपको क्या चाहिए",
    "footnote": "Pro लाइव होने से पहले मूल्य विवरण, सटीक सीमाएँ और लॉन्च तारीख सब्सक्राइब्ड यूज़र्स को ईमेल से बताई जाएगी।",
}


def patch(path, patches):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    data["pricing_page"] = patches
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{path}: pricing_page replaced with {len(patches)} keys")


patch("messages/en.json", EN)
patch("messages/hi.json", HI)
