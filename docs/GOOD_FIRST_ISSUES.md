# Good First Issues

Looking to contribute to MONEYVERSE? Here are 8 well-scoped starter tasks across the codebase:

1. **Add a New Quiz Question**
   - **File**: `src/ai/quiz/questionBank.ts`
   - **Task**: Add 2-3 beginner questions covering topics such as `"ipo"`, `"mutual-funds"`, or `"risk"`.
   - **Verification**: Run `npm test src/ai/quiz/questionBank.test.ts`.

2. **Translate Financial Glossary Terms**
   - **File**: `src/ai/glossary.ts` and `src/ai/glossary.md`
   - **Task**: Add Spanish (or other language) descriptions or expand English explanations for key terms like "Dividend", "Liquidity", or "ETF".

3. **Add IPO Island Placeholder District**
   - **Files**: `src/scene/components/IPOIsland.tsx`, `src/App.tsx`, `src/scene/worldLayout.ts`
   - **Task**: Create an `/ipo` route and link it from the top navigation to showcase the existing 3D IPO Island scene.

4. **Add a New Market Crash Scenario**
   - **File**: `src/sim/scenarios.ts`
   - **Task**: Define an energy-specific market shock (`ENERGY_CRUNCH`) using `CrashScenario` with sector shocks and beginner-friendly explanations.
   - **Verification**: Run `npm test src/sim/__tests__/`.

5. **Improve Accessibility (a11y) Labels**
   - **Files**: `src/components/shared/SimulatedBadge.tsx`, `src/ai/ChatPanel.tsx`
   - **Task**: Audit aria labels, role attributes, and keyboard focus outlines so screen readers announce simulated data notes accurately.

6. **Add Unit Tests for Scenario Explanations**
   - **File**: `src/ai/explainScenario.test.ts`
   - **Task**: Add unit tests for edge cases where a user holds only one defensive stock during an asymmetric market crash.

7. **Mount Simulated Badges on Portfolio Screen**
   - **File**: `src/portfolio/PortfolioPage.tsx`
   - **Task**: Mount `<SimulatedBadge />` in the header and `<DataSourceFootnote />` under the holdings summary table.

8. **Add Input Validation Tests for Serverless Proxy**
   - **File**: `api/chat.test.ts`
   - **Task**: Add tests verifying handling of unusual payload encodings and empty message arrays.

