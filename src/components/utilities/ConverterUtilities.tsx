/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Copy,
  RotateCcw,
  ArrowRightLeft,
  Clock,
  Globe,
  Hash,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface ConverterUtilitiesProps {
  toolId: string;
}

export default function ConverterUtilities({ toolId }: ConverterUtilitiesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (toolId) {
    case 'unit-converter':
      return <UnitConverter onCopy={handleCopy} />;
    case 'timezone-converter':
      return <TimezoneConverter onCopy={handleCopy} />;
    case 'roman-numeral-converter':
      return <RomanNumeralConverter onCopy={handleCopy} />;
    case 'number-to-words':
      return <NumberToWords onCopy={handleCopy} />;
    default:
      return <div className="text-sm text-slate-500">Select a valid converter tool.</div>;
  }
}

// -------------------------------------------------------------
// 1. UNIT CONVERTER
// -------------------------------------------------------------
type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'pressure' | 'energy' | 'storage';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // base unit defined per category
}

const UNIT_DATA: Record<UnitCategory, { base: string; units: UnitDef[] }> = {
  length: {
    base: 'm',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', ratioToBase: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', ratioToBase: 0.001 },
      { id: 'mi', name: 'Mile', symbol: 'mi', ratioToBase: 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
      { id: 'ft', name: 'Foot', symbol: 'ft', ratioToBase: 0.3048 },
      { id: 'in', name: 'Inch', symbol: 'in', ratioToBase: 0.0254 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', ratioToBase: 1852 },
    ]
  },
  weight: {
    base: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', ratioToBase: 1 },
      { id: 'g', name: 'Gram', symbol: 'g', ratioToBase: 0.001 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', ratioToBase: 0.000001 },
      { id: 't', name: 'Metric Ton', symbol: 't', ratioToBase: 1000 },
      { id: 'lb', name: 'Pound', symbol: 'lb', ratioToBase: 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', ratioToBase: 0.028349523125 },
      { id: 'st', name: 'Stone', symbol: 'st', ratioToBase: 6.35029318 },
    ]
  },
  temperature: {
    base: 'C',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', ratioToBase: 1 },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', ratioToBase: 1 },
      { id: 'K', name: 'Kelvin', symbol: 'K', ratioToBase: 1 },
    ]
  },
  area: {
    base: 'm2',
    units: [
      { id: 'm2', name: 'Square Meter', symbol: 'm²', ratioToBase: 1 },
      { id: 'km2', name: 'Square Kilometer', symbol: 'km²', ratioToBase: 1000000 },
      { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', ratioToBase: 0.0001 },
      { id: 'ft2', name: 'Square Foot', symbol: 'ft²', ratioToBase: 0.09290304 },
      { id: 'in2', name: 'Square Inch', symbol: 'in²', ratioToBase: 0.00064516 },
      { id: 'ac', name: 'Acre', symbol: 'ac', ratioToBase: 4046.8564224 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', ratioToBase: 10000 },
    ]
  },
  volume: {
    base: 'L',
    units: [
      { id: 'L', name: 'Liter', symbol: 'L', ratioToBase: 1 },
      { id: 'mL', name: 'Milliliter', symbol: 'mL', ratioToBase: 0.001 },
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³', ratioToBase: 1000 },
      { id: 'gal', name: 'Gallon (US)', symbol: 'gal', ratioToBase: 3.785411784 },
      { id: 'qt', name: 'Quart (US)', symbol: 'qt', ratioToBase: 0.946352946 },
      { id: 'pt', name: 'Pint (US)', symbol: 'pt', ratioToBase: 0.473176473 },
      { id: 'cup', name: 'Cup (US)', symbol: 'cup', ratioToBase: 0.2365882365 },
      { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz', ratioToBase: 0.0295735295625 },
    ]
  },
  speed: {
    base: 'mps',
    units: [
      { id: 'mps', name: 'Meter per second', symbol: 'm/s', ratioToBase: 1 },
      { id: 'kmh', name: 'Kilometer per hour', symbol: 'km/h', ratioToBase: 1 / 3.6 },
      { id: 'mph', name: 'Mile per hour', symbol: 'mph', ratioToBase: 0.44704 },
      { id: 'kn', name: 'Knot', symbol: 'kn', ratioToBase: 0.514444444 },
      { id: 'fps', name: 'Foot per second', symbol: 'ft/s', ratioToBase: 0.3048 },
    ]
  },
  pressure: {
    base: 'Pa',
    units: [
      { id: 'Pa', name: 'Pascal', symbol: 'Pa', ratioToBase: 1 },
      { id: 'kPa', name: 'Kilopascal', symbol: 'kPa', ratioToBase: 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', ratioToBase: 100000 },
      { id: 'psi', name: 'PSI', symbol: 'psi', ratioToBase: 6894.75729 },
      { id: 'atm', name: 'Atmosphere (standard)', symbol: 'atm', ratioToBase: 101325 },
      { id: 'torr', name: 'Torr / mmHg', symbol: 'Torr', ratioToBase: 133.322368 },
    ]
  },
  energy: {
    base: 'J',
    units: [
      { id: 'J', name: 'Joule', symbol: 'J', ratioToBase: 1 },
      { id: 'kJ', name: 'Kilojoule', symbol: 'kJ', ratioToBase: 1000 },
      { id: 'cal', name: 'Calorie', symbol: 'cal', ratioToBase: 4.184 },
      { id: 'kcal', name: 'Kilocalorie (Food)', symbol: 'kcal', ratioToBase: 4184 },
      { id: 'Wh', name: 'Watt-hour', symbol: 'Wh', ratioToBase: 3600 },
      { id: 'kWh', name: 'Kilowatt-hour', symbol: 'kWh', ratioToBase: 3600000 },
      { id: 'btu', name: 'BTU', symbol: 'BTU', ratioToBase: 1055.05585 },
    ]
  },
  storage: {
    base: 'B',
    units: [
      { id: 'B', name: 'Byte', symbol: 'B', ratioToBase: 1 },
      { id: 'KB', name: 'Kilobyte (Decimal)', symbol: 'KB', ratioToBase: 1e3 },
      { id: 'MB', name: 'Megabyte (Decimal)', symbol: 'MB', ratioToBase: 1e6 },
      { id: 'GB', name: 'Gigabyte (Decimal)', symbol: 'GB', ratioToBase: 1e9 },
      { id: 'TB', name: 'Terabyte (Decimal)', symbol: 'TB', ratioToBase: 1e12 },
      { id: 'KiB', name: 'Kibibyte (Binary)', symbol: 'KiB', ratioToBase: 1024 },
      { id: 'MiB', name: 'Mebibyte (Binary)', symbol: 'MiB', ratioToBase: 1024 ** 2 },
      { id: 'GiB', name: 'Gibibyte (Binary)', symbol: 'GiB', ratioToBase: 1024 ** 3 },
      { id: 'TiB', name: 'Tebibyte (Binary)', symbol: 'TiB', ratioToBase: 1024 ** 4 },
    ]
  }
};

function UnitConverter({ onCopy }: { onCopy: (text: string) => void }) {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [value, setValue] = useState<number>(1);

  // Update default units on category switch
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const units = UNIT_DATA[cat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1] ? units[1].id : units[0].id);
  };

  const convertedValue = useMemo(() => {
    if (isNaN(value)) return 0;

    if (category === 'temperature') {
      if (fromUnit === toUnit) return value;
      // Convert to Celsius first
      let cVal = value;
      if (fromUnit === 'F') cVal = (value - 32) * (5 / 9);
      if (fromUnit === 'K') cVal = value - 273.15;

      // Convert from Celsius to Target
      if (toUnit === 'C') return cVal;
      if (toUnit === 'F') return cVal * (9 / 5) + 32;
      if (toUnit === 'K') return cVal + 273.15;
      return cVal;
    }

    const currentCat = UNIT_DATA[category];
    const fromDef = currentCat.units.find((u) => u.id === fromUnit);
    const toDef = currentCat.units.find((u) => u.id === toUnit);
    if (!fromDef || !toDef) return 0;

    const inBase = value * fromDef.ratioToBase;
    return inBase / toDef.ratioToBase;
  }, [category, fromUnit, toUnit, value]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const currentUnits = UNIT_DATA[category].units;
  const fromDef = currentUnits.find((u) => u.id === fromUnit);
  const toDef = currentUnits.find((u) => u.id === toUnit);

  const formattedResult = convertedValue.toLocaleString(undefined, {
    maximumFractionDigits: 6
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
              category === cat
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
          {/* From Input */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              From
            </label>
            <input
              type="number"
              value={isNaN(value) ? '' : value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:pt-6">
            <button
              onClick={swapUnits}
              className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
              title="Swap Units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Output */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              To
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-base font-black text-amber-700 dark:text-amber-400 truncate">
              {formattedResult}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula / Explanation Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-zinc-400">
            Formula: 1 {fromDef?.symbol} ={' '}
            {category === 'temperature'
              ? 'Specific Temperature Formula'
              : `${((fromDef?.ratioToBase || 1) / (toDef?.ratioToBase || 1)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toDef?.symbol}`}
          </span>
          <button
            onClick={() => onCopy(`${value} ${fromDef?.symbol} = ${formattedResult} ${toDef?.symbol}`)}
            className="px-3 py-1.5 rounded-lg font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Conversion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. TIMEZONE CONVERTER
// -------------------------------------------------------------
const POPULAR_TIMEZONES = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { id: 'America/New_York', label: 'New York (Eastern Time - US & Canada)' },
  { id: 'America/Chicago', label: 'Chicago (Central Time - US)' },
  { id: 'America/Denver', label: 'Denver (Mountain Time - US)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time - US)' },
  { id: 'Europe/London', label: 'London (GMT / BST)' },
  { id: 'Europe/Paris', label: 'Paris / Berlin / Rome (CET / CEST)' },
  { id: 'Asia/Dubai', label: 'Dubai (Gulf Standard Time)' },
  { id: 'Asia/Karachi', label: 'Karachi / Islamabad (Pakistan Standard Time)' },
  { id: 'Asia/Kolkata', label: 'Mumbai / New Delhi (Indian Standard Time)' },
  { id: 'Asia/Singapore', label: 'Singapore / Hong Kong (SGT / HKT)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (Japan Standard Time)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST / AEDT)' },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST / NZDT)' }
];

function TimezoneConverter({ onCopy }: { onCopy: (text: string) => void }) {
  // Current local ISO date-time
  const now = new Date();
  const localIsoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [dateTime, setDateTime] = useState<string>(localIsoString);
  const [sourceTz, setSourceTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [targetTz, setTargetTz] = useState<string>('UTC');

  // Compute converted time
  const targetFormatted = useMemo(() => {
    try {
      const parsedDate = new Date(dateTime);
      if (isNaN(parsedDate.getTime())) return 'Invalid Date';

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      return formatter.format(parsedDate);
    } catch (e: any) {
      return e.message;
    }
  }, [dateTime, targetTz]);

  // World Comparison Matrix
  const worldMatrix = useMemo(() => {
    try {
      const parsedDate = new Date(dateTime);
      if (isNaN(parsedDate.getTime())) return [];

      return POPULAR_TIMEZONES.map((tz) => {
        const timeFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: tz.id,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(parsedDate);

        const dateFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: tz.id,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }).format(parsedDate);

        return {
          id: tz.id,
          label: tz.label,
          time: timeFmt,
          date: dateFmt
        };
      });
    } catch {
      return [];
    }
  }, [dateTime]);

  return (
    <div className="space-y-6">
      {/* Primary Input Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Select Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Source Timezone
            </label>
            <select
              value={sourceTz}
              onChange={(e) => setSourceTz(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value={sourceTz}>Current: {sourceTz}</option>
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Target Timezone
            </label>
            <select
              value={targetTz}
              onChange={(e) => setTargetTz(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Converted Output Display */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Converted Time in {targetTz}
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {targetFormatted}
            </p>
          </div>
          <button
            onClick={() => onCopy(targetFormatted)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Converted Time</span>
          </button>
        </div>
      </div>

      {/* World Clock Overview */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
          Simultaneous World Timezones
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {worldMatrix.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.id.split('/')[1] || item.id}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {item.date}
                </span>
              </div>
              <p className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">
                {item.time}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. ROMAN NUMERAL CONVERTER
// -------------------------------------------------------------
const ROMAN_MAP: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I']
];

function RomanNumeralConverter({ onCopy }: { onCopy: (text: string) => void }) {
  const [direction, setDirection] = useState<'num-to-roman' | 'roman-to-num'>('num-to-roman');
  const [numInput, setNumInput] = useState<number>(2024);
  const [romanInput, setRomanInput] = useState<string>('MMXXIV');

  // Decimal -> Roman
  const { romanOutput, breakdown } = useMemo(() => {
    if (isNaN(numInput) || numInput < 1 || numInput > 3999) {
      return { romanOutput: '', breakdown: [] };
    }

    let n = Math.floor(numInput);
    let result = '';
    const parts: string[] = [];

    for (const [val, sym] of ROMAN_MAP) {
      while (n >= val) {
        result += sym;
        parts.push(`${sym} (${val})`);
        n -= val;
      }
    }

    return { romanOutput: result, breakdown: parts };
  }, [numInput]);

  // Roman -> Decimal
  const { decimalOutput, romanError } = useMemo(() => {
    const raw = romanInput.trim().toUpperCase();
    if (!raw) return { decimalOutput: null, romanError: null };

    // Standard Roman numeral validation regex
    const validRegex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    if (!validRegex.test(raw)) {
      return { decimalOutput: null, romanError: 'Invalid Roman numeral syntax' };
    }

    const valMap: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000
    };

    let sum = 0;
    for (let i = 0; i < raw.length; i++) {
      const cur = valMap[raw[i]];
      const next = valMap[raw[i + 1]] || 0;
      if (cur < next) {
        sum += next - cur;
        i++;
      } else {
        sum += cur;
      }
    }

    return { decimalOutput: sum, romanError: null };
  }, [romanInput]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setDirection('num-to-roman')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            direction === 'num-to-roman'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Number &rarr; Roman Numeral
        </button>
        <button
          onClick={() => setDirection('roman-to-num')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            direction === 'roman-to-num'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Roman Numeral &rarr; Number
        </button>
      </div>

      {direction === 'num-to-roman' ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Enter an integer (1 to 3,999)
            </label>
            <input
              type="number"
              min={1}
              max={3999}
              value={isNaN(numInput) ? '' : numInput}
              onChange={(e) => setNumInput(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Roman Numeral Result
              </span>
              <p className="text-2xl font-black font-serif text-slate-900 dark:text-white mt-1 tracking-wider">
                {romanOutput || 'Invalid input (range 1 - 3999)'}
              </p>
            </div>
            {romanOutput && (
              <button
                onClick={() => onCopy(romanOutput)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            )}
          </div>

          {breakdown.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Breakdown: {breakdown.join(' + ')} = {numInput}
            </p>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Enter Roman Numeral (e.g. MMXXIV)
            </label>
            <input
              type="text"
              value={romanInput}
              onChange={(e) => setRomanInput(e.target.value.toUpperCase())}
              placeholder="e.g. MCMLXXXIV"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold font-serif uppercase text-slate-900 dark:text-white"
            />
          </div>

          {romanError ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{romanError}</span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Decimal Value
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {decimalOutput !== null ? decimalOutput.toLocaleString() : '--'}
                </p>
              </div>
              {decimalOutput !== null && (
                <button
                  onClick={() => onCopy(String(decimalOutput))}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. NUMBER TO WORDS
// -------------------------------------------------------------
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function convertChunk(num: number): string {
  let str = '';
  if (num >= 100) {
    str += ONES[Math.floor(num / 100)] + ' hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)];
    if (num % 10 > 0) str += '-' + ONES[num % 10];
    str += ' ';
  } else if (num > 0) {
    str += ONES[num] + ' ';
  }
  return str.trim();
}

function convertIntegerToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + convertIntegerToWords(Math.abs(num));

  const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
  let current = Math.floor(num);
  let scaleIndex = 0;
  let result = '';

  while (current > 0 && scaleIndex < scales.length) {
    const chunk = current % 1000;
    if (chunk > 0) {
      const chunkStr = convertChunk(chunk);
      const scaleStr = scales[scaleIndex];
      result = `${chunkStr} ${scaleStr} ${result}`.trim();
    }
    current = Math.floor(current / 1000);
    scaleIndex++;
  }

  return result.trim();
}

function NumberToWords({ onCopy }: { onCopy: (text: string) => void }) {
  const [numStr, setNumStr] = useState<string>('12500.50');
  const [currencyMode, setCurrencyMode] = useState<'standard' | 'usd' | 'pkr' | 'inr' | 'eur' | 'gbp'>('standard');
  const [casing, setCasing] = useState<'lower' | 'title' | 'upper'>('title');

  const wordsResult = useMemo(() => {
    const clean = numStr.trim();
    if (!clean || isNaN(Number(clean))) return '';

    const parts = clean.split('.');
    const integerPart = parseInt(parts[0], 10);
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : '';

    const integerWords = convertIntegerToWords(integerPart);

    let output = '';

    if (currencyMode === 'standard') {
      output = integerWords;
      // Decimals are read digit by digit: 12.05 -> "twelve point zero five" (not "point five").
      const allDecimals = (parts[1] || '').replace(/\D/g, '');
      if (allDecimals) {
        const digitWords = allDecimals.split('').map((d) => (d === '0' ? 'zero' : convertIntegerToWords(Number(d))));
        output += ` point ${digitWords.join(' ')}`;
      }
    } else {
      const decCents = decimalPart ? parseInt(decimalPart.padEnd(2, '0'), 10) : 0;
      const decWords = decCents > 0 ? convertIntegerToWords(decCents) : '';

      switch (currencyMode) {
        case 'usd':
          output = `${integerWords} dollars`;
          if (decCents > 0) output += ` and ${decWords} cents`;
          break;
        case 'pkr':
          output = `${integerWords} rupees`;
          if (decCents > 0) output += ` and ${decWords} paisa`;
          break;
        case 'inr':
          output = `${integerWords} rupees`;
          if (decCents > 0) output += ` and ${decWords} paise`;
          break;
        case 'eur':
          output = `${integerWords} euros`;
          if (decCents > 0) output += ` and ${decWords} cents`;
          break;
        case 'gbp':
          output = `${integerWords} pounds`;
          if (decCents > 0) output += ` and ${decWords} pence`;
          break;
      }
    }

    if (casing === 'upper') return output.toUpperCase();
    if (casing === 'title') {
      return output.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return output.toLowerCase();
  }, [numStr, currencyMode, casing]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Enter Number or Amount
            </label>
            <input
              type="text"
              value={numStr}
              onChange={(e) => setNumStr(e.target.value)}
              placeholder="e.g. 1500000.75"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Format / Currency
            </label>
            <select
              value={currencyMode}
              onChange={(e) => setCurrencyMode(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="standard">Standard Numbers</option>
              <option value="usd">USD ($ Dollars &amp; Cents)</option>
              <option value="pkr">PKR (Rs. Rupees &amp; Paisa)</option>
              <option value="inr">INR (₹ Rupees &amp; Paise)</option>
              <option value="eur">EUR (€ Euros &amp; Cents)</option>
              <option value="gbp">GBP (£ Pounds &amp; Pence)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs pt-1 border-t border-slate-100 dark:border-zinc-800">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Letter Casing:</span>
          {(['title', 'lower', 'upper'] as const).map((c) => (
            <label key={c} className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="casing"
                checked={casing === c}
                onChange={() => setCasing(c)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="capitalize text-slate-700 dark:text-zinc-300">{c}</span>
            </label>
          ))}
        </div>

        {/* Output */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Written in Words
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {wordsResult || 'Enter a valid number above...'}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onCopy(wordsResult)}
            disabled={!wordsResult}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>
        </div>
      </div>
    </div>
  );
}
