import { useEffect, useRef, useState } from "react";
import { Country, CountryDropdownProps, } from "../../types/CustomInputTypes";
import { customCountryDropdownStyles } from "../../utils/Constant/CRMLeadConstant";

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value,
  onChange,
  countries,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredCountries = countries.filter((c: Country) =>
    normalizeString(c.name).includes(normalizeString(debouncedSearch)) ||
    normalizeString(c.callingCode).includes(normalizeString(debouncedSearch))
  );

  const defaultCountry = countries.find((c) => c.code === "IN");

  let selectedCountry: Country | undefined;

  if (!value) {
    // Case 1: no value → India
    selectedCountry = defaultCountry;
  } else if (typeof value === "string" && value === "+91") {
    // Case 2: value is string +91 → India
    selectedCountry = defaultCountry;
  } else if (typeof value === "object" && "code" in value) {
    // Case 3: value is a Country object → match by code
    selectedCountry = countries.find((c) => c.code === value.code);
  } else if (typeof value === "string") {
    selectedCountry = countries.find((c) => c.code === value);
  }

  const handleKeyDown = (e: React.KeyboardEvent, country: Country) => {
    if (e.key === "Enter" || e.key === " ") {
      onChange(country);
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="country-dropdown" ref={dropdownRef}>
      <style>{customCountryDropdownStyles}</style>
      <div
        className={`country-dropdown-toggle ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-label="Select Country Code"
      >
        {selectedCountry ? (
          <>
            <img
              src={selectedCountry.flag}
              srcSet={`${selectedCountry.flag} 1x, ${selectedCountry.flag2x} 2x`}
              alt={selectedCountry.name}
            />
            <span>{`${selectedCountry.callingCode} ${selectedCountry.name}`}</span>
          </>
        ) : (
          <span>Select Country *</span>
        )}
      </div>
      {isOpen && (
        <div className="country-dropdown-menu">
          <div className="country-search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Country"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              aria-label="Search for a country"
            />
          </div>
          <ul className="country-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country: Country) => (
                <li
                  key={country.code}
                  onClick={() => {
                    onChange(country);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, country.code)}
                  tabIndex={0}
                  role="option"
                  aria-selected={value === country.code}
                >
                  <img
                    src={country.flag}
                    srcSet={`${country.flag} 1x, ${country.flag2x} 2x`}
                    alt={country.name}
                  />
                  <span>{`${country.callingCode} ${country.name}`}</span>
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
