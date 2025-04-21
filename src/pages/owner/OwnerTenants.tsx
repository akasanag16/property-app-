
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
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

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  property: {
    id: string;
    name: string;
  };
  email: string;
  last_payment?: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue';
  };
  next_payment?: {
    amount: number;
    date: string;
    due_in_days: number;
  };
};

// Sample data for demonstration
const sampleTenants: Tenant[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    property: {
      id: "1",
      name: "Riverdale Apartment"
    },
    email: "john.doe@example.com",
    last_payment: {
      amount: 2200,
      date: "2025-04-01",
      status: 'paid'
    },
    next_payment: {
      amount: 2200,
      date: "2025-05-01",
      due_in_days: 10
    }
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    property: {
      id: "2",
      name: "Sunset Condo"
    },
    email: "jane.smith@example.com",
    last_payment: {
      amount: 1800,
      date: "2025-04-05",
      status: 'paid'
    },
    next_payment: {
      amount: 1800,
      date: "2025-05-05",
      due_in_days: 14
    }
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Johnson",
    property: {
      id: "3",
      name: "Lakeside House"
    },
    email: "michael.johnson@example.com",
    last_payment: {
      amount: 2800,
      date: "2025-03-28",
      status: 'overdue'
    },
    next_payment: {
      amount: 2800,
      date: "2025-04-28",
      due_in_days: 7
    }
  },
  {
    id: "4",
    first_name: "Emily",
    last_name: "Brown",
    property: {
      id: "4",
      name: "Downtown Loft"
    },
    email: "emily.brown@example.com",
    last_payment: {
      amount: 2000,
      date: "2025-04-10",
      status: 'pending'
    },
    next_payment: {
      amount: 2000,
      date: "2025-05-10",
      due_in_days: 19
    }
  },
  {
    id: "5",
    first_name: "David",
    last_name: "Wilson",
    property: {
      id: "5",
      name: "Park View Townhouse"
    },
    email: "david.wilson@example.com",
    last_payment: {
      amount: 2600,
      date: "2025-04-03",
      status: 'paid'
    },
    next_payment: {
      amount: 2600,
      date: "2025-05-03",
      due_in_days: 12
    }
  }
];

export default function OwnerTenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate total expected income for the month
  const totalMonthlyIncome = tenants.reduce((total, tenant) => 
    total + (tenant.next_payment?.amount || 0), 0
  );

  // Calculate overdue payments
  const overduePayments = tenants.filter(tenant => 
    tenant.last_payment?.status === 'overdue'
  );

  // Calculate upcoming payments
  const upcomingPayments = tenants.filter(tenant => 
    tenant.next_payment && tenant.next_payment.due_in_days <= 7
  );

  const fetchTenants = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch tenant data from the database
      // For demo purposes, use the sample data
      setTenants(sampleTenants);
      
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTenants();
  }, [user, refreshKey]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tenants</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <p className="text-gray-600">
          View and manage your tenants and their payments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Tenants</CardTitle>
              <CardDescription>Active tenants across properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div className="text-3xl font-bold">{tenants.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Monthly Income</CardTitle>
              <CardDescription>Expected rent this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                <div className="text-3xl font-bold">${totalMonthlyIncome.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
              <CardDescription>Overview of rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <TrendingDown className="h-6 w-6 text-red-500 mb-1" />
                  <div className="text-xl font-bold">{overduePayments.length}</div>
                  <div className="text-xs text-gray-500">Overdue</div>
                </div>

                <div className="flex flex-col items-center">
                  <TrendingUp className="h-6 w-6 text-orange-500 mb-1" />
                  <div className="text-xl font-bold">{upcomingPayments.length}</div>
                  <div className="text-xs text-gray-500">Due Soon</div>
                </div>

                <div className="flex flex-col items-center">
                  <DollarSign className="h-6 w-6 text-green-500 mb-1" />
                  <div className="text-xl font-bold">
                    {tenants.filter(t => t.last_payment?.status === 'paid').length}
                  </div>
                  <div className="text-xs text-gray-500">Paid</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">No Tenants Found</h2>
            <p className="text-gray-500 mb-4">
              You don't have any tenants yet. Add properties and invite tenants.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </DashboardLayout>
  );
}
