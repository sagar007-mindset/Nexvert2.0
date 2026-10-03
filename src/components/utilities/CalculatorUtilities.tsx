/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Copy,
  Calendar,
  Percent,
  Calculator,
  Activity,
  DollarSign,
  TrendingDown,
  Monitor,
  Receipt
} from 'lucide-react';

interface CalculatorUtilitiesProps {
  toolId: string;
}

export default function CalculatorUtilities({ toolId }: CalculatorUtilitiesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (toolId) {
    case 'percentage-calculator':
      return <PercentageCalculator onCopy={handleCopy} />;
    case 'age-calculator':
      return <AgeCalculator onCopy={handleCopy} />;
    case 'date-calculator':
      return <DateCalculator onCopy={handleCopy} />;
    case 'bmi-calculator':
      return <BmiCalculator onCopy={handleCopy} />;
    case 'loan-calculator':
      return <LoanCalculator onCopy={handleCopy} />;
    case 'tip-calculator':
      return <TipCalculator onCopy={handleCopy} />;
    case 'discount-calculator':
      return <DiscountCalculator onCopy={handleCopy} />;
    case 'aspect-ratio-calculator':
      return <AspectRatioCalculator onCopy={handleCopy} />;
    case 'gst-calculator':
      return <GstCalculator onCopy={handleCopy} />;
    default:
      return <div className="text-sm text-slate-500">Select a valid calculator.</div>;
  }
}

// -------------------------------------------------------------
// 1. PERCENTAGE CALCULATOR
// -------------------------------------------------------------
function PercentageCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  // Mode 1: What is X% of Y?
  const [p1, setP1] = useState(15);
  const [v1, setV1] = useState(250);

  // Mode 2: X is what percent of Y?
  const [x2, setX2] = useState(45);
  const [y2, setY2] = useState(180);

  // Mode 3: Percentage increase/decrease from X to Y
  const [from3, setFrom3] = useState(100);
  const [to3, setTo3] = useState(135);

  const res1 = (p1 / 100) * v1;
  const res2 = y2 !== 0 ? (x2 / y2) * 100 : 0;
  const res3 = from3 !== 0 ? ((to3 - from3) / from3) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Block 1 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
          What is X% of Y?
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>What is</span>
          <input
            type="number"
            value={p1}
            onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>% of</span>
          <input
            type="number"
            value={v1}
            onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>=</span>
          <span className="font-black text-amber-600 dark:text-amber-400 text-lg">
            {res1.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
          <button
            onClick={() => onCopy(String(res1))}
            className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            title="Copy Result"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block 2 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
          X is what percent of Y?
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="number"
            value={x2}
            onChange={(e) => setX2(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>is what percent of</span>
          <input
            type="number"
            value={y2}
            onChange={(e) => setY2(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>=</span>
          <span className="font-black text-amber-600 dark:text-amber-400 text-lg">
            {res2.toFixed(2)}%
          </span>
          <button
            onClick={() => onCopy(`${res2.toFixed(2)}%`)}
            className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            title="Copy Result"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block 3 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
          Percentage Increase or Decrease
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>From</span>
          <input
            type="number"
            value={from3}
            onChange={(e) => setFrom3(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>to</span>
          <input
            type="number"
            value={to3}
            onChange={(e) => setTo3(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-center"
          />
          <span>=</span>
          <span
            className={`font-black text-lg ${
              res3 >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {res3 >= 0 ? `+${res3.toFixed(2)}% (Increase)` : `${res3.toFixed(2)}% (Decrease)`}
          </span>
          <button
            onClick={() => onCopy(`${res3.toFixed(2)}%`)}
            className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            title="Copy Result"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. AGE CALCULATOR
// -------------------------------------------------------------
function AgeCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [birthDate, setBirthDate] = useState('1995-06-15');

  const ageData = useMemo(() => {
    if (!birthDate) return null;
    const b = new Date(birthDate);
    const now = new Date();

    if (isNaN(b.getTime()) || b > now) return null;

    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = now.getTime() - b.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Next birthday calculation
    const nextBday = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (nextBday < now) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const daysToNext = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const nextWeekday = nextBday.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      daysToNext,
      nextWeekday
    };
  }, [birthDate]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold text-slate-900 dark:text-white"
          />
        </div>

        {ageData && (
          <div className="space-y-6 pt-2">
            {/* Primary Age Highlight */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Current Exact Age
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {ageData.years} <span className="text-sm font-semibold text-slate-500">years</span>{' '}
                  {ageData.months} <span className="text-sm font-semibold text-slate-500">months</span>{' '}
                  {ageData.days} <span className="text-sm font-semibold text-slate-500">days</span>
                </p>
              </div>
              <button
                onClick={() => onCopy(`${ageData.years} years, ${ageData.months} months, ${ageData.days} days`)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            {/* Next Birthday & Life Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Next Birthday In</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
                  {ageData.daysToNext} days
                </span>
                <span className="text-[10px] text-slate-400 block">{ageData.nextWeekday}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Days Lived</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
                  {ageData.totalDays.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Weeks Lived</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
                  {ageData.totalWeeks.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Hours</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
                  {ageData.totalHours.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DATE CALCULATOR
// -------------------------------------------------------------
function DateCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [tab, setTab] = useState<'diff' | 'add'>('diff');

  // Difference Mode
  const [dateA, setDateA] = useState('2024-01-01');
  const [dateB, setDateB] = useState('2024-12-31');

  // Add/Subtract Mode
  const [startDate, setStartDate] = useState('2024-01-01');
  const [operation, setOperation] = useState<'add' | 'sub'>('add');
  const [amount, setAmount] = useState<number>(30);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  // Diff Calculations
  const diffResult = useMemo(() => {
    const d1 = new Date(dateA);
    const d2 = new Date(dateB);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Workdays calculation
    let workdays = 0;
    let weekends = 0;
    const start = d1 < d2 ? new Date(d1) : new Date(d2);
    const end = d1 < d2 ? new Date(d2) : new Date(d1);

    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const day = cur.getDay();
      if (day === 0 || day === 6) weekends++;
      else workdays++;
    }

    return { totalDays, weeks, remainingDays, workdays, weekends };
  }, [dateA, dateB]);

  // Add/Sub Calculations
  const addResult = useMemo(() => {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return null;

    const mult = operation === 'add' ? 1 : -1;
    if (unit === 'days') d.setDate(d.getDate() + mult * amount);
    if (unit === 'weeks') d.setDate(d.getDate() + mult * amount * 7);
    if (unit === 'months') d.setMonth(d.getMonth() + mult * amount);
    if (unit === 'years') d.setFullYear(d.getFullYear() + mult * amount);

    return {
      formatted: d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      iso: d.toISOString().slice(0, 10)
    };
  }, [startDate, operation, amount, unit]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('diff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            tab === 'diff'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Date Difference
        </button>
        <button
          onClick={() => setTab('add')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            tab === 'add'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Add / Subtract Days
        </button>
      </div>

      {tab === 'diff' ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {diffResult && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Total Difference
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {diffResult.totalDays} Days{' '}
                    <span className="text-sm font-medium text-slate-500">
                      ({diffResult.weeks} weeks + {diffResult.remainingDays} days)
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => onCopy(`${diffResult.totalDays} days`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Working Days</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {diffResult.workdays} days
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Weekend Days</span>
                  <span className="text-lg font-bold text-slate-600 dark:text-zinc-400 block mt-0.5">
                    {diffResult.weekends} days
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="add">+ Add</option>
                <option value="sub">- Subtract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white capitalize"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {addResult && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Calculated Target Date
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {addResult.formatted}
                </p>
                <span className="text-xs text-slate-500 font-mono">{addResult.iso}</span>
              </div>
              <button
                onClick={() => onCopy(addResult.formatted)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. BMI CALCULATOR
// -------------------------------------------------------------
function BmiCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  // Metric
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  // Imperial
  const [weightLbs, setWeightLbs] = useState(154);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);

  const { bmi, category, color, healthyWeightRange } = useMemo(() => {
    let wKg = weightKg;
    let hM = heightCm / 100;

    if (unitSystem === 'imperial') {
      wKg = weightLbs * 0.45359237;
      const totalInches = heightFt * 12 + heightIn;
      hM = (totalInches * 2.54) / 100;
    }

    if (hM <= 0 || wKg <= 0) {
      return { bmi: 0, category: 'Invalid', color: 'text-slate-500', healthyWeightRange: '' };
    }

    const bmiVal = wKg / (hM * hM);

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = 18.5 * (hM * hM);
    const maxHealthyKg = 24.9 * (hM * hM);
    let healthyRangeStr = `${minHealthyKg.toFixed(1)} - ${maxHealthyKg.toFixed(1)} kg`;
    if (unitSystem === 'imperial') {
      healthyRangeStr = `${(minHealthyKg * 2.20462).toFixed(1)} - ${(maxHealthyKg * 2.20462).toFixed(1)} lbs`;
    }

    let cat = 'Normal Weight';
    let clr = 'text-emerald-600 dark:text-emerald-400';

    if (bmiVal < 18.5) {
      cat = 'Underweight';
      clr = 'text-blue-500';
    } else if (bmiVal >= 25 && bmiVal < 30) {
      cat = 'Overweight';
      clr = 'text-amber-500';
    } else if (bmiVal >= 30) {
      cat = 'Obese';
      clr = 'text-rose-600 dark:text-rose-400';
    }

    return {
      bmi: parseFloat(bmiVal.toFixed(1)),
      category: cat,
      color: clr,
      healthyWeightRange: healthyRangeStr
    };
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setUnitSystem('metric')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            unitSystem === 'metric'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Metric (kg, cm)
        </button>
        <button
          onClick={() => setUnitSystem('imperial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            unitSystem === 'imperial'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          Imperial (lbs, ft/in)
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        {unitSystem === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Height (Feet)
              </label>
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Height (Inches)
              </label>
              <input
                type="number"
                value={heightIn}
                onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Results Card */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Body Mass Index (BMI)
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {bmi}
              </span>
              <span className={`text-base font-bold ${color}`}>
                {category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Healthy weight for height: <strong>{healthyWeightRange}</strong>
            </p>
          </div>
          <button
            onClick={() => onCopy(`BMI: ${bmi} (${category})`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy BMI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. LOAN CALCULATOR (EMI)
// -------------------------------------------------------------
function LoanCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [principal, setPrincipal] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [tenureYears, setTenureYears] = useState<number>(15);

  const { monthlyEmi, totalInterest, totalPayment } = useMemo(() => {
    const P = principal;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = totalPay - P;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay)
    };
  }, [principal, interestRate, tenureYears]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Loan Amount ($)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Loan Tenure (Years)
            </label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* EMI Summary Card */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Monthly Payment (EMI)
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              ${monthlyEmi.toLocaleString()}/mo
            </p>
          </div>
          <button
            onClick={() => onCopy(`$${monthlyEmi}/month`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy EMI</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Principal Amount</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              ${principal.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Interest</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 block mt-1">
              ${totalInterest.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Amount Payable</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block mt-1">
              ${totalPayment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. TIP CALCULATOR
// -------------------------------------------------------------
function TipCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [bill, setBill] = useState<number>(85);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [people, setPeople] = useState<number>(2);

  const { tipAmount, totalBill, tipPerPerson, totalPerPerson } = useMemo(() => {
    const b = bill || 0;
    const p = Math.max(1, people || 1);
    const tip = (b * (tipPercent || 0)) / 100;
    const total = b + tip;

    return {
      tipAmount: tip,
      totalBill: total,
      tipPerPerson: tip / p,
      totalPerPerson: total / p
    };
  }, [bill, tipPercent, people]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Bill Amount ($)
            </label>
            <input
              type="number"
              value={bill}
              onChange={(e) => setBill(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Number of People (Split)
            </label>
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tip Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Select Tip Percentage
          </label>
          <div className="flex flex-wrap gap-2">
            {[10, 15, 18, 20, 25].map((pct) => (
              <button
                key={pct}
                onClick={() => setTipPercent(pct)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  tipPercent === pct
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {pct}%
              </button>
            ))}
            <div className="flex items-center space-x-1">
              <input
                type="number"
                placeholder="Custom %"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
              />
              <span className="text-xs text-slate-500 font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Total Per Person
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${totalPerPerson.toFixed(2)}
            </p>
            <span className="text-xs text-slate-500">
              includes ${tipPerPerson.toFixed(2)} tip each
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Bill + Tip
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${totalBill.toFixed(2)}
            </p>
            <span className="text-xs text-slate-500">
              total tip: ${tipAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onCopy(`$${totalPerPerson.toFixed(2)} per person ($${totalBill.toFixed(2)} total)`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Split Amount</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. DISCOUNT CALCULATOR
// -------------------------------------------------------------
function DiscountCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [stackedPercent, setStackedPercent] = useState<number>(0);

  const { finalPrice, totalSaved, effectiveDiscount } = useMemo(() => {
    const p = originalPrice || 0;
    const firstDiscount = (p * (discountPercent || 0)) / 100;
    const priceAfterFirst = p - firstDiscount;
    const secondDiscount = (priceAfterFirst * (stackedPercent || 0)) / 100;
    const finalP = Math.max(0, priceAfterFirst - secondDiscount);
    const saved = p - finalP;
    const effective = p > 0 ? (saved / p) * 100 : 0;

    return {
      finalPrice: finalP,
      totalSaved: saved,
      effectiveDiscount: effective
    };
  }, [originalPrice, discountPercent, stackedPercent]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Original Price ($)
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Primary Discount (%)
            </label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Additional / Coupon Discount (%)
            </label>
            <input
              type="number"
              value={stackedPercent}
              onChange={(e) => setStackedPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Final Discounted Price
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              ${finalPrice.toFixed(2)}
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              You Save: ${totalSaved.toFixed(2)} ({effectiveDiscount.toFixed(1)}% total discount)
            </span>
          </div>
          <button
            onClick={() => onCopy(`$${finalPrice.toFixed(2)} (Saved: $${totalSaved.toFixed(2)})`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Price</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. ASPECT RATIO CALCULATOR
// -------------------------------------------------------------
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function AspectRatioCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [w1, setW1] = useState<number>(1920);
  const [h1, setH1] = useState<number>(1080);

  // Resize Solver
  const [w2, setW2] = useState<number>(1280);
  const [h2, setH2] = useState<number>(720);

  const ratio = useMemo(() => {
    if (w1 <= 0 || h1 <= 0) return { x: 0, y: 0, text: '--' };
    const divisor = gcd(Math.round(w1), Math.round(h1));
    const x = Math.round(w1) / divisor;
    const y = Math.round(h1) / divisor;
    return { x, y, text: `${x}:${y}` };
  }, [w1, h1]);

  const handleW2Change = (newW: number) => {
    setW2(newW);
    if (w1 > 0) {
      setH2(Math.round((newW * h1) / w1));
    }
  };

  const handleH2Change = (newH: number) => {
    setH2(newH);
    if (h1 > 0) {
      setW2(Math.round((newH * w1) / h1));
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        {/* Source Dimensions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Original Dimensions &amp; Aspect Ratio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={w1}
                onChange={(e) => setW1(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={h1}
                onChange={(e) => setH1(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Calculated Ratio
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {ratio.text}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: '16:9 (HD/Video)', w: 1920, h: 1080 },
            { label: '4:3 (Standard)', w: 1024, h: 768 },
            { label: '1:1 (Square/IG)', w: 1080, h: 1080 },
            { label: '9:16 (Story/TikTok)', w: 1080, h: 1920 },
            { label: '21:9 (Ultrawide)', w: 2560, h: 1080 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setW1(preset.w);
                setH1(preset.h);
                handleW2Change(w2);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Target Dimension Solver */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Proportional Resize Solver
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Target Width (px)
              </label>
              <input
                type="number"
                value={w2}
                onChange={(e) => handleW2Change(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Target Height (Calculated px)
              </label>
              <input
                type="number"
                value={h2}
                onChange={(e) => handleH2Change(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. GST / SALES TAX CALCULATOR
// -------------------------------------------------------------
function GstCalculator({ onCopy }: { onCopy: (text: string) => void }) {
  const [amount, setAmount] = useState<number>(5000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [type, setType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const { netAmount, gstAmount, totalAmount } = useMemo(() => {
    const raw = amount || 0;
    const rate = gstRate || 0;

    if (type === 'exclusive') {
      // Adding GST
      const gst = (raw * rate) / 100;
      const total = raw + gst;
      return { netAmount: raw, gstAmount: gst, totalAmount: total };
    } else {
      // Removing GST
      const net = (raw * 100) / (100 + rate);
      const gst = raw - net;
      return { netAmount: net, gstAmount: gst, totalAmount: raw };
    }
  }, [amount, gstRate, type]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Calculation Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="exclusive">GST Exclusive (Add GST)</option>
              <option value="inclusive">GST Inclusive (Extract GST)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              GST / Tax Rate (%)
            </label>
            <select
              value={gstRate}
              onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18% (Standard)</option>
              <option value={28}>28%</option>
            </select>
          </div>
        </div>

        {/* GST Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Net Amount</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
              ${netAmount.toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              GST ({gstRate}%)
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block mt-1">
              ${gstAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              CGST: ${(gstAmount / 2).toFixed(2)} &bull; SGST: ${(gstAmount / 2).toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Total Gross Amount
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onCopy(`Gross: $${totalAmount.toFixed(2)} (Net: $${netAmount.toFixed(2)}, Tax: $${gstAmount.toFixed(2)})`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy GST Breakdown</span>
          </button>
        </div>
      </div>
    </div>
  );
}
