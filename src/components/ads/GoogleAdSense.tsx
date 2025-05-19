
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
    try {
      // Wait a moment to ensure the element is in the DOM
      const timer = setTimeout(() => {
        if (adRef.current && (window as any).adsbygoogle) {
          console.log('AdSense loading for slot:', slot);
          // Push the adsbygoogle command to display an ad
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } else {
          console.log('AdSense not ready yet or element not found');
        }
      }, 200); // Increased timeout to ensure the element is fully rendered
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [slot, adRef]);

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
