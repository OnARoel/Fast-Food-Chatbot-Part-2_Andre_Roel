const {
  SinkContext
} = require("twilio/lib/rest/events/v1/sink");
const Order = require("./Order");

let hotdog_check = false;
let fries_check = false;
let drink_check = false;
let hotdog_error = false;
let fries_error = false;
let drink_error = false;
let total = 0;

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment"),
  CHECK_HOTDOG: Symbol("check_hotdog"),
  HOTDOG: Symbol("hotdog"),
  CHECK_FRIES: Symbol("fries"),
  FRIES: Symbol("fries"),
  DRINKS: Symbol("drinks"),
  FINISH: Symbol("finish"),
  DRINK_SIZE: Symbol("drink_size")
});

module.exports = class TheBestFastFood extends Order {
  constructor(sNumber, sUrl) {
      super(sNumber, sUrl);
      this.stateCur = OrderState.WELCOMING;
      this.sSize = "";
      this.sToppings = "";
      this.sDrinks = "";
      this.sCheckHotdog = "";
      this.sHotDogSize = "";
      this.sCheckFries = "";
      this.sFries = "";
      this.sFriesSize = "";
      this.sDrinkSize = "";
  }
  handleInput(sInput) {
      let aReturn = [];

      switch (this.stateCur) {
          case OrderState.WELCOMING:
              this.stateCur = OrderState.CHECK_HOTDOG;
              aReturn.push("Welcome to the best fast food restaurant!");
              aReturn.push("Would you like a hot dog?\nAll sizes are $5!\nPlease enter yes or no");
              break;
          case OrderState.CHECK_HOTDOG:
              if (!hotdog_error) this.sCheckHotdog = sInput;
              else this.sCheckHotdog = "yes";

              if (this.sCheckHotdog.toLocaleLowerCase() == "yes") {
                  this.stateCur = OrderState.HOTDOG;
                  hotdog_check = true;
                  aReturn.push("What size would you like for your hotdog?\nsmall, medium or large");
                  total += 5;
                  hotdog_error = false;
              } else if (this.sCheckHotdog.toLocaleLowerCase() != "no") {
                  this.stateCur = OrderState.WELCOMING;
                  aReturn.push("You didn't enter yes or no, please enter something to go back and try again!");
              } else {
                  this.stateCur = OrderState.CHECK_FRIES;
                  aReturn.push("Would you like some fries?\nAll sizes are $3!");
              }
              break;
          case OrderState.HOTDOG:
              this.sHotDogSize = sInput;
              if (this.sHotDogSize.toLocaleLowerCase().trim() != "small" && this.sHotDogSize.toLocaleLowerCase().trim() != "medium" && this.sHotDogSize.toLocaleLowerCase().trim() != "large") {
                  aReturn.push("You entered a wrong hotdog size!\n Please enter anything to go back and correct your answer!");
                  this.stateCur = OrderState.CHECK_HOTDOG;
                  hotdog_error = true;
              } else {
                  this.stateCur = OrderState.CHECK_FRIES;
                  aReturn.push("Would you like some fries?\nAll sizes are $3!");
              }
              break;
          case OrderState.CHECK_FRIES:
              if (!fries_error) this.sCheckFries = sInput;
              else this.sCheckFries = "yes";

              if (this.sCheckFries.toLocaleLowerCase() == "yes") {
                  this.stateCur = OrderState.FRIES;
                  fries_check = true;
                  fries_error = false;
                  total += 3;
                  aReturn.push("What size would you like for your fries?\nsmall, medium or large");
              } else if (this.sCheckFries.toLocaleLowerCase() != "no") {
                  this.stateCur = OrderState.CHECK_FRIES;
                  aReturn.push("You didn't enter yes or no, please enter yes if you would like fries, and no if not");
              } else {
                  this.stateCur = OrderState.TOPPINGS;
                  aReturn.push("Would you like to add some cheese to your food as a topping?\nIt's only $1!");
              }
              break;

          case OrderState.FRIES:
              this.sFriesSize = sInput;
              if (this.sFriesSize.toLocaleLowerCase().trim() != "small" && this.sFriesSize.toLocaleLowerCase().trim() != "medium" && this.sFriesSize.toLocaleLowerCase().trim() != "large") {
                  aReturn.push("You entered a wrong fries size!\n Please enter anything to go back and correct your answer!");
                  this.stateCur = OrderState.CHECK_FRIES;
                  fries_error = true;
              } else {
                  this.stateCur = OrderState.TOPPINGS;
                  aReturn.push("Would you like to add some cheese to your food as a topping?\nIt's only $1!");
              }
              break;
          case OrderState.TOPPINGS:

              this.sToppings = sInput;

              if (this.sToppings.toLocaleLowerCase() == "yes") {
                  this.stateCur = OrderState.DRINKS;
                  aReturn.push("Would you like a drink?\nWe have the best coke in the land!\nAll sizes are $2!");
                  total += 1;
              } else if (this.sToppings.toLocaleLowerCase() != "no") {
                  aReturn.push("You didn't enter yes or no correctly, please enter yes if you would like cheese\nand no if you woudn't");
                  this.stateCur = OrderState.TOPPINGS;
              } else {
                  this.stateCur = OrderState.DRINKS;
                  aReturn.push("Would you like a drink?\nWe have the best coke in the land!\nAll sizes are $2!");
              }
              break;

          case OrderState.DRINKS:

              if (!drink_error) this.sDrinks = sInput;
              else this.sDrinks = "yes";

              if (this.sDrinks.toLocaleLowerCase() == "yes") {
                  aReturn.push("What size coke would you like?\nsmall, medium, or large?");
                  drink_check = true;
                  drink_error = false;
                  total+=2;
                  this.stateCur = OrderState.DRINK_SIZE;
              } else if (this.sDrinks.toLocaleLowerCase() != "no") {
                  this.stateCur = OrderState.DRINKS;
                  aReturn.push("You didn't enter yes or no, please enter yes if you would like a drink and no if you woudn't");
              } else this.stateCur = OrderState.PAYMENT;
              break;
          case OrderState.DRINK_SIZE:
              this.sDrinkSize = sInput;

              if (this.sDrinkSize.toLocaleLowerCase().trim() != "small" && this.sDrinkSize.toLocaleLowerCase().trim() != "medium" && this.sDrinkSize.toLocaleLowerCase().trim() != "large") {
                  aReturn.push("You entered a wrong drink size!\n Please enter anything to go back and correct your answer!");
                  this.stateCur = OrderState.DRINKS;
                  drink_error = true;
              } else {
                  this.stateCur = OrderState.FINISH;
                  aReturn.push("Thank-you, please enter anything to get your order ready!");
              }
              break;
          case OrderState.FINISH:
            this.nOrder = total;
              this.stateCur = OrderState.PAYMENT;
              aReturn.push("Thank-you for your order of");
              if (hotdog_check) aReturn.push("A " + this.sHotDogSize + " Hotdog");
              if (fries_check) aReturn.push("Some " + this.sFriesSize + " Fries");
              if (this.sToppings == "yes") aReturn.push("With some side Cheese topping on the side");
              if (drink_check) aReturn.push("And a " + this.sDrinkSize + " Coke");

              hotdog_check = fries_check = drink_check = drink_error = fries_error = hotdog_error = false;

              aReturn.push(`Your total today is: $${total}`);
              aReturn.push(`Please pay for your order here`);
              aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
              break;
          case OrderState.PAYMENT:
              let address = sInput.purchase_units[0].shipping.address;
              this.isDone(true);
              let d = new Date();
              d.setMinutes(d.getMinutes() + 20);
              aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
              aReturn.push("At the delivery address:");

              let temp = [];
              for (const [key, value] of Object.entries(address)) temp.push(value);

              for (let i = 0; i < temp.length; i += 2) {
                  if (temp[i + 1] == undefined) temp[i + 1] = " ";
                  aReturn.push(temp[i] + " " + temp[i + 1]);
              }

              aReturn.push("Thank you for your order and please come again~");
              break;
      }
      return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
      if (sTitle != "-1") {
          this.sItem = sTitle;
      }
      if (sAmount != "-1") {
          this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID
      return (`
  <!DOCTYPE html>

  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
  </head>
  
  <body>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script
      src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
    </script>
    Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
    <div id="paypal-button-container"></div>

    <script>
      paypal.Buttons({
          createOrder: function(data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '${this.nOrder}'
                }
              }]
            });
          },
          onApprove: function(data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function(details) {
              // This function shows a transaction success message to your buyer.
              $.post(".", details, ()=>{
                window.open("", "_self");
                window.close(); 
              });
            });
          }
      
        }).render('#paypal-button-container');
      // This function displays Smart Payment Buttons on your web page.
    </script>
  
  </body>
      
  `);

  }
}