const express = require("express");
const app = express();
const favicon = require('serve-favicon');
const path = require('path');
const port = process.env.PORT || 3001;
const { fetchStation } = require("amtrak");
const { fetchTrain }   = require("amtrak");

const lerp = (start, end, amt) => start + amt * (end - start);

// Serve favicon.ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get("/", (req, res) =>
{
  let html = '<!DOCTYPE html><html><body>';
  let trainArray = [];

  fetchStation("EMY").then((station) => {
    // console.log(station);
    // console.log(station.EMY.trains);

    let promises = []

    // Add now to train array
    trainArray.push( { stamp: new Date(), name: '<td></td><td></td><td>----- NOW -----</td>' } );

    station.EMY.trains.forEach((train_number) => {

      promises.push( fetchTrain(train_number).then((train) => {
        // console.log(Object.values(train)[0][0].routeName);
        let x = Object.values(train)[0][0];

        // if( x.trainNum == 710 ) console.log( x );

        let stations = x.stations;
        let ratio;
        let i;
        for( i=0; i < stations.length; i++ )
        {
          // Look for RIC-EMY, RIC-BKY, MTZ-EMY
          if(( stations[i].code == 'EMY' ) && ( stations[i+1].code == 'MTZ' ))
          {
            ratio = 3.7 / 34;
            break;
          }
          else if(( stations[i].code == 'MTZ' ) && ( stations[i+1].code == 'EMY' ))
          {
            ratio = 1 - ( 3.7 / 34 );
            break;
          }
          else if(( stations[i].code == 'EMY' ) && ( stations[i+1].code == 'RIC' ))
          {
            ratio = 3.7 / 4.6;
            break;
          }
          else if(( stations[i].code == 'RIC' ) && ( stations[i+1].code == 'EMY' ))
          {
            ratio = 1 - ( 3.7 / 4.6 );
            break;
          }
          else if(( stations[i].code == 'BKY' ) && ( stations[i+1].code == 'RIC' ))
          {
            ratio = 1.4 / 6.4;
            break;
          }
          else if(( stations[i].code == 'RIC' ) && ( stations[i+1].code == 'BKY' ))
          {
            ratio = 1 - ( 1.4 / 6.4 );
            break;
          }
        }

        let dep = Date.parse( stations[i].dep );
        let arr = Date.parse( stations[i+1].arr );
        let mid;

        // If arr/dep null, use schArr/schDep instead
        if( stations[i].dep   == null ) dep = Date.parse( stations[i].schDep );
        if( stations[i+1].arr == null ) arr = Date.parse( stations[i+1].schArr );

        // Interpolate time
        mid = new Date( lerp( dep, arr, ratio ));

        // console.log( stations[i].code,   new Date( dep ).toLocaleTimeString());
        // console.log( stations[i+1].code, new Date( arr ).toLocaleTimeString());
        // console.log( 'BUC', mid.toLocaleTimeString());

        // console.log( x.trainNum + '\t' + x.routeName + '\t' + mid.toLocaleTimeString());
        trainArray.push( { stamp: mid, name: '<td style="text-align:right">' + x.trainNum + '</td><td>' + x.destCode + '</td><td>' + x.routeName + '</td>' } );
      }));

    });

    return Promise.all(promises);

  }).then(() => {
    trainArray.sort((a, b) => a.stamp.getTime() - b.stamp.getTime());

    html += '<table>';
    for( let i = 0; i < trainArray.length; i++ )
    {
      //console.log( trainArray[i].stamp.toLocaleTimeString(), trainArray[i].name );
      console.log( trainArray[i].stamp.toLocaleString() +'\t' + trainArray[i].name );
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

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`
