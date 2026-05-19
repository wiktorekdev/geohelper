// Screenshot scene definitions for capture.mjs

export const SCENES = {
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
  edit: {
    file: "edit-mode",
    mock: null,
    edit: true,
  },
};
