// Screenshot scene definitions: one object per screenshot we want.
// Exported so the capture script can loop over them.

export const SCENES = {
  // Classic view: France round, everything visible.
  paris: {
    file: "paris",
    mock: {
      coords: { lat: 48.8566, lng: 2.3522, source: "mock", timestamp: Date.now() },
      place: {
        country: "France",
        countryCode: "fr",
        region: "Île-de-France",
        city: "Paris",
        neighbourhood: "4th Arrondissement",
        road: "Rue de Rivoli",
        postcode: "75004",
        continent: "Europe",
      },
      country: {
        capital: "Paris",
        subregion: "Western Europe",
        languages: ["French"],
        currency: "EUR (€)",
        callingCode: "+33",
        timezones: ["UTC+01:00"],
      },
    },
    edit: false,
  },
  krakow: {
    file: "krakow",
    mock: {
      coords: { lat: 50.0619, lng: 19.9368, source: "mock", timestamp: Date.now() },
      place: {
        country: "Poland",
        countryCode: "pl",
        region: "Lesser Poland Voivodeship",
        city: "Kraków",
        neighbourhood: "Stare Miasto",
        road: "Rynek Główny",
        postcode: "31-042",
        continent: "Europe",
      },
      country: {
        capital: "Warsaw",
        subregion: "Central Europe",
        languages: ["Polish"],
        currency: "PLN (zł)",
        callingCode: "+48",
        timezones: ["UTC+01:00"],
      },
    },
    edit: false,
  },
  tokyo: {
    file: "tokyo",
    mock: {
      coords: { lat: 35.6762, lng: 139.6503, source: "mock", timestamp: Date.now() },
      place: {
        country: "Japan",
        countryCode: "jp",
        region: "Tokyo",
        city: "Chiyoda",
        neighbourhood: "Marunouchi",
        road: "Eitai-dori",
        postcode: "100-0005",
        continent: "Asia",
      },
      country: {
        capital: "Tokyo",
        subregion: "Eastern Asia",
        languages: ["Japanese"],
        currency: "JPY (¥)",
        callingCode: "+81",
        timezones: ["UTC+09:00"],
      },
    },
    edit: false,
  },
  // Edit mode: editable cards visible.
  edit: {
    file: "edit-mode",
    mock: null, // will auto-inject Paris on toggle
    edit: true,
  },
};
