'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { COUNTRY_BY_ISON } from '@/lib/countries';
import { Continent } from '@/types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Maps territory isoN → parent country isoN so territories get colored with their parent
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

interface WorldMapProps {
  p1Countries: string[];
  p2Countries: string[];
  p1Name: string;
  p2Name: string;
  continent?: Continent;
}

export default function WorldMap({ p1Countries, p2Countries, p1Name, p2Name, continent }: WorldMapProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const COLORS = {
    p1: '#3b82f6',      // blue-500
    p2: '#f97316',      // orange-500
    both: '#22c55e',    // green-500
    neither: isDark ? '#374151' : '#e5e7eb',     // gray-700 dark / gray-200 light
    outOfScope: isDark ? '#1f2937' : '#f1f5f9',  // gray-800 dark / slate-100 light
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
    if (inP1 && inP2) return COLORS.both;
    if (inP1) return COLORS.p1;
    if (inP2) return COLORS.p2;
    // In continent sprint, countries outside the selected continent get a lighter shade
    if (continent) {
      const country = COUNTRY_BY_ISON.get(n);
      if (!country || country.continent !== continent) return COLORS.outOfScope;
    }
    return COLORS.neither;
  }

  return (
    <div className="w-full">
      <ComposableMap
        projectionConfig={{ scale: 140, center: [0, 10] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
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
      </ComposableMap>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-2 text-sm px-2">
        <LegendItem color={COLORS.p1} label={`Only ${p1Name}`} />
        <LegendItem color={COLORS.p2} label={`Only ${p2Name}`} />
        <LegendItem color={COLORS.both} label="Both named" />
        <LegendItem color={COLORS.neither} label="Neither" isDark={isDark} />
        {continent && <LegendItem color={COLORS.outOfScope} label="Not in play" border isDark={isDark} />}
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
