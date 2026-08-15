import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

export function PlaceholderModule({
  title,
  subtitle,
  note,
  tone = "deep-water",
}: {
  title: string;
  subtitle: string;
  note: string;
  tone?: "deep-water" | "water-mid";
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} tone={tone} />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="flex flex-col gap-2 border-dashed p-5 text-center">
          <span className="text-2xl">🧭</span>
          <p className="text-sm text-muted-2">{note}</p>
        </Card>
      </main>
    </div>
  );
}
