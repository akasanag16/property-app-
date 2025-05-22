
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRentReminders } from "@/hooks/rent/useRentReminders";
import { RentReminder, CreateRentReminderParams } from "@/types/rent";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RentReminderFormProps {
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}

export function RentReminderForm({ propertyId, propertyName, onSuccess }: RentReminderFormProps) {
  const { user } = useAuth();
  const { rentReminders, isLoading, isCreating, createRentReminder, getPropertyReminder } = useRentReminders(user);
  
  const [reminderDay, setReminderDay] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [tenantNotificationDays, setTenantNotificationDays] = useState<number>(4);
  const [ownerNotificationDays, setOwnerNotificationDays] = useState<number>(5);

  // Initialize form with existing reminder data if available
  useEffect(() => {
    const existingReminder = getPropertyReminder(propertyId);
    if (existingReminder) {
      setReminderDay(existingReminder.reminder_day);
      setAmount(existingReminder.amount);
      setTenantNotificationDays(existingReminder.tenant_notification_days);
      setOwnerNotificationDays(existingReminder.owner_notification_days);
    }
  }, [propertyId, rentReminders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: CreateRentReminderParams = {
      property_id: propertyId,
      reminder_day: reminderDay,
      amount,
      tenant_notification_days: tenantNotificationDays,
      owner_notification_days: ownerNotificationDays
    };
    
    createRentReminder.mutate(params, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="property-name">Property</Label>
            <Input id="property-name" value={propertyName} readOnly disabled className="bg-gray-100" />
          </div>
          
          <div>
            <Label htmlFor="reminder-day">Rent due day of month</Label>
            <Input 
              id="reminder-day" 
              type="number" 
              min={1} 
              max={31} 
              value={reminderDay} 
              onChange={(e) => setReminderDay(parseInt(e.target.value))} 
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Day of the month when rent is due (1-31)
            </p>
          </div>
          
          <div>
            <Label htmlFor="amount">Monthly Rent Amount ($)</Label>
            <Input 
              id="amount" 
              type="number" 
              min={0.01}
              step={0.01}
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value))} 
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenant-notification">Notify Tenant Days Before</Label>
              <Input 
                id="tenant-notification" 
                type="number" 
                min={1} 
                max={30} 
                value={tenantNotificationDays} 
                onChange={(e) => setTenantNotificationDays(parseInt(e.target.value))} 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="owner-notification">Notify Owner Days Before</Label>
              <Input 
                id="owner-notification" 
                type="number" 
                min={1} 
                max={30} 
                value={ownerNotificationDays} 
                onChange={(e) => setOwnerNotificationDays(parseInt(e.target.value))} 
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating}
          >
            {isCreating ? <LoadingSpinner size="sm" /> : 'Save Rent Reminder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
