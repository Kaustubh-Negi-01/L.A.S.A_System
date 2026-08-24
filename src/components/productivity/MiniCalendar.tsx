import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, Tag } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { ExtractedEvent } from '../../types';

export const MiniCalendar: React.FC = () => {
  const { events, addEvent, deleteEvent } = useSharedContext();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ExtractedEvent['category']>('exam');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      category,
      actionSuggested: ['Create Study Plan', 'Set Reminder Task']
    });

    setTitle('');
    setLocation('');
    setIsAdding(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '14px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <CalendarIcon size={16} color="#c084fc" />
          <span>Extracted Schedule & Calendar</span>
        </div>
        <button
          type="button"
          className={`icon-btn calendar-add-button ${isAdding ? 'is-open' : ''}`}
          onClick={() => setIsAdding(!isAdding)}
          style={{ width: '28px', height: '28px' }}
          title="Add Event"
          aria-label="Add calendar event"
        >
          <Plus size={14} />
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddEvent}
          className="animate-slide-up"
          style={{
            padding: '10px',
            background: 'var(--surface-muted)',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '12px'
          }}
        >
          <input
            type="text"
            required
            placeholder="Event Title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '3px',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text)',
              fontSize: '12px'
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                padding: '6px',
                borderRadius: '3px',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text)',
                fontSize: '11px'
              }}
            />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                padding: '6px',
                borderRadius: '3px',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text)',
                fontSize: '11px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)} style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
              Save
            </button>
          </div>
        </form>
      )}

      <div className="calendar-event-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.length === 0 ? (
          <div className="calendar-empty-state">
            <CalendarIcon size={18} />
            <strong>No events yet</strong>
            <span>Scan a notice or add a date to keep it in view.</span>
          </div>
        ) : events.map(event => (
          <div
            key={event.id}
            className="calendar-event"
            style={{
              padding: '10px 12px',
              borderRadius: '5px',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{event.title}</span>
                <span className={`badge ${event.category === 'exam' ? 'badge-red' : event.category === 'competition' ? 'badge-amber' : 'badge-purple'}`}>
                  {event.category}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CalendarIcon size={10} color="#d08a67" />
                  {event.date}
                </span>
                {event.time && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} color="#e3b56d" />
                    {event.time}
                  </span>
                )}
                {event.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={10} color="#e39485" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g, '')}${event.time ? 'T' + event.time.replace(/:/g, '') + '00' : ''}/${event.date.replace(/-/g, '')}${event.time ? 'T' + event.time.replace(/:/g, '') + '00' : ''}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  title="Add to Google Calendar"
                  aria-label={`Add ${event.title} to Google Calendar`}
                >
                  <CalendarIcon size={12} color="var(--primary-cyan)" />
                </a>
                <button
                  type="button"
                  onClick={() => deleteEvent(event.id)}
                  className="icon-btn"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  title="Delete Event"
                  aria-label={`Delete event: ${event.title}`}
                >
                  <Trash2 size={12} color="#d27568" />
                </button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};
