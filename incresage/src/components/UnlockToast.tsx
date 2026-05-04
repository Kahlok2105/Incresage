import React, { useEffect, useState } from "react";

export const UnlockToast: React.FC<{ unlockedFeatures: string[] }> = ({ unlockedFeatures }) => {
  const [visible, setVisible] = useState(false);
  const [lastFeature, setLastFeature] = useState<string | null>(null);

  useEffect(() => {
    // When unlockedFeatures length increases, capture the newly added feature.
    const features = unlockedFeatures;
    if (features.length) {
      const stored = (lastFeature && features.includes(lastFeature)) ? lastFeature : null;
      if (!stored) {
        // Assume the last element is the newest unlock.
        const newFeature = features[features.length - 1];
        setLastFeature(newFeature);
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [unlockedFeatures]);

  if (!visible || !lastFeature) return null;

  return (
    <div className="unlock-toast" role="alert">
      🎉 {lastFeature.charAt(0).toUpperCase() + lastFeature.slice(1)} feature unlocked!
    </div>
  );
};