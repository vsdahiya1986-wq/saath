import type { Activity } from '@/lib/db';
import ActivityRunnerClient from './ActivityRunnerClient';

const ALL_ACTIVITIES: Activity[] = ['familiar_pairs', 'sound_sight', 'pattern_garden', 'my_next_step', 'together'];

export function generateStaticParams() {
  return ALL_ACTIVITIES.map((activity) => ({ activity }));
}

export default async function ActivityRunnerPage({ params }: { params: Promise<{ activity: string }> }) {
  const { activity } = await params;
  return <ActivityRunnerClient activity={activity as Activity} />;
}
