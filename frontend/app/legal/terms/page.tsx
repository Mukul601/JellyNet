import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service — JellyNet",
  description: "JellyNet terms of service — rules for using the platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using JellyNet ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. These terms apply to all users including API suppliers, consumers, and visitors.`,
  },
  {
    title: "2. Description of Service",
    body: `JellyNet is an API marketplace that allows:
- **Suppliers** to list API endpoints and earn USDC per request through the x402 payment protocol.
- **Consumers** (including AI agents and developers) to discover and call those endpoints by paying per request in USDC.

The Platform acts as an intermediary proxy and payment processor. We do not create, own, or operate the upstream APIs listed by suppliers.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least 18 years old to use the Platform. By using JellyNet you represent that you meet this requirement. The Platform is not available to users in jurisdictions where micropayment or cryptocurrency services are prohibited by law.`,
  },
  {
    title: "4. Account Registration",
    body: `You must sign in with a valid Google account to access supplier and payment features. You are responsible for all activity on your account. If you believe your account has been compromised, contact us immediately. We reserve the right to suspend accounts that violate these terms.`,
  },
  {
    title: "5. Payments and Fees",
    body: `**x402 Payments:** All payments on the Platform are made in USDC on supported blockchain networks. Payments are initiated by the consumer and verified on-chain by the proxy. Once confirmed on-chain, payments are final and non-refundable.

**Platform Fee:** JellyNet deducts a 10% platform fee from each payment before crediting the supplier's balance. The remaining 90% is credited to the supplier.

**Withdrawals:** Suppliers may withdraw their USDC balance to any compatible wallet address. Withdrawal requests are processed within a reasonable time. JellyNet does not guarantee specific processing times.

**No Chargebacks:** Due to the nature of blockchain transactions, there are no chargebacks or reversals. Consumers should verify they are calling the correct endpoint before attaching payment.`,
  },
  {
    title: "6. Supplier Responsibilities",
    body: `As a supplier you agree to:
- Only list APIs you have the legal right to resell or proxy.
- Not list APIs that facilitate illegal activity, CSAM, or violations of third-party terms of service.
- Maintain the availability and reliability of your upstream API to the best of your ability.
- Accurately describe your API in the listing (category, description, rate limits).
- Not attempt to manipulate health scores, transaction counts, or other platform metrics.`,
  },
  {
    title: "7. Consumer Responsibilities",
    body: `As a consumer you agree to:
- Not attempt to circumvent payment requirements or exploit x402 payment verification.
- Not use the Platform to conduct DDoS attacks, spam, or otherwise abuse listed APIs.
- Comply with the terms of service of any upstream API you call through the Platform.
- Maintain sufficient wallet balance before initiating calls to paid endpoints.`,
  },
  {
    title: "8. Intellectual Property",
    body: `JellyNet's platform, code, design, and brand are the property of JellyNet and its founders. Suppliers retain all rights to their upstream APIs. Consumers retain all rights to data they generate or retrieve. By listing an endpoint you grant JellyNet a licence to display its metadata (name, description, category) on the marketplace.`,
  },
  {
    title: "9. Disclaimer of Warranties",
    body: `The Platform is provided "as is" and "as available" without any warranty of any kind. JellyNet does not warrant that:
- The Platform will be uninterrupted, error-free, or secure.
- Any particular API listed on the marketplace will be available or accurate.
- Transactions will be processed within any specific time frame.

JellyNet is not responsible for the quality, legality, or reliability of upstream APIs listed by suppliers.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `To the maximum extent permitted by law, JellyNet and its founders shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to: loss of USDC or other digital assets, lost profits, failed transactions, or API downtime.

JellyNet's total liability in any circumstance shall not exceed the total platform fees paid by you in the 30 days preceding the claim.`,
  },
  {
    title: "11. Beta Status",
    body: `JellyNet is currently in beta. The Platform operates on testnet networks. Do not use mainnet funds or production API keys during the beta period. Features, APIs, and terms may change without notice. We may reset data, balances, or endpoints during the beta period.`,
  },
  {
    title: "12. Termination",
    body: `We may suspend or terminate your account at any time for violation of these terms. You may close your account at any time by contacting us. Upon termination, any pending balances will be processed for withdrawal at the address on file, if one has been set up.`,
  },
  {
    title: "13. Changes to Terms",
    body: `We may update these terms at any time. We will update the "Last Updated" date and, for material changes, notify users by email or in-app notice. Continued use of the Platform after changes constitutes acceptance of the new terms.`,
  },
  {
    title: "14. Governing Law",
    body: `These terms are governed by the laws of India. Any disputes arising from these terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka, India.`,
  },
  {
    title: "15. Contact",
    body: `For questions about these terms, contact us at: legal@jellynet.xyz`,
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of Service" lastUpdated="April 2026" sections={sections} />;
}
