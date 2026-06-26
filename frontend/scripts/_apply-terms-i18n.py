"""Apply Terms i18n keys to en+hi locale files."""
import json, sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN = {
    "title": "Terms of Service",
    "subtitle": "Please read these terms carefully before using WeLovePDF.",
    "effective_label": "Effective: {date}",

    "s1_title": "1. Acceptance of these terms",
    "s1_p1_pre": "By accessing or using WeLovePDF (the \"Service\"), you agree to be bound by these Terms of Service and our ",
    "s1_p1_link": "Privacy Policy",
    "s1_p1_post": ". If you do not agree, please do not use the Service.",

    "s2_title": "2. The Service",
    "s2_p1": "WeLovePDF provides free and (in future) paid online tools for processing PDF and related document files — including merging, splitting, compressing, converting, organizing, watermarking, password protection, page numbering, and AI-assisted analysis. Tool availability may change over time.",

    "s3_title": "3. Eligibility",
    "s3_p1": "You must be at least 18 years old or have your parent/guardian's consent in jurisdictions where minors are not permitted to enter into binding agreements. By using the Service you represent that you meet this requirement.",

    "s4_title": "4. Your account",
    "s4_p1": "An account is optional. If you create one, you are responsible for keeping your password secure and for all activity that occurs on your account. Notify us immediately if you suspect unauthorized access.",

    "s5_title": "5. Acceptable use",
    "s5_p1": "You agree NOT to use WeLovePDF to:",
    "s5_li1": "Upload, process, or distribute illegal, infringing, or harmful content",
    "s5_li2": "Process material you do not own or have permission to handle",
    "s5_li3": "Reverse-engineer, scrape, or abuse our APIs",
    "s5_li4": "Attempt to bypass rate limits, file size limits, or other protections",
    "s5_li5": "Resell access to the Service without our written permission",
    "s5_li6": "Use the Service to violate any law, including India's Information Technology Act, 2000",
    "s5_p2": "We may suspend or terminate accounts that violate these rules without notice.",

    "s6_title": "6. Fair use and limits",
    "s6_p1": "The free tier is intended for personal and occasional small-business use. We enforce upload and rate limits to keep the Service fast and affordable for everyone:",
    "s6_li1_label": "Free / anonymous: ",
    "s6_li1": "up to 25 MB per file",
    "s6_li2_label": "Pro plan (when launched): ",
    "s6_li2": "up to 100 MB per file",
    "s6_li3": "Rate limits apply per IP and per account; abuse may trigger temporary blocks",

    "s7_title": "7. Your content",
    "s7_p1": "You retain all rights to files you upload. By uploading, you grant us a limited, non-exclusive, transient license to process the file solely to deliver the result you requested. Files are automatically deleted within 1 hour. We never use your content for training, advertising, or any other purpose.",

    "s8_title": "8. Paid plans (future)",
    "s8_p1": "Paid plans, when launched, will be billed in Indian Rupees (INR) through Razorpay or a similar processor. Refund and renewal terms will be disclosed at checkout. We will provide at least 14 days' notice of any price change for active subscriptions.",

    "s9_title": "9. AI-generated output",
    "s9_p1": "Outputs from our AI features (summary, key points, generated titles) are produced by language models and may contain inaccuracies. You should verify AI output before relying on it for any consequential decision. WeLovePDF makes no warranty about the correctness of AI-generated content.",

    "s10_title": "10. Disclaimer of warranties",
    "s10_p1": "The Service is provided \"as is\" and \"as available\" without warranty of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that processed files will be free of defects. Always keep backups of your original files.",

    "s11_title": "11. Limitation of liability",
    "s11_p1": "To the maximum extent permitted by law, WeLovePDF will not be liable for any indirect, incidental, consequential, or punitive damages, or any loss of data, profits, or business opportunity arising from your use of the Service. Our total cumulative liability for any claim is limited to the greater of (a) ₹1,000 or (b) the amount you paid us in the 12 months preceding the claim.",

    "s12_title": "12. Indemnification",
    "s12_p1": "You agree to indemnify and hold WeLovePDF harmless from any claim, demand, loss, liability, or expense (including reasonable legal fees) arising out of (a) your use of the Service, (b) your violation of these Terms, or (c) your violation of any third-party rights.",

    "s13_title": "13. Termination",
    "s13_p1": "You may stop using the Service at any time. We may suspend or terminate access at any time for breach of these Terms, illegal activity, or abuse. On termination, sections that by their nature should survive (payment obligations, liability limits, indemnification) will continue to apply.",

    "s14_title": "14. Governing law and jurisdiction",
    "s14_p1": "These Terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at New Delhi, India.",

    "s15_title": "15. Changes to these terms",
    "s15_p1": "We may update these Terms from time to time. We will display a notice on the site and email registered users for material changes. Continued use after the effective date means you accept the updated Terms.",

    "s16_title": "16. Contact",
    "s16_email_pre": "Questions about these Terms: ",

    "lang_disclaimer": "These Terms are offered in English and Hindi. The English version is the canonical legal text; the Hindi translation is provided for convenience.",
}

HI = {
    "title": "सेवा की शर्तें",
    "subtitle": "WeLovePDF का इस्तेमाल करने से पहले इन शर्तों को ध्यान से पढ़ें।",
    "effective_label": "प्रभावी: {date}",

    "s1_title": "1. इन शर्तों की स्वीकृति",
    "s1_p1_pre": "WeLovePDF (\"सेवा\") को एक्सेस या इस्तेमाल करके, आप इन सेवा की शर्तों और हमारी ",
    "s1_p1_link": "गोपनीयता नीति",
    "s1_p1_post": " से बँधे होने के लिए सहमत होते हैं। अगर आप सहमत नहीं हैं, तो कृपया सेवा का इस्तेमाल न करें।",

    "s2_title": "2. यह सेवा",
    "s2_p1": "WeLovePDF PDF और सम्बंधित डॉक्यूमेंट फ़ाइलों को प्रोसेस करने के लिए मुफ़्त और (भविष्य में) पेड ऑनलाइन टूल्स प्रदान करता है — मर्जिंग, स्प्लिटिंग, कम्प्रेशन, कन्वर्शन, ऑर्गनाइज़िंग, वॉटरमार्किंग, पासवर्ड प्रोटेक्शन, पेज नंबरिंग, और AI-असिस्टेड एनालिसिस सहित। टूल उपलब्धता समय के साथ बदल सकती है।",

    "s3_title": "3. पात्रता",
    "s3_p1": "आपकी उम्र कम से कम 18 साल होनी चाहिए, या उन क्षेत्राधिकारों में जहाँ नाबालिगों को बाध्यकारी अनुबंध करने की अनुमति नहीं है, माता-पिता/अभिभावक की सहमति होनी चाहिए। सेवा का इस्तेमाल करके आप इस आवश्यकता को पूरा करने का प्रतिनिधित्व करते हैं।",

    "s4_title": "4. आपका अकाउंट",
    "s4_p1": "अकाउंट वैकल्पिक है। अगर आप बनाते हैं, तो अपना पासवर्ड सुरक्षित रखने और अपने अकाउंट पर होने वाली सभी गतिविधि के लिए आप ज़िम्मेदार हैं। अनधिकृत एक्सेस का संदेह होने पर हमें तुरंत सूचित करें।",

    "s5_title": "5. स्वीकार्य उपयोग",
    "s5_p1": "आप WeLovePDF का इस्तेमाल इन कामों के लिए नहीं करने पर सहमत हैं:",
    "s5_li1": "अवैध, उल्लंघनकारी, या हानिकारक सामग्री अपलोड, प्रोसेस, या वितरित करना",
    "s5_li2": "ऐसी सामग्री प्रोसेस करना जिसके आप मालिक नहीं हैं या जिसकी अनुमति नहीं है",
    "s5_li3": "हमारी APIs को रिवर्स-इंजीनियर, स्क्रेप, या दुरुपयोग करना",
    "s5_li4": "रेट लिमिट, फ़ाइल साइज़ लिमिट, या अन्य सुरक्षा को बायपास करने की कोशिश",
    "s5_li5": "हमारी लिखित अनुमति के बिना सेवा को रीसेल करना",
    "s5_li6": "किसी कानून, भारत के सूचना प्रौद्योगिकी अधिनियम, 2000 सहित, का उल्लंघन करने के लिए सेवा का इस्तेमाल",
    "s5_p2": "हम बिना सूचना के इन नियमों का उल्लंघन करने वाले अकाउंट्स को निलंबित या समाप्त कर सकते हैं।",

    "s6_title": "6. फ़ेयर यूज़ और सीमाएँ",
    "s6_p1": "फ़्री टियर व्यक्तिगत और कभी-कभार छोटे बिज़नेस उपयोग के लिए है। हम सेवा को सबके लिए तेज़ और सस्ती रखने के लिए अपलोड और रेट लिमिट लागू करते हैं:",
    "s6_li1_label": "फ़्री / अनॉनिमस: ",
    "s6_li1": "प्रति फ़ाइल 25 MB तक",
    "s6_li2_label": "Pro प्लान (लॉन्च होने पर): ",
    "s6_li2": "प्रति फ़ाइल 100 MB तक",
    "s6_li3": "रेट लिमिट प्रति IP और प्रति अकाउंट लागू होती हैं; दुरुपयोग पर अस्थायी ब्लॉक हो सकता है",

    "s7_title": "7. आपकी सामग्री",
    "s7_p1": "आप अपनी अपलोड की गई फ़ाइलों के सभी अधिकार बरकरार रखते हैं। अपलोड करके, आप हमें केवल आपके अनुरोधित परिणाम देने के लिए फ़ाइल प्रोसेस करने का सीमित, गैर-विशेष, क्षणिक लाइसेंस देते हैं। फ़ाइलें 1 घंटे के अंदर स्वचालित रूप से डिलीट हो जाती हैं। हम आपकी सामग्री का इस्तेमाल ट्रेनिंग, विज्ञापन, या किसी अन्य उद्देश्य के लिए कभी नहीं करते।",

    "s8_title": "8. पेड प्लान्स (भविष्य में)",
    "s8_p1": "पेड प्लान्स, जब लॉन्च होंगे, भारतीय रुपये (INR) में Razorpay या समान प्रोसेसर के माध्यम से बिल किए जाएँगे। रिफ़ंड और नवीनीकरण की शर्तें चेकआउट पर बताई जाएँगी। सक्रिय सब्सक्रिप्शन के लिए किसी भी मूल्य परिवर्तन की कम से कम 14 दिन पहले सूचना देंगे।",

    "s9_title": "9. AI-जनित आउटपुट",
    "s9_p1": "हमारे AI फ़ीचर्स (सारांश, मुख्य बिंदु, उत्पन्न शीर्षक) के आउटपुट लैंग्वेज मॉडल्स से बनते हैं और इनमें अशुद्धियाँ हो सकती हैं। किसी भी महत्वपूर्ण निर्णय पर भरोसा करने से पहले AI आउटपुट को सत्यापित करें। WeLovePDF AI-जनित सामग्री की शुद्धता की कोई गारंटी नहीं देता।",

    "s10_title": "10. वारंटी का अस्वीकरण",
    "s10_p1": "सेवा \"जैसी है\" और \"जैसी उपलब्ध है\" आधार पर बिना किसी वारंटी के प्रदान की जाती है। हम गारंटी नहीं देते कि सेवा निर्बाध, त्रुटि-रहित होगी, या प्रोसेस की गई फ़ाइलें दोष-रहित होंगी। अपनी मूल फ़ाइलों का बैकअप हमेशा रखें।",

    "s11_title": "11. देयता की सीमा",
    "s11_p1": "कानून द्वारा अनुमत अधिकतम सीमा तक, WeLovePDF आपकी सेवा के उपयोग से उत्पन्न किसी भी अप्रत्यक्ष, आकस्मिक, परिणामी, या दंडात्मक नुकसान, या डेटा, लाभ, या व्यवसायिक अवसर के नुकसान के लिए ज़िम्मेदार नहीं होगा। किसी भी दावे के लिए हमारी कुल संचयी देयता (a) ₹1,000 या (b) दावे से पहले 12 महीनों में आपने हमें भुगतान की गई राशि, जो भी ज़्यादा हो, तक सीमित है।",

    "s12_title": "12. क्षतिपूर्ति",
    "s12_p1": "आप WeLovePDF को (a) सेवा के आपके उपयोग, (b) इन शर्तों के आपके उल्लंघन, या (c) किसी थर्ड-पार्टी अधिकार के आपके उल्लंघन से उत्पन्न किसी भी दावे, माँग, हानि, देयता, या खर्च (उचित कानूनी फ़ीस सहित) से क्षतिपूर्ति देने और हानिरहित रखने पर सहमत हैं।",

    "s13_title": "13. समाप्ति",
    "s13_p1": "आप किसी भी समय सेवा का इस्तेमाल बंद कर सकते हैं। हम इन शर्तों के उल्लंघन, अवैध गतिविधि, या दुरुपयोग के लिए किसी भी समय एक्सेस को निलंबित या समाप्त कर सकते हैं। समाप्ति पर, वे खंड जो स्वभाव से बने रहने चाहिए (भुगतान दायित्व, देयता सीमाएँ, क्षतिपूर्ति) लागू रहेंगे।",

    "s14_title": "14. शासी कानून और क्षेत्राधिकार",
    "s14_p1": "ये शर्तें भारत के कानूनों द्वारा शासित हैं। कोई भी विवाद नई दिल्ली, भारत के न्यायालयों के विशेष क्षेत्राधिकार के अधीन होगा।",

    "s15_title": "15. इन शर्तों में बदलाव",
    "s15_p1": "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। महत्वपूर्ण बदलावों के लिए हम साइट पर सूचना दिखाएँगे और रजिस्टर्ड यूज़र्स को ईमेल करेंगे। प्रभावी तारीख के बाद इस्तेमाल जारी रखने का मतलब है कि आप अपडेटेड शर्तें स्वीकार करते हैं।",

    "s16_title": "16. संपर्क",
    "s16_email_pre": "इन शर्तों के बारे में प्रश्न: ",

    "lang_disclaimer": "ये शर्तें अंग्रेज़ी और हिंदी में उपलब्ध हैं। अंग्रेज़ी संस्करण कैनोनिकल कानूनी पाठ है; हिंदी अनुवाद सुविधा के लिए दिया गया है।",
}


def patch(path: str, ns: str, keys: dict) -> None:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    data[ns] = keys
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path}: {ns} = {len(keys)} keys")


patch("messages/en.json", "terms", EN)
patch("messages/hi.json", "terms", HI)
