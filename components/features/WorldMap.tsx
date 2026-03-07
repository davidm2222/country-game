'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { COUNTRY_BY_ISON } from '@/lib/countries';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Colors for each category
const COLORS = {
  p1: '#3b82f6',    // blue-500
  p2: '#f97316',    // orange-500
  both: '#8b5cf6',  // violet-500
  neither: '#e5e7eb', // gray-200
  stroke: '#ffffff',
};

interface WorldMapProps {
  p1Countries: string[]; // canonical names
  p2Countries: string[]; // canonical names
  p1Name: string;
  p2Name: string;
}

export default function WorldMap({ p1Countries, p2Countries, p1Name, p2Name }: WorldMapProps) {
  // Build sets for fast lookup by isoN
  const p1Set = new Set<number>();
  const p2Set = new Set<number>();

  for (const name of p1Countries) {
    // Find by canonical name in the country list
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
    const n = Number(geoId);
    const inP1 = p1Set.has(n);
    const inP2 = p2Set.has(n);
    if (inP1 && inP2) return COLORS.both;
    if (inP1) return COLORS.p1;
    if (inP2) return COLORS.p2;
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
        <LegendItem color={COLORS.neither} label="Neither" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-600 text-xs">{label}</span>
    </div>
  );
}
