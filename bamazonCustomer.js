const inquirer = require("inquirer");
const mysql    = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_db"
});

function validateInput(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && (sign === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
    }
};
function purchasePrompt() {
  inquirer.prompt([
  {
  type: 'input',
  name: 'item_id',
  message: 'Enter the Item ID of the item you would like to purchase.',
  validate: validateInput,
  filter: Number
  },
  {
  type: 'input',
  name: 'quantity',
  message: 'How many would you like?',
  validate: validateInput,
  filter: Number
  }
  ]).then(function(input) {

  var item = input.item_id;
  var quantity = input.quantity;

  
  var queryDB = 'SELECT * FROM products WHERE ?';

  connection.query(queryDB, {item_id: item}, function(err, stock) {
    if (err) throw err;

    if (stock.length === 0) {
      console.log('ERROR: Invalid Item ID. Please select a valid ID.');
      
      inventory();
      } else {

          var productData = stock[0];
          if (quantity <= productData.stock_quantity) {

            var updtQueryDB = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
            connection.query(updtQueryDB, function(err, stock) {
              if (err) throw err;

              console.log('You ordered ' + quantity + 'x ' + productData.product_name); 
              console.log('Your total is $' + productData.price * quantity);
              console.log('Thank you for your purchase!');
              console.log("\n----------------------------------------------------------------------------------\n");
              connection.end();
            })
          } else {
              console.log('Sorry, we currently do not have enough stock to meet your order.');
              console.log('Change your order.');
              console.log("\n----------------------------------------------------------------------------------\n");

              inventory();
          }
      }
  })
})
};
  
function inventory() {

  queryDB = 'SELECT * FROM products';
  connection.query(queryDB, function(err, stock) {
    if (err) throw err;

    var output = '';
    console.log('----------------------------------------------------------------------------------');
    console.log('Item ID     Product Name                                  Deparment          Price');
    console.log('----------------------------------------------------------------------------------');
    for (var i = 0; i < stock.length; i++) {
      output = '';
      output += stock[i].item_id + '           ';
      output += stock[i].product_name + '              ';
      output += stock[i].department_name + '        ';
      output += '$' + stock[i].price + '\n';

    console.log(output);
    }

 console.log("----------------------------------------------------------------------------------\n");
  purchasePrompt();
  })
};

function runBamazon() {
  inventory();
};

runBamazon();