import {
  Caveat,
  Dancing_Script,
  Great_Vibes,
  Pacifico,
  Sacramento,
  Allura,
  Satisfy,
  Kaushan_Script,
} from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], display: "swap", weight: ["400", "700"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], display: "swap", weight: ["400", "700"] });
const greatVibes = Great_Vibes({ subsets: ["latin"], display: "swap", weight: ["400"] });
const pacifico = Pacifico({ subsets: ["latin"], display: "swap", weight: ["400"] });
const sacramento = Sacramento({ subsets: ["latin"], display: "swap", weight: ["400"] });
const allura = Allura({ subsets: ["latin"], display: "swap", weight: ["400"] });
const satisfy = Satisfy({ subsets: ["latin"], display: "swap", weight: ["400"] });
const kaushan = Kaushan_Script({ subsets: ["latin"], display: "swap", weight: ["400"] });

export type SignatureFont = {
  id: string;
  label: string;
  className: string;
  fontFamily: string;
};

export const SIGNATURE_FONTS: SignatureFont[] = [
  { id: "caveat", label: "Caveat", className: caveat.className, fontFamily: caveat.style.fontFamily },
  { id: "dancing", label: "Dancing Script", className: dancingScript.className, fontFamily: dancingScript.style.fontFamily },
  { id: "great-vibes", label: "Great Vibes", className: greatVibes.className, fontFamily: greatVibes.style.fontFamily },
  { id: "pacifico", label: "Pacifico", className: pacifico.className, fontFamily: pacifico.style.fontFamily },
  { id: "sacramento", label: "Sacramento", className: sacramento.className, fontFamily: sacramento.style.fontFamily },
  { id: "allura", label: "Allura", className: allura.className, fontFamily: allura.style.fontFamily },
  { id: "satisfy", label: "Satisfy", className: satisfy.className, fontFamily: satisfy.style.fontFamily },
  { id: "kaushan", label: "Kaushan Script", className: kaushan.className, fontFamily: kaushan.style.fontFamily },
];
