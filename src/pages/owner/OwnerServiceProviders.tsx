import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorAlert } from "@/components/ui/alert-error";
import { ServiceTypeCard } from "@/components/services/ServiceTypeCard";
import { ServiceProviderCard } from "@/components/services/ServiceProviderCard";
import { ServiceProvidersHeader } from "@/components/services/ServiceProvidersHeader";
import { EmptyServiceProviderState } from "@/components/services/EmptyServiceProviderState";
import { useOwnerServiceProviders } from "@/hooks/services/useOwnerServiceProviders";
import { serviceTypes } from "@/data/serviceTypes";
import { OwnerInvitationsList } from "@/components/invitations/OwnerInvitationsList";

export default function OwnerServiceProviders() {
  const { user } = useAuth();
  const { 
    serviceProviders, 
    loading, 
    error, 
    handleRefresh,
    serviceProviderInvitations,
    invitationsLoading,
    invitationsError,
    resendingId,
    handleResendInvitation
  } = useOwnerServiceProviders(user?.id);

  const handleViewProviders = (serviceName: string) => {
    toast.info(`Viewing ${serviceName} providers`);
    // In a real app, this would navigate to a detailed list of providers for this service
  };

  const handleAddToProperty = (serviceName: string) => {
    toast.success(`${serviceName} added to your properties`);
    // In a real app, this would open a modal to select which properties to add this service to
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ServiceProvidersHeader onRefresh={handleRefresh} loading={loading || invitationsLoading} />
        
        <p className="text-gray-600">
          Browse and manage service providers for your properties. These services can be offered to your tenants.
        </p>

        {error && (
          <ErrorAlert message={error} onRetry={handleRefresh} />
        )}

        {/* Pending Service Provider Invitations Section */}
        <div className="mb-6">
          <OwnerInvitationsList
            invitations={serviceProviderInvitations || []}
            loading={invitationsLoading}
            error={invitationsError}
            resendingId={resendingId}
            title="Pending Service Provider Invitations"
            emptyMessage="No pending service provider invitations"
            onResend={handleResendInvitation}
          />
        </div>

        {/* Assigned Service Providers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Assigned Service Providers</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : serviceProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceProviders.map((provider) => (
                <ServiceProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <EmptyServiceProviderState />
          )}
        </div>

        {/* Available Service Types Section */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Available Service Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((service) => (
            <ServiceTypeCard 
              key={service.id}
              service={service}
              onViewProviders={handleViewProviders}
              onAddToProperty={handleAddToProperty}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
