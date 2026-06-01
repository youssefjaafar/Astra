import { EmptyState } from "@/components/astra/EmptyState";
import { SectionHeader } from "@/components/astra/SectionHeader";
import { MotionPanel } from "@/components/motion-panel";

type PlaceholderPageProps = {
  title: string;
  description: string;
  emptyTitle?: string;
};

export function PlaceholderPage({ title, description, emptyTitle }: PlaceholderPageProps) {
  return (
    <MotionPanel>
      <div className="space-y-6">
        <SectionHeader title={title} subtitle={description} />
        <EmptyState
          title={emptyTitle ?? `${title} module is in orbit`}
          description="This surface is ready for the next build pass. For now, Astra keeps the signal calm and leaves room for the real workflow."
        />
      </div>
    </MotionPanel>
  );
}
