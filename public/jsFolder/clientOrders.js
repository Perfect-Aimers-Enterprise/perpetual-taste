// config.js
const config2 = {
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : `${window.location.protocol}//${window.location.hostname}`
  };

  const navigationPopUp = document.getElementById('navigationPopUp')


document.addEventListener('DOMContentLoaded', ()=> {
    getAllMenuProductFunc()
    populateUserProceedOrder()
    // fetchUserGallery()
   

    
})


const menuGridClass = document.querySelector('.menuGridClass')

const getAllMenuProductFunc = async () => {
    try {
        const getAllMenuProductResponse = await fetch(`${config2.apiUrl}/doveeysKitchen/product/getMenuProducts`);
        console.log(getAllMenuProductResponse);
        
        const data = await getAllMenuProductResponse.json();
        console.log(data);
        menuGridClass.innerHTML = '';        

        data.forEach((eachData) => {
            const eachDataId = eachData._id;

            let productContent = '';


            if (eachData.menuPrice && (!eachData.variations || eachData.variations.length === 0 || isAllVariationsInvalid(eachData.variations))) {
                
                productContent = `
                    <div class="border rounded-lg shadow-lg p-4 bg-white text-black menu-item" data-id="${eachDataId}">
                        <img src="${eachData.menuImage}" alt="${eachData.menuProductName}" class="w-full h-48 object-cover rounded">
                        <h3 class="mt-4 text-xl font-semibold">${eachData.menuProductName}</h3>
                        <p class="text-gray-600">${eachData.menuDescription}</p>
                        <p class="mt-2 text-orange-700 font-bold">₦${eachData.menuPrice}</p>
                        <button id="orderNowButton" class="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 w-full">Order Now</button>
                    </div>
                `;
            } else if (eachData.variations && eachData.variations.length > 0) {
                 // Show the price of the first variation
                 const firstVariationPrice = eachData.variations[0].price;

                 productContent = `
                     <div class="border rounded-lg shadow-lg p-4 bg-white text-black menu-item" data-id="${eachDataId}">
                         <img src="${eachData.menuImage}" alt="${eachData.menuProductName}" class="w-full h-48 object-cover rounded">
                         <h3 class="mt-4 text-xl font-semibold">${eachData.menuProductName}</h3>
                         <p class="text-gray-600">${eachData.menuDescription}</p>
                         <p class="mt-2 text-orange-700 font-bold">₦${firstVariationPrice}</p>
                         <button id="orderNowButton" class="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 w-full">Order Now</button>
                     </div>
                 `;
            }

            // Append the product content to the menu grid
            menuGridClass.innerHTML += productContent;
        });

        setTimeout(() => {
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach((item) => {
                item.classList.add('visible');
            });
        }, 100);
        
        const orderNowButton = document.querySelectorAll('#orderNowButton');
        
        orderNowButton.forEach((eachOrderNowButton) => {
            eachOrderNowButton.addEventListener('click', (e) => {
                const token = localStorage.getItem('token');
                if (!token) {
                   alert('Please Register an Account')
                   return
                }
                const menuProductId = e.target.closest('.menu-item').dataset.id;
                fetchSingleProductFunc(menuProductId);
            });
        });

    } catch (error) {
        console.log(error);
    }
};



const fetchSingleProductFunc = async (menuProductId) => {

  
    try {
      const fetchSingleProductResponse = await fetch(`${config2.apiUrl}/doveeysKitchen/product/getSingleMenuProduct/${menuProductId}`)
  
    // console.log(fetchSingleProductResponse);
  
      const data = await fetchSingleProductResponse.json()
      console.log('Testing Data String', data);

      const menuProductOrderImage = data.menuImage
      const menuProductOrderName = data.menuProductName
      const menuProductOrderDescription = data.menuDescription
      const menuProductOrderPrice = data.menuPrice
      const menuProductVariations = data.variations || []; // Check if variations exist

      console.log(menuProductVariations);
      

      localStorage.setItem('menuProductOrderImage', menuProductOrderImage)
      localStorage.setItem('menuProductOrderName', menuProductOrderName)
      localStorage.setItem('menuProductOrderDescription', menuProductOrderDescription)
      localStorage.setItem('menuProductOrderPrice', menuProductOrderPrice)
      localStorage.setItem('menuProductVariations', JSON.stringify(menuProductVariations));

      window.location.href = '../htmlFolder/orderDetailsPage.html'

    } catch (error) {
      console.log(error);
      
    }}


const orderPage = document.getElementById('orderPage')

const populateUserProceedOrder = () => {
    // e.preventDefault()

    orderPage.innerHTML = ''

    const proceedOrderImg = localStorage.getItem('menuProductOrderImage')
    const proceedOrderName = localStorage.getItem('menuProductOrderName')
    const proceedOrderPrice = parseFloat(localStorage.getItem('menuProductOrderPrice'));
    const menuProductVariations = JSON.parse(localStorage.getItem('menuProductVariations'))

    console.log(menuProductVariations);
    


    let variationDropdown = '';
    let priceDisplay = '';


    if (proceedOrderPrice && (!menuProductVariations || menuProductVariations.length === 0 || isAllVariationsInvalidMenuPrice(menuProductVariations))) {
        priceDisplay = `
        <div class="mb-4">
            <p id="orderProceedPrice" class="text-lg font-semibold text-gray-800">Price: <span class="text-orange-500">&#8358;${proceedOrderPrice.toFixed(2)}</span></p>
        </div>`;
    } else if (menuProductVariations && menuProductVariations.length > 0) {
        variationDropdown = `
        <div class="mb-4">
            <label for="variationSelect" class="block text-gray-600 font-medium mb-1">Choose Variation</label>
            <select id="variationSelect" class="w-full p-3 border border-gray-300 rounded-lg">
            <option disabled selected>Select Food Size</option>
            ${menuProductVariations
                .map(
                (variation) =>
                    `<option value="${variation.price}" data-variation-name="${variation.size}">
                    ${variation.size} - &#8358;${variation.price.toFixed(2)}
                    </option>`
                )
                .join('')}
            </select>
        </div>`;

        priceDisplay = `
        <div class="mb-4">
            <p id="orderProceedPrice" class="text-lg font-semibold text-gray-800">Price: <span class="text-orange-500">&#8358;${menuProductVariations[0].price.toFixed(2)}</span></p>
        </div>`;
    }

        
    function isAllVariationsInvalidMenuPrice(menuProductVariations) {
        return menuProductVariations.every((menuProductVariation) => !menuProductVariation.size || menuProductVariation.price === null);
      }

    const userProceedOrder = `
            <form id="userProceedOrderId" class="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
            <h2 class="text-2xl font-bold text-gray-700 mb-4">Order Details</h2>

            <!-- Product Image -->
            <div class="mb-4 h-[400px] items-center justify-center overflow-hidden">
                <img id="orderProceedImage" src="${proceedOrderImg}" alt="Product Image" class="rounded-lg w-full h-[400px]">
            </div>

            <!-- Product Name -->
            <div class="mb-4">
                <p id="orderProceedName" class="text-lg font-semibold text-gray-800">Name: <span class="text-orange-500">${proceedOrderName}</span></p>
            </div>


             ${variationDropdown}

            ${priceDisplay}

             <!-- Product Price -->
            

            <!-- Address Input -->
            <div class="mb-4">
                <label for="address" class="block text-gray-600 font-medium mb-1">Delivery Address</label>
                <input id="orderProceedAddress" type="text" id="address" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 inputProceed" placeholder="Enter your address">
            </div>

            <!-- Delivery Contact Input -->
            <div class="mb-4">
                <label for="deliveryContact" class="block text-gray-600 font-medium mb-1">Delivery Contact</label>
                <input type="tel" id="deliveryContact" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 inputProceed" placeholder="Enter your contact">
            </div>

            <!-- Quantity Input -->
            <div class="mb-4">
                <label for="quantity" class="block text-gray-600 font-medium mb-1">Quantity</label>
                <input type="number" id="quantity" min="1" value="1" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 inputProceed">
            </div>

            <!-- Total Price -->
            <div class="mb-4">
                <p id="totalPrice" class="text-lg font-semibold text-gray-800">Total Price: <span class="text-orange-500">&#8358 </span></p>
            </div>

            <!-- Terms and Conditions -->
            <div class="mb-6">
                <label class="inline-flex items-center">
                    <input type="checkbox" id="terms" class="form-checkbox h-5 w-5 text-orange-600">
                    <span id="termsCondition" class="ml-2 text-gray-700">I agree to the <a href="#" class="text-blue-500">Terms and Conditions</a></span>
                </label>
            </div>


            <!-- Proceed Button -->
            <button id="proceedButton" class="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>Proceed to Order</button>
        </form>
        `

        orderPage.innerHTML = userProceedOrder

    const terms_condition = `
                <div class="fixed inset-0 z-50 bg-white text-black">
            <section class="w-[90%] mx-auto md:w-[80%] lg:w-[70%] bg-white p-4 rounded-lg shadow-lg">
            <h1 class="font-bold text-lg">📝 Terms and Conditions for Placing Orders</h1>

            <p class="text-black goBack"><i class="fas fa-arrow-left"></i> back </p>
            
            <!-- Scrollable container -->
            <div class="mt-4 max-h-64 overflow-y-scroll relative border-t border-gray-300 pt-4">
                <ul class="list-disc list-inside space-y-6"> 
                <li>
                    <h2 class="font-semibold text-gray-800">🚚 Payment before Delivery</h2>
                    <p>💳 Payment will only be accepted before delivery of your order.</p>
                    <p>🚪 Please ensure someone is available at your delivery address to make the payment.</p>
                    <p>💵 Accepted payment methods include cash or mobile transfer at the time of delivery.</p>
                </li>
            
                <li>
                    <h2 class="font-semibold text-gray-800">⚠️ Important Notes</h2>
                    <p>📍 Delivery Address: Ensure the address provided is correct to avoid delays.</p>
                    <p>⏱️ Delivery Time: Deliveries will be made within the estimated timeframe provided when you place your order.</p>
                    <p>🚫 Cancellations: Orders cannot be canceled once they are en route for delivery.</p>
                    <p>🤝 Acceptance Policy: By placing an order, you agree to our payment-on-delivery policy.</p>
                </li>
            
                <li>
                    <h2 class="font-semibold text-gray-800">📦 Order Verification</h2>
                    <p>📝 Upon delivery, please inspect your order for accuracy. If there are any issues, notify the delivery personnel immediately.</p>
                    <p>👍 Once payment is made, it indicates acceptance of the order as delivered.</p>
                </li>
            
                <li>
                    <h2 class="font-semibold text-gray-800">🛠️ Support and Assistance</h2>
                    <p>📞 For any questions or issues, please contact our support team at <span class="font-bold">+234 803 096 2601</span> before completing your order.</p>
                </li>
            
                <li>
                    <h2 class="font-semibold text-gray-800">💡 Why Payment on Delivery?</h2>
                    <p>
                    We want to ensure your satisfaction and trust by letting you inspect your order before payment. This policy is
                    designed for your convenience and peace of mind.
                    </p>
                    <p>Thank you for choosing <span class="font-bold">Doveeys Kitchen!</span> We look forward to serving you. 🥳</p>
                    <p>By placing your order, you agree to these terms and conditions. ✅</p>
                </li>
                </ul>
            </div>
            </section>
            
        </div>
    `

  
    initializeEventListeners(proceedOrderPrice)
    const proceedPayment = document.getElementById('proceedPayment')
    
        const termsCondition = document.getElementById('termsCondition')

        termsCondition.addEventListener('click', () => {
            orderPage.innerHTML = terms_condition
            const goBack = document.querySelector('.goBack')
            goBackFunc(goBack)
        })

        
        const goBackFunc = (goBack) => {
            goBack.addEventListener('click', () => {
                orderPage.innerHTML = userProceedOrder
            })
        }
        

        // Price and Total Price Handling
        const orderProceedAddress = document.getElementById('orderProceedAddress')
        const deliveryContact = document.getElementById('deliveryContact')



        proceedButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const validateInputProvision = document.querySelectorAll('#userProceedOrderId .inputProceed')

            // Validate inputs and stop execution if any are empty
            const hasEmptyInput = Array.from(validateInputProvision).some((inputProvision) => {
                if (!inputProvision.value) {
                    alert('Please provide all information');
                    return true; // Stop further validation
                }
                return false;
            });

            if (hasEmptyInput) return;


            const token = localStorage.getItem('token')
            const userName = localStorage.getItem('userName')
            const userEmail = localStorage.getItem('userEmail')
            const userPhone = localStorage.getItem('userPhone')
            
            if (!token) {
                
                return navigationPopUp.classList.remove('hidden')
                
            }
 
            const variationSelect = document.getElementById('variationSelect');
            // const hasVariation = menuProductVariations.length > 0 && variationSelect && variationSelect.selectedOptions.length > 0;


            const hasVariation = menuProductVariations.length > 0 && variationSelect;

            if (hasVariation) {
                // Ensure user selects a variation
                if (variationSelect.selectedIndex === 0) {
                    alert("Please select a food size before proceeding.");
                    return;
                }
            }



            
        let sizeDisplay = '';
        let variationSizeDisplay = '';
        let selectedSize = ''; // Store the selected size

        if (proceedOrderPrice && (!menuProductVariations || menuProductVariations.length === 0 || isAllVariationsInvalidMenuPrice(menuProductVariations))) {
            sizeDisplay = '';
        } else if (menuProductVariations && menuProductVariations.length > 0) {
            variationSizeDisplay = `
                <select id="variationSelect" class="">
                    ${menuProductVariations.map((variation) => 
                        `<option value="${variation.price}" data-variation-name="${variation.size}">
                            ${variation.size}
                        </option>`
                    ).join('')}
                </select>
            `;
        }

            // Event listener to update selected size
            document.addEventListener('change', (event) => {
                if (event.target && event.target.id === 'variationSelect') {
                    selectedSize = event.target.selectedOptions[0].dataset.variationName;
                }
            });


            const selectedSizeValue = variationSelect ? variationSelect.selectedOptions[0].dataset.variationName : menuProductVariations[0]?.size || 'Default';


            const selectedPriceTotal = selectedPrice * quantity.value
            payWithMonnify(selectedPriceTotal, userName, userEmail, proceedOrderName)
            proceedPayment.addEventListener('click', () => {
                payWithMonnify()
            })

            

                const formData = {
                    menuProductOrderImage: `${proceedOrderImg}`,
                    menuProductOrderName: `${proceedOrderName} - Size: ${selectedSizeValue}`,
                    menuProductOrderPrice: selectedPrice,
                    menuTotalProductOrderPrice: selectedPrice * quantity.value,
                    menuProductOrderAddress: orderProceedAddress.value,
                    menuProductOrderContact: deliveryContact.value,
                    menuProductOrderQuantity: quantity.value,
                    userName,
                    userEmail,
                    userPhone,
                    ...(hasVariation && variationSelect.selectedIndex > 0 && {
                        menuProductOrderVariation: {
                            size: variationSelect.selectedOptions[0].dataset.variationName,
                            price: parseFloat(variationSelect.value)
                        }
                    })
                }
    

    
                alert(`Selected Price: ${selectedPrice}`);
                await userProceedOrderFunc(formData, orderPage)
            

        })
    

}

const userProceedOrderFunc = async (formData, orderPage) => {
    const orderPopUpAlert = document.getElementById('orderPopUpAlert')
    try {
        const userProceedResponse = await fetch(`${config2.apiUrl}/doveeysKitchen/order/createProceedOrder`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })


        console.log(userProceedResponse);
        
        const data = await userProceedResponse.json()
        // console.log(data);
        // alert('orderPlaced Successfully')
        orderPage.classList.add('hidden');
        orderPopUpAlert.classList.remove('hidden')
        
    } catch (error) {
        console.log(error);
        
    }
}



const initializeEventListeners = (proceedOrderPrice) => {
    const variationSelect = document.getElementById('variationSelect');
    const quantityInput = document.getElementById('quantity');
    const totalPriceElement = document.getElementById('totalPrice');
    const proceedButton = document.getElementById('proceedButton');
    const termsCheckbox = document.getElementById('terms');

    // Enable Proceed Button on Terms Acceptance
    termsCheckbox.addEventListener('change', () => {
        proceedButton.disabled = !termsCheckbox.checked;
    });


    // Listen for changes in the variation dropdown
if (variationSelect) {
    variationSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        selectedPrice = parseFloat(selectedOption.value); // Update selectedPrice based on selected variation
        document.getElementById('orderProceedPrice').innerHTML = `Price: <span class="text-orange-500">&#8358;${selectedPrice.toFixed(2)}</span>`;
        updateTotalPrice();
    });
} else {
    selectedPrice = proceedOrderPrice; // Default to the fixed price from local storage
}


    quantityInput.addEventListener('input', () => {

        updateTotalPrice()
    });

};


// Function to update the total price dynamically
const updateTotalPrice = () => {
    const totalPrice = selectedPrice * parseInt(quantity.value || 1, 10);
    document.getElementById('totalPrice').innerHTML = `Total Price: <span class="text-orange-500">&#8358;${totalPrice.toFixed(2)}</span>`;
};





// Helper function to check if all variations are invalid
function isAllVariationsInvalid(variations) {
    return variations.every((variation) => !variation.size || variation.price === null);
  }


  function payWithMonnify(selectedPriceTotal, userName, userEmail, proceedOrderName) {
    MonnifySDK.initialize({
        amount: selectedPriceTotal,
        currency: "NGN",
        reference: new String(new Date().getTime()),
        customerFullName: userName,
        customerEmail: userEmail,
        apiKey: "MK_TEST_YBGVMT4MSZ",
        contractCode: "1062242318",
        paymentDescription: proceedOrderName,
        metadata: {
          name: userName
        },
        onLoadStart: () => {
          console.log("loading has started")
        },
        onLoadComplete: () => {
          console.log("SDK is UP")
        },
        onComplete: function (response) {
          console.log(response)
  
          if (response.completed === true) {
              alert('Successful, click OK to proceed')
              document.getElementById('proceedPayment').classList.add('hidden')
          }
        },
        onClose: function (data) {
          console.log(data)
          if (data.responseCode === "USER_CANCELLED") {
              alert('Order Cancelled')
              window.location.href = '../htmlFolder/perpetualTaste.html'
          }
        },
      })
  }  