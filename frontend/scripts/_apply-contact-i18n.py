"""Update contact_page i18n keys: drop fake phone/office, add honest ones."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Contact Us",
    "description": "Email us with questions, feedback, or bug reports. We read every message.",
    "hero_heading_part1": "Get in",
    "hero_heading_part2": "touch",
    "hero_description": "We read every email personally and respond as quickly as we can. There is no support ticket queue, no chatbot, just us.",

    "email_support_title": "General Support",
    "email_support_desc": "Bug reports, feature requests, anything else.",
    "email_support_action": "Email us",

    "privacy_inquiries_title": "Privacy & Data Requests",
    "privacy_inquiries_desc": "Account deletion, data export, GDPR / DPDP rights.",

    "form_title": "Send us a message",
    "form_subtitle": "We will reply by email within 1-2 business days.",
    "first_name": "First name",
    "first_name_placeholder": "John",
    "last_name": "Last name",
    "last_name_placeholder": "Doe",
    "email_label": "Email",
    "email_placeholder": "you@example.com",
    "subject_label": "Subject",
    "subject_placeholder": "How can we help?",
    "message_label": "Message",
    "message_placeholder": "Tell us what is on your mind...",
    "send": "Send message",

    "about_title": "How we handle your message",
    "about_text": "Your message goes straight to our inbox. We do not run a third-party support desk, so the details you share stay between us. We never use the contents of contact-form messages for anything other than helping you.",

    "response_time_label": "Response time",
    "response_time_value": "Within 1-2 business days",
    "language_label": "Languages",
    "language_value": "English & Hindi",

    "faq_title": "Quick answers",
    "faq_1_q": "Are my files really deleted?",
    "faq_1_a": "Yes. A background sweeper deletes all uploaded files and processing artifacts within 1 hour. Files are never backed up or replicated.",
    "faq_2_q": "How do I delete my account?",
    "faq_2_a": "Log in, go to Settings, and click Delete Account. The action is immediate and irreversible. You can also email us and we will do it for you.",
    "faq_3_q": "Can I use WeLovePDF for commercial work?",
    "faq_3_a": "Yes. The free tier is fine for personal and small-business use. There is no separate commercial license fee.",
    "faq_4_q": "Do you offer a paid plan?",
    "faq_4_a": "Not yet. A Pro tier with larger file limits is planned. We will email registered users before launch.",
}

HI = {
    "title": "संपर्क करें",
    "description": "सवाल, फ़ीडबैक या बग रिपोर्ट के लिए हमें ईमेल करें। हम हर मेसेज पढ़ते हैं।",
    "hero_heading_part1": "संपर्क",
    "hero_heading_part2": "करें",
    "hero_description": "हम हर ईमेल खुद पढ़ते हैं और जल्द से जल्द जवाब देते हैं। कोई सपोर्ट टिकट क्यू नहीं, कोई चैटबॉट नहीं, बस हम।",

    "email_support_title": "सामान्य सहायता",
    "email_support_desc": "बग रिपोर्ट, फीचर रिक्वेस्ट, और कुछ भी।",
    "email_support_action": "ईमेल करें",

    "privacy_inquiries_title": "प्राइवेसी और डेटा अनुरोध",
    "privacy_inquiries_desc": "अकाउंट डिलीट, डेटा एक्सपोर्ट, GDPR / DPDP अधिकार।",

    "form_title": "हमें मेसेज भेजें",
    "form_subtitle": "हम 1-2 कार्य दिवस के अंदर ईमेल से जवाब देंगे।",
    "first_name": "पहला नाम",
    "first_name_placeholder": "राहुल",
    "last_name": "अंतिम नाम",
    "last_name_placeholder": "शर्मा",
    "email_label": "ईमेल",
    "email_placeholder": "you@example.com",
    "subject_label": "विषय",
    "subject_placeholder": "हम कैसे मदद कर सकते हैं?",
    "message_label": "संदेश",
    "message_placeholder": "आप क्या कहना चाहते हैं हमें बताइए...",
    "send": "मेसेज भेजें",

    "about_title": "हम आपके मेसेज के साथ क्या करते हैं",
    "about_text": "आपका मेसेज सीधे हमारे इनबॉक्स में आता है। हम कोई थर्ड-पार्टी सपोर्ट डेस्क नहीं चलाते, इसलिए आपकी बातें हमारे बीच ही रहती हैं। संपर्क-फ़ॉर्म मेसेज का इस्तेमाल हम सिर्फ़ आपकी मदद के लिए करते हैं।",

    "response_time_label": "जवाब का समय",
    "response_time_value": "1-2 कार्य दिवस के अंदर",
    "language_label": "भाषाएँ",
    "language_value": "English और हिंदी",

    "faq_title": "त्वरित जवाब",
    "faq_1_q": "क्या मेरी फ़ाइलें सच में डिलीट हो जाती हैं?",
    "faq_1_a": "हाँ। एक बैकग्राउंड स्वीपर सभी अपलोड की गई फ़ाइलें और प्रोसेसिंग आर्टिफ़ैक्ट्स को 1 घंटे के अंदर डिलीट कर देता है। फ़ाइलों का कभी बैकअप या रेप्लिकेशन नहीं होता।",
    "faq_2_q": "मैं अपना अकाउंट कैसे डिलीट करूँ?",
    "faq_2_a": "लॉग इन करें, Settings में जाएँ, और Delete Account पर क्लिक करें। यह तुरंत और अपरिवर्तनीय है। आप हमें ईमेल भी कर सकते हैं, हम आपके लिए कर देंगे।",
    "faq_3_q": "क्या मैं WeLovePDF का इस्तेमाल बिज़नेस के लिए कर सकता हूँ?",
    "faq_3_a": "हाँ। फ़्री टियर पर्सनल और छोटे बिज़नेस इस्तेमाल के लिए ठीक है। अलग कमर्शियल लाइसेंस फ़ीस नहीं है।",
    "faq_4_q": "क्या आप पेड प्लान देते हैं?",
    "faq_4_a": "अभी नहीं। बड़ी फ़ाइल लिमिट वाला Pro टियर प्लान में है। लॉन्च से पहले हम रजिस्टर्ड यूज़र्स को ईमेल करेंगे।",
}

# Old keys with fake phone / live chat / office address — drop them so the
# locale files don't keep dead translations around.
LEGACY_EXACT = {
    "live_chat_title", "live_chat_desc", "live_chat_details", "live_chat_action",
    "phone_support_title", "phone_support_desc", "phone_support_details", "phone_support_action",
    "office_title", "office_desc", "office_details", "office_action",
    "business_hours_label", "business_hours_value",
    "email_support_details",
    "cta_heading", "cta_description", "cta_call_now", "cta_schedule",
}


def patch(path, patches):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    section = data.setdefault("contact_page", {})
    for k, v in patches.items():
        section[k] = v
    legacy = [k for k in list(section.keys()) if k in LEGACY_EXACT]
    for k in legacy:
        del section[k]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{path}: {len(patches)} keys upserted, {len(legacy)} legacy removed")


patch("messages/en.json", EN)
patch("messages/hi.json", HI)
