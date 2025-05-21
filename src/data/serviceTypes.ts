
import { HomeIcon, Shirt, Wrench, RefreshCw } from "lucide-react";

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  providers: number;
}

export const serviceTypes: ServiceType[] = [
  {
    id: "1",
    name: "Home Cleaning",
    description: "Professional cleaning services for your properties",
    icon: HomeIcon,
    color: "text-blue-500",
    providers: 8
  },
  {
    id: "2",
    name: "Laundry Services",
    description: "Pickup and delivery laundry services for tenants",
    icon: Shirt,
    color: "text-green-500",
    providers: 5
  },
  {
    id: "3",
    name: "Plumbing",
    description: "Professional plumbing repair and maintenance",
    icon: Wrench,
    color: "text-orange-500",
    providers: 12
  },
  {
    id: "4",
    name: "Electrical",
    description: "Licensed electricians for all electrical needs",
    icon: Wrench,
    color: "text-yellow-500",
    providers: 9
  },
  {
    id: "5",
    name: "HVAC",
    description: "Heating, ventilation, and air conditioning services",
    icon: Wrench,
    color: "text-purple-500",
    providers: 7
  },
  {
    id: "6",
    name: "Gardening & Landscaping",
    description: "Lawn care and landscape maintenance",
    icon: HomeIcon,
    color: "text-green-600",
    providers: 6
  },
  {
    id: "7",
    name: "Furniture Assembly",
    description: "Professional furniture assembly services",
    icon: HomeIcon,
    color: "text-indigo-500",
    providers: 4
  },
  {
    id: "8",
    name: "Locksmith",
    description: "Emergency locksmith and security services",
    icon: HomeIcon,
    color: "text-gray-600",
    providers: 3
  }
];
