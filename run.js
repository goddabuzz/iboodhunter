var http = require('http');
require('colors');

// Ibood data
var offer = {};
var iboodState = [0,0,0];
var timer;

function handleError(e) {
    var msg = "Got error: " + e.message;
    console.log(msg.red);
}

function getNewItem(){
    var options = {
        host: 'www.ibood.com',
        port: 80,
        path: '/js/offer/nl_nl.js'
    };
    console.log('+++'.yellow + ' Downloading new data'.blue);

    http.get(options, function(res) {
        var data = "";
        res.on('data', function(chunk){        
            data += chunk.toString();
        });
        res.on('end', function(){
            // Parse data
            data = parseIboodData(data);
            
            if (data.offer_id){
                timer = setTimeout(updateStatus, 5000);
            }
            
            console.log('==='.red +' NEW OFFER: ' + data.short_name.green);
            console.log('==='.red +' PRICE: ' + data.price.string);
            
            // Update the status
            offer = data;
        });
    }).on('error', handleError);
}

function updateStatus(){
    var options = {
        host: 'www.ibood.com',
        port: 80,
        path: '/js/stock/nl.js'
    };
    
    http.get(options, function(res) {
        res.on('data', function(data){        
            data = parseIboodData(data.toString());
            
            if (data[2]===1 && iboodState[2]===0) {
                console.log('+++'.yellow + ' Item is sold out!'.red);
            } 
            
            if (data[0] === iboodState[0]){
                // Update the data in 5 seconds..
                timer = setTimeout(updateStatus, 5000);
            } else {
                getNewItem();
            }
            
            // Update the status
            iboodState = data;
        });
    }).on('error', handleError);
}

/**
 * Normalize data. We are recieving JSON+padding data.
 */
function parseIboodData(data){
    return JSON.parse(
        data.slice(
            data.indexOf('(') + 1, 
            data.lastIndexOf(')')
        )
    );
}

updateStatus();