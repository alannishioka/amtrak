const { fetchTrain } = require("amtrak"); // CommonJS

// JS
fetchTrain('742').then((train) => {
  console.log(train);
/*
  let trainsArray = Object.values(trains);

  for( let i = 0; i < trainsArray.length; i++ )
  {
    for( let j = 0; j < trainsArray[i].length; j++ )
    {
      console.log( trainsArray[i][j].trainID, trainsArray[i][j].routeName );
    }
  }
*/
});
