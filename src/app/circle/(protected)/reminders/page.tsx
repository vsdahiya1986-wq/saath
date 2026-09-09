'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { Reminder, remindersForPerson, db } from '@/lib/db';
import { scheduleReminder, cancelReminder, ensurePermission } from '@/lib/reminders';
import AnalogClock from '@/components/ui/AnalogClock';

export default function ReminderScheduler() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [category, setCategory] = useState<Reminder['category']>('medicine');
  const [carePlanText, setCarePlanText] = useState('');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [permissionWarning, setPermissionWarning] = useState(false);

  async function refresh(id: string) {
    setReminders(await remindersForPerson(id));
  }

  useEffect(() => {
    getActivePersonId().then((id) => {
      setPersonId(id);
      if (id) refresh(id);
    });
  }, []);

  async function add() {
    if (!personId || !carePlanText.trim()) return;
    const granted = await ensurePermission().catch(() => false);
    if (!granted) setPermissionWarning(true);

    const r: Reminder = {
      id: uuid(),
      person_id: personId,
      category,
      care_plan_text: carePlanText.trim(),
      hour,
      minute,
      period,
      version: 1,
      device_activated: false,
    };
    if (granted) {
      await scheduleReminder(r);
    } else {
      // Store it either way — the UI must say plainly it is not armed, never pretend.
      const { putReminder } = await import('@/lib/db');
      await putReminder(r);
    }
    setCarePlanText('');
    await refresh(personId);
  }

  async function remove(r: Reminder) {
    await cancelReminder(r);
    await db.reminders.delete(r.id);
    if (personId) await refresh(personId);
  }

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-6 max-w-lg mx-auto">
      <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
        Reminders
      </h1>

      {permissionWarning && (
        <p style={{ fontSize: 14, color: 'var(--alert)' }}>
          Notification permission was not granted. Reminders are saved but will NOT fire on this device until it is
          allowed in system settings.
        </p>
      )}

      <section style={cardStyle} className="flex flex-col gap-3">
        <h2 style={{ fontSize: 18 }} className="font-black">
          New reminder
        </h2>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Reminder['category'])} style={inputStyle}>
            <option value="medicine">Medicine</option>
            <option value="hydration">Hydration</option>
            <option value="activity">Activity</option>
            <option value="appointment">Appointment</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Care-plan text (pasted, never generated)</span>
          <textarea value={carePlanText} onChange={(e) => setCarePlanText(e.target.value)} style={{ ...inputStyle, minHeight: 72 }} />
        </label>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 14 }}>Hour</span>
            <select value={hour} onChange={(e) => setHour(Number(e.target.value))} style={inputStyle}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 14 }}>Minute</span>
            <select value={minute} onChange={(e) => setMinute(Number(e.target.value))} style={inputStyle}>
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 14 }}>Period</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')} style={inputStyle}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          <AnalogClock hour={hour} minute={minute} size={56} />
        </div>
        <button onClick={add} disabled={!carePlanText.trim()} style={{ minHeight: 52, background: 'var(--accent)', borderRadius: 'var(--radius)' }} className="text-white font-black disabled:opacity-40">
          Schedule
        </button>
      </section>

      <section className="flex flex-col gap-2">
        {reminders.map((r) => (
          <div key={r.id} style={cardStyle} className="flex items-center gap-3">
            <AnalogClock hour={r.hour} minute={r.minute} size={48} />
            <div className="flex-1">
              <div style={{ fontSize: 16 }} className="font-black capitalize">
                {r.category} — {r.hour}:{String(r.minute).padStart(2, '0')} {r.period}
              </div>
              <div style={{ fontSize: 13 }} className="text-[var(--text-muted)]">
                {r.care_plan_text} · {r.device_activated ? 'armed' : 'NOT armed'} · v{r.version}
              </div>
            </div>
            <button onClick={() => remove(r)} style={{ fontSize: 12, color: 'var(--alert)' }}>
              Remove
            </button>
          </div>
        ))}
        {!reminders.length && <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">No reminders yet.</p>}
      </section>

      <Link href="/circle" style={{ fontSize: 14, color: 'var(--text-muted)' }} className="underline text-center">
        Back to Circle
      </Link>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
const inputStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 48, padding: '0 12px', fontSize: 16 } as const;
