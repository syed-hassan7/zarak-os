import { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import App from '../../App';

/**
 * Renders the full SZH_OS application onto the 3D monitor screen
 * using Drei's <Html> component as a portal from DOM → WebGL space.
 *
 * CRITICAL FIX: We use the `portal` prop to render the Html content
 * into a separate DOM container appended to document.body rather than
 * inside the Canvas's parent. This is necessary because:
 *
 * 1. drei's Html with `transform=true` sets the root portal element to
 *    `pointer-events: none; overflow: hidden;` (Html.tsx line 220)
 * 2. The transform outer wrapper also gets `pointer-events: none` (line 249)
 * 3. While the inner wrapper gets `pointer-events: auto` (line 267),
 *    the `overflow: hidden` on the root combined with CSS 3D preserve-3d
 *    transforms causes hit-testing to clip to the root bounds — even though
 *    the content renders visually outside those bounds.
 * 4. Additionally, R3F's event system attaches native pointerdown listeners
 *    to the Canvas parent (events.connected), consuming clicks.
 *
 * By portaling out to document.body, the Html content sits in a completely
 * separate DOM tree with its own stacking context, fully isolated from
 * R3F's event pipeline.
 */
export default function MonitorScreen() {
  // Create a DOM container directly on document.body, outside of R3F's control
  const [portalContainer] = useState(() => {
    const div = document.createElement('div');
    div.id = 'monitor-portal';
    div.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(div);
    return div;
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, [portalContainer]);

  // Stable ref for drei's portal prop
  const portalRef = useRef(portalContainer);

  return (
    <group position={[0, 0, 0.025]}>
      <Html
        transform
        portal={portalRef}
        position={[0, 0, 0.03]}
        distanceFactor={1.17}
        pointerEvents="auto"
        style={{
          width: '1024px',
          height: '576px',
          overflow: 'hidden',
          background: '#05070A',
          pointerEvents: 'auto',
          boxShadow: '0 0 80px rgba(45, 212, 191, 0.1), 0 0 200px rgba(45, 212, 191, 0.04)',
        }}
        className="monitor-screen-html"
        zIndexRange={[100, 0]}
      >
        <div
          style={{
            width: '1024px',
            height: '576px',
            overflow: 'hidden',
            position: 'relative',
            pointerEvents: 'auto',
          }}
        >
          <App />
        </div>
      </Html>
    </group>
  );
}
