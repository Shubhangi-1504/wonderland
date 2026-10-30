/**
 * Glossary text as a plain string for the serverless function.
 * Vercel bundles /api with its own toolchain, which does not understand Vite's
 * `?raw` imports, so the Markdown source is mirrored here.
 * Source of truth: ./glossary.md — keep both copies identical.
 */
export const GLOSSARY_MARKDOWN = `# Glossary

- **Stock**: A share of ownership in a company. Owning stock means you own a small piece of that business.
- **Share**: One unit of ownership in a company; a company splits ownership into many shares. If a company has 100 shares and you own 10, you own 10%.
- **Market cap**: The total value of a company's shares, calculated as price × number of shares. A large market cap usually means a big, established company.
- **Bull market**: A long stretch when prices are mostly rising and investors feel optimistic. The bull is named for pushing upward with its horns.
- **Bear market**: A long stretch when prices are mostly falling, often by 20% or more. The bear is named for swiping downward with its paws.
- **Volatility**: How much an investment's price swings up and down over time. High volatility means bigger, faster moves in both directions.
- **Diversification**: Spreading money across different investments so one bad result does not sink everything. It is the "don't put all your eggs in one basket" idea.
- **Sector**: A group of companies that do similar business, such as tech, energy, finance or health. Different sectors can react differently to the same news.
- **Portfolio**: The collection of investments you own, plus cash, viewed as one whole. Its value is the sum of what each part is worth.
- **Profit and loss**: Profit is what you gain when you sell for more than you paid; loss is what you lose when you sell for less. Unrealized profit or loss is the change in value before you sell.
- **Risk vs return**: Higher potential returns usually come with a higher risk of loss. Safer investments tend to grow more slowly.
- **Mutual fund**: A pool of money from many investors, managed by professionals who buy a mix of investments. Each investor owns a slice of the whole pool.
- **SIP**: A systematic investment plan: investing a fixed amount on a regular schedule, such as every month. It builds discipline and averages out your purchase price.
- **IPO**: Initial public offering — the first time a private company sells shares to the public. After that, its shares can trade on a stock exchange.
- **Issue price**: The price at which shares are sold to investors during an IPO. It is set before trading starts, by the company and its bankers.
- **Listing price**: The first price a stock trades at on the exchange after its IPO. It can be higher or lower than the issue price.
- **Index**: A basket of stocks used to track how a whole market or a section of it is doing. An index might, for example, follow the largest 100 companies.
- **Market crash**: A sudden, steep drop in prices across many stocks in a short time. Crashes are often driven by fear, though markets have historically recovered over long periods.
`;
