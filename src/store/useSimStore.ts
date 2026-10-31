/**
 * Zustand store for the simulation slice (Person C).
 *
 * This is the ONLY file that calls `create()` on `createSimSlice`.
 * Every component that needs simulation state imports from here.
 *
 * Keep this file minimal — all real logic lives in `src/store/simSlice.ts`
 * and `src/sim/`.
 */
import { create } from 'zustand';
import { createSimSlice, type SimSlice } from './simSlice';

export const useSimStore = create<SimSlice>()(createSimSlice);
