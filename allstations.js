const { fetchAllStations } = require("amtrak"); // CommonJS

// JS
fetchAllStations().then((stations) => {
  console.log(stations);
});
