const express = require("express");
const app = express();
const favicon = require('serve-favicon');
const path = require('path');
const port = process.env.PORT || 3001;
const { fetchAllTrains } = require("amtrak"); // CommonJS


const lerp = (start, end, amt) => start + amt * (end - start);

// Serve favicon.ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get("/", (req, res) =>
{
  let html = '<!DOCTYPE html><html><body>';
  let trainArray = [];

  fetchAllTrains().then((trains) => {
    // console.log(trains);
    let trainsArray = Object.values(trains);

    // Add now to train array
    trainArray.push( { stamp: new Date(), name: '<td></td><td></td><td>----- NOW -----</td>' } );

    for( let i = 0; i < trainsArray.length; i++ )
    {
      for( let j = 0; j < trainsArray[i].length; j++ )
      {
        let train = trainsArray[i][j];
        // console.log( train.trainID, train.routeName );

        let stations = train.stations;
        let ratio;
        let k;
        for( k = 0; k < stations.length; k++ )
        {
          // Look for RIC-EMY, RIC-BKY, MTZ-EMY
          if(( stations[k].code == 'EMY' ) && ( stations[k+1].code == 'MTZ' ))
          {
            ratio = 3.7 / 34;
            break;
          }
          else if(( stations[k].code == 'MTZ' ) && ( stations[k+1].code == 'EMY' ))
          {
            ratio = 1 - ( 3.7 / 34 );
            break;
          }
          else if(( stations[k].code == 'EMY' ) && ( stations[k+1].code == 'RIC' ))
          {
            ratio = 3.7 / 4.6;
            break;
          }
          else if(( stations[k].code == 'RIC' ) && ( stations[k+1].code == 'EMY' ))
          {
            ratio = 1 - ( 3.7 / 4.6 );
            break;
          }
          else if(( stations[k].code == 'BKY' ) && ( stations[k+1].code == 'RIC' ))
          {
            ratio = 1.4 / 6.4;
            break;
          }
          else if(( stations[k].code == 'RIC' ) && ( stations[k+1].code == 'BKY' ))
          {
            ratio = 1 - ( 1.4 / 6.4 );
            break;
          }
        }

        if( k == stations.length )
        {
          // console.log( "RIC-EMY, RIC-BKY, MTZ-EMY stations not found" );
          continue;
        }

        // console.log( stations[k], stations[k+1] );

        let dep = Date.parse( stations[k].dep );
        let arr = Date.parse( stations[k+1].arr );
        let mid;

        // If arr/dep null, use schArr/schDep instead
        if( stations[k].dep   == null ) dep = Date.parse( stations[k].schDep );
        if( stations[k+1].arr == null ) arr = Date.parse( stations[k+1].schArr );

        // Interpolate time
        mid = new Date( lerp( dep, arr, ratio ));

        // console.log( stations[k].code,   new Date( dep ).toLocaleTimeString());
        // console.log( stations[k+1].code, new Date( arr ).toLocaleTimeString());
        // console.log( 'BUC', mid.toLocaleTimeString());

        // console.log( train.trainNum + '\t' + train.routeName + '\t' + mid.toLocaleTimeString());
        trainArray.push( { stamp: mid, name: '<td style="text-align:right">' + train.trainNum + '</td><td>' + train.destCode + '</td><td>' + train.routeName + '</td>' } );
      }
    }

    trainArray.sort((a, b) => a.stamp.getTime() - b.stamp.getTime());

    html += '<table style="font-size:4.5vw">';
    for( let i = 0; i < trainArray.length; i++ )
    {
      // console.log( trainArray[i].stamp.toLocaleTimeString(), trainArray[i].name );
      // console.log( trainArray[i].stamp.toLocaleString() +'\t' + trainArray[i].name );
      html += '<tr>';
      html += '<td style="text-align:right">' + trainArray[i].stamp.toLocaleDateString() +'</td>';
      html += '<td style="text-align:right">' + trainArray[i].stamp.toLocaleTimeString() +'</td>';
      html += '<td>' + trainArray[i].name + '</td>';
      html += '</tr>';
    }
    html += '</table>';

    res.type('html').send(html)
  });
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
