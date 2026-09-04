export const metadata = {
  title: 'Privacy Policy',
  description: 'How Satwik Farms collects, uses and protects your information when you use our website, order online, use our mobile app or contact us.',
  alternates: {
    canonical: 'https://satwikfarms.com/privacy',
  },
  openGraph: {
    type: 'website',
    url: 'https://satwikfarms.com/privacy',
    title: 'Privacy Policy - Satwik Farms',
    description: 'How Satwik Farms collects, uses and protects your information.',
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '4 September 2026';

const sections = [
  {
    heading: 'Who we are',
    paragraphs: [
      'Satwik Farms ("we", "our", "us") is a residue-free farm in Kisarawe, Pwani, Tanzania, delivering fresh produce, dairy and groceries to customers in Dar es Salaam. This policy covers our website at satwikfarms.com, the online shop at satwikfarms.com/order, the Satwik Farms mobile app for Android and iPhone, and the ways you contact us.',
      'We handle personal information in line with the Personal Data Protection Act, 2022 of the United Republic of Tanzania. Where we act as a controller of your data, this policy tells you what we collect, why, and what your choices are.',
    ],
  },
  {
    heading: 'What we collect when you order',
    bullets: [
      'Your name, phone number and delivery address, so we can deliver to you and call you about your order.',
      'Your email address, if you choose to give it, for order confirmations.',
      'Delivery notes you type, such as directions to your gate.',
      'The items you ordered, prices, any promo code you used, and the date and time of the order.',
      'Your order history, so you can see past orders in the app and reorder.',
    ],
  },
  {
    heading: 'What we collect automatically',
    bullets: [
      'On the website and online shop: page views and anonymous counts of steps such as "added to cart" and "order placed". These counters contain no names, phone numbers or product details. We use Vercel Analytics, which sets no cookies.',
      'On the mobile app: the app version and device type sent with each order, and crash and usage diagnostics provided by the Google Play and Apple App Store platforms.',
      'Your internet address, used briefly to protect the ordering service from automated abuse. It is not stored with your order.',
      'When you place a web order, a Cloudflare Turnstile check confirms you are a person and not a script. Cloudflare\'s privacy policy applies to that check.',
    ],
  },
  {
    heading: 'How we use your information',
    bullets: [
      'To take, prepare, invoice and deliver your orders, and to contact you if something about an order needs confirming.',
      'To keep accurate business and accounting records.',
      'To answer your questions and resolve problems with an order.',
      'To understand how the shop and app are used, so we can improve them.',
      'To detect and prevent fraud, duplicate orders and abuse of the ordering service.',
    ],
    paragraphs: ['We do not sell your personal information, and we do not use it for advertising.'],
  },
  {
    heading: 'Where your information is stored and who processes it',
    paragraphs: ['We use a small number of trusted service providers to run the shop. They process your information only on our instructions and under their own privacy and security commitments:'],
    bullets: [
      'Accu360, our business and invoicing system, where customer records, orders and invoices are kept.',
      'Render (backend hosting) and Neon (database hosting) in the United States, which run the service that receives your order and passes it to our business system.',
      'Vercel, which hosts this website and the online shop.',
      'Upstash, which holds short-lived rate-limit counters and the anonymous usage counters described above.',
      'Cloudinary, which serves product photographs.',
      'Google, whose Sheets and Apps Script services hold our product catalogue and prices, and whose sign-in service is used by our staff to access internal tools.',
      'WhatsApp, if you choose to message us there. WhatsApp\'s own privacy policy applies to messages sent on its platform.',
    ],
    paragraphs2: ['Some of these providers are outside Tanzania. We choose providers with strong security practices and transfer only what is needed to fulfil your order.'],
  },
  {
    heading: 'Information stored on your device',
    bullets: [
      'The online shop remembers your name, phone number and address in your browser\'s local storage, so you do not have to type them again. It also remembers your cart and saved items. Clearing your browser data removes this.',
      'The mobile app stores your details, cart, favourites and order history on your phone. Uninstalling the app removes this.',
      'The website itself does not use tracking or advertising cookies. A sign-in cookie is set only for authorised Satwik Farms staff using our internal dashboard.',
    ],
  },
  {
    heading: 'Our staff dashboard',
    paragraphs: [
      'Authorised Satwik Farms staff use an internal dashboard on this website to see sales, orders and delivery problems. Staff sign in with Google. From Google we receive the staff member\'s name and email address, which we use only to check that they are on our access list and to keep a log of sign-ins. Customer information shown to staff there is the same information used to fulfil your orders.',
    ],
  },
  {
    heading: 'How long we keep information',
    paragraphs: [
      'Order and invoice records are kept for as long as our accounting and tax obligations require. Delivery notes and contact details are kept while you remain a customer so that reorders and deliveries work smoothly. Anonymous usage counters are kept for about thirteen months so we can compare one year with the next.',
    ],
  },
  {
    heading: 'Your choices and rights',
    bullets: [
      'You can ask us what information we hold about you, ask us to correct it, or ask us to delete it where we are not required to keep it for accounting or legal reasons.',
      'You can order without an email address, and you can use the shop without saving your details by clearing your browser data afterwards.',
      'You can stop using the mobile app at any time by uninstalling it.',
    ],
    paragraphs: ['To exercise any of these, contact us using the details below. We will respond within a reasonable time and may ask you to confirm your identity first.'],
  },
  {
    heading: 'Children',
    paragraphs: ['Our services are intended for adults ordering groceries for their households. We do not knowingly collect information from children under 13. If you believe a child has given us personal information, contact us and we will delete it.'],
  },
  {
    heading: 'Security',
    paragraphs: ['Orders travel over encrypted connections, our systems are protected by access keys and rate limits, and only staff who need customer details to fulfil orders can see them. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work to protect your information and to fix problems quickly when they are found.'],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [`We may update this policy as our services change. The date at the top of this page shows when it was last revised. This version replaces the earlier policy published for the mobile app. Last updated: ${LAST_UPDATED}.`],
  },
  {
    heading: 'Contact us',
    paragraphs: ['Satwik Farms, Kisarawe, Pwani, Tanzania. Phone and WhatsApp: +255 767 211 422. You can also reach us through the contact details in the footer of this website.'],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5016] via-[#68B030] to-[#2D5016]">
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            How we look after your information when you order from Satwik Farms, use our app, or get in touch.
          </p>
          <p className="mt-4 text-white/70">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-12 px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section) => (
            <div key={section.heading} className="farm-glass rounded-2xl p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 border-b border-white/20 pb-4">
                {section.heading}
              </h2>
              {section.paragraphs?.map((text) => (
                <p key={text} className="text-white/85 leading-relaxed mb-4">{text}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-3 mb-4">
                  {section.bullets.map((text) => (
                    <li key={text} className="border-l-4 border-[#98D84E] pl-4 text-white/85 leading-relaxed">{text}</li>
                  ))}
                </ul>
              )}
              {section.paragraphs2?.map((text) => (
                <p key={text} className="text-white/85 leading-relaxed">{text}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
