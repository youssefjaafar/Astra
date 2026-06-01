import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionGridProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionGrid({ title, description, children, className, contentClassName }: SectionGridProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
