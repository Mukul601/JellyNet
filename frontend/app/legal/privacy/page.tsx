import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy — JellyNet",
  description: "JellyNet privacy policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "1. Who We Are",
    body: `JellyNet ("we", "us", "our") is an API marketplace platform that enables suppliers to monetise API endpoints and AI agents to pay per request using stablecoin micropayments. This policy explains what data we collect, why, and how we protect it.`,
  },
  {
    title: "2. Data We Collect",
    body: `**Account data:** When you sign in with Google OAuth we receive your name, email address, and profile picture from Google. We store this in our database to identify your account.

**Usage data:** We log API calls made through our proxy layer including endpoint ID, timestamp, response status, and transaction hash. We do not log request or response bodies.

**Wallet addresses:** If you connect an existing wallet or generate one through our platform, we store the wallet address and (for generated wallets) an encrypted mnemonic phrase. Private keys and unencrypted mnemonics are never stored in plaintext.

**Payment data:** We record USDC transaction hashes, amounts, sender addresses, and timestamps as part of normal blockchain payment processing. This information is also publicly visible on-chain.

**Session data:** We use session cookies managed by NextAuth.js to keep you signed in. See our Cookie Policy for details.`,
  },
  {
    title: "3. How We Use Your Data",
    body: `We use the data we collect to:
- Authenticate your account and maintain sessions
- Route API calls through the proxy and verify payments
- Credit your balance and process withdrawal requests
- Show you your transaction history and earnings
- Diagnose technical issues and improve the platform
- Comply with legal obligations

We do not sell your data to third parties. We do not use your data for advertising.`,
  },
  {
    title: "4. Blockchain Transactions",
    body: `JellyNet processes payments on public blockchains. Transaction data including wallet addresses and amounts is permanently recorded on-chain and visible to anyone. This is inherent to how blockchain networks function and is outside our control once a transaction is submitted.`,
  },
  {
    title: "5. Data Sharing",
    body: `We share data only with:
- **Infrastructure providers:** Our hosting and database providers (Vercel, Railway) process data on our behalf under data processing agreements.
- **Blockchain nodes:** Transaction data is broadcast to public networks by necessity.
- **Law enforcement:** We may disclose data if required by law, regulation, or valid legal process.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your account data for as long as your account is active. Transaction and payment records are retained indefinitely for audit and compliance purposes. You may request deletion of your account and personal data by contacting us; note that on-chain transaction data cannot be deleted.`,
  },
  {
    title: "7. Security",
    body: `We encrypt sensitive data (API keys, wallet mnemonics) at rest using industry-standard symmetric encryption. Access to production databases is restricted to authorised personnel. Despite these measures, no system is completely secure and we cannot guarantee absolute security.`,
  },
  {
    title: "8. Your Rights",
    body: `Depending on your location, you may have rights to access, correct, or delete your personal data, or to object to certain processing. To exercise these rights, contact us at the address below. We will respond within 30 days.`,
  },
  {
    title: "9. Beta Disclaimer",
    body: `JellyNet is currently in beta and operates on testnet networks. Data collected during this period may be deleted or migrated when the platform moves to production. We will provide reasonable notice of any such changes.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this policy as the platform evolves. We will update the "Last Updated" date at the top of this page. For significant changes we will notify users via email or an in-app notice.`,
  },
  {
    title: "11. Contact",
    body: `For privacy-related questions or data requests, contact us at: privacy@jellynet.xyz`,
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" lastUpdated="April 2026" sections={sections} />;
}
