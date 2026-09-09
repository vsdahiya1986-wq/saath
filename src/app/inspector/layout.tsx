import type { ReactNode } from 'react';
import CircleGate from '@/components/circle/CircleGate';

export default function InspectorLayout({ children }: { children: ReactNode }) {
  return <CircleGate>{children}</CircleGate>;
}
