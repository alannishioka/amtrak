const { fetchAllTrains } = require("amtrak"); // CommonJS

// JS
fetchAllTrains().then((trains) => {
  console.log(trains);
});
