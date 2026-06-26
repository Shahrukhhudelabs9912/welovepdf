"""Add bilingual content for all 5 legal pages (privacy, terms, cookies, gdpr, dmca).

Strategy:
- Granular keys per visible string. No t.rich() — keeps the component simple.
- One section_X_title + multiple section_X_pN paragraph keys per section.
- Lists use section_X_liN per bullet.

Run from frontend/:
    python scripts/_apply-legal-i18n.py
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# ── PRIVACY ────────────────────────────────────────────────────────────
PRIVACY_EN = {
    "title": "Privacy Policy",
    "subtitle": "How WeLovePDF protects your files and personal data.",
    "last_updated_label": "Last updated: {date}",
    "trust_1_title": "1-hour deletion",
    "trust_1_desc": "Auto-deleted within 1 hour",
    "trust_2_title": "No tracking",
    "trust_2_desc": "We never sell your data",
    "trust_3_title": "Encrypted transfer",
    "trust_3_desc": "TLS 1.2+ end to end",

    "s1_title": "1. Who we are",
    "s1_p1": "WeLovePDF (\"we\", \"our\", \"us\") is a free online toolkit for PDF processing operated from India. This policy explains what data we collect, why we collect it, and how we protect it. We comply with India's Digital Personal Data Protection Act, 2023 (DPDP Act) and align with global standards including the EU's General Data Protection Regulation (GDPR).",

    "s2_title": "2. Files you upload",
    "s2_p1_label": "Processing only:",
    "s2_p1": " When you use a tool (merge, split, compress, OCR, AI summary, etc.), your file is sent to our servers, processed in temporary memory or a temporary directory, and the result is returned to you. We never use your files for training models, advertising, or any purpose beyond fulfilling your request.",
    "s2_p2_label": "Automatic deletion:",
    "s2_p2": " A background sweeper deletes processed files and any temporary artifacts within 1 hour. There is no \"delete file\" button because there is nothing left to delete after that window.",
    "s2_p3_label": "No backups of your files:",
    "s2_p3": " Uploaded files are never written to our database, never backed up, and never replicated to third parties.",

    "s3_title": "3. Account data (if you sign up)",
    "s3_p1": "An account is optional. If you create one, we store:",
    "s3_li1": "Email address (used for login and password reset)",
    "s3_li2": "Hashed password (bcrypt — we never see your real password)",
    "s3_li3": "Optional profile name",
    "s3_li4": "Activity history (which tools you used and when, never the file contents)",
    "s3_p2": "Account data is stored in MongoDB Atlas (managed cloud database) with encryption at rest. You can delete your account at any time from your dashboard settings; deletion is permanent and removes all associated activity history.",

    "s4_title": "4. AI tools",
    "s4_p1": "Our AI summarization, key points, and title generation features send your document's extracted text to Groq Cloud (an LLM provider) for analysis. Groq does not retain prompts beyond the duration needed to compute a response. The document file itself is never sent to Groq — only the extracted plain text. If our cloud LLM is unavailable, we fall back to a local model running on our servers, which keeps the data entirely within our infrastructure.",

    "s5_title": "5. Cookies and analytics",
    "s5_p1_pre": "We use a small number of ",
    "s5_p1_emph": "essential cookies",
    "s5_p1_post": " for login session management and language preference. We use privacy-friendly analytics (no personal identifiers, no cross-site tracking) to understand which tools are popular and improve them. We do not use Google Analytics, Facebook Pixel, or any advertising trackers. See our ",
    "s5_p1_link_text": "Cookie Policy",
    "s5_p1_after_link": " for details.",

    "s6_title": "6. Third parties we work with",
    "s6_li1_label": "MongoDB Atlas",
    "s6_li1": " — account database (data stored at rest)",
    "s6_li2_label": "Groq Cloud",
    "s6_li2": " — AI text analysis (transient, no retention)",
    "s6_li3_label": "Cloudflare",
    "s6_li3": " — CDN, DDoS protection, DNS",
    "s6_li4_label": "Sentry",
    "s6_li4": " — error monitoring (no file contents, only stack traces)",
    "s6_li5_label": "Hetzner Cloud",
    "s6_li5": " — server hosting",
    "s6_li6_label": "Razorpay",
    "s6_li6": " (future) — payment processing for paid plans",
    "s6_p2": "Each of these providers has their own privacy commitments. We choose providers that don't resell data and offer GDPR-compliant data processing agreements.",

    "s7_title": "7. Children",
    "s7_p1": "WeLovePDF is not intended for users under 18 in jurisdictions where minors require parental consent. Under India's DPDP Act, processing children's personal data requires verifiable parental consent. If you believe a child has created an account, contact us and we will remove it.",

    "s8_title": "8. Your rights",
    "s8_p1": "You have the right to:",
    "s8_li1": "Access the personal data we hold about you",
    "s8_li2": "Correct inaccurate or outdated data",
    "s8_li3": "Delete your account and associated history",
    "s8_li4": "Export your activity data in a machine-readable format",
    "s8_li5": "Withdraw consent for non-essential processing at any time",
    "s8_p2_pre": "To exercise any of these rights, email us at ",
    "s8_p2_post": ". We respond within 30 days as required under the DPDP Act.",

    "s9_title": "9. Data location and transfers",
    "s9_p1": "Our primary servers are located in Europe (Hetzner, Falkenstein/Germany). MongoDB Atlas data is hosted in a region of your choice during signup. By using the service, you consent to your data being processed in these locations, which provide adequate protections under GDPR and DPDP Act.",

    "s10_title": "10. Security",
    "s10_p1": "We use industry-standard security: TLS 1.2+ for all data in transit, bcrypt for passwords, JWT for session management with short expiry, rate limiting against abuse, and a least-privilege server architecture. Despite our best efforts, no online service is 100% secure; we will notify affected users within 72 hours of any confirmed breach.",

    "s11_title": "11. Changes to this policy",
    "s11_p1": "If we change this policy materially, we will email registered users and display a banner on the site. Continued use after the change date constitutes acceptance.",

    "s12_title": "12. Contact us",
    "s12_email_pre": "Privacy questions: ",
    "s12_response_label": "Response time: within 30 days",

    "lang_disclaimer": "This policy is offered in English and Hindi. The English version is the canonical legal text; the Hindi translation is provided for convenience.",
}

PRIVACY_HI = {
    "title": "गोपनीयता नीति",
    "subtitle": "WeLovePDF आपकी फ़ाइलों और व्यक्तिगत डेटा की सुरक्षा कैसे करता है।",
    "last_updated_label": "अंतिम अपडेट: {date}",
    "trust_1_title": "1-घंटे में डिलीट",
    "trust_1_desc": "1 घंटे के अंदर अपने आप डिलीट",
    "trust_2_title": "कोई ट्रैकिंग नहीं",
    "trust_2_desc": "हम आपका डेटा कभी नहीं बेचते",
    "trust_3_title": "एन्क्रिप्टेड ट्रांसफ़र",
    "trust_3_desc": "TLS 1.2+ एंड-टू-एंड",

    "s1_title": "1. हम कौन हैं",
    "s1_p1": "WeLovePDF (\"हम\", \"हमारा\") एक मुफ़्त ऑनलाइन PDF प्रोसेसिंग टूलकिट है जो भारत से संचालित होता है। यह नीति बताती है कि हम कौन-सा डेटा एकत्र करते हैं, क्यों करते हैं, और उसकी सुरक्षा कैसे करते हैं। हम भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन अधिनियम, 2023 (DPDP Act) का पालन करते हैं और EU के GDPR सहित वैश्विक मानकों के अनुरूप हैं।",

    "s2_title": "2. आपकी अपलोड की गई फ़ाइलें",
    "s2_p1_label": "केवल प्रोसेसिंग:",
    "s2_p1": " जब आप कोई टूल इस्तेमाल करते हैं (मर्ज, स्प्लिट, कम्प्रेस, OCR, AI समराइज़ेशन आदि), आपकी फ़ाइल हमारे सर्वर पर भेजी जाती है, टेम्पररी मेमोरी या टेम्पररी डायरेक्टरी में प्रोसेस होती है, और रिज़ल्ट आपको वापस मिलता है। हम आपकी फ़ाइलों का इस्तेमाल मॉडल ट्रेनिंग, विज्ञापन, या आपके अनुरोध को पूरा करने के अलावा किसी और काम के लिए नहीं करते।",
    "s2_p2_label": "स्वचालित डिलीशन:",
    "s2_p2": " एक बैकग्राउंड स्वीपर प्रोसेस की गई फ़ाइलें और कोई भी टेम्पररी आर्टिफ़ैक्ट 1 घंटे के अंदर डिलीट कर देता है। कोई \"फ़ाइल डिलीट करें\" बटन नहीं है क्योंकि उस अवधि के बाद डिलीट करने को कुछ बचता ही नहीं।",
    "s2_p3_label": "आपकी फ़ाइलों का कोई बैकअप नहीं:",
    "s2_p3": " अपलोड की गई फ़ाइलें कभी हमारे डेटाबेस में नहीं लिखी जातीं, कभी बैकअप नहीं होतीं, और कभी थर्ड पार्टीज़ को रेप्लिकेट नहीं की जातीं।",

    "s3_title": "3. अकाउंट डेटा (अगर आप साइन अप करते हैं)",
    "s3_p1": "अकाउंट वैकल्पिक है। अगर आप बनाते हैं, तो हम स्टोर करते हैं:",
    "s3_li1": "ईमेल पता (लॉगिन और पासवर्ड रीसेट के लिए)",
    "s3_li2": "हैश किया गया पासवर्ड (bcrypt — हम आपका असली पासवर्ड कभी नहीं देखते)",
    "s3_li3": "वैकल्पिक प्रोफ़ाइल नाम",
    "s3_li4": "गतिविधि इतिहास (आपने कौन से टूल कब इस्तेमाल किए, फ़ाइल का कंटेंट कभी नहीं)",
    "s3_p2": "अकाउंट डेटा MongoDB Atlas (मैनेज्ड क्लाउड डेटाबेस) में एन्क्रिप्शन-एट-रेस्ट के साथ स्टोर होता है। आप कभी भी अपने डैशबोर्ड सेटिंग्स से अकाउंट डिलीट कर सकते हैं; डिलीशन स्थायी है और सारा सम्बंधित गतिविधि इतिहास हटा देता है।",

    "s4_title": "4. AI टूल्स",
    "s4_p1": "हमारे AI समराइज़ेशन, की पॉइंट्स, और टाइटल जेनरेशन फ़ीचर्स आपके डॉक्यूमेंट के एक्सट्रैक्ट किए गए टेक्स्ट को Groq Cloud (एक LLM प्रोवाइडर) पर एनालिसिस के लिए भेजते हैं। Groq प्रॉम्प्ट्स को रिस्पॉन्स कम्प्यूट करने के अलावा रिटेन नहीं करता। डॉक्यूमेंट फ़ाइल खुद कभी Groq पर नहीं भेजी जाती — केवल एक्सट्रैक्ट किया गया प्लेन टेक्स्ट। अगर हमारा क्लाउड LLM उपलब्ध न हो, तो हम अपने सर्वर पर चलने वाले लोकल मॉडल पर फ़ॉलबैक करते हैं, जो डेटा को पूरी तरह हमारे इंफ़्रास्ट्रक्चर के अंदर रखता है।",

    "s5_title": "5. कुकीज़ और एनालिटिक्स",
    "s5_p1_pre": "हम लॉगिन सेशन प्रबंधन और भाषा प्राथमिकता के लिए कुछ ",
    "s5_p1_emph": "आवश्यक कुकीज़",
    "s5_p1_post": " का इस्तेमाल करते हैं। हम प्राइवेसी-फ़्रेंडली एनालिटिक्स (कोई व्यक्तिगत पहचान नहीं, कोई क्रॉस-साइट ट्रैकिंग नहीं) इस्तेमाल करते हैं ताकि समझ सकें कि कौन से टूल लोकप्रिय हैं और उन्हें बेहतर बनाएँ। हम Google Analytics, Facebook Pixel, या कोई विज्ञापन ट्रैकर इस्तेमाल नहीं करते। विवरण के लिए हमारी ",
    "s5_p1_link_text": "कुकी पॉलिसी",
    "s5_p1_after_link": " देखें।",

    "s6_title": "6. थर्ड पार्टीज़ जिनके साथ हम काम करते हैं",
    "s6_li1_label": "MongoDB Atlas",
    "s6_li1": " — अकाउंट डेटाबेस (डेटा एट-रेस्ट स्टोर)",
    "s6_li2_label": "Groq Cloud",
    "s6_li2": " — AI टेक्स्ट एनालिसिस (क्षणिक, कोई रिटेंशन नहीं)",
    "s6_li3_label": "Cloudflare",
    "s6_li3": " — CDN, DDoS सुरक्षा, DNS",
    "s6_li4_label": "Sentry",
    "s6_li4": " — एरर मॉनिटरिंग (कोई फ़ाइल कंटेंट नहीं, केवल स्टैक ट्रेस)",
    "s6_li5_label": "Hetzner Cloud",
    "s6_li5": " — सर्वर होस्टिंग",
    "s6_li6_label": "Razorpay",
    "s6_li6": " (भविष्य में) — पेड प्लान्स के लिए पेमेंट प्रोसेसिंग",
    "s6_p2": "इन सभी प्रोवाइडर्स की अपनी प्राइवेसी प्रतिबद्धताएँ हैं। हम ऐसे प्रोवाइडर्स चुनते हैं जो डेटा रीसेल नहीं करते और GDPR-अनुपालन डेटा प्रोसेसिंग एग्रीमेंट देते हैं।",

    "s7_title": "7. बच्चे",
    "s7_p1": "WeLovePDF उन क्षेत्राधिकारों में 18 साल से कम उम्र के यूज़र्स के लिए नहीं है जहाँ नाबालिगों को माता-पिता की सहमति की ज़रूरत होती है। भारत के DPDP एक्ट के तहत, बच्चों के व्यक्तिगत डेटा की प्रोसेसिंग के लिए सत्यापन योग्य माता-पिता की सहमति चाहिए। अगर आपको लगता है कि किसी बच्चे ने अकाउंट बनाया है, तो हमसे संपर्क करें, हम उसे हटा देंगे।",

    "s8_title": "8. आपके अधिकार",
    "s8_p1": "आपके पास अधिकार है:",
    "s8_li1": "अपने बारे में हमारे पास रखे व्यक्तिगत डेटा को देखने का",
    "s8_li2": "गलत या पुराने डेटा को सुधारने का",
    "s8_li3": "अपना अकाउंट और सम्बंधित इतिहास डिलीट करने का",
    "s8_li4": "अपनी गतिविधि डेटा को मशीन-रीडेबल फ़ॉर्मैट में एक्सपोर्ट करने का",
    "s8_li5": "किसी भी समय गैर-आवश्यक प्रोसेसिंग की सहमति वापस लेने का",
    "s8_p2_pre": "इन अधिकारों का इस्तेमाल करने के लिए हमें ईमेल करें: ",
    "s8_p2_post": "। हम DPDP एक्ट के अनुसार 30 दिन के अंदर जवाब देते हैं।",

    "s9_title": "9. डेटा स्थान और स्थानांतरण",
    "s9_p1": "हमारे प्राथमिक सर्वर यूरोप (Hetzner, फ़ाल्केनस्टीन/जर्मनी) में हैं। MongoDB Atlas डेटा साइनअप के समय आपकी पसंद के क्षेत्र में होस्ट होता है। सेवा का इस्तेमाल करके आप इन स्थानों पर अपने डेटा की प्रोसेसिंग के लिए सहमति देते हैं, जो GDPR और DPDP एक्ट के तहत पर्याप्त सुरक्षा प्रदान करते हैं।",

    "s10_title": "10. सुरक्षा",
    "s10_p1": "हम इंडस्ट्री-स्टैंडर्ड सुरक्षा का इस्तेमाल करते हैं: सभी ट्रांज़िट डेटा के लिए TLS 1.2+, पासवर्ड के लिए bcrypt, छोटी एक्सपायरी के साथ JWT सेशन प्रबंधन, दुरुपयोग के विरुद्ध रेट लिमिटिंग, और लीस्ट-प्रिविलेज सर्वर आर्किटेक्चर। बेहतरीन प्रयासों के बावजूद, कोई ऑनलाइन सेवा 100% सुरक्षित नहीं है; किसी पुष्टि किए गए ब्रीच की स्थिति में हम प्रभावित यूज़र्स को 72 घंटे के अंदर सूचित करेंगे।",

    "s11_title": "11. इस नीति में बदलाव",
    "s11_p1": "अगर हम इस नीति में महत्वपूर्ण बदलाव करते हैं, तो रजिस्टर्ड यूज़र्स को ईमेल करेंगे और साइट पर बैनर दिखाएँगे। बदलाव की तारीख के बाद इस्तेमाल जारी रखना स्वीकृति माना जाएगा।",

    "s12_title": "12. हमसे संपर्क करें",
    "s12_email_pre": "गोपनीयता प्रश्न: ",
    "s12_response_label": "जवाब का समय: 30 दिन के अंदर",

    "lang_disclaimer": "यह नीति अंग्रेज़ी और हिंदी में उपलब्ध है। अंग्रेज़ी संस्करण कैनोनिकल कानूनी पाठ है; हिंदी अनुवाद सुविधा के लिए दिया गया है।",
}


# Marker — full content for terms/cookies/gdpr/dmca will be appended here
# in subsequent edits to keep this file under the 50-line edit cap.
ALL_LOCALES = {
    "en": {"privacy": PRIVACY_EN},
    "hi": {"privacy": PRIVACY_HI},
}


def main() -> None:
    for locale, namespaces in ALL_LOCALES.items():
        path = Path(f"messages/{locale}.json")
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        for ns, keys in namespaces.items():
            data[ns] = keys
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        added = sum(len(v) for v in namespaces.values())
        print(f"{path}: {len(namespaces)} namespaces, {added} keys upserted")


if __name__ == "__main__":
    main()
