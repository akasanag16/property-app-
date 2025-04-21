
import { v4 as uuidv4 } from 'uuid';

export type PropertyPhoto = {
  id: string;
  url: string;
  propertyId: string;
  isPrimary: boolean;
};

export type SampleProperty = {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'condo' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  area: number; // square feet
  rent: number;
  photos: PropertyPhoto[];
};

export const sampleProperties: SampleProperty[] = [
  {
    id: uuidv4(),
    name: "Riverdale Apartment",
    address: "123 Riverdale Ave, New York, NY 10001",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 1,
    area: 850,
    rent: 2200,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        propertyId: "1",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Sunset Condo",
    address: "456 Sunset Blvd, Los Angeles, CA 90001",
    type: "condo",
    bedrooms: 1,
    bathrooms: 1,
    area: 700,
    rent: 1800,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
        propertyId: "2",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Lakeside House",
    address: "789 Lakeside Dr, Chicago, IL 60001",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    rent: 2800,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
        propertyId: "3",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Downtown Loft",
    address: "101 Main St, Seattle, WA 98001",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    rent: 2000,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        propertyId: "4",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Park View Townhouse",
    address: "202 Park Ave, Boston, MA 02101",
    type: "townhouse",
    bedrooms: 2,
    bathrooms: 2.5,
    area: 1200,
    rent: 2600,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        propertyId: "5",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Harbor Heights",
    address: "303 Harbor Blvd, San Francisco, CA 94101",
    type: "condo",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    rent: 3200,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        propertyId: "6",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Mountain View Retreat",
    address: "404 Mountain Rd, Denver, CO 80201",
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    rent: 3500,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        propertyId: "7",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Beachside Studio",
    address: "505 Beach St, Miami, FL 33101",
    type: "apartment",
    bedrooms: 0,
    bathrooms: 1,
    area: 500,
    rent: 1500,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        propertyId: "8",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "Garden Oasis",
    address: "606 Garden Ave, Austin, TX 78701",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    rent: 2400,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
        propertyId: "9",
        isPrimary: true
      },
    ]
  },
  {
    id: uuidv4(),
    name: "City Center Condo",
    address: "707 City Center, Atlanta, GA 30301",
    type: "condo",
    bedrooms: 2,
    bathrooms: 2,
    area: 1000,
    rent: 2100,
    photos: [
      {
        id: uuidv4(),
        url: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
        propertyId: "10",
        isPrimary: true
      },
    ]
  }
];
