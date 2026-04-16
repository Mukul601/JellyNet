import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Cookie Policy — JellyNet",
  description: "JellyNet cookie policy — what storage mechanisms we use and why.",
};

const sections = [
  {
    title: "1. Overview",
    body: `This Cookie Policy explains how JellyNet uses cookies and similar browser storage mechanisms. By using the Platform, you consent to the use of the storage mechanisms described in this policy.`,
  },
  {
    title: "2. What Are Cookies?",
    body: `Cookies are small text files stored in your browser by websites you visit. They allow websites to remember information about your visit, such as your login state or preferences. "Similar technologies" include localStorage, sessionStorage, and other browser-based storage.`,
  },
  {
    title: "3. Strictly Necessary Cookies",
    body: `These cookies are required for the Platform to function and cannot be disabled.

**Session cookie (next-auth.session-token):** Set by NextAuth.js when you sign in with Google. Contains an encrypted session token that keeps you authenticated. Expires when you sign out or after 30 days of inactivity.

**CSRF token (next-auth.csrf-token):** A security token used to prevent cross-site request forgery attacks on sign-in flows. Session-scoped.

These cookies do not track you across external websites. They are strictly limited to keeping your JellyNet session active and secure.`,
  },
  {
    title: "4. Preference Storage (localStorage)",
    body: `JellyNet stores a small number of user preferences in your browser's localStorage. These are not cookies and are not transmitted to our servers.

**Mode preference:** Whether you are in "supplier" or "agent" mode. Persists until you clear site data.

**Network/chain preference:** Your last-selected blockchain network. Persists until you clear site data.

**Theme preference:** Light or dark mode, if toggled.

These values are read client-side only to restore your UI state across page reloads. They are not linked to your account or sent to any server.`,
  },
  {
    title: "5. Analytics and Tracking",
    body: `JellyNet does not use any third-party analytics cookies or tracking pixels. We do not use Google Analytics, Meta Pixel, Hotjar, or any similar services. We do not track you across external websites.`,
  },
  {
    title: "6. Third-Party Cookies",
    body: `The Platform uses Google OAuth for authentication. During sign-in, Google may set cookies in your browser according to Google's own cookie policy. These cookies are managed by Google and are outside our control. Please review Google's privacy policy for details.

No other third-party cookie-setting services are embedded in the Platform.`,
  },
  {
    title: "7. Managing Cookies",
    body: `You can manage cookies through your browser settings. Most browsers allow you to:
- View and delete individual cookies
- Block cookies from specific sites
- Block all third-party cookies
- Clear all cookies on exit

Note that disabling session cookies will prevent you from signing in to JellyNet. Clearing localStorage will reset your UI preferences.

Instructions for managing cookies in popular browsers:
- Chrome: Settings > Privacy and security > Cookies
- Firefox: Settings > Privacy & Security > Cookies and Site Data
- Safari: Preferences > Privacy > Manage Website Data`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this policy when we change how we use storage mechanisms. We will update the "Last Updated" date at the top of this page.`,
  },
  {
    title: "9. Contact",
    body: `For questions about cookies or data storage, contact us at: privacy@jellynet.xyz`,
  },
];

export default function CookiesPage() {
  return <LegalPage title="Cookie Policy" lastUpdated="April 2026" sections={sections} />;
}
