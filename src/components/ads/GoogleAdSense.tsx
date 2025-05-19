
import { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  className?: string;
  style?: React.CSSProperties;
  format?: string;
  slot?: string;
  responsive?: boolean;
  layout?: string;
}

export function GoogleAdSense({
  className = '',
  style = {},
  format = 'auto',
  slot = '',
  responsive = true,
  layout = 'in-article'
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if window.adsbygoogle is available
    if (adRef.current && (window as any).adsbygoogle) {
      try {
        // Push the adsbygoogle command to display an ad
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    } else {
      console.log('AdSense not ready yet');
    }
  }, [adRef]);

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef as any}
        className="adsbygoogle"
        style={{
          display: 'block',
          overflow: 'hidden',
          ...style
        }}
        data-ad-client="ca-pub-5099055278802719"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-ad-layout={layout}
      />
    </div>
  );
}
