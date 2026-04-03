import React, { useState } from 'react';
import { useStore } from '../store/UserActivityStore';
import { Avatar } from './Avatar';
import { DailyInputForm } from './DailyInputForm';
import { Activity, Droplets, Moon, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';


const GenderSelect: React.FC = () => {
  const { profile, setProfile } = useStore();
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {(['male', 'female', 'other'] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setProfile({ gender: g })}
          style={{
            flex: 1,
            background: profile.gender === g ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)',
            color: profile.gender === g ? '#000' : 'var(--text-primary)',
            border: '1px solid ' + (profile.gender === g ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'),
            borderRadius: '8px',
            padding: '8px 4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
            fontSize: '0.8rem',
            transition: 'all 0.2s',
            textTransform: 'capitalize',
          }}
        >
          {g}
        </button>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { profile, metrics, setProfile, resetDailyMetrics, triggerAvatarGeneration } = useStore();

  // Mood status label
  const isTired = metrics.sleepHours > 0 && metrics.sleepHours < 6;
  const isPumped = metrics.exerciseMins >= 60;
  const isHappy = metrics.exerciseMins >= 30 && metrics.sleepHours >= 7;
  const moodLabel = isPumped ? '🔥 Pumped' : isHappy ? '😊 Happy' : isTired ? '😴 Tired' : '😐 Neutral';
  const moodColor = isPumped ? '#ff6b35' : isHappy ? '#00ffaa' : isTired ? '#9d00ff' : 'var(--text-secondary)';

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 20px 60px' }} className="fade-in">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>
            Gymastic
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{profile.name}</strong>!
            &nbsp;·&nbsp;
            <span style={{ color: moodColor, fontWeight: 700 }}>{moodLabel}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/assessment"
            className="btn"
            style={{ textDecoration: 'none', background: 'rgba(157, 0, 255, 0.1)', border: '1px solid rgba(157, 0, 255, 0.3)', color: '#d580ff', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
          >
            <Layers size={16} /> System Assessment
          </Link>
          <button
            onClick={() => triggerAvatarGeneration()}
            title="Regenerate AI Avatar"
            className="btn"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,240,255,0.4)',
              color: 'var(--accent-color)',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px'
            }}
          >
            <RefreshCw size={16} /> Regenerate
          </button>
          <button
            onClick={resetDailyMetrics}
            className="btn"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)', padding: '10px 16px' }}
          >
            Reset Day
          </button>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 2.2fr) minmax(260px, 1fr)',
        gap: '28px',
        alignItems: 'start',
      }}>

        {/* ── LEFT: Profile ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel">
            <h2 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Your Profile</h2>
            <p style={{ fontSize: '0.8rem', marginBottom: '20px' }}>Attributes shape your avatar.</p>

            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
            />

            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Gender</label>
            <GenderSelect />

            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Height (cm)</label>
            <input
              type="number"
              className="input-field"
              value={profile.height}
              onChange={(e) => setProfile({ height: Number(e.target.value) })}
            />

            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Weight (kg)</label>
            <input
              type="number"
              className="input-field"
              value={profile.weight}
              onChange={(e) => setProfile({ weight: Number(e.target.value) })}
            />

            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hair Color</label>
            <input
              type="color"
              className="input-field"
              style={{ padding: '4px', height: '44px', cursor: 'pointer' }}
              value={profile.hairColor}
              onChange={(e) => setProfile({ hairColor: e.target.value })}
            />
          </div>


        </div>

        {/* ── CENTER: Avatar ── */}
        <div className="glass-panel" style={{
          height: '640px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'radial-gradient(ellipse at center, rgba(0,200,255,0.06) 0%, rgba(0,0,0,0) 70%)',
          overflow: 'hidden',
          padding: '16px',
        }}>
          <Avatar />
        </div>

        {/* ── RIGHT: Inputs + Vitals ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DailyInputForm />

          {/* Vitals panel */}
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Today's Vitals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <VitalBar
                icon={<Droplets size={16} color="var(--accent-color)" />}
                label="Calories"
                value={`${metrics.calories} kcal`}
                pct={Math.min(100, (metrics.calories / 2500) * 100)}
                barColor="var(--accent-color)"
              />
              <VitalBar
                icon={<Activity size={16} color="#00ffaa" />}
                label="Exercise"
                value={`${metrics.exerciseMins} mins`}
                pct={Math.min(100, (metrics.exerciseMins / 60) * 100)}
                barColor="#00ffaa"
              />
              <VitalBar
                icon={<Moon size={16} color="#9d00ff" />}
                label="Sleep"
                value={`${metrics.sleepHours} hrs`}
                pct={Math.min(100, (metrics.sleepHours / 8) * 100)}
                barColor="#9d00ff"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VitalBar: React.FC<{ icon: React.ReactNode; label: string; value: string; pct: number; barColor: string }> = ({
  icon, label, value, pct, barColor
}) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <span style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.88rem' }}>{icon} {label}</span>
      <strong style={{ fontSize: '1rem' }}>{value}</strong>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`,
        background: barColor,
        height: '100%',
        borderRadius: '99px',
        transition: 'width 0.5s ease',
        boxShadow: `0 0 8px ${barColor}`,
      }} />
    </div>
  </div>
);
