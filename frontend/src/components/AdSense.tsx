import React, { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidth = true,
  style = {}
}) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-9261420035824805"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidth.toString()}
    />
  );
};

export default AdSense;
