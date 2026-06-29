"use client";
import { create } from "zustand";
import type { ReportForm } from "@/types";

interface ReportStore {
  step: number;
  formData: Partial<ReportForm>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFormData: (data: Partial<ReportForm>) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  step: 1,
  formData: {},
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
  reset: () => set({ step: 1, formData: {} }),
}));
