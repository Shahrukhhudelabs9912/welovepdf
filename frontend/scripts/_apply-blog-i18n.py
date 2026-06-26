"""Blog page i18n — replace dummy post keys with empty-state keys."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Blog",
    "description": "Tutorials, deep dives, and tips on PDF workflows. Subscribe to be notified when we publish.",
    "hero_heading": "Blog is coming soon",
    "hero_description": "We're working on practical PDF guides, behind-the-scenes engineering posts, and Hindi-language tutorials. Drop your email below and we'll let you know when the first post goes live.",
    "subscribe_pill": "Get notified",
    "subscribe_desc": "One email when the blog launches. No spam, ever.",
    "subscribe_placeholder": "you@example.com",
    "subscribe_button": "Notify me",
    "subscribe_subscribed": "Subscribed",
    "subscribe_success": "Got it — we'll email you when posts go live.",
    "subscribe_privacy": "We use your email only to notify you about new posts. Unsubscribe anytime.",
    "planned_topics_label": "Topics on our roadmap",
    "topic_1": "How to compress PDFs without losing quality",
    "topic_2": "Aadhaar PDF best practices",
    "topic_3": "Hindi: PDF को Word में कैसे बदलें",
    "topic_4": "Building privacy-first AI features",
    "topic_5": "PDF security for small businesses",
}

HI = {
    "title": "ब्लॉग",
    "description": "PDF वर्कफ़्लो पर ट्यूटोरियल, गहराई से जानकारी और टिप्स। पोस्ट लाइव होने पर पता लगाने के लिए सब्सक्राइब करें।",
    "hero_heading": "ब्लॉग जल्द ही आ रहा है",
    "hero_description": "हम प्रैक्टिकल PDF गाइड्स, बैकग्राउंड में चलने वाले इंजीनियरिंग पोस्ट, और हिंदी ट्यूटोरियल पर काम कर रहे हैं। नीचे अपना ईमेल छोड़िए, पहली पोस्ट लाइव होने पर हम आपको बताएँगे।",
    "subscribe_pill": "सूचित करें",
    "subscribe_desc": "ब्लॉग लॉन्च होने पर एक ईमेल। कोई स्पैम नहीं।",
    "subscribe_placeholder": "you@example.com",
    "subscribe_button": "मुझे बताएँ",
    "subscribe_subscribed": "सब्सक्राइब हो गया",
    "subscribe_success": "हो गया — पोस्ट लाइव होने पर हम ईमेल करेंगे।",
    "subscribe_privacy": "हम आपका ईमेल सिर्फ़ नई पोस्ट के बारे में बताने के लिए इस्तेमाल करते हैं। कभी भी अनसब्सक्राइब करें।",
    "planned_topics_label": "हमारे रोडमैप के टॉपिक्स",
    "topic_1": "PDF को क्वालिटी खोए बिना कम्प्रेस कैसे करें",
    "topic_2": "आधार PDF: बेस्ट प्रैक्टिसेज़",
    "topic_3": "हिंदी: PDF को Word में कैसे बदलें",
    "topic_4": "प्राइवेसी-फ़र्स्ट AI फीचर्स बनाना",
    "topic_5": "छोटे बिज़नेस के लिए PDF सिक्योरिटी",
}


def patch(path, patches):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    # Replace the entire blog_page namespace with the new keys — the old
    # placeholder posts/categories keys no longer have any reference.
    data["blog_page"] = patches
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{path}: blog_page replaced with {len(patches)} keys")


patch("messages/en.json", EN)
patch("messages/hi.json", HI)
