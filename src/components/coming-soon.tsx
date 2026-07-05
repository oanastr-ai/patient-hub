import { ro } from "@/i18n/ro";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {ro.common.comingSoon}
        </CardContent>
      </Card>
    </div>
  );
}
