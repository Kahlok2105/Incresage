import React, { useEffect, useState } from "react";





export const UnlockToast: React.FC<{ feature: string | null }> = ({ feature }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (feature) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [feature]);

  if (!visible || !feature) return null;

  return (
    <div className="unlock-toast" role="alert">
      🎉 {feature.charAt(0).toUpperCase() + feature.slice(1)} feature unlocked!
    </div>
  );
};

