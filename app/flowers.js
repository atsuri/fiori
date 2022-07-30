window.onload = Main;
const baseURL = "http://localhost:3000";

function Main() {
  Vue.createApp({
    data() {
      return {
        input: "",
        showRecommendation: false,
        recommendation: [],
        flowers: [],
        soldout: false,
        cart: [],
        checkcart: false,
        total: 0
      }
    },
    methods: {
      order: function (event) {
        let check = confirm("カートに入れますか？");
        if( check === true ) {
          let url = baseURL + '/flowers/?id=' + event.target.id;
          // console.log(url);
          // console.log(event);
          fetch(url, {method: 'GET'})
          .then((response) => {
            return response.json();
          })
          .then((res) => {
            // console.log(res);
            // console.log(res[0].stock);
            let newstock;
            let flo_name;
            let flo_id;
            let flo_img;
            let flo_price;
            if(res[0].stock >= 1){
              newstock = res[0].stock-1;
              flo_name = res[0].name;
              flo_id = res[0].id;
              flo_img = res[0].image;
              flo_price = res[0].price;
              // console.log(newstock);
              // console.log(res[0].id, res[0].name, res[0].image,newstock,res[0].category_name,res[0].price);
              fetch(baseURL + '/flowers/' + event.target.id, {
                method: 'PUT',
                headers:{
                  'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                  "id": flo_id,
                  "name": flo_name,
                  "image": flo_img,
                  "stock": newstock,
                  "category_name": res[0].category_name,
                  "price": flo_price
                })
              })
              .then((res)=>{
                this.soldout = false;
                this.checkcart = false;
                alert("ありがとうございます。カートに入れました。");
                this.cartpush(event.target.id);
              }) 
            }else if(res[0].stock == 0){
              this.soldout = true;
              this.checkcart = false;
            }
          })
          .catch((res) => {
            console.log(res);
          });
        }
      },
      cartpush: function (id) {
        let url = baseURL + '/carts?id=' + id;
        // console.log(url);
        // console.log(event);
        fetch(url, {method: 'GET'})
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          // console.log(res);
          // console.log(res[0].stock);
          let flo_buy = res[0].buy+1;
          let flo_name = res[0].name;
          let flo_id = res[0].id;
          let flo_img = res[0].image;
          let flo_price = res[0].price;
          let flo_category = res[0].category_name;
          // console.log(newstock);
          console.log(flo_id, flo_name, flo_img, flo_buy, flo_category, flo_price);
          fetch(baseURL + '/carts/' + id, {
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
              "id": flo_id,
              "name": flo_name,
              "image": flo_img,
              "buy": flo_buy,
              "category_name": flo_category,
              "price": flo_price
            })
          })
          .then((res)=>{
            console.log(res);
            console.log(flo_category);
            this.searchFlowersByCategory(flo_category);
          }) 
        })
        .catch((res) => {
          console.log(res);
        });
      },
      clearcart: function (id) {
        if(this.cart != ''){
          let check = confirm("注文を確定しますか？");
          if( check === true ) {
            let url = baseURL + '/carts';
            // console.log(url);
            // console.log(event);
            fetch(url, {method: 'GET'})
            .then((response) => {
              return response.json();
            })
            .then((res) => {
              res.forEach(e => {
                // console.log(e);
                if(parseInt(e.buy) >= 1){
                  let flo_name = e.name;
                  let flo_id = e.id;
                  let flo_img = e.image;
                  let flo_price = e.price;
                  let flo_category = e.category_name;
                  fetch(baseURL + '/carts/' + flo_id, {
                    method: 'PUT',
                    headers:{
                      'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify({
                      "id": flo_id,
                      "name": flo_name,
                      "image": flo_img,
                      "buy": 0,
                      "category_name": flo_category,
                      "price": flo_price
                    })
                  })
                  .then((res)=>{
                    console.log(res);
                  }) 
                }
              })
              alert("ご注文ありがとうございます。");
              this.cartopen();
            });
          }
        }else{
          alert("何もカートに入れられていません。");
        }
      },
      searchFlowersByCategory: function (event) {
        this.showRecommendation = false;
        this.checkcart = false;
        let flower;
        if(typeof event.target === 'undefined'){
          flower = event;
        }else{
          flower = event.target.value;
        }
        // デバッグ
        console.log(flower);
        if("bouquet" == flower) {
          console.log("花束");
        } else if("red" == flower) {
          console.log("赤色");
        } else if("orange" == flower) {
          console.log("オレンジ色");
        } else if("pink" == flower) {
          console.log("ピンク色");
        } else if("purple" == flower) {
          console.log("紫色");
        } else if("other" == flower) {
          console.log("その他の色");
        }

        let url = "/flowers?category_name=" + flower;
        url = baseURL + encodeURI(url);
        this.updateFlowers(url);  
      },
      searchFlowersByName: function(event) {
        this.checkcart = false;
        this.soldout = false;
        this.showRecommendation = false;
        let url = "/flowers?name_like=" + this.input;
        url = baseURL + encodeURI(url);
        this.updateFlowers(url);  
      },
      updateFlowers: function(url) {
        fetch(url, { method: 'GET' })
        .then((response) => {
          this.soldout = false;
          return response.json();
        })
        .then((res) => {
          if(Array.isArray(res)) {
            this.flowers = res;
          }
          else {
            this.flowers = [ res ];
          }
        })
        .catch((res) => {
          console.log(res);
        });
      },
      recommendFlower: function(url) {
        fetch(url, { method: 'GET' })
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          // console.log(res);
          this.recommendation.push({id: res[0].id, name: res[0].name, image: res[0].image, price: res[0].price});
          // console.log(this.recommendation);
          this.showRecommendation = true;   
        })
        .catch((res) => {
          console.log(res);
        });
      },
      cartopen: function(event) {
        this.checkcart = true;
        this.soldout = false;
        let url = baseURL + '/carts';
        fetch(url, {method: 'GET'})
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          // console.log(res);
          this.cart = [];
          this.total = 0;
          res.forEach(e => {
            // console.log(e);
            if(parseInt(e.buy) >= 1){
              this.cart.push(e);
              this.total = this.total + (e.buy*e.price);
            }
          })
          // console.log(this.cart);
          // return [this.cart, this.total];
        })
        .catch((res) => {
          console.log(res);
        });

      }
    },mounted: function(event) {
      fetch(baseURL + "/recommendation", { method: 'GET'})
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        // console.log(response[1].id);
        for(i in response){
          // console.log(i);
          let url = "/flowers?id=" + response[i].id;
          url = baseURL + encodeURI(url);
          // console.log(url);
          this.recommendFlower(url); 
        }
      })
      .catch((response) => {
        console.log(response);
      });
    }
  }).mount('#flowersApp');
}