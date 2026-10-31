# Adding a District to MONEYVERSE

Districts represent thematic financial zones along the central 3D river path (e.g., Stock Market City, Investment Forest, IPO Island).

## Existing Extension Points

1. **3D Scene Layout (`src/scene/worldLayout.ts`)**:
   - `CAM_POSES`: Camera position and look-at keyframes (`pos`, `look`) along the -z axis.
   - `GATES_Z`: Transition thresholds between district zones.
   - Components live in `src/scene/components/` (e.g. `City.tsx`, `Forest.tsx`, `IPOIsland.tsx`).

2. **Domain Model (`src/types.ts`)**:
   - `Sector`: `'tech' | 'energy' | 'consumer' | 'finance' | 'health'`.
   - `Company`: Fictional businesses associated with the district's asset class.

3. **Application Routing (`src/App.tsx`)**:
   - Routes currently register `/` (`IntroPage`), `/world` (`WorldPage`), and `/portfolio` (`PortfolioPage`).

## How to Add a New District

Because a dynamic district registry does not exist yet, follow these steps:

1. **Create the 3D Stage**: Add `src/scene/components/<DistrictName>.tsx` and render it inside `src/scene/IntroScene.tsx`.
2. **Add Layout Keyframes**: Add camera pose in `CAM_POSES` and gate coordinate in `GATES_Z` in `src/scene/worldLayout.ts`.
3. **Create the District Page**: Create `src/<district>/<District>Page.tsx` using `<SimulatedBadge />` for any financial figures.
4. **Register the Route**: Add `<Route path="/<district>" element={<DistrictPage />} />` inside `<Routes>` in `src/App.tsx`.
5. **Update Navigation**: Add `<Link to="/<district>">` in `NavBar` within `src/App.tsx`.

