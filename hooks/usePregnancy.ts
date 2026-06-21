import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PregnancyInfo = {
  dueDate: Date;
  week: number;
  day: number;
  daysToGo: number;
  trimester: 1 | 2 | 3;
};

/** Loads the active pregnancy and derives the current week / trimester. */
export function usePregnancy(): PregnancyInfo | null {
  const [info, setInfo] = useState<PregnancyInfo | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { data } = await supabase
          .from('pregnancies').select('due_date').eq('is_active', true)
          .order('created_at', { ascending: false }).limit(1);
        if (!data || data.length === 0) { setInfo(null); return; }
        const dueDate = new Date(data[0].due_date + 'T00:00:00');
        const daysToGo = Math.max(0, Math.round((dueDate.getTime() - Date.now()) / 86400000));
        const daysAlong = 280 - daysToGo;
        const week = Math.max(0, Math.floor(daysAlong / 7));
        const day = Math.max(0, daysAlong % 7);
        const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
        setInfo({ dueDate, week, day, daysToGo, trimester });
      })();
    }, [])
  );

  return info;
}

/** "Week 24 · Trimester 2" subtitle for the shared tab header. */
export function weekSubtitle(info: PregnancyInfo | null): string {
  if (!info) return 'Your pregnancy journey';
  return `Week ${info.week} · Trimester ${info.trimester}`;
}
