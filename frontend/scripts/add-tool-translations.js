// One-shot script to extend en.json/hi.json with full translations for the
// 7 newer tool pages so ToolLayout (via toolKey) can render localized strings.
const fs = require("fs");
const path = require("path");

const MSG_DIR = path.join(__dirname, "..", "messages");

const ENTRIES = {
  unlock_pdf: {
    en: {
      seo_h1: "Unlock PDF Online for Free",
      seo_h2: "How to Remove a Password from a PDF",
      seo_faq: [
        { question: "Do I need the password to unlock the PDF?", answer: "Yes. You must know the original password — we cannot recover or bypass it. This tool only removes the password layer once the correct password is provided." },
        { question: "Is it safe to upload my password-protected PDF?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing. Passwords are never stored." },
        { question: "What if my PDF has owner permissions but no open password?", answer: "Use this tool the same way — leave the password empty or enter the owner password. The unlocked PDF will allow printing, copying, and editing freely." },
      ],
    },
    hi: {
      title: "PDF अनलॉक करें",
      description: "किसी पासवर्ड-सुरक्षित PDF से पासवर्ड हटाएँ — बस मूल पासवर्ड डालें।",
      seo_h1: "PDF ऑनलाइन मुफ़्त अनलॉक करें",
      seo_h2: "PDF से पासवर्ड कैसे हटाएँ",
      seo_faq: [
        { question: "क्या अनलॉक करने के लिए पासवर्ड ज़रूरी है?", answer: "हाँ। आपको मूल पासवर्ड पता होना चाहिए — हम इसे रिकवर या बायपास नहीं कर सकते। सही पासवर्ड देने पर ही पासवर्ड लेयर हट जाती है।" },
        { question: "क्या पासवर्ड-प्रोटेक्टेड PDF अपलोड करना सुरक्षित है?", answer: "हाँ। फ़ाइलें HTTPS पर प्रोसेस होती हैं और प्रोसेसिंग के बाद अपने आप डिलीट हो जाती हैं। पासवर्ड कभी स्टोर नहीं किए जाते।" },
        { question: "अगर मेरी PDF में सिर्फ़ ओनर पर्मिशन हैं, ओपन पासवर्ड नहीं?", answer: "इस टूल का उपयोग वैसे ही करें — पासवर्ड खाली छोड़ें या ओनर पासवर्ड डालें। अनलॉक की गई PDF में प्रिंट, कॉपी और एडिट खुलकर हो सकेगा।" },
      ],
    },
  },
  rotate_pdf: {
    en: {
      seo_h1: "Rotate PDF Pages Online for Free",
      seo_h2: "How to Rotate a PDF",
      seo_faq: [
        { question: "Will rotating affect the PDF quality?", answer: "No. Rotation is applied as page metadata, so text, images, and links stay pixel-identical to the source." },
        { question: "Can I rotate only specific pages?", answer: "Yes. Leave the range as 'all' to rotate everything, or enter pages like '1,3,5-7' to rotate only those." },
        { question: "Which angles can I rotate by?", answer: "90° (clockwise), 180° (upside down), or 270° (counter-clockwise / 90° anticlockwise)." },
      ],
    },
    hi: {
      seo_h1: "PDF के पेज ऑनलाइन मुफ़्त घुमाएँ",
      seo_h2: "PDF को कैसे रोटेट करें",
      seo_faq: [
        { question: "क्या रोटेट करने से PDF क्वालिटी पर असर पड़ता है?", answer: "नहीं। रोटेशन सिर्फ़ पेज मेटाडेटा में बदलाव है — टेक्स्ट, इमेज और लिंक सब वैसे ही रहते हैं।" },
        { question: "क्या मैं कुछ ही पेज रोटेट कर सकता हूँ?", answer: "हाँ। पूरा डॉक्यूमेंट घुमाने के लिए 'all' रखें, या '1,3,5-7' जैसे पेज नंबर डालें।" },
        { question: "मैं कौन से एंगल पर रोटेट कर सकता हूँ?", answer: "90° (दक्षिणावर्त), 180° (उल्टा), या 270° (वामावर्त / 90° एंटीक्लॉकवाइज़)।" },
      ],
    },
  },
  extract_pages: {
    en: {
      seo_h1: "Extract Pages from PDF Online for Free",
      seo_h2: "How to Extract Pages from a PDF",
      seo_faq: [
        { question: "How do I pick the pages?", answer: "Type page numbers separated by commas. Ranges are written with a hyphen — for example, 1,3,5-7 extracts pages 1, 3, 5, 6, and 7." },
        { question: "Is this different from Split PDF?", answer: "Split PDF breaks the file into several output PDFs. Extract Pages produces a single new PDF containing only the pages you selected." },
        { question: "Will the extracted PDF lose quality?", answer: "No. Pages are copied as-is from the source PDF — text, images, and links remain unchanged." },
      ],
    },
    hi: {
      seo_h1: "PDF से पेज ऑनलाइन मुफ़्त निकालें",
      seo_h2: "PDF से पेज कैसे निकालें",
      seo_faq: [
        { question: "मैं पेज कैसे चुनूँ?", answer: "पेज नंबरों को कौमा से अलग करके लिखें। रेंज के लिए हाइफ़न लगाएँ — जैसे 1,3,5-7 से पेज 1, 3, 5, 6 और 7 निकलते हैं।" },
        { question: "क्या यह Split PDF से अलग है?", answer: "Split PDF फ़ाइल को कई PDF में तोड़ता है। Extract Pages सिर्फ़ चुने हुए पेजों की एक नई PDF बनाता है।" },
        { question: "क्या निकाली गई PDF की क्वालिटी कम होती है?", answer: "नहीं। पेज मूल PDF से जस के तस कॉपी होते हैं — टेक्स्ट, इमेज और लिंक नहीं बदलते।" },
      ],
    },
  },
  powerpoint_to_pdf: {
    en: {
      seo_h1: "Convert PowerPoint to PDF Online for Free",
      seo_h2: "How to Convert PPT to PDF",
      seo_faq: [
        { question: "Are slide animations preserved?", answer: "PDF is a static format, so animations and transitions are flattened to the final slide content." },
        { question: "What's the file size limit?", answer: "100 MB for free users." },
      ],
    },
    hi: {
      seo_h1: "PowerPoint को PDF में ऑनलाइन मुफ़्त बदलें",
      seo_h2: "PPT को PDF में कैसे बदलें",
      seo_faq: [
        { question: "क्या स्लाइड एनिमेशन बनी रहती हैं?", answer: "PDF एक स्टैटिक फॉर्मेट है, इसलिए एनिमेशन और ट्रांज़िशन फ़ाइनल स्लाइड कंटेंट पर फ़्लैट हो जाते हैं।" },
        { question: "फ़ाइल साइज़ की लिमिट क्या है?", answer: "मुफ़्त यूज़र्स के लिए 100 MB।" },
      ],
    },
  },
  pdf_to_powerpoint: {
    en: {
      title: "PDF to PowerPoint",
      description: "Convert PDF documents into editable PowerPoint presentations. Each page becomes a slide.",
      result_title: "PowerPoint Ready",
      download_again: "Download Again",
      seo_h1: "Convert PDF to PowerPoint Online",
      seo_h2: "How PDF to PowerPoint Works",
      seo_faq: [
        { question: "Will the text be editable?", answer: "Each slide contains a high-resolution image of the page, not editable text. Use this when you need slides that look exactly like the PDF." },
        { question: "What's the slide aspect ratio?", answer: "Slides are 16:9 widescreen (13.33in x 7.5in), the modern PowerPoint default." },
      ],
    },
    hi: {
      title: "PDF से PowerPoint",
      description: "PDF डॉक्यूमेंट को PowerPoint प्रेज़ेंटेशन में बदलें — हर पेज एक स्लाइड बन जाता है।",
      result_title: "PowerPoint तैयार है",
      download_again: "फिर से डाउनलोड करें",
      seo_h1: "PDF को PowerPoint में ऑनलाइन बदलें",
      seo_h2: "PDF से PowerPoint कैसे काम करता है",
      seo_faq: [
        { question: "क्या टेक्स्ट एडिट किया जा सकेगा?", answer: "हर स्लाइड में पेज की हाई-रेज़ोल्यूशन इमेज होती है, एडिट करने योग्य टेक्स्ट नहीं। जब आपको PDF जैसी दिखने वाली स्लाइड चाहिए तब यह बेहतर है।" },
        { question: "स्लाइड का एस्पेक्ट रेशियो क्या है?", answer: "स्लाइड 16:9 वाइडस्क्रीन (13.33in x 7.5in) हैं — आज के PowerPoint का डिफ़ॉल्ट।" },
      ],
    },
  },
  ocr_pdf: {
    en: {
      title: "OCR PDF",
      description: "Make a scanned PDF searchable by adding an invisible text layer.",
      language_label: "OCR Language",
      language_hint: "Pick the language that matches the text in your scan. Mixed-language docs work best with the primary language.",
      result_title: "Searchable PDF ready",
      download_again: "Download Again",
      seo_h1: "Make Scanned PDFs Searchable",
      seo_h2: "How OCR PDF Works",
      seo_faq: [
        { question: "Will the visible look of the PDF change?", answer: "No. OCR adds an invisible text layer behind the existing pages — the original images are kept pixel-perfect." },
        { question: "How long does OCR take?", answer: "Roughly 2-5 seconds per page on a typical scan. Multi-page documents may take a minute or two." },
        { question: "What languages are supported?", answer: "English (eng) and Hindi (hin). More languages can be added on request." },
      ],
    },
    hi: {
      title: "OCR PDF",
      description: "स्कैन की हुई PDF में अदृश्य टेक्स्ट लेयर जोड़कर उसे सर्च-योग्य बनाएँ।",
      language_label: "OCR भाषा",
      language_hint: "अपनी स्कैन की भाषा चुनें। मिक्स-लैंग्वेज डॉक्यूमेंट के लिए मुख्य भाषा चुनें।",
      result_title: "सर्च-योग्य PDF तैयार है",
      download_again: "फिर से डाउनलोड करें",
      seo_h1: "स्कैन की गई PDF को सर्च-योग्य बनाएँ",
      seo_h2: "OCR PDF कैसे काम करता है",
      seo_faq: [
        { question: "क्या PDF का दिखने वाला रूप बदलेगा?", answer: "नहीं। OCR मौजूदा पेजों के पीछे एक अदृश्य टेक्स्ट लेयर जोड़ता है — मूल इमेज पिक्सेल-परफ़ेक्ट रहती हैं।" },
        { question: "OCR में कितना समय लगता है?", answer: "एक सामान्य स्कैन में हर पेज पर लगभग 2-5 सेकंड। कई पेजों के डॉक्यूमेंट में एक-दो मिनट लग सकते हैं।" },
        { question: "कौन सी भाषाएँ सपोर्टेड हैं?", answer: "अंग्रेज़ी (eng) और हिंदी (hin)। और भाषाएँ रिक्वेस्ट पर जोड़ी जा सकती हैं।" },
      ],
    },
  },
  sign_pdf: {
    en: {
      title: "Sign PDF",
      description: "Add a typed or uploaded signature to your PDF — click where you want it.",
      upload_pdf_title: "Upload a PDF to sign",
      upload_pdf_hint: "PDF up to 100 MB",
      choose_pdf: "Choose PDF",
      remove: "Remove",
      click_to_place: "Click anywhere on the page below to drop your signature.",
      page_of: "Page {current} of {total}",
      mode_type: "Type",
      mode_draw: "Draw",
      mode_upload: "Upload",
      type_placeholder: "Your name",
      type_preview_hint: "Type your name above",
      draw_clear: "Clear",
      upload_choose: "Click to choose PNG/JPG",
      use_signature: "Use this signature",
      signature_ready: "Signature ready",
      signature_edit: "Edit",
      apply_all_pages: "Apply on all pages when I click",
      placements_count: "Placements ({count})",
      clear_all: "Clear all",
      placement_label: "#{index} — page {page}",
      sign_button: "Sign & Download",
      signing: "Signing...",
      result_download: "Download again: {filename}",
      toast_select_pdf: "Please select a PDF file.",
      toast_signature_first: "Create your signature on the right first.",
      toast_signature_missing: "Signature is missing.",
      toast_create_signature: "Create your signature first.",
      toast_signature_ready: "Signature ready — click on the PDF to place it.",
      toast_upload_pdf_first: "Upload a PDF first.",
      toast_place_signature_first: "Place your signature on the PDF first.",
      toast_sign_failed: "Signing failed.",
      toast_sign_error: "Could not sign the PDF.",
      toast_signed_count: "Signed {count} location(s).",
      seo_h1: "Sign PDF Online for Free",
      seo_h2: "How to Sign a PDF",
      seo_faq: [
        { question: "Is this a legally binding signature?", answer: "It's a visual signature — appropriate for many internal and personal documents. For legally binding e-signatures with audit trails, use a dedicated e-sign service." },
        { question: "Can I sign multiple pages?", answer: "The MVP signs one page per upload. Repeat the process to sign additional pages." },
        { question: "What image formats are supported?", answer: "PNG (recommended — supports transparency) and JPG." },
      ],
    },
    hi: {
      title: "PDF पर हस्ताक्षर करें",
      description: "अपनी PDF पर टाइप किया हुआ या अपलोड किया हुआ हस्ताक्षर जोड़ें — जहाँ चाहें वहाँ क्लिक करें।",
      upload_pdf_title: "हस्ताक्षर के लिए PDF अपलोड करें",
      upload_pdf_hint: "PDF अधिकतम 100 MB तक",
      choose_pdf: "PDF चुनें",
      remove: "हटाएँ",
      click_to_place: "अपना हस्ताक्षर लगाने के लिए नीचे पेज पर क्लिक करें।",
      page_of: "पेज {current} / {total}",
      mode_type: "टाइप",
      mode_draw: "ड्रॉ",
      mode_upload: "अपलोड",
      type_placeholder: "आपका नाम",
      type_preview_hint: "ऊपर अपना नाम टाइप करें",
      draw_clear: "साफ़ करें",
      upload_choose: "PNG/JPG चुनने के लिए क्लिक करें",
      use_signature: "यह हस्ताक्षर इस्तेमाल करें",
      signature_ready: "हस्ताक्षर तैयार",
      signature_edit: "एडिट",
      apply_all_pages: "क्लिक पर सभी पेजों पर लगाएँ",
      placements_count: "स्थान ({count})",
      clear_all: "सब हटाएँ",
      placement_label: "#{index} — पेज {page}",
      sign_button: "हस्ताक्षर करें और डाउनलोड करें",
      signing: "हस्ताक्षर हो रहा है...",
      result_download: "फिर से डाउनलोड करें: {filename}",
      toast_select_pdf: "कृपया एक PDF फ़ाइल चुनें।",
      toast_signature_first: "पहले दाईं ओर अपना हस्ताक्षर बनाएँ।",
      toast_signature_missing: "हस्ताक्षर मौजूद नहीं है।",
      toast_create_signature: "पहले अपना हस्ताक्षर बनाएँ।",
      toast_signature_ready: "हस्ताक्षर तैयार है — इसे लगाने के लिए PDF पर क्लिक करें।",
      toast_upload_pdf_first: "पहले एक PDF अपलोड करें।",
      toast_place_signature_first: "पहले PDF पर अपना हस्ताक्षर रखें।",
      toast_sign_failed: "हस्ताक्षर विफल रहा।",
      toast_sign_error: "PDF पर हस्ताक्षर नहीं हो सका।",
      toast_signed_count: "{count} स्थान पर हस्ताक्षर किया गया।",
      seo_h1: "PDF पर ऑनलाइन मुफ़्त हस्ताक्षर करें",
      seo_h2: "PDF पर हस्ताक्षर कैसे करें",
      seo_faq: [
        { question: "क्या यह क़ानूनी रूप से मान्य हस्ताक्षर है?", answer: "यह एक दृश्य (visual) हस्ताक्षर है — कई आंतरिक और व्यक्तिगत डॉक्यूमेंट के लिए उपयुक्त। क़ानूनी रूप से बाध्यकारी ई-साइन और ऑडिट ट्रेल के लिए डेडिकेटेड ई-साइन सर्विस इस्तेमाल करें।" },
        { question: "क्या मैं कई पेजों पर हस्ताक्षर कर सकता हूँ?", answer: "हाँ — कई स्थानों पर क्लिक करें, या 'सभी पेजों पर लगाएँ' विकल्प चालू करें।" },
        { question: "कौन से इमेज फॉर्मेट सपोर्टेड हैं?", answer: "PNG (बेहतर — ट्रांसपेरेंसी सपोर्ट करता है) और JPG।" },
      ],
    },
  },
};

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      mergeDeep(target[key], sv);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

for (const lang of ["en", "hi"]) {
  const file = path.join(MSG_DIR, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [tool, langs] of Object.entries(ENTRIES)) {
    if (!data[tool]) data[tool] = {};
    mergeDeep(data[tool], langs[lang]);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${file}`);
}
