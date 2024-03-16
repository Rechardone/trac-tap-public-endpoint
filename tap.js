const { io } = require("socket.io-client");

// connect to public TAP endpoint with Trac

const trac = io("https://tap.trac.network", {
    autoConnect : true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax : 500,
    randomizationFactor : 0
});

trac.connect();

// default response event for all endpoint calls.
// this event handles all incoming results for requests performed using "emit".
//
// You may use the response to render client updates or store in your local database cache.
//
// Example response object: 
// {
//    "error": "",
//    "func": ORIGINALLY-CALLED-FUNCTION-NAME,
//    "args": ARRAY-WITH-ARGUMENTS,
//    "call_id": OPTIONAL-CUSTOM-VALUE,
//    "result": RETURNED-MIXED-TYPE-VALUE
// }

trac.on('response', async function(msg){
  console.log(msg);
  
});

// default error event for internal Trac errors, if any

trac.on('error', async function(msg){
    console.log(msg);
});

// example getter to get a deployed token.
// the results for this call will be triggered by the 'response' event above.
// this structure is exactly the same for all available getters of this endpoint.

// trac.emit('get',
// {
//     func : 'deployment', // the endpoints function to call
//     args : ['tap'],     // the arguments for the function (in this case only 1 argument)
//     call_id : ''         // a mixed-type custom id that is passed through in the 'response' event above to identify for which call the response has been and how to proceed.
// });


async function tokens(address)
{
    trac.emit('get',
    {
        func : 'accountTokensLength',
        args : [address],
        call_id : { cmd : 'tokens_accountTokens', address : address }
    });
}

async function getAccountTokens(address, offset = 0, max = 500, call_id = null)
{
    trac.emit('get',
    {
        func : 'accountTokens',
        args : [address, offset, max],
        call_id : call_id === null ? '' : call_id
    });
}

async function getAccountTradesListLength(address,ticker ) 
{
  trac.emit('get',
{
    func : 'accountTradesListLength',
    args : [address, ticker],
    call_id : ''
});

}


// tokens('bc1p6wynl030xsvr48r6kgw99jdtll7jd9n3e8f60j04hmgnrwwysruqwrf9pm')
// getAccountTradesListLength('bc1p7jsjwyz7gfsr5cqkzxmgh0nqk5r8fkztvpk3wlw64xpprhlvedss6rn4de','DMT-NATCATS')


// trac.emit('get',
// {
//     func : 'tickerTradesListLength',
//     args : ["nat"],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'deploymentsLength',
//     args : [],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'holders',
//     args : ["dmt-nat", 0, 20],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'mintTokensLeft',
//     args : ["dmt-natcats"],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'holders',
//     args : ["dmt-natcats", 0, 20],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'tickerMintListLength',
//     args : ["dmt-natcats"],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'tickerMintList',
//     args : ["dmt-natcats", 0, 100],
//     call_id : ''
// });

// trac.emit('get',
// {
//     func : 'mintListLength',
//     args : [],
//     call_id : ''
// });


// trac.emit('get',
// {
//     func : 'deploymentsLength',
//     args : [],
//     call_id : ''
// });


trac.emit('get',
{
    func : 'deployments',
    args : [0, 500],
    call_id : ''
});