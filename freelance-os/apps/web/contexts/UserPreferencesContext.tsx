"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CountryPreference = "US" | "IN" | null;
export type CurrencyPreference = "USD" | "INR";

interface UserPreferencesContextType {
  country: CountryPreference;
  currency: CurrencyPreference;
  setCountry: (country: "US" | "IN") => void;
  isLoaded: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<CountryPreference>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("freelanceos_country");
    if (stored === "US" || stored === "IN") {
      setCountryState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setCountry = (newCountry: "US" | "IN") => {
    setCountryState(newCountry);
    localStorage.setItem("freelanceos_country", newCountry);
  };

  const currency: CurrencyPreference = country === "IN" ? "INR" : "USD"; // Default to USD if not set

  return (
    <UserPreferencesContext.Provider value={{ country, currency, setCountry, isLoaded }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}

export function formatCurrency(amount: number, currency: CurrencyPreference, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits,
  }).format(amount);
}
