
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MaintenanceStatusCardProps = {
  title: string;
  description: string;
  count: number;
  color: string;
};

export function MaintenanceStatusCard({ title, description, count, color }: MaintenanceStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{count}</div>
      </CardContent>
    </Card>
  );
}
