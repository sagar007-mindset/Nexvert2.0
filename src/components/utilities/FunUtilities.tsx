/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Copy,
  Sparkles,
  Dice5,
  Coins,
  Shuffle,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Trash2
} from 'lucide-react';

/** Uniform integer in [0, maxExclusive) from crypto.getRandomValues, using rejection sampling to avoid modulo bias. */
function secureRandomInt(maxExclusive: number): number {
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % maxExclusive;
}

interface FunUtilitiesProps {
  toolId: string;
}

export default function FunUtilities({ toolId }: FunUtilitiesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (toolId) {
    case 'random-picker':
      return <RandomPicker onCopy={handleCopy} />;
    case 'dice-roller':
      return <DiceRoller onCopy={handleCopy} />;
    case 'coin-flip':
      return <CoinFlip onCopy={handleCopy} />;
    case 'random-number':
      return <RandomNumberGenerator onCopy={handleCopy} />;
    default:
      return <div className="text-sm text-slate-500">Select a valid fun tool.</div>;
  }
}

// -------------------------------------------------------------
// 1. RANDOM PICKER
// -------------------------------------------------------------
function RandomPicker({ onCopy }: { onCopy: (text: string) => void }) {
  const [input, setInput] = useState(
    'Pizza\nBurger\nSushi\nTacos\nPasta\nSalad\nThai Curry'
  );
  const [winner, setWinner] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [removePicked, setRemovePicked] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const options = useMemo(() => {
    return input
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [input]);

  const pickWinner = () => {
    if (options.length === 0 || isPicking) return;
    setIsPicking(true);

    let counter = 0;
    const interval = setInterval(() => {
      const tempPick = options[Math.floor(Math.random() * options.length)];
      setWinner(tempPick);
      counter++;
      if (counter >= 15) {
        clearInterval(interval);
        // Final secure pick using crypto
        const finalPick = options[secureRandomInt(options.length)];
        setWinner(finalPick);
        setHistory((prev) => [finalPick, ...prev]);

        if (removePicked) {
          setInput((prev) =>
            prev
              .split(/\r?\n/)
              .filter((l) => l.trim() !== finalPick)
              .join('\n')
          );
        }
        setIsPicking(false);
      }
    }, 80);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Options List ({options.length} items)
            </label>
            <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={removePicked}
                onChange={(e) => setRemovePicked(e.target.checked)}
                className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Remove picked item</span>
            </label>
          </div>
          <textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter one option per line..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-white"
          />
          <button
            onClick={pickWinner}
            disabled={options.length === 0 || isPicking}
            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <Shuffle className="w-4 h-4" />
            <span>{isPicking ? 'Selecting Random Choice...' : 'Pick a Winner!'}</span>
          </button>
        </div>

        {/* Right: Winner Stage */}
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-900/60 flex flex-col items-center justify-center p-6 text-center">
            {winner ? (
              <div className="space-y-2 animate-in zoom-in-95">
                <Trophy className="w-8 h-8 mx-auto text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {isPicking ? 'Randomizing...' : 'Selected Winner'}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {winner}
                </p>
                {!isPicking && (
                  <button
                    onClick={() => onCopy(winner)}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 transition-colors inline-flex items-center space-x-1 cursor-pointer mt-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Choice</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-slate-400 space-y-1">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
                <p className="text-xs font-semibold">Click "Pick a Winner" to choose an option</p>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  Pick History
                </span>
                <button
                  onClick={() => setHistory([])}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. DICE ROLLER
// -------------------------------------------------------------
function DiceRoller({ onCopy }: { onCopy: (text: string) => void }) {
  const [dieType, setDieType] = useState<number>(6); // d6
  const [count, setCount] = useState<number>(2);
  const [modifier, setModifier] = useState<number>(0);
  const [results, setResults] = useState<number[]>([4, 5]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    let ticks = 0;
    const interval = setInterval(() => {
      const temp = Array.from({ length: count }, () => Math.floor(Math.random() * dieType) + 1);
      setResults(temp);
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        // Cryptographically secure final roll
        const finalArr = Array.from({ length: count }, () => {
          return secureRandomInt(dieType) + 1;
        });
        setResults(finalArr);
        setIsRolling(false);
      }
    }, 60);
  };

  const sum = results.reduce((a, b) => a + b, 0);
  const totalWithMod = sum + modifier;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-4">
        {/* Die Type Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
            Dice Type
          </label>
          <div className="flex flex-wrap gap-2">
            {[4, 6, 8, 10, 12, 20, 100].map((d) => (
              <button
                key={d}
                onClick={() => setDieType(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dieType === d
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                d{d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Quantity of Dice (1 to 10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Modifier (+/-)
            </label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling}
          className="w-full py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
        >
          <Dice5 className="w-4 h-4" />
          <span>{isRolling ? 'Rolling Dice...' : `Roll ${count}d${dieType}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`}</span>
        </button>
      </div>

      {/* Results Arena */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="flex flex-wrap justify-center gap-4">
          {results.map((val, idx) => (
            <div
              key={idx}
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shadow-md transition-all ${
                isRolling ? 'rotate-12 scale-95 opacity-80' : 'rotate-0 scale-100'
              } ${
                val === dieType
                  ? 'border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  : val === 1
                  ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white'
              }`}
            >
              {val}
            </div>
          ))}
        </div>

        {/* Sum Breakdown */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Total Roll Result
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalWithMod}{' '}
              {modifier !== 0 && (
                <span className="text-xs font-semibold text-slate-500">
                  (Base: {sum} {modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`})
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => onCopy(String(totalWithMod))}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Sum</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. COIN FLIP
// -------------------------------------------------------------
function CoinFlip({ onCopy }: { onCopy: (text: string) => void }) {
  const [result, setResult] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    let flips = 0;
    const interval = setInterval(() => {
      setResult((prev) => (prev === 'heads' ? 'tails' : 'heads'));
      flips++;
      if (flips >= 12) {
        clearInterval(interval);
        // Cryptographically secure 50/50
        const buf = new Uint8Array(1);
        crypto.getRandomValues(buf);
        const outcome = buf[0] % 2 === 0 ? 'heads' : 'tails';
        setResult(outcome);
        if (outcome === 'heads') setHeadsCount((c) => c + 1);
        else setTailsCount((c) => c + 1);
        setIsFlipping(false);
      }
    }, 75);
  };

  const total = headsCount + tailsCount;

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-6">
        {/* Animated Coin */}
        <div
          onClick={flipCoin}
          className={`w-36 h-36 rounded-full border-4 border-amber-500 bg-linear-to-tr from-amber-400 to-amber-200 shadow-xl flex items-center justify-center cursor-pointer select-none transition-transform duration-100 ${
            isFlipping ? 'scale-90 rotate-y-180 opacity-80' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <span className="text-xl font-black text-amber-950 uppercase tracking-widest">
            {result}
          </span>
        </div>

        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
        >
          <Coins className="w-4 h-4" />
          <span>{isFlipping ? 'Flipping...' : 'Flip Coin'}</span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Heads</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
              {headsCount}
            </span>
            <span className="text-[10px] text-slate-400">
              {total > 0 ? `${((headsCount / total) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Tails</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
              {tailsCount}
            </span>
            <span className="text-[10px] text-slate-400">
              {total > 0 ? `${((tailsCount / total) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. RANDOM NUMBER GENERATOR
// -------------------------------------------------------------
function RandomNumberGenerator({ onCopy }: { onCopy: (text: string) => void }) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(5);
  const [unique, setUnique] = useState(true);
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('asc');
  const [generated, setGenerated] = useState<number[]>([]);

  const handleGenerate = () => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    const qty = Math.min(Math.max(1, count), unique ? range : 1000);

    const results: number[] = [];

    if (unique && qty <= range) {
      const pool = Array.from({ length: range }, (_, i) => lo + i);
      for (let i = 0; i < qty; i++) {
        const idx = secureRandomInt(pool.length);
        results.push(pool[idx]);
        pool.splice(idx, 1);
      }
    } else {
      for (let i = 0; i < qty; i++) {
        results.push(lo + secureRandomInt(range));
      }
    }

    if (sort === 'asc') results.sort((a, b) => a - b);
    if (sort === 'desc') results.sort((a, b) => b - a);

    setGenerated(results);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Minimum
            </label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Maximum
            </label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Sorting
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            >
              <option value="none">Unsorted</option>
              <option value="asc">Ascending (1 &rarr; 9)</option>
              <option value="desc">Descending (9 &rarr; 1)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              Unique numbers only (No duplicates)
            </span>
          </label>

          <button
            onClick={handleGenerate}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Numbers</span>
          </button>
        </div>

        {/* Results */}
        {generated.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Generated Numbers ({generated.length})
              </span>
              <button
                onClick={() => onCopy(generated.join(', '))}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy List</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generated.map((n, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-900/60 text-sm font-black text-slate-900 dark:text-white shadow-xs"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
