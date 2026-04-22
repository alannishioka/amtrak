const { fetchAllTrains } = require("amtrak"); // CommonJS

// JS
fetchAllTrains().then((trains) => {
  // console.log(trains);
  let trainsArray = Object.values(trains);

  for( let i = 0; i < trainsArray.length; i++ )
  {
    for( let j = 0; j < trainsArray[i].length; j++ )
    {
      console.log( trainsArray[i][j].trainID, trainsArray[i][j].routeName );
    }
  }
});
