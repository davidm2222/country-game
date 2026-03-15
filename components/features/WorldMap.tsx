'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { COUNTRY_BY_ISON } from '@/lib/countries';
import { Continent } from '@/types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const TERRITORY_TO_PARENT: Record<number, number> = {
  304: 208, // Greenland → Denmark
  234: 208, // Faroe Islands → Denmark
  254: 250, // French Guiana → France
  312: 250, // Guadeloupe → France
  474: 250, // Martinique → France
  638: 250, // Réunion → France
  175: 250, // Mayotte → France
  258: 250, // French Polynesia → France
  540: 250, // New Caledonia → France
  533: 528, // Aruba → Netherlands
  531: 528, // Curaçao → Netherlands
  344: 156, // Hong Kong → China
  446: 156, // Macau → China
};

const CONTINENT_PROJECTION: Record<Continent, { center: [number, number]; scale: number }> = {
  Africa:          { center: [20, 0],    scale: 250 },
  Asia:            { center: [90, 30],   scale: 180 },
  Europe:          { center: [15, 55],   scale: 400 },
  'North America': { center: [-95, 40],  scale: 250 },
  'South America': { center: [-60, -15], scale: 280 },
  Oceania:         { center: [145, -25], scale: 350 },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

interface WorldMapProps {
  p1Countries: string[];
  p2Countries: string[];
  p1Name: string;
  p2Name: string;
  continent?: Continent;
  variant?: 'reveal' | 'play';
}

export default function WorldMap({ p1Countries, p2Countries, p1Name, p2Name, continent, variant = 'reveal' }: WorldMapProps) {
  const [isDark, setIsDark] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const COLORS = {
    p1: '#3b82f6',
    p2: '#f97316',
    both: '#22c55e',
    neither: isDark ? '#374151' : '#e5e7eb',
    outOfScope: isDark ? '#1f2937' : '#f1f5f9',
    stroke: '#ffffff',
  };

  const p1Set = new Set<number>();
  const p2Set = new Set<number>();

  for (const name of p1Countries) {
    for (const [isoN, country] of COUNTRY_BY_ISON) {
      if (country.name === name) { p1Set.add(isoN); break; }
    }
  }
  for (const name of p2Countries) {
    for (const [isoN, country] of COUNTRY_BY_ISON) {
      if (country.name === name) { p2Set.add(isoN); break; }
    }
  }

  function getColor(geoId: string | number): string {
    const rawN = Number(geoId);
    const n = TERRITORY_TO_PARENT[rawN] ?? rawN;
    const inP1 = p1Set.has(n);
    const inP2 = p2Set.has(n);

    if (variant === 'play') {
      return inP1 ? COLORS.p1 : COLORS.neither;
    }

    if (inP1 && inP2) return COLORS.both;
    if (inP1) return COLORS.p1;
    if (inP2) return COLORS.p2;
    if (continent) {
      const country = COUNTRY_BY_ISON.get(n);
      if (!country || country.continent !== continent) return COLORS.outOfScope;
    }
    return COLORS.neither;
  }

  function shouldRenderGeo(geoId: string | number): boolean {
    if (variant !== 'play' || !continent) return true;
    const rawN = Number(geoId);
    const n = TERRITORY_TO_PARENT[rawN] ?? rawN;
    const country = COUNTRY_BY_ISON.get(n);
    return country?.continent === continent;
  }

  const projectionConfig = variant === 'play' && continent
    ? CONTINENT_PROJECTION[continent]
    : { center: [0, 10] as [number, number], scale: 140 };

  function handleZoomIn() {
    setZoom(z => Math.min(z * 2, MAX_ZOOM));
  }

  function handleZoomOut() {
    setZoom(z => Math.max(z / 2, MIN_ZOOM));
  }

  function handleReset() {
    setZoom(1);
    setCenter([0, 0]);
  }

  return (
    <div className="w-full">
      {/* Map + zoom controls */}
      <div className="relative">
        <ComposableMap
          projectionConfig={projectionConfig}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ zoom: z, coordinates }) => {
              setZoom(z);
              setCenter(coordinates);
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies
                  .filter(geo => shouldRenderGeo(geo.id))
                  .map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(geo.id)}
                      stroke={COLORS.stroke}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls — top-right corner */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-7 h-7 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors flex items-center justify-center"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-7 h-7 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors flex items-center justify-center"
            aria-label="Zoom out"
          >
            −
          </button>
          {(zoom > 1) && (
            <button
              onClick={handleReset}
              className="w-7 h-7 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-xs shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              aria-label="Reset zoom"
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-2 text-sm px-2">
        {variant === 'play' ? (
          <>
            <LegendItem color={COLORS.p1} label="Named" />
            <LegendItem color={COLORS.neither} label="Not yet" isDark={isDark} />
          </>
        ) : (
          <>
            <LegendItem color={COLORS.p1} label={`Only ${p1Name}`} />
            <LegendItem color={COLORS.p2} label={`Only ${p2Name}`} />
            <LegendItem color={COLORS.both} label="Both named" />
            <LegendItem color={COLORS.neither} label="Neither" isDark={isDark} />
            {continent && <LegendItem color={COLORS.outOfScope} label="Not in play" border isDark={isDark} />}
          </>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label, border, isDark }: { color: string; label: string; border?: boolean; isDark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-3 h-3 rounded-sm flex-shrink-0 ${border ? (isDark ? 'border border-gray-600' : 'border border-gray-300') : ''}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-600 dark:text-gray-400 text-xs">{label}</span>
    </div>
  );
}
