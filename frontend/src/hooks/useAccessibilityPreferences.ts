import { useEffect, useMemo, useState } from "react";

export type TextScale = "normal" | "large" | "xlarge";
export type ColorVisionMode = "normal" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia";

export type AccessibilitySettings = {
  textScale: TextScale;
  highContrast: boolean;
  colorVisionMode: ColorVisionMode;
};

const storageKey = "leasing-accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  textScale: "normal",
  highContrast: false,
  colorVisionMode: "normal"
};

export function useAccessibilityPreferences() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") {
      return defaultSettings;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return defaultSettings;
    }

    try {
      return { ...defaultSettings, ...JSON.parse(stored) } as AccessibilitySettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textScale = settings.textScale;
    root.dataset.contrast = settings.highContrast ? "high" : "normal";
    root.dataset.colorVision = settings.colorVisionMode;
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  const actions = useMemo(() => ({
    setTextScale: (textScale: TextScale) => setSettings((current) => ({ ...current, textScale })),
    toggleHighContrast: () => setSettings((current) => ({ ...current, highContrast: !current.highContrast })),
    setColorVisionMode: (colorVisionMode: ColorVisionMode) => setSettings((current) => ({ ...current, colorVisionMode })),
    reset: () => setSettings(defaultSettings)
  }), []);

  return {
    settings,
    ...actions
  };
}
