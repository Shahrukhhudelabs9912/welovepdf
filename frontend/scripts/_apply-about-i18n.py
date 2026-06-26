"""One-shot script — adds About page i18n keys to en+hi, drops legacy keys."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

EN_ABOUT = {
    "badge": "About Us",
    "title": "About WeLovePDF",
    "description": "A free, privacy-first toolkit for everyday PDF work, built from India for the world.",
    "hero_heading_part1": "Free PDF tools",
    "hero_heading_part2": "that respect your time and privacy",
    "hero_description": "WeLovePDF is a small, focused tool we built because we wanted PDF utilities that don't hide essential features behind paywalls or ship our files to opaque third parties. Today thousands of people use it every week.",
    "mission_title": "Our Mission",
    "mission_subtitle": "Make essential PDF work fast, free, and private",
    "mission_text": "Most PDF websites bury basic features behind subscriptions, riddle their pages with ads, or quietly send your files to servers you don't know. We don't. Every core tool here is free, every file is deleted within an hour, and we never sell user data.",
    "mission_text_2": "We focus on the tools people actually use day to day — merge, split, compress, convert — and we keep the interface uncluttered so you can finish what you came for in seconds.",
    "values_title": "What we stand for",
    "values_subtitle": "A short list of things we won't compromise on",
    "value_privacy_title": "Privacy by default",
    "value_privacy_desc": "Your files are processed in temporary memory and auto-deleted within 1 hour. No backups. No tracking pixels. No selling data.",
    "value_free_title": "Free as our default tier",
    "value_free_desc": "Every essential PDF tool is free with no signup wall. Paid tiers (when launched) only unlock larger files and priority processing.",
    "value_local_title": "Built for India and the world",
    "value_local_desc": "Native Hindi interface, support for Indian document types (Aadhaar, government forms), and pricing in INR. We work hard for users underserved by US-first tools.",
    "value_ai_title": "AI used responsibly",
    "value_ai_desc": "Our AI features run on Groq (cloud) with a local HuggingFace fallback. Document text is sent for analysis, never the file itself, and never used for training.",
    "story_title": "How it started",
    "story_para_1": "WeLovePDF began as a side project to scratch a personal itch. The big PDF sites all had the same pattern: free for two operations, then a paywall — or worse, low-quality output that nudged you toward upgrading.",
    "story_para_2": "We built our own. Then made it Hindi-friendly. Then added AI summarization because students kept asking for it. Today the platform runs on a small VPS in Europe with users from 30+ countries — most of them in India.",
    "story_para_3": "We are a tiny team, often a one-person operation. We respond to email personally and we ship updates frequently. If you have feedback or hit a bug, we genuinely want to hear it.",
    "cta_heading": "Try it for yourself",
    "cta_description": "Pick any PDF tool and use it without signing up. Or reach out — we read every message.",
    "cta_try_tools": "Try a tool",
    "cta_contact_us": "Contact us",
}

HI_ABOUT = {
    "badge": "हमारे बारे में",
    "title": "WeLovePDF के बारे में",
    "description": "आपके रोज़मर्रा के PDF काम के लिए मुफ़्त, प्राइवेसी-फ़र्स्ट टूलकिट, भारत से दुनिया के लिए बना।",
    "hero_heading_part1": "मुफ़्त PDF टूल्स",
    "hero_heading_part2": "जो आपके समय और प्राइवेसी का सम्मान करते हैं",
    "hero_description": "WeLovePDF एक छोटा, फ़ोकस्ड टूल है जिसे हमने इसलिए बनाया क्योंकि हम चाहते थे कि बेसिक PDF फीचर्स पेवॉल के पीछे न छुपे हों और हमारी फ़ाइलें किसी अंजान सर्वर पर न जाएँ। आज हज़ारों लोग इसे हर हफ़्ते इस्तेमाल करते हैं।",
    "mission_title": "हमारा मिशन",
    "mission_subtitle": "ज़रूरी PDF काम को तेज़, मुफ़्त और प्राइवेट बनाना",
    "mission_text": "ज़्यादातर PDF वेबसाइटें बेसिक फीचर्स को सब्सक्रिप्शन के पीछे छुपा देती हैं, ऐड्स से भर देती हैं, या आपकी फ़ाइलें ऐसे सर्वर पर भेजती हैं जिनके बारे में आप जानते नहीं। हम ऐसा नहीं करते। हर ज़रूरी टूल मुफ़्त है, हर फ़ाइल एक घंटे में डिलीट हो जाती है, और हम कभी यूज़र डेटा नहीं बेचते।",
    "mission_text_2": "हम उन टूल्स पर ध्यान देते हैं जो लोग रोज़ाना इस्तेमाल करते हैं — मर्ज, स्प्लिट, कम्प्रेस, कन्वर्ट — और इंटरफ़ेस सिंपल रखते हैं ताकि आप सेकंडों में काम पूरा कर सकें।",
    "values_title": "हमारे सिद्धांत",
    "values_subtitle": "कुछ चीज़ें जिन पर हम कभी समझौता नहीं करेंगे",
    "value_privacy_title": "डिफ़ॉल्ट रूप से प्राइवेसी",
    "value_privacy_desc": "आपकी फ़ाइलें टेम्पररी मेमोरी में प्रोसेस होती हैं और 1 घंटे में ऑटो-डिलीट हो जाती हैं। कोई बैकअप नहीं। कोई ट्रैकिंग पिक्सेल नहीं। डेटा बेचने का सवाल ही नहीं।",
    "value_free_title": "मुफ़्त डिफ़ॉल्ट टियर",
    "value_free_desc": "हर ज़रूरी PDF टूल बिना साइनअप के मुफ़्त है। पेड टियर्स (जब आएँगे) सिर्फ़ बड़ी फ़ाइलें और प्रायोरिटी प्रोसेसिंग देंगे।",
    "value_local_title": "भारत और दुनिया के लिए बनाया",
    "value_local_desc": "नेटिव हिंदी इंटरफ़ेस, भारतीय डॉक्यूमेंट्स (आधार, सरकारी फ़ॉर्म) के लिए सपोर्ट, और INR में प्राइसिंग। US-फ़र्स्ट टूल्स से अनदेखे यूज़र्स के लिए हम मेहनत करते हैं।",
    "value_ai_title": "AI का ज़िम्मेदार इस्तेमाल",
    "value_ai_desc": "हमारे AI फीचर्स Groq (क्लाउड) पर चलते हैं, लोकल HuggingFace बैकअप के साथ। डॉक्यूमेंट टेक्स्ट एनालिसिस के लिए जाता है, फ़ाइल कभी नहीं, और ट्रेनिंग के लिए कुछ भी नहीं।",
    "story_title": "शुरुआत कैसे हुई",
    "story_para_1": "WeLovePDF एक साइड प्रोजेक्ट के रूप में शुरू हुआ — एक निजी ज़रूरत को पूरा करने के लिए। बड़ी PDF साइट्स का एक ही पैटर्न था: दो ऑपरेशन तक मुफ़्त, फिर पेवॉल — या उससे भी बुरा, ख़राब क्वालिटी आउटपुट जो आपको अपग्रेड के लिए मजबूर करता था।",
    "story_para_2": "हमने अपना ख़ुद का बनाया। फिर इसे हिंदी-फ़्रेंडली बनाया। फिर AI समराइज़ेशन जोड़ा क्योंकि स्टूडेंट्स बार-बार माँग रहे थे। आज प्लेटफ़ॉर्म यूरोप के एक छोटे VPS पर चलता है और 30+ देशों के यूज़र्स हैं — ज़्यादातर भारत से।",
    "story_para_3": "हम एक छोटी टीम हैं, अक्सर एक अकेला आदमी। हम ईमेल का जवाब ख़ुद देते हैं और अक्सर अपडेट्स भेजते हैं। अगर आपके पास फ़ीडबैक है या बग मिला है, तो हम सच में सुनना चाहेंगे।",
    "cta_heading": "ख़ुद आज़माएँ",
    "cta_description": "कोई भी PDF टूल चुनिए और बिना साइनअप के इस्तेमाल कीजिए। या हमसे संपर्क कीजिए — हम हर मेसेज पढ़ते हैं।",
    "cta_try_tools": "टूल आज़माएँ",
    "cta_contact_us": "संपर्क करें",
}

# These keys were referenced by the old team-section / milestone / impact-stats
# components. The new About page no longer renders them, so dropping them keeps
# the locale files honest.
LEGACY_PREFIXES = ("team_member_", "milestone_", "impact_")
LEGACY_EXACT = {"team_title", "team_subtitle", "journey_title", "journey_subtitle",
                "cta_join_team", "cta_view_positions"}


def patch(path: str, patches: dict) -> None:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    section = data.setdefault("about", {})
    added, replaced = 0, 0
    for k, v in patches.items():
        if k in section:
            replaced += 1
        else:
            added += 1
        section[k] = v
    legacy = [
        k for k in list(section.keys())
        if k.startswith(LEGACY_PREFIXES) or k in LEGACY_EXACT
    ]
    for k in legacy:
        del section[k]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{path}: +{added} added, ~{replaced} replaced, -{len(legacy)} legacy removed")


patch("messages/en.json", EN_ABOUT)
patch("messages/hi.json", HI_ABOUT)
