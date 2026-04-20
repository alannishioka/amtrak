const { fetchStation } = require("amtrak");
const { fetchTrain }   = require("amtrak");

const lerp = (start, end, amt) => start + amt * (end - start);

fetchStation("EMY").then((station) => {
  // console.log(station);
  // console.log(station.EMY.trains);

  let trainArray = [];
  let promises = []

  // Add now to train array
  trainArray.push( { stamp: new Date(), name: '\t\t----- NOW -----' } );

  station.EMY.trains.forEach((train_number) => {

    promises.push( fetchTrain(train_number).then((train) => {
      // console.log(Object.values(train)[0][0].routeName);
      let x = Object.values(train)[0][0];

      // if( x.trainNum == 710 ) console.log( x );

      let station = '';
      let nextStation = '';
      let stations = x.stations;
      for( let i=0; i < stations.length; i++ )
      {
        // Just save MTZ and EMY
        if(( stations[i].code == 'EMY' ) || ( stations[i].code == 'MTZ' ))
        {
          if( station == '' ) station = stations[i];
          else if( nextStation == '' ) nextStation = stations[i];
        }
      }

      let dep = Date.parse( station.dep );
      let arr = Date.parse( nextStation.arr );
      let mid;

      // If arr/dep null, use schArr/schDep instead
      if( station.dep     == null ) dep = Date.parse( station.schDep );
      if( nextStation.arr == null ) arr = Date.parse( station.schArr );

      if( station.code == 'EMY' )
      {
        mid = new Date( lerp( dep, arr, 3.7 / 34 ));
      }
      else
      {
        mid = new Date( lerp( arr, dep, 3.7 / 34 ));
      }

      // console.log( station.code, station.dep );
      // console.log( nextStation.code, nextStation.arr );
      // console.log( 'BUC', mid.toLocaleTimeString());

      // console.log( x.trainNum + '\t' + x.routeName + '\t' + mid.toLocaleTimeString());
      trainArray.push( { stamp: mid, name: x.trainNum + '\t' + x.destCode + '\t' + x.routeName } );
    }));

  });

  Promise.all(promises).then(() => {

    trainArray.sort((a, b) => a.stamp.getTime() - b.stamp.getTime());

    for( let i = 0; i < trainArray.length; i++ )
    {
      //console.log( trainArray[i].stamp.toLocaleTimeString(), trainArray[i].name );
      console.log( trainArray[i].stamp.toLocaleString() +'\t' + trainArray[i].name );
    }
  });
});
