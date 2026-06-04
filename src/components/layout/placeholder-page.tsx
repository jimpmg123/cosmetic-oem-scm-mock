import { PageHeader } from "@/components/layout/page-parts";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="rounded-md border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        화면 구조 placeholder — 다음 단계에서 테이블·폼 구현
      </div>
    </>
  );
}
