
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tenant } from "@/types/tenant";

interface TenantTableProps {
  tenants: Tenant[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Payment Information</CardTitle>
        <CardDescription>
          Overview of all tenant payments and due dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">
                  {tenant.first_name} {tenant.last_name}
                </TableCell>
                <TableCell>{tenant.property.name}</TableCell>
                <TableCell>{tenant.last_payment?.date}</TableCell>
                <TableCell>{tenant.next_payment?.date}</TableCell>
                <TableCell>${tenant.next_payment?.amount}</TableCell>
                <TableCell>
                  <span 
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      tenant.last_payment?.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : tenant.last_payment?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tenant.last_payment?.status === 'paid' 
                      ? 'Paid' 
                      : tenant.last_payment?.status === 'pending'
                        ? 'Pending'
                        : 'Overdue'
                    }
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
