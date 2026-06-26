import { redirect } from "next/navigation";

/**
 * Canonical privacy URL is /privacy. This route redirects there to keep
 * any historical /privacy-policy bookmarks and footer links working while
 * collapsing duplicate content for SEO.
 */
export default function PrivacyPolicyRedirect(): never {
  redirect("/privacy");
}
