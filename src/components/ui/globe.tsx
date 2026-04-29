"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    // JAVÍTÁS ITT: NodeJS.Timeout helyett dinamikus típust használunk,
    // vagy egyszerűen "any"-t, de ez a legszebb megoldás:
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const initGlobe = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const size = containerRef.current.offsetWidth;
      
      if (size === 0) return;

      if (globeRef.current) {
        globeRef.current.destroy();
      }

      // Kétszeres felbontás a retina kijelzők miatt, de a CSS méret marad
      canvasRef.current.width = size * window.devicePixelRatio;
      canvasRef.current.height = size * window.devicePixelRatio;
      canvasRef.current.style.width = `${size}px`;
      canvasRef.current.style.height = `${size}px`;

      globeRef.current = createGlobe(canvasRef.current, {
        devicePixelRatio: window.devicePixelRatio,
        width: size * window.devicePixelRatio,
        height: size * window.devicePixelRatio,
        phi: phiRef.current,
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: [0.1, 0.8, 1],
        glowColor: [1, 1, 1],
        markers: [
          { location: [47.4979, 19.0402], size: 0.1 },
        ],
        onRender: (state) => {
          state.phi = phiRef.current;
          phiRef.current += 0.01;
        },
      });
    };

    const onResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Debounce: csak ha 200ms eltelt változtatás nélkül, akkor rajzoljuk újra
      resizeTimeout = setTimeout(() => {
        initGlobe();
      }, 200);
    };

    const resizeObserver = new ResizeObserver(onResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    initGlobe();

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      globeRef.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-150 aspect-square ${className}`}
    >
      <canvas 
        className="w-full h-full opacity-0 transition-opacity duration-500" 
        ref={canvasRef}
        style={{ opacity: 1 }} 
      />
    </div>
  );
}