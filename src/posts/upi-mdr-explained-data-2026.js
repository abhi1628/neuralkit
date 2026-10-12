// src/posts/upi-mdr-explained-data-2026.js
const post = {
  slug: "upi-mdr-explained-data-2026",
  title: "UPI's New MDR, Explained With Data: What the Fee Is, What UPI Actually Costs, and Who Has Been Paying",
  date: "October 12, 2026",
  readTime: "15 min read",
  category: "Fintech",
  categoryColor: "#2563eb",
  excerpt: "From October 15, 2026, some UPI merchant payments carry a 0.4% fee. Not a tax, not a charge on you — but not nothing either. Here is what MDR is, what a UPI transaction really costs to run, who has been absorbing that cost since 2020, and what the numbers can and cannot tell us.",
  coverEmoji: "💸",
  tags: ["UPI", "MDR", "Fintech", "Payments", "NPCI", "Data Analysis", "India"],
  content: [
    {
      type: "intro",
      text: "Take a ₹3,000 payment to a shop through UPI. Until October 14, 2026, the shop received ₹3,000 and the payment cost it nothing. From October 15, if that shop falls in the charged category, it receives ₹2,988 and ₹12 is split among the banks and apps that moved the money. You still pay exactly ₹3,000. That ₹12 is called MDR, and it has produced one of the loudest debates in Indian fintech this year. This article does not take a side. It does what a data person should do with a contested policy: define the terms, find the numbers, check whether the numbers agree with each other, and mark clearly where they do not. Everything below is based on official documents (the Department of Financial Services FAQ of September 15, 2026, the NPCI framework, PIB releases) and published reporting, as of October 12, 2026. The rules take effect in three days and a public interest petition is already before the Supreme Court, so details may change."
    },
    {
      type: "h2",
      text: "What Is MDR, in Plain Language?"
    },
    {
      type: "p",
      text: "MDR stands for Merchant Discount Rate. It is the small percentage a merchant gives up when a customer pays digitally. The word 'discount' is slightly misleading: nobody gives the customer a discount. It means the merchant receives the sale amount minus a small cut. Think of it as the toll on the road between your bank account and the shop's bank account."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "You pay, the app sends the request", text: "You scan a QR code and approve with your PIN. The UPI app (PhonePe, Google Pay, Paytm, a bank app) sends the instruction through NPCI's switch. The app's partner bank is called the Payment Service Provider (PSP) bank." },
        { num: "2", title: "Your bank checks and debits", text: "Your bank is the 'issuer' or remitter. It verifies your balance and PIN, runs fraud checks, and debits you. It keeps this infrastructure running 24x7: servers, security, dispute handling." },
        { num: "3", title: "The merchant's bank credits", text: "The merchant's bank is the 'acquirer'. It credits the merchant, handles QR onboarding, settlement, and merchant support." },
        { num: "4", title: "MDR is how those costs are shared", text: "MDR is the fee, paid by the merchant, that is then divided among these participants. It is not collected by the government or NPCI. The Finance Ministry and NPCI both state this explicitly. What the government did was change the law so that the Centre can decide which payment modes may carry charges, and then notify the framework." }
      ]
    },
    {
      type: "callout",
      icon: "🧾",
      text: "Three things MDR is not: it is not a tax (the government does not receive it), it is not a fee on the customer (merchants are barred from passing it on, and UPI apps are barred from adding platform fees), and it is not new to Indian payments (cards have charged it for decades, and UPI itself charged it in its early years before the zero-MDR rule of January 1, 2020)."
    },
    {
      type: "h2",
      text: "Why Is MDR Needed? Start With the Cost Per Transaction"
    },
    {
      type: "p",
      text: "A UPI transaction feels free because nobody at the counter pays for it. But servers, bandwidth, fraud systems, customer support and bank technology all cost money. The cleanest way to see the problem is to divide cost by volume. In FY26, UPI processed about 241.6 billion transactions worth ₹314 lakh crore. The industry estimate, quoted by NPCI in its FAQ, is that running UPI costs around ₹20,000 crore a year."
    },
    {
      type: "code-block",
      label: "Back-of-envelope: cost per UPI transaction vs. what the subsidy covers (my arithmetic on published figures)",
      code: "# Inputs: FY26 volume/value (PIB), cost estimate (NPCI FAQ, industry-sourced),\n# FY27 budgeted incentive (Union Budget 2026-27)\ntxns_fy26   = 241.6e9      # transactions\nvalue_fy26  = 314e12       # rupees  (Rs 314 lakh crore)\nannual_cost = 20_000e7     # rupees  (Rs 20,000 crore)\nsubsidy_fy27 = 2_000e7     # rupees  (Rs 2,000 crore)\n\navg_ticket      = value_fy26 / txns_fy26        # ~ Rs 1,300\ncost_per_txn    = annual_cost / txns_fy26       # ~ Rs 0.83 (83 paise)\ncost_pct_value  = annual_cost / value_fy26*100  # ~ 0.064 % of value\nsubsidy_per_txn = subsidy_fy27 / txns_fy26      # ~ Rs 0.08 (8 paise)\ncoverage        = subsidy_fy27 / annual_cost*100 # ~ 10 %\n\ndef upi_mdr(amount):\n    # standard category: 0 up to Rs 2,000; 0.4 % above; capped at Rs 300\n    if amount <= 2000:\n        return 0.0\n    return min(0.004 * amount, 300.0)\n\nfor a in [1500, 3000, 10000, 75000, 100000]:\n    fee = upi_mdr(a)\n    print(a, fee, round(fee / a * 100, 2), '%')\n# 1500 -> 0 | 3000 -> 12 (0.4 %) | 10000 -> 40 (0.4 %)\n# 75000 -> 300 (0.4 %) | 100000 -> 300 (0.3 %, the cap bites)\n\n# Takeaway: cost is roughly per-transaction (~83 paise average), fee is\n# per-value (0.4 %). That mismatch is the whole design problem."
    },
    {
      type: "p",
      text: "Two things stand out. First, the cost is roughly proportional to the number of transactions, not their value: it takes about the same servers and fraud checks to move ₹50 as ₹50,000. Second, the average ticket is shrinking. The RBI's payment systems report puts it at ₹1,848 in 2021 and ₹1,313 in 2025, and August 2026 data shows about ₹1,217. That is a 34% fall in five years. When volume compounds and ticket size falls, costs grow with the transaction count while any revenue tied to value does not keep pace. This is the core of the argument made by the Finance Ministry, NPCI, the RBI and a Parliamentary Standing Committee."
    },
    {
      type: "callout",
      icon: "⚠️",
      text: "A caution on the ₹20,000 crore figure: it is an industry estimate, not an audited number, and published estimates differ. The Payments Council of India said around ₹10,000 crore in March 2025. NPCI's FAQ says about ₹20,000 crore. A Parliamentary committee cited ₹20,700 crore in August 2026. An older RBI discussion paper (2022) estimated that an ₹800 merchant payment cost participants about ₹2. Per-transaction cost therefore ranges from roughly 83 paise (system-wide average, my calculation) to about ₹2 (merchant payment, RBI 2022) depending on what is counted and when. The honest summary: the cost is real and large, but its exact size is not independently verified."
    },
    {
      type: "h2",
      text: "How Much Will It Actually Cost? The Rate Card"
    },
    {
      type: "versions-table",
      rows: [
        { version: "P2P (person to person)", released: "Any amount", status: "Free", highlight: "Sending money to family, friends, self-transfers. No charge to sender or receiver, as the Finance Ministry FAQ states." },
        { version: "P2M up to ₹2,000", released: "Standard merchants", status: "Free", highlight: "Per the FAQ, this band is more than 95% of P2M transaction volume. Chai, groceries, auto rides, daily shopping." },
        { version: "P2M above ₹2,000", released: "Standard category", status: "0.4%", highlight: "Example: ₹3,000 pays ₹12; ₹50,000 pays ₹200. Paid by the merchant, not the customer." },
        { version: "P2M ₹75,000 and above", released: "Standard category", status: "₹300 cap", highlight: "The fee stops at ₹300. A ₹1,00,000 payment pays ₹300 (0.3%), not ₹400." },
        { version: "Fuel, railways, telecom, insurance, utilities", released: "Industry programme categories", status: "₹5 flat", highlight: "Above ₹2,000, a flat ₹5 per transaction instead of a percentage. Utility and education payments up to ₹2,000 are free." },
        { version: "Mutual funds, securities, brokers", released: "Capital markets", status: "0.02%, cap ₹300", highlight: "A much lower rate, designed for retail investing flows." },
        { version: "Small merchants (P2PM)", released: "Up to ₹1 lakh/month via QR", status: "Zero MDR", highlight: "No GST registration needed to qualify. Moves to the standard category if inflows stay above ₹1 lakh for 3 consecutive months." },
        { version: "AutoPay mandates, RuPay debit", released: "Recurring payments; RuPay debit cards", status: "No MDR", highlight: "Recurring UPI AutoPay carries no prescribed MDR. RuPay credit cards linked to UPI follow separate credit-product rules." }
      ]
    },
    {
      type: "p",
      text: "How does that compare with cards? The FAQ states that standard credit card MDRs typically range from 1.5% to 2.5% and debit card MDRs are capped up to 0.90%. Apply those to the same ₹3,000 purchase: UPI costs the merchant ₹12, a debit card up to ₹27, and a credit card ₹45 to ₹75. On ₹10,000 the figures are ₹40 for UPI against up to ₹90 (debit) and ₹150 to ₹250 (credit). By this yardstick UPI remains the cheapest digital payment mode a merchant can accept. Whether it is cheap enough for a particular merchant's margin is a separate question, and one the data below helps frame."
    },
    {
      type: "h2",
      text: "The Data View: Who Actually Pays?"
    },
    {
      type: "p",
      text: "The most useful statistic in this whole debate is a distribution, not an average. Payments above ₹2,000 are only about 4% of merchant transactions by count, but about 68% of merchant transaction value (JM Financial's July data; Jefferies puts the value share at 67% for the last financial year). The Finance Ministry itself says about 96% of merchant transactions are unaffected. Goldman Sachs estimates that about 48% of merchant value will pay the full 0.4%. Merchant payments are about 63% of all UPI volume, spread across roughly 65 million merchants and 731 million QR codes."
    },
    {
      type: "p",
      text: "In statistical terms this is a heavy-tailed distribution: a small number of large transactions carries most of the value. A threshold fee on the tail raises most of the revenue while touching very few transactions. That is the design logic. It also shows the risk: the revenue depends on a thin slice of transactions, so behaviour change in that slice (a shift to cash, cards or bank transfers for large payments) matters far more than behaviour change among small payments."
    },
    {
      type: "code-block",
      label: "Sanity check: do the revenue forecasts match the distribution? (my arithmetic, rough)",
      code: "# Merchant share of UPI volume: ~63 %; charged share of merchant txns: ~4 %\nmerchant_txns = 0.63 * 241.6e9            # ~152 billion\ncharged_txns  = 0.04 * merchant_txns      # ~6.1 billion\n\n# Published annual revenue-pool estimates (analysts, via Business Standard):\n#   Jefferies Rs 15,000-18,000 cr | Citi Rs 16,000-17,000 cr | Goldman Rs 20,600 cr\nfor pool_cr in [15_000, 20_600]:\n    pool = pool_cr * 1e7\n    fee_per_charged_txn = pool / charged_txns        # Rs 25 to Rs 34\n    implied_ticket = fee_per_charged_txn / 0.004     # Rs 6,200 to Rs 8,500\n    print(pool_cr, round(fee_per_charged_txn), round(implied_ticket))\n\n# Reading: the forecasts imply an average charged ticket of roughly\n# Rs 6,000-8,500 -- plausible for a tail that starts at Rs 2,000 and runs to\n# lakhs. The forecasts are internally consistent, but they assume today's\n# behaviour continues. They are scenarios, not measurements.\n# Caveats: flat Rs 5 categories, 0.02 % capital-market flows and the P2PM\n# exemption all lower the real average; the 4 % share is a July snapshot."
    },
    {
      type: "h2",
      text: "Who Has Been Bearing the Cost Until Now?"
    },
    {
      type: "p",
      text: "Zero MDR was a legal requirement, not a market outcome. Section 10A of the Payment and Settlement Systems Act, inserted in 2019, barred banks and system providers from charging for the electronic modes the tax department prescribed. UPI, UPI QR codes and RuPay debit cards were prescribed with effect from January 1, 2020. After that, the cost of running UPI fell on three groups: the banks and payment apps that absorbed it, the government through a budgetary incentive scheme, and (indirectly) the wider ecosystem through slower investment."
    },
    {
      type: "versions-table",
      rows: [
        { version: "FY 2021-22", released: "Incentive scheme (RuPay debit + UPI)", status: "₹1,389 crore", highlight: "First year of the scheme after zero MDR began." },
        { version: "FY 2022-23", released: "Incentive scheme", status: "₹2,210 crore", highlight: "Scheme outlay approved at ₹2,600 crore; ₹2,210 crore reported paid." },
        { version: "FY 2023-24", released: "Incentive scheme", status: "₹3,631 crore", highlight: "The peak. This is the highest budgetary payout to date." },
        { version: "FY 2024-25", released: "Incentive scheme (small merchants only)", status: "About ₹2,000 crore", highlight: "Initial allocation ₹1,441 crore, revised up. Cabinet scheme outlay was ₹1,500 crore at 0.15% on small-merchant payments up to ₹2,000. Sources report slightly different final figures (about ₹1,923 to ₹2,000 crore)." },
        { version: "FY 2025-26", released: "Incentive scheme", status: "₹437 crore → ₹2,196 crore", highlight: "Budgeted at ₹437 crore, then raised sharply to about ₹2,196 crore." },
        { version: "FY 2026-27", released: "Incentive scheme (budgeted)", status: "₹2,000 crore", highlight: "About 8.9% below the revised FY26 figure." }
      ]
    },
    {
      type: "p",
      text: "Two features of this series matter for a data reader. First, volatility: the allocation swung from ₹3,631 crore to ₹437 crore (budget stage) and back to about ₹2,200 crore within three years, which makes long-term infrastructure planning hard. Second, coverage: the DFS told the Parliamentary Standing Committee that the incentive covered only about 11% of industry costs and 14% of the potential MDR. My own check agrees: ₹2,000 crore against ₹20,000 crore is 10%, or about 8 paise per transaction against a cost of about 83 paise. Also note the scheme's design: it only ever paid on small-merchant payments up to ₹2,000. Payments above ₹2,000 received no incentive, which is the same boundary the new MDR uses."
    },
    {
      type: "callout",
      icon: "🏦",
      text: "Axis Bank's CEO said publicly in August 2025 that banks are not paid for providing the pipes for UPI, and the RBI Governor said around the same time that UPI is not free even now because someone is paying for it. Those are statements of the people who run the system, so treat them as informed but interested. The independent data point is the arithmetic above: a 10% subsidy coverage ratio means about 90% of the estimated cost was absorbed by the industry."
    },
    {
      type: "h2",
      text: "Where Does the Fee Go?"
    },
    {
      type: "p",
      text: "Not to the government. According to the worked example reported by Business Standard, on a ₹10,000 payment the ₹40 fee is divided as ₹16 to the customer's bank (issuer), ₹12 to the merchant's bank (acquirer), ₹8 to the UPI app, and ₹4 to the PSP bank. The framework also directs a share (reported as 5% of the total) to a dedicated fund for small-merchant onboarding and incentives, especially in Tier 3 to 6 centres, the North-East, J&K and Ladakh. The detailed design of that fund is to be finalised with the RBI within three months of the FAQ, so it is not yet known how it will be operated. I have not reconciled how the 5% fits with the four-way split in that example, so treat the exact split as reported, not final."
    },
    {
      type: "h2",
      text: "Is This About Foreign Cards? What the Record Shows"
    },
    {
      type: "p",
      text: "You will see this claim in the debate, so it is worth separating what is documented from what is argued. The MDR is a fee on UPI, a domestic system run by NPCI. Visa and Mastercard are not part of the UPI payment chain, and the fee is shared among Indian banks and apps."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "What the government says", text: "The Finance Ministry (DFS) said on September 17 that the NPCI circular of September 15 does not allow credit transactions on UPI by any credit card other than RuPay, that this is a deliberate policy to make RuPay credit the preferred card, and that the MDR decision was not taken under US pressure. It also said RuPay debit remains free of MDR regardless of value." },
        { num: "2", title: "Where the question came from", text: "The US Trade Representative's 2026 report raised concerns about US payment providers being unable to take part in UPI, including credit transactions, on terms equal to RuPay. Some opposition parties, including the Congress, alleged the MDR was linked to US pressure. The ministry called that claim false." },
        { num: "3", title: "A counter-argument on who benefits", text: "The think tank GTRI has argued that dominant foreign-owned apps could benefit most from the fee. The data to test this exists only partly. In August, PhonePe handled about 45.9% of UPI transactions and Google Pay about 32.4% (together about 78%). If the app share of the example split (₹8 of ₹40, or 20%) were divided in proportion to volume, those two apps would receive roughly 16% of the fee pool. That is my illustration under a simplifying assumption, not a reported figure, since actual app-level sharing terms are not public." },
        { num: "4", title: "What a data reader should conclude", text: "On the narrow question of foreign cards, the documents say the framework does not open UPI credit to foreign card networks. On the broader question of foreign-owned apps, the concern is a stated argument with partial supporting data, and the market-share cap that could limit it has been deferred to December 31, 2026. Both statements can be true at once." }
      ]
    },
    {
      type: "h2",
      text: "What the Data Cannot Tell Us Yet"
    },
    {
      type: "do-dont",
      items: [
        { do: "Check the denominator. '4% of transactions are charged' and '68% of merchant value is charged' are both correct and describe the same fact. The first sounds small; the second sounds large. Ask which one the argument needs.", dont: "Quote one share without the other. A claim that 'only 4% pay' and a claim that 'two-thirds of value pays' can both be accurate and still mislead if used alone." },
        { do: "Treat revenue forecasts (₹15,000 to ₹20,600 crore a year) as scenarios. They assume current behaviour continues and that merchants absorb the fee.", dont: "Treat them as measured outcomes. They come from brokerages' models, not from observed post-October data." },
        { do: "Watch behaviour in the above-₹2,000 band after October 15: cash share, card share, UPI share, and whether merchants split bills or nudge customers. This is where the policy will be tested.", dont: "Judge the policy by sentiment surveys alone. A LocalCircles survey found 41% of merchants refusing any charge and 17% willing to bear 0.4%; a separate consumer survey found 53% would switch from UPI if costs were passed on. But the law bars pass-through, and stated intentions are not observed behaviour." },
        { do: "Track average ticket size. If it keeps falling from ₹1,217, the charged slice shrinks over time, and the revenue the fee was designed to raise erodes with it.", dont: "Assume the threshold of ₹2,000 is permanent. It is a policy parameter set by the UPI Steering Committee chaired by NPCI, and parameters get revised." }
      ]
    },
    {
      type: "h2",
      text: "The Bottom Line"
    },
    {
      type: "p",
      text: "Here is the plain version. UPI is not free to run: estimates put the annual cost between ₹10,000 and ₹20,700 crore, with ₹20,000 crore being the figure NPCI cites. Since 2020, banks and apps carried most of it, helped by a government incentive that peaked at ₹3,631 crore, fell to ₹437 crore at the FY26 budget stage, and sits at ₹2,000 crore for FY27, covering roughly a tenth of the estimated cost. From October 15, 2026, the new framework asks merchants to pay a capped fee on payments above ₹2,000: 0.4% for most, ₹5 flat for fuel, railways, telecom, insurance and utilities, and 0.02% for capital markets. P2P transfers, payments up to ₹2,000, small merchants under ₹1 lakh a month, and AutoPay stay free."
    },
    {
      type: "p",
      text: "Reasonable people disagree on whether this is the right design. Supporters point to cost-per-transaction arithmetic, the funding volatility of annual subsidies, and the fact that UPI's fee remains well below card rates. Critics point to the risk of a shift back to cash for large payments, the burden on mid-sized merchants with thin margins, the earlier government statements that no MDR was planned, and the concentration of the app market. The data supports some of each argument. What it cannot yet do is tell us which effect will be larger, because the first real observations arrive after October 15. That is the number worth watching."
    },
    {
      type: "p",
      text: "Sources used: Department of Financial Services FAQ on MDR for select UPI P2M transactions (September 15, 2026); PIB releases on the incentive scheme and UPI statistics; Union Budget 2026-27 coverage (Business Standard); Business Standard reporting on the revenue estimates and fee split; Forbes (Zennon Kapron, September 27, 2026) for the legislative timeline, market shares and survey figures; Finance Ministry statement on US pressure claims (via PTI, September 17, 2026). Figures were gathered on October 12, 2026 and may change as the framework is implemented. Please verify against the original documents before relying on any number for business or financial decisions."
    }
  ]
};

export default post;
