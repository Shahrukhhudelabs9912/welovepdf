"""Apply DMCA i18n keys to en+hi."""
import json, sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Copyright (DMCA) Policy",
    "subtitle": "How to report copyright infringement and our takedown process.",
    "last_updated_label": "Last updated: {date}",

    "notice_title": "Important: PDFOrca does not host user files",
    "notice_body": "Files you upload to use our PDF tools are processed in temporary memory and deleted within 1 hour. We do not store, index, or distribute user-uploaded files. If you believe your work has been used to train our models or appears in our public assets (logos, templates, blog), please file a notice below.",

    "req_1_title": "1. Identification of the copyrighted work",
    "req_1_desc": "A clear description of the copyrighted material you claim is being infringed (e.g., title, registration number, URL of the original).",
    "req_2_title": "2. Identification of the infringing material",
    "req_2_desc": "The exact URL on pdforca.com (or sub-page) where the allegedly infringing content appears.",
    "req_3_title": "3. Your contact information",
    "req_3_desc": "Full legal name, postal address, telephone number, and a valid email address where we can reach you.",
    "req_4_title": "4. Good-faith statement",
    "req_4_desc": "A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.",
    "req_5_title": "5. Accuracy & authority statement",
    "req_5_desc": "A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on the owner's behalf.",
    "req_6_title": "6. Physical or electronic signature",
    "req_6_desc": "A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.",

    "s1_title": "1. Reporting copyright infringement",
    "s1_p1": "PDFOrca respects the intellectual property rights of others and complies with the notice-and-takedown procedures of the Digital Millennium Copyright Act (DMCA, United States) and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 in India.",
    "s1_p2": "If you are the copyright owner (or an authorized representative) and you believe content on our site infringes your copyright, send a written notice to our designated agent (details at the bottom of this page) containing the elements listed below.",

    "s2_title": "2. Required information in your notice",

    "s3_title": "3. Where to send a notice",
    "s3_p1": "Send your complete written notice (with all six required elements above) to our designated copyright agent:",
    "s3_p2": "We acknowledge receipt within 5 business days and aim to act on valid notices within 36 hours of acknowledgement, as required under the IT Rules, 2021.",

    "s4_title": "4. What happens next",
    "s4_li1": "We review the notice for completeness. Incomplete notices are returned with a note on what is missing.",
    "s4_li2": "For valid notices, we remove or disable access to the disputed content and notify the user who posted it (if applicable).",
    "s4_li3": "The affected user may file a counter-notice (see Section 5).",
    "s4_li4": "Repeat infringers will have their accounts terminated.",

    "s5_title": "5. Counter-notice procedure",
    "s5_p1": "If you believe content was removed by mistake or misidentification, you can file a counter-notice. It must include:",
    "s5_li1": "Your physical or electronic signature, name, address, telephone, and email.",
    "s5_li2": "Identification of the removed material and the location where it appeared.",
    "s5_li3": "A statement under penalty of perjury that the removal was due to mistake or misidentification.",
    "s5_li4": "Consent to the jurisdiction of the courts at New Delhi, India and acceptance of service from the original complainant.",
    "s5_p2": "Send counter-notices to the same email above. We forward valid counter-notices to the original complainant and may restore the content within 10-14 business days unless the complainant pursues legal action.",

    "s6_title": "6. False claims",
    "s6_p1": "Filing a knowingly false copyright notice is a serious offense and may result in liability for damages, costs, and legal fees under both Indian and U.S. law. Please consult a lawyer if you are unsure whether infringement has occurred.",

    "s7_title": "7. Repeat infringers",
    "s7_p1": "We terminate the accounts of users who are determined to be repeat infringers of copyright. We maintain a record of valid takedown notices for this purpose.",

    "s8_title": "8. Designated agent for copyright notices",
    "s8_agent_label": "PDFOrca Copyright Agent",
    "s8_email_label": "Email:",
    "s8_postal_label": "Postal address: available on written request to the email above.",

    "see_more_pre": "For our broader content rules, see the ",
    "see_more_terms": "Terms of Service",
    "see_more_mid": " and ",
    "see_more_privacy": "Privacy Policy",
    "see_more_post": ".",

    "lang_disclaimer": "This policy is offered in English and Hindi. The English version is the canonical legal text; the Hindi translation is provided for convenience.",
}

HI = {
    "title": "कॉपीराइट (DMCA) नीति",
    "subtitle": "कॉपीराइट उल्लंघन की रिपोर्ट कैसे करें और हमारी टेकडाउन प्रक्रिया।",
    "last_updated_label": "अंतिम अपडेट: {date}",

    "notice_title": "महत्वपूर्ण: PDFOrca यूज़र फ़ाइलें होस्ट नहीं करता",
    "notice_body": "हमारे PDF टूल्स इस्तेमाल करने के लिए आप जो फ़ाइलें अपलोड करते हैं वे टेम्पररी मेमोरी में प्रोसेस होती हैं और 1 घंटे के अंदर डिलीट हो जाती हैं। हम यूज़र-अपलोडेड फ़ाइलें स्टोर, इंडेक्स, या वितरित नहीं करते। अगर आपको लगता है कि आपके काम का इस्तेमाल हमारे मॉडल्स की ट्रेनिंग में हुआ है या हमारी सार्वजनिक सम्पत्तियों (लोगो, टेम्प्लेट्स, ब्लॉग) में दिखाई दे रहा है, तो कृपया नीचे एक नोटिस दर्ज करें।",

    "req_1_title": "1. कॉपीराइट कार्य की पहचान",
    "req_1_desc": "उस कॉपीराइट सामग्री का स्पष्ट विवरण जिसके उल्लंघन का आप दावा कर रहे हैं (जैसे शीर्षक, पंजीकरण संख्या, मूल का URL)।",
    "req_2_title": "2. उल्लंघनकारी सामग्री की पहचान",
    "req_2_desc": "pdforca.com (या उप-पेज) पर वह सटीक URL जहाँ कथित उल्लंघनकारी सामग्री दिखाई देती है।",
    "req_3_title": "3. आपकी संपर्क जानकारी",
    "req_3_desc": "पूरा कानूनी नाम, डाक पता, टेलीफ़ोन नंबर, और एक वैध ईमेल पता जहाँ हम आपसे संपर्क कर सकें।",
    "req_4_title": "4. सद्भावना का बयान",
    "req_4_desc": "एक बयान कि आपका सद्भावपूर्ण विश्वास है कि विवादित उपयोग कॉपीराइट मालिक, उसके एजेंट, या कानून द्वारा अधिकृत नहीं है।",
    "req_5_title": "5. सटीकता और प्राधिकार बयान",
    "req_5_desc": "झूठी गवाही की सज़ा के तहत किया गया बयान कि नोटिस में जानकारी सटीक है और आप कॉपीराइट मालिक हैं या मालिक की ओर से कार्य करने के लिए अधिकृत हैं।",
    "req_6_title": "6. भौतिक या इलेक्ट्रॉनिक हस्ताक्षर",
    "req_6_desc": "कॉपीराइट मालिक या उसकी ओर से कार्य करने के लिए अधिकृत व्यक्ति का भौतिक या इलेक्ट्रॉनिक हस्ताक्षर।",

    "s1_title": "1. कॉपीराइट उल्लंघन की रिपोर्टिंग",
    "s1_p1": "PDFOrca दूसरों के बौद्धिक संपदा अधिकारों का सम्मान करता है और डिजिटल मिलेनियम कॉपीराइट एक्ट (DMCA, संयुक्त राज्य) और भारत में सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, 2021 के नियम 3(2) के नोटिस-और-टेकडाउन प्रक्रियाओं का पालन करता है।",
    "s1_p2": "अगर आप कॉपीराइट मालिक (या अधिकृत प्रतिनिधि) हैं और आपको लगता है कि हमारी साइट पर सामग्री आपके कॉपीराइट का उल्लंघन करती है, तो नीचे सूचीबद्ध तत्वों वाले एक लिखित नोटिस को हमारे नामित एजेंट (इस पेज के नीचे विवरण) को भेजें।",

    "s2_title": "2. आपके नोटिस में आवश्यक जानकारी",

    "s3_title": "3. नोटिस कहाँ भेजें",
    "s3_p1": "अपना पूरा लिखित नोटिस (ऊपर के सभी छह आवश्यक तत्वों के साथ) हमारे नामित कॉपीराइट एजेंट को भेजें:",
    "s3_p2": "हम 5 कार्य दिवस के अंदर प्राप्ति की पुष्टि करते हैं और IT नियम, 2021 के अनुसार पुष्टि के 36 घंटे के अंदर वैध नोटिस पर कार्य करने का लक्ष्य रखते हैं।",

    "s4_title": "4. आगे क्या होता है",
    "s4_li1": "हम पूर्णता के लिए नोटिस की समीक्षा करते हैं। अधूरे नोटिस वापस भेजे जाते हैं, इस नोट के साथ कि क्या ग़ायब है।",
    "s4_li2": "वैध नोटिस के लिए, हम विवादित सामग्री को हटा देते हैं या एक्सेस अक्षम कर देते हैं और उसे पोस्ट करने वाले यूज़र को सूचित करते हैं (अगर लागू हो)।",
    "s4_li3": "प्रभावित यूज़र काउंटर-नोटिस दर्ज कर सकता है (देखें खंड 5)।",
    "s4_li4": "बार-बार उल्लंघन करने वालों के अकाउंट समाप्त किए जाएँगे।",

    "s5_title": "5. काउंटर-नोटिस प्रक्रिया",
    "s5_p1": "अगर आपको लगता है कि सामग्री गलती या ग़लत पहचान से हटाई गई थी, तो आप काउंटर-नोटिस दर्ज कर सकते हैं। इसमें शामिल होना चाहिए:",
    "s5_li1": "आपका भौतिक या इलेक्ट्रॉनिक हस्ताक्षर, नाम, पता, टेलीफ़ोन, और ईमेल।",
    "s5_li2": "हटाई गई सामग्री की पहचान और वह स्थान जहाँ वह दिखाई दी थी।",
    "s5_li3": "झूठी गवाही की सज़ा के तहत एक बयान कि हटाना गलती या ग़लत पहचान के कारण था।",
    "s5_li4": "नई दिल्ली, भारत के न्यायालयों के क्षेत्राधिकार की सहमति और मूल शिकायतकर्ता से सेवा की स्वीकृति।",
    "s5_p2": "काउंटर-नोटिस ऊपर वाले उसी ईमेल पर भेजें। हम वैध काउंटर-नोटिस को मूल शिकायतकर्ता को भेजते हैं और 10-14 कार्य दिवस के अंदर सामग्री को पुनर्स्थापित कर सकते हैं, जब तक कि शिकायतकर्ता कानूनी कार्रवाई न करे।",

    "s6_title": "6. झूठे दावे",
    "s6_p1": "जानबूझकर झूठा कॉपीराइट नोटिस दर्ज करना गंभीर अपराध है और भारतीय व U.S. कानून दोनों के तहत क्षतिपूर्ति, खर्च, और कानूनी शुल्क की देयता हो सकती है। अगर आप अनिश्चित हैं कि उल्लंघन हुआ है या नहीं, तो कृपया वकील से सलाह लें।",

    "s7_title": "7. बार-बार उल्लंघन करने वाले",
    "s7_p1": "हम उन यूज़र्स के अकाउंट्स समाप्त करते हैं जिन्हें कॉपीराइट का बार-बार उल्लंघन करने वाला निर्धारित किया जाता है। इस उद्देश्य के लिए हम वैध टेकडाउन नोटिस का रिकॉर्ड रखते हैं।",

    "s8_title": "8. कॉपीराइट नोटिस के लिए नामित एजेंट",
    "s8_agent_label": "PDFOrca कॉपीराइट एजेंट",
    "s8_email_label": "ईमेल:",
    "s8_postal_label": "डाक पता: ऊपर वाले ईमेल पर लिखित अनुरोध पर उपलब्ध।",

    "see_more_pre": "हमारे व्यापक सामग्री नियमों के लिए, ",
    "see_more_terms": "सेवा की शर्तें",
    "see_more_mid": " और ",
    "see_more_privacy": "गोपनीयता नीति",
    "see_more_post": " देखें।",

    "lang_disclaimer": "यह नीति अंग्रेज़ी और हिंदी में उपलब्ध है। अंग्रेज़ी संस्करण कैनोनिकल कानूनी पाठ है; हिंदी अनुवाद सुविधा के लिए दिया गया है।",
}


def patch(path: str, ns: str, keys: dict) -> None:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    data[ns] = keys
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path}: {ns} = {len(keys)} keys")


patch("messages/en.json", "dmca", EN)
patch("messages/hi.json", "dmca", HI)
