"""Apply GDPR i18n keys to en+hi."""
import json, sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "GDPR & DPDP Compliance",
    "subtitle": "Your data protection rights under the EU's GDPR and India's DPDP Act, 2023.",
    "last_updated_label": "Last updated: {date}",

    "right_1_title": "Right to Access",
    "right_1_desc": "Request a copy of all personal data we hold about you (account email, name, activity history).",
    "right_2_title": "Right to Rectification",
    "right_2_desc": "Update inaccurate or incomplete information directly from your dashboard settings.",
    "right_3_title": "Right to Erasure",
    "right_3_desc": "Delete your account and all associated data permanently. This is irreversible.",
    "right_4_title": "Right to Data Portability",
    "right_4_desc": "Export your activity history in a machine-readable (JSON) format.",
    "right_5_title": "Right to Restrict Processing",
    "right_5_desc": "Ask us to pause specific processing of your data while a complaint is being resolved.",
    "right_6_title": "Right to Withdraw Consent",
    "right_6_desc": "Withdraw consent for non-essential processing (e.g., product update emails) at any time.",

    "s1_title": "1. Who this applies to",
    "s1_p1": "This page describes how PDFOrca complies with two major data-protection regimes:",
    "s1_li1_label": "GDPR",
    "s1_li1": " — applicable if you reside in the European Economic Area (EEA), United Kingdom, or Switzerland.",
    "s1_li2_label": "DPDP Act 2023",
    "s1_li2": " — applicable if you reside in India and use the Service or if your personal data is processed in India.",
    "s1_p2": "The rights we offer apply uniformly to all users, regardless of jurisdiction.",

    "s2_title": "2. Our role under each regime",
    "s2_p1_pre": "Under ",
    "s2_p1_gdpr": "GDPR",
    "s2_p1_mid": ", PDFOrca acts as a ",
    "s2_p1_controller": "Data Controller",
    "s2_p1_mid2": " for account information (email, profile, activity history) and as a ",
    "s2_p1_processor": "Processor",
    "s2_p1_post": " for files you upload (held transiently and deleted within 1 hour).",
    "s2_p2_pre": "Under the ",
    "s2_p2_dpdp": "DPDP Act 2023",
    "s2_p2_mid": ", PDFOrca is a ",
    "s2_p2_fiduciary": "Data Fiduciary",
    "s2_p2_post": " with respect to personal data we determine the purposes and means of processing.",

    "s3_title": "3. Lawful basis for processing",
    "s3_p1": "We process personal data on the following lawful bases:",
    "s3_li1_label": "Performance of a contract",
    "s3_li1": " — to provide the tools you request.",
    "s3_li2_label": "Legitimate interest",
    "s3_li2": " — to keep the service secure, prevent abuse, and improve reliability.",
    "s3_li3_label": "Consent",
    "s3_li3": " — for optional marketing communications.",
    "s3_li4_label": "Legal obligation",
    "s3_li4": " — to respond to lawful demands from authorities.",

    "s4_title": "4. How to exercise your rights",
    "s4_p1": "Most rights can be exercised directly from your account dashboard. For requests we cannot fulfill automatically (e.g., a data access request as an EU citizen), email us:",
    "s4_p2_pre": "We respond within ",
    "s4_p2_emph": "30 days",
    "s4_p2_post": " under GDPR and the DPDP Act. We may ask for verification of identity before processing requests.",

    "s5_title": "5. International transfers",
    "s5_p1": "Our infrastructure runs primarily in the European Union (Hetzner, Germany). When data is transferred from India to the EU, the transfer is governed by Standard Contractual Clauses (SCCs) or other safeguards permitted under Section 16 of the DPDP Act and GDPR Articles 44-49.",

    "s6_title": "6. Data retention",
    "s6_li1_label": "Uploaded files:",
    "s6_li1": " deleted automatically within 1 hour of processing.",
    "s6_li2_label": "Account data:",
    "s6_li2": " retained while the account is active. Deleted within 30 days of account closure (or longer where required by law).",
    "s6_li3_label": "Server access logs:",
    "s6_li3": " retained for 30 days for security and debugging.",
    "s6_li4_label": "Error reports (Sentry):",
    "s6_li4": " retained for 90 days, then auto-purged.",

    "s7_title": "7. Children",
    "s7_p1": "PDFOrca is not directed at children. Under the DPDP Act, processing personal data of a child (anyone under 18) requires verifiable parental consent. We do not knowingly collect data from children. Parents who believe their child has created an account should email us for immediate removal.",

    "s8_title": "8. Right to lodge a complaint",
    "s8_p1": "If you believe we have not handled your data properly, you have the right to complain to a supervisory authority:",
    "s8_li1_label": "India:",
    "s8_li1": " Data Protection Board of India (once constituted under the DPDP Act).",
    "s8_li2_label": "EU residents:",
    "s8_li2_mid": " Your local Data Protection Authority. A list is available at ",
    "s8_li2_post": ".",

    "s9_title": "9. Changes to this page",
    "s9_p1": "We will update this page if data-protection legislation evolves (for example, as the DPDP Act's implementing rules are published). Material changes are announced to registered users via email.",

    "lang_disclaimer": "This page is offered in English and Hindi. The English version is the canonical legal text; the Hindi translation is provided for convenience.",
}

HI = {
    "title": "GDPR और DPDP अनुपालन",
    "subtitle": "EU के GDPR और भारत के DPDP अधिनियम, 2023 के तहत आपके डेटा सुरक्षा अधिकार।",
    "last_updated_label": "अंतिम अपडेट: {date}",

    "right_1_title": "एक्सेस का अधिकार",
    "right_1_desc": "अपने बारे में हमारे पास रखे सभी व्यक्तिगत डेटा (अकाउंट ईमेल, नाम, गतिविधि इतिहास) की प्रतिलिपि माँगें।",
    "right_2_title": "सुधार का अधिकार",
    "right_2_desc": "गलत या अधूरी जानकारी को सीधे अपने डैशबोर्ड सेटिंग्स से अपडेट करें।",
    "right_3_title": "मिटाने का अधिकार",
    "right_3_desc": "अपना अकाउंट और सम्बंधित सारा डेटा स्थायी रूप से डिलीट करें। यह अपरिवर्तनीय है।",
    "right_4_title": "डेटा पोर्टेबिलिटी का अधिकार",
    "right_4_desc": "अपनी गतिविधि इतिहास को मशीन-रीडेबल (JSON) फ़ॉर्मैट में एक्सपोर्ट करें।",
    "right_5_title": "प्रोसेसिंग सीमित करने का अधिकार",
    "right_5_desc": "शिकायत के समाधान तक अपने डेटा की विशिष्ट प्रोसेसिंग रोकने के लिए हमसे कहें।",
    "right_6_title": "सहमति वापस लेने का अधिकार",
    "right_6_desc": "किसी भी समय गैर-आवश्यक प्रोसेसिंग (जैसे उत्पाद अपडेट ईमेल) की सहमति वापस लें।",

    "s1_title": "1. यह किस पर लागू होता है",
    "s1_p1": "यह पेज बताता है कि PDFOrca दो प्रमुख डेटा सुरक्षा शासनों का पालन कैसे करता है:",
    "s1_li1_label": "GDPR",
    "s1_li1": " — लागू अगर आप यूरोपीय आर्थिक क्षेत्र (EEA), यूनाइटेड किंगडम, या स्विट्ज़रलैंड में रहते हैं।",
    "s1_li2_label": "DPDP अधिनियम 2023",
    "s1_li2": " — लागू अगर आप भारत में रहते हैं और सेवा का इस्तेमाल करते हैं या आपका व्यक्तिगत डेटा भारत में प्रोसेस होता है।",
    "s1_p2": "हम जो अधिकार देते हैं वे क्षेत्राधिकार की परवाह किए बिना सभी यूज़र्स पर समान रूप से लागू होते हैं।",

    "s2_title": "2. प्रत्येक शासन के तहत हमारी भूमिका",
    "s2_p1_pre": "",
    "s2_p1_gdpr": "GDPR",
    "s2_p1_mid": " के तहत, PDFOrca अकाउंट जानकारी (ईमेल, प्रोफ़ाइल, गतिविधि इतिहास) के लिए ",
    "s2_p1_controller": "डेटा कंट्रोलर",
    "s2_p1_mid2": " के रूप में कार्य करता है और आपकी अपलोड की गई फ़ाइलों के लिए ",
    "s2_p1_processor": "प्रोसेसर",
    "s2_p1_post": " के रूप में (क्षणिक रूप से रखी जाती हैं और 1 घंटे के अंदर डिलीट हो जाती हैं)।",
    "s2_p2_pre": "",
    "s2_p2_dpdp": "DPDP अधिनियम 2023",
    "s2_p2_mid": " के तहत, PDFOrca उस व्यक्तिगत डेटा के सम्बंध में ",
    "s2_p2_fiduciary": "डेटा फ़िड्यूशियरी",
    "s2_p2_post": " है जिसके प्रोसेसिंग के उद्देश्य और साधन हम तय करते हैं।",

    "s3_title": "3. प्रोसेसिंग का कानूनी आधार",
    "s3_p1": "हम निम्नलिखित कानूनी आधारों पर व्यक्तिगत डेटा प्रोसेस करते हैं:",
    "s3_li1_label": "अनुबंध का निष्पादन",
    "s3_li1": " — आपके अनुरोधित टूल्स प्रदान करने के लिए।",
    "s3_li2_label": "वैध हित",
    "s3_li2": " — सेवा को सुरक्षित रखने, दुरुपयोग रोकने, और विश्वसनीयता बेहतर बनाने के लिए।",
    "s3_li3_label": "सहमति",
    "s3_li3": " — वैकल्पिक मार्केटिंग संचार के लिए।",
    "s3_li4_label": "कानूनी दायित्व",
    "s3_li4": " — अधिकारियों की वैध माँगों का जवाब देने के लिए।",

    "s4_title": "4. अपने अधिकारों का उपयोग कैसे करें",
    "s4_p1": "अधिकांश अधिकारों का उपयोग सीधे आपके अकाउंट डैशबोर्ड से किया जा सकता है। उन अनुरोधों के लिए जो हम स्वचालित रूप से पूरे नहीं कर सकते (उदाहरण के लिए, EU नागरिक के रूप में डेटा एक्सेस अनुरोध), हमें ईमेल करें:",
    "s4_p2_pre": "हम GDPR और DPDP अधिनियम के तहत ",
    "s4_p2_emph": "30 दिन",
    "s4_p2_post": " के अंदर जवाब देते हैं। अनुरोध प्रोसेस करने से पहले हम पहचान सत्यापन माँग सकते हैं।",

    "s5_title": "5. अंतर्राष्ट्रीय स्थानांतरण",
    "s5_p1": "हमारा बुनियादी ढाँचा मुख्य रूप से यूरोपीय संघ (Hetzner, जर्मनी) में चलता है। जब डेटा भारत से EU में स्थानांतरित होता है, तो स्थानांतरण DPDP अधिनियम की धारा 16 और GDPR अनुच्छेद 44-49 के तहत अनुमत स्टैंडर्ड कॉन्ट्रैक्चुअल क्लॉज़ (SCCs) या अन्य सुरक्षा उपायों द्वारा शासित होता है।",

    "s6_title": "6. डेटा प्रतिधारण",
    "s6_li1_label": "अपलोड की गई फ़ाइलें:",
    "s6_li1": " प्रोसेसिंग के 1 घंटे के अंदर स्वचालित रूप से डिलीट।",
    "s6_li2_label": "अकाउंट डेटा:",
    "s6_li2": " अकाउंट सक्रिय रहने तक रखा जाता है। अकाउंट बंद करने के 30 दिन के अंदर डिलीट (या कानून द्वारा आवश्यक होने पर लंबा)।",
    "s6_li3_label": "सर्वर एक्सेस लॉग्स:",
    "s6_li3": " सुरक्षा और डिबगिंग के लिए 30 दिन तक रखे जाते हैं।",
    "s6_li4_label": "एरर रिपोर्ट्स (Sentry):",
    "s6_li4": " 90 दिन तक रखी जाती हैं, फिर ऑटो-पर्ज।",

    "s7_title": "7. बच्चे",
    "s7_p1": "PDFOrca बच्चों के लिए निर्देशित नहीं है। DPDP अधिनियम के तहत, बच्चे (18 साल से कम उम्र के किसी भी व्यक्ति) के व्यक्तिगत डेटा की प्रोसेसिंग के लिए सत्यापन योग्य माता-पिता की सहमति चाहिए। हम जानबूझकर बच्चों से डेटा एकत्र नहीं करते। माता-पिता जो मानते हैं कि उनके बच्चे ने अकाउंट बनाया है, उन्हें तत्काल हटाने के लिए हमें ईमेल करना चाहिए।",

    "s8_title": "8. शिकायत दर्ज करने का अधिकार",
    "s8_p1": "अगर आप मानते हैं कि हमने आपके डेटा को ठीक से नहीं संभाला है, तो आपको पर्यवेक्षण प्राधिकरण के पास शिकायत करने का अधिकार है:",
    "s8_li1_label": "भारत:",
    "s8_li1": " भारत का डेटा सुरक्षा बोर्ड (DPDP अधिनियम के तहत गठित होने पर)।",
    "s8_li2_label": "EU निवासी:",
    "s8_li2_mid": " आपका स्थानीय डेटा सुरक्षा प्राधिकरण। सूची ",
    "s8_li2_post": " पर उपलब्ध है।",

    "s9_title": "9. इस पेज में बदलाव",
    "s9_p1": "अगर डेटा सुरक्षा कानून विकसित होता है (उदाहरण के लिए, जैसे-जैसे DPDP अधिनियम के क्रियान्वयन नियम प्रकाशित होते हैं) तो हम इस पेज को अपडेट करेंगे। महत्वपूर्ण बदलाव रजिस्टर्ड यूज़र्स को ईमेल से बताए जाते हैं।",

    "lang_disclaimer": "यह पेज अंग्रेज़ी और हिंदी में उपलब्ध है। अंग्रेज़ी संस्करण कैनोनिकल कानूनी पाठ है; हिंदी अनुवाद सुविधा के लिए दिया गया है।",
}


def patch(path: str, ns: str, keys: dict) -> None:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    data[ns] = keys
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path}: {ns} = {len(keys)} keys")


patch("messages/en.json", "gdpr", EN)
patch("messages/hi.json", "gdpr", HI)
