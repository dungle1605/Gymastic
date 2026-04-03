import React from 'react';
import { useStore } from '../store/UserActivityStore';
import { CheckCircle, Circle, AlertTriangle, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
  if (priority === 'high') return <AlertCircle size={18} color="#ff3b30" />;
  if (priority === 'medium') return <AlertTriangle size={18} color="#ff9500" />;
  return <Info size={18} color="#34c759" />;
};

export const SystemAssessment: React.FC = () => {
  const { issues, enhancements, toggleIssueStatus } = useStore();

  const sortedIssues = [...issues].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 60px' }} className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
        <Link to="/" className="btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <ArrowLeft size={18} /> Back
        </Link>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>
          System Assessment
        </h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>System Issues</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Click to mark issues as done in real-time. Status syncs across tabs.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedIssues.map((issue) => (
              <div 
                key={issue.id} 
                onClick={() => toggleIssueStatus(issue.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: `1px solid ${issue.status === 'done' ? 'rgba(0,255,170,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.2s',
                  opacity: issue.status === 'done' ? 0.6 : 1,
                  textDecoration: issue.status === 'done' ? 'line-through' : 'none',
                }}>
                <div style={{ color: issue.status === 'done' ? '#00ffaa' : 'var(--text-secondary)' }}>
                  {issue.status === 'done' ? <CheckCircle size={24} /> : <Circle size={24} />}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '1.1rem', color: issue.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{issue.title}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    <PriorityIcon priority={issue.priority} /> {issue.priority} Priority
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: issue.status === 'done' ? '#00ffaa' : 'var(--accent-color)' }}>
                  {issue.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Feature Enhancements</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Planned upgrades for Gymastic.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {enhancements.map((enh) => (
              <div key={enh.id} style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 0, 0, 0.2))',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ background: 'rgba(0, 240, 255, 0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={16} color="var(--accent-color)" />
                </div>
                <strong style={{ fontSize: '1.05rem' }}>{enh.title}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>Planned</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
