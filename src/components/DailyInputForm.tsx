import React, { useState } from 'react';
import { useStore } from '../store/UserActivityStore';
import { Activity, Moon, Flame, Zap } from 'lucide-react';

type MealEntry = { name: string; calories: number };
type ExerciseEntry = { name: string; minutes: number };

const PRESET_MEALS: MealEntry[] = [
  { name: 'Breakfast', calories: 400 },
  { name: 'Lunch', calories: 600 },
  { name: 'Dinner', calories: 700 },
  { name: 'Snack', calories: 200 },
];

const PRESET_EXERCISES: ExerciseEntry[] = [
  { name: 'Running', minutes: 30 },
  { name: 'Weight Training', minutes: 45 },
  { name: 'Cycling', minutes: 40 },
  { name: 'Yoga', minutes: 30 },
  { name: 'Swimming', minutes: 40 },
];

export const DailyInputForm: React.FC = () => {
  const { metrics, setMetrics, triggerAvatarGeneration, isGeneratingAvatar } = useStore();

  const [cal, setCal] = useState<number | string>('');
  const [sleep, setSleep] = useState<number | string>('');
  const [exr, setExr] = useState<number | string>('');

  const addPresetMeal = (meal: MealEntry) => {
    setCal((prev) => (Number(prev) || 0) + meal.calories);
  };

  const addPresetExercise = (ex: ExerciseEntry) => {
    setExr((prev) => (Number(prev) || 0) + ex.minutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMetrics = {
      calories: metrics.calories + (Number(cal) || 0),
      sleepHours: metrics.sleepHours + (Number(sleep) || 0),
      exerciseMins: metrics.exerciseMins + (Number(exr) || 0),
    };
    setMetrics(updatedMetrics);
    setCal('');
    setSleep('');
    setExr('');
    // Trigger AI avatar generation with latest combined values
    await triggerAvatarGeneration(updatedMetrics);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Log Activity</h2>
      <p style={{ fontSize: '0.85rem' }}>Log your stats and your AI avatar will reflect them.</p>

      {/* Quick-add meals */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: 1 }}>Quick Add Meals</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_MEALS.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => addPresetMeal(m)}
              style={{
                background: 'rgba(0,240,255,0.08)',
                border: '1px solid rgba(0,240,255,0.2)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-family)',
              }}
            >
              {m.name} <span style={{ color: 'var(--accent-color)' }}>+{m.calories}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick-add exercises */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: 1 }}>Quick Add Exercise</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_EXERCISES.map((ex) => (
            <button
              key={ex.name}
              type="button"
              onClick={() => addPresetExercise(ex)}
              style={{
                background: 'rgba(0,255,170,0.08)',
                border: '1px solid rgba(0,255,170,0.2)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-family)',
              }}
            >
              {ex.name} <span style={{ color: '#00ffaa' }}>+{ex.minutes}m</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '37px', color: 'var(--accent-color)', pointerEvents: 'none' }}>
            <Flame size={18} />
          </div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Calories (kcal)</label>
          <input
            type="number"
            placeholder="e.g. 600"
            className="input-field"
            value={cal}
            onChange={(e) => setCal(e.target.value)}
            style={{ paddingLeft: '40px', marginTop: '4px', marginBottom: 0 }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '37px', color: '#9d00ff', pointerEvents: 'none' }}>
            <Moon size={18} />
          </div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Sleep (hours)</label>
          <input
            type="number"
            placeholder="e.g. 7.5"
            className="input-field"
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            style={{ paddingLeft: '40px', marginTop: '4px', marginBottom: 0 }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '37px', color: '#00ffaa', pointerEvents: 'none' }}>
            <Activity size={18} />
          </div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Exercise (minutes)</label>
          <input
            type="number"
            placeholder="e.g. 45"
            className="input-field"
            value={exr}
            onChange={(e) => setExr(e.target.value)}
            style={{ paddingLeft: '40px', marginTop: '4px', marginBottom: 0 }}
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={isGeneratingAvatar}
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isGeneratingAvatar ? 0.7 : 1,
            cursor: isGeneratingAvatar ? 'not-allowed' : 'pointer',
          }}
        >
          <Zap size={18} />
          {isGeneratingAvatar ? 'Generating Avatar…' : 'Update & Generate Avatar'}
        </button>
      </form>
    </div>
  );
};
