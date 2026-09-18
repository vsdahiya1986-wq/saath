import { ACTIVITIES, LEGACY_SLUGS, activityForSlug } from '@/content/activities';
import ActivityRunnerClient from './ActivityRunnerClient';
import LegacyRedirect from './LegacyRedirect';

/**
 * One page per activity slug (R4), plus one per pre-rename slug so shared links
 * keep working. The slug is only a URL: the stored activity id it maps to is
 * unchanged, so trial history and the engine's queries are untouched.
 */
export function generateStaticParams() {
  return [...ACTIVITIES.map((a) => ({ activity: a.slug })), ...Object.keys(LEGACY_SLUGS).map((old) => ({ activity: old }))];
}

export default async function ActivityRunnerPage({ params }: { params: Promise<{ activity: string }> }) {
  const { activity: slug } = await params;

  const renamedTo = LEGACY_SLUGS[slug];
  if (renamedTo) return <LegacyRedirect to={`/play/${renamedTo}`} />;

  const activity = activityForSlug(slug);
  if (!activity) return null;
  return <ActivityRunnerClient activity={activity} />;
}
