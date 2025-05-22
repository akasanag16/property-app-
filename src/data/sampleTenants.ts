
import { Tenant } from "@/types/tenant";
import { v4 as uuidv4 } from 'uuid';
import { sampleProperties } from "./sampleProperties";

// Create sample tenants based on the sample properties
export const sampleTenants: Tenant[] = [
  {
    id: uuidv4(),
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    properties: [{
      id: sampleProperties[0].id,
      name: sampleProperties[0].name,
    }],
    last_payment: {
      amount: 2200,
      date: "2025-04-01",
      status: "paid"
    },
    next_payment: {
      amount: 2200,
      date: "2025-05-01",
      due_in_days: 10
    }
  },
  {
    id: uuidv4(),
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@example.com",
    properties: [{
      id: sampleProperties[1].id,
      name: sampleProperties[1].name,
    }],
    last_payment: {
      amount: 1800,
      date: "2025-04-01",
      status: "paid"
    },
    next_payment: {
      amount: 1800,
      date: "2025-05-01",
      due_in_days: 10
    }
  },
  {
    id: uuidv4(),
    first_name: "Michael",
    last_name: "Brown",
    email: "mbrown@example.com",
    properties: [{
      id: sampleProperties[2].id,
      name: sampleProperties[2].name,
    }],
    last_payment: {
      amount: 2800,
      date: "2025-03-28",
      status: "pending"
    },
    next_payment: {
      amount: 2800,
      date: "2025-04-28",
      due_in_days: 7
    }
  },
  {
    id: uuidv4(),
    first_name: "Emma",
    last_name: "Wilson",
    email: "ewilson@example.com",
    properties: [{
      id: sampleProperties[3].id,
      name: sampleProperties[3].name,
    }],
    last_payment: {
      amount: 2000,
      date: "2025-03-15",
      status: "overdue"
    },
    next_payment: {
      amount: 2000,
      date: "2025-04-15",
      due_in_days: 0
    }
  },
  {
    id: uuidv4(),
    first_name: "David",
    last_name: "Lee",
    email: "dlee@example.com",
    properties: [{
      id: sampleProperties[4].id,
      name: sampleProperties[4].name,
    }],
    last_payment: {
      amount: 2600,
      date: "2025-03-31",
      status: "paid"
    },
    next_payment: {
      amount: 2600,
      date: "2025-04-30",
      due_in_days: 9
    }
  },
  {
    id: uuidv4(),
    first_name: "Jessica",
    last_name: "Garcia",
    email: "jgarcia@example.com",
    properties: [{
      id: sampleProperties[5].id,
      name: sampleProperties[5].name,
    }],
    last_payment: {
      amount: 3200,
      date: "2025-04-05",
      status: "paid"
    },
    next_payment: {
      amount: 3200,
      date: "2025-05-05",
      due_in_days: 14
    }
  }
];
