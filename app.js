if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
}

const dbPromise = idb.open('currency-converter', 1, upgradeDB => {
  upgradeDB.createObjectStore('conv');
});


const from_cur = document.getElementById('from_cur');
const to_cur = document.getElementById('to_cur'); 
const amt_form = document.getElementById('from_val'); 
const result = document.getElementById('result'); 

class CurrencyConverter {

  constructor(){
    this.currency;
  }

  fetchCurrency () {
    const url = 'https://free.currencyconverterapi.com/api/v5/currencies';

    if ('caches' in window) {
      caches.match(url).then(response => {
        if (response) {
          response.json().then(json => {
            for ( const c in json.results){
              from_cur.innerHTML += `<option value='${c}'>${json.results[c].currencyName}</option>`;
              to_cur.innerHTML += `<option value='${c}'>${json.results[c].currencyName}</option>`; 
            }
          });
        }
      });
    };
  };


  getConvert(from, to, amt = 0) {
    let query = encodeURIComponent(from) + '_' + encodeURIComponent(to);

    console.log(query);

    var url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query + '&compact=ultra';
    
    
    //set "foo" to be "bar" in "keyval"
    


    // read "hello" in "keyval"
    dbPromise.then(db => {
      var tx = db.transaction('conv');
      var keyValStore = tx.objectStore('conv');
      return keyValStore.get(query);
    }).then(function(val) {
      if(val) {
        document.getElementById('result').value = amt * val;   
      } 
    }).then( 
      fetch(url)
        .then (response => response.json())
        .then (data => {
            
            console.log(data[query]);

            dbPromise.then(db => {
              var tx = db.transaction('conv', 'readwrite');
              var keyValStore = tx.objectStore('conv');
              keyValStore.put(data[query], query);
              return tx.complete;
            }).then(() => {
              console.log(`${query} => ${data[query]} add to indexed DB`);
              document.getElementById('result').value = amt * data[query];
            })
          })
      
    );
  }
}



window.addEventListener('load', e => {
  const myApp = new CurrencyConverter();
  myApp.fetchCurrency();  

  document.getElementById('convert').addEventListener('click', ()=>{
    let f = from_cur.options[from_cur.selectedIndex].value;
    let t = to_cur.options[to_cur.selectedIndex].value;
    let amt = amt_form.value;
    myApp.getConvert(f, t, amt);
  });

});
