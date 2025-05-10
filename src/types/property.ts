
export type PropertyDetails = {
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  rent?: number;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  description?: string; // Added description property as optional
  details?: PropertyDetails;
  image_url?: string | null;
  owner_id?: string;
};

export type PropertyRole = 'tenant' | 'owner' | 'service_provider';
