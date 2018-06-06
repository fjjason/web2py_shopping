// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };
    function get_users_url() {
        return users_url;
    }
    function get_products_url(userName) {
        var pp = {
            userName: userName
        };
        return products_url + "?" + $.param(pp);
    }
    self.get_products = function (userName) {
        // Gets new products in response to a query, or to an initial page load.
        $.getJSON(get_products_url(userName), function(data) {
            self.vue.products = data.products;
            self.vue.email = data.email;
            console.log(self.vue.email);
            enumerate(self.vue.products);

            self.vue.users = data.users;

            //get unique users
            function onlyUnique(value, index, self) { 
                return self.indexOf(value) === index;
            }
            var unique = self.vue.users.filter( onlyUnique );
            self.vue.users = unique; 
            console.log(self.vue.users);
            
            //append button with users name on it
            for(var i = 0; i<unique.length; i++){
                var node = document.createElement("a");
                var textnode = document.createTextNode(unique[i]);
                node.id = unique[i];
                node.appendChild(textnode);
                document.getElementById("myList").appendChild(node);
                document.getElementById("myList").appendChild(document.createElement('br'));
            }

            $("a").click(function() {
                self.get_products2(this.id); // or alert($(this).attr('id'));
            });


        });
    };

    self.get_products2 = function (userName) {
        // Gets new products in response to a query, or to an initial page load.
        $.getJSON(get_products_url(userName), function(data) {
            self.vue.products = data.products;
            enumerate(self.vue.products);
            self.vue.users = data.users;
            self.vue.email = data.email;

            $("a").click(function() {
                self.get_products2(this.id); // or alert($(this).attr('id'));
            });

            
        });
    };

    self.post_cart = function() {
        localStorage.cart = JSON.stringify(self.vue.cart);
    };

    self.get_cart = function() {
        if (localStorage.cart) {
            self.vue.cart = JSON.parse(localStorage.cart);
        } else {
            self.vue.cart = [];
        }
        self.update_cart();
    };

    self.inc_desired_quantity = function(product_idx, qty) {
        // Inc and dec to desired quantity.
        var p = self.vue.products[product_idx];
        p.desired_quantity = Math.max(0, p.desired_quantity + qty);
        p.desired_quantity = Math.min(p.quantity, p.desired_quantity);
    };

    self.inc_cart_quantity = function(product_idx, qty) {
        // Inc and dec to desired quantity.
        var p = self.vue.cart[product_idx];
        p.cart_quantity = Math.max(0, p.cart_quantity + qty);
        p.cart_quantity = Math.min(p.quantity, p.cart_quantity);
        self.update_cart();
        self.post_cart();
    };

    self.update_cart = function () {
        enumerate(self.vue.cart);
        var cart_size = 0;
        var cart_total = 0;
        for (var i = 0; i < self.vue.cart.length; i++) {
            var q = self.vue.cart[i].cart_quantity;
            if (q > 0) {
                cart_size++;
                cart_total += q * self.vue.cart[i].price;
            }
        }
        self.vue.cart_size = cart_size;
        self.vue.cart_total = cart_total;
    };

    self.buy_product = function(product_idx) {
        var p = self.vue.products[product_idx];
        // I need to put the product in the cart.
        // Check if it is already there.
        var already_present = false;
        var found_idx = 0;
        for (var i = 0; i < self.vue.cart.length; i++) {
            if (self.vue.cart[i].id === p.id) {
                already_present = true;
                found_idx = i;
            }
        }
        // If it's there, just replace the quantity; otherwise, insert it.
        if (!already_present) {
            found_idx = self.vue.cart.length;
            self.vue.cart.push(p);
        }
        self.vue.cart[found_idx].cart_quantity = p.desired_quantity;

        // Updates the amount of products in the cart.
        self.update_cart();
        self.post_cart();
    };

    self.edit_product = function(product_idx) {
        console.log("edit");
        self.vue.products[product_idx].is_editting = true;
    };

    self.save_product = function(product_idx) {
        var product = self.vue.products[product_idx];
        console.log(product.price_model);
        $.post(save_product_url,
               { new_price: product.price_model,
                product_id: product.id,
               },
               function(data) {
                    product.price = product.price_model;
                    console.log("done1");
                    product.is_editting = false;
               });
    }

    self.goto = function (page) {
        self.vue.page = page;
    };

    self.pay = function () {
        // We need to send the cart, so that the server can
        // generate an order number, and the page with the stripe button.
        $.post(create_order_url,
            { cart: JSON.stringify(self.vue.cart) },
            function (data) {
                // Redirect to the page for showing order and the payment.
                window.location = pay_order_url + '?' + $.param({order_id: data.order_id});
            }
        );
    };

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = self.vue.file;
        var price = document.getElementById('price').value;
        console.log(price);
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    setTimeout(post, 1200);
                    function post(){
                        req.addEventListener("load", self.upload_complete(get_url, price));
                    }
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.upload_file2 = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        console.log(" YOUR file IS" + file);
        self.vue.file = file; 
    };


    self.upload_complete = function(get_url,price) {
        // Hides the uploader div.
        setTimeout(post, 1200);
        self.vue.show_img = true;
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        console.log(self.vue.created_on);
        console.log(self.vue.created_by);
        console.log(get_url);
        console.log(price);
        //post image url to DB
        function post(){
            $.post(add_products_url,
                {
                    images: get_url,
                    price: price
                },
                function (data) {
                    
                    console.log(data.products);
                    $.web2py.enableElement($("#add_image_submit"));
                    self.vue.products.unshift(data.products);
                    enumerate(self.vue.products);
                    
                });
        }
        //when user uploads, they can see their own pictures.
        //self.get_images2("default");
    };
    self.set_price = function(event) {
        // Hides the uploader div.
        var price = document.forms["myForm"]["price"].value;
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            products: [],
            cart: [],
            product_search: '',
            email : null,
            users: [],
            cart_size: 0,
            cart_total: 0,
            page: 'prod',
            is_uploading: false,
            is_editting: false,
            self_page: true, 
            file: '' 
        },
        methods: {
            get_products: self.get_products,
            inc_desired_quantity: self.inc_desired_quantity,
            inc_cart_quantity: self.inc_cart_quantity,
            buy_product: self.buy_product,
            edit_product: self.edit_product,
            goto: self.goto,
            do_search: self.get_products,
            pay: self.pay,
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            upload_file2: self.upload_file2,
            set_price: self.set_price,
            save_product: self.save_product,
        }

    });

    self.get_products("default");
    self.get_cart();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
