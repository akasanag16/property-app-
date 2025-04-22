
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
  details?: PropertyDetails;
  image_url?: string | null;
};

export type PropertyRole = 'tenant' | 'owner' | 'service_provider';

