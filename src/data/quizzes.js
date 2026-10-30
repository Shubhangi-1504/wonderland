export const QUIZZES_DATA = {
  'technova-m1': {
    id: 'technova-m1',
    missionId: 'technova-m1',
    title: 'Become a Shareholder — Mastery Quiz',
    subtitle: 'Test your understanding of companies, shares, and equities.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'q1',
        topic: 'What a Company Is',
        question: 'What is a company at its fundamental core?',
        options: [
          'A physical building that only exists inside a stock market',
          'An organized group of people collaborating to provide products or services',
          'A government bank that sets annual tax rates',
          'A lottery ticket that promises guaranteed monthly profits',
        ],
        correctIndex: 1,
        explanation:
          'A company is an organization of people working together to provide valuable products (like smartphones or solar panels) or services (like cloud software or logistics) to solve customer problems.',
      },
      {
        id: 'q2',
        topic: 'What a Share Represents',
        question: 'When you purchase a share of stock in a business, what does that share represent?',
        options: [
          'A unit of legal fractional ownership in that company',
          'A short-term loan that the company must repay you next month',
          'A discount coupon valid only at company retail stores',
          'A donation given to the company with no rights attached',
        ],
        correctIndex: 0,
        explanation:
          'A share represents a true fractional unit of ownership. When you hold shares, you are legally a shareholder (part-owner) and share directly in the business’s financial success!',
      },
      {
        id: 'q3',
        topic: 'Why Companies Issue Shares',
        question: 'Why do ambitious companies issue shares to the public on an exchange like TechNova?',
        options: [
          'Because legal regulations forbid companies from earning revenue',
          'To raise capital (funds) to build gigafactories, hire engineers, and expand globally',
          'To avoid selling products or services to customers',
          'To transfer all operational debts permanently onto retail investors',
        ],
        correctIndex: 1,
        explanation:
          'Companies issue shares to raise equity capital from investors. This allows them to invest in expensive long-term growth (like clean energy research or factories) without taking on high-interest debt.',
      },
      {
        id: 'q4',
        topic: 'What it Means to be a Shareholder',
        question: 'Which of the following is true about your rights and experience as a shareholder?',
        options: [
          'You are required to work at the corporate office for 40 hours each week',
          'You own all company servers and can change employee passwords',
          'You participate in the company’s growth and may receive dividends from profits',
          'You are personally forced by banks to pay off company debts if sales decline',
        ],
        correctIndex: 2,
        explanation:
          'As a shareholder, you benefit from company prosperity: your shares can appreciate in market value, and you may receive dividend payments as your portion of company earnings, with limited liability.',
      },
      {
        id: 'q5',
        topic: 'Owning a Share vs Lending Money',
        question: 'How does owning a share fundamentally differ from lending money to a company (such as a bank loan)?',
        options: [
          'Shareholders are partial owners whose returns depend on company performance; lenders are creditors owed fixed repayment',
          'Lenders own the company, while shareholders merely lend money temporarily',
          'There is no difference whatsoever; stocks and bank loans are identical instruments',
          'Bank loans increase in market value whenever a company invents popular products',
        ],
        correctIndex: 0,
        explanation:
          'Lenders (creditors) receive a fixed interest repayment regardless of whether the business booms or stagnates. Shareholders, however, are equity partners: their investment value grows as the business succeeds, with no guaranteed payout if it falters.',
      },
    ],
  },
};
