import countryTelephoneData  from 'country-telephone-data';

const { allCountries } = countryTelephoneData;

const getCountryOptions = () => {
    try {
        if (!allCountries || !Array.isArray(allCountries)) {
            console.warn('allCountries is not available or not an array');
            return [{ name: 'United States', dialCode: '+1', iso2: 'US' }]; // fallback
        }
        return allCountries.map((country) => ({
            name: country.name,
            dialCode: `+${country.dialCode}`,
            iso2: country.iso2.toUpperCase(),
        }));
    } catch (error) {
        console.error('Error processing country data:', error);
        return [{ name: 'United States', dialCode: '+1', iso2: 'US' }]; // fallback
    }
};

export default getCountryOptions;