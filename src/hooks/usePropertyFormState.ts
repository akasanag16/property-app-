
import { useState } from "react";

export type PropertyFormState = {
  name: string;
  address: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  rent: string;
};

const initialState: PropertyFormState = {
  name: "",
  address: "",
  type: "apartment",
  bedrooms: "2",
  bathrooms: "1",
  area: "",
  rent: "",
};

export function usePropertyFormState() {
  const [property, setProperty] = useState<PropertyFormState>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setProperty(initialState);
  };

  return {
    property,
    handleChange,
    handleSelectChange,
    resetForm
  };
}
