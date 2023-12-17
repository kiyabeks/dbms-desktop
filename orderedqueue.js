let orderedProducts = [];

function addProduct() {
  const productInput = document.getElementById("product-input");
  const productName = productInput.value;

  if (productName !== "") {
    const productList = document.getElementById("product-ul");
    const li = document.createElement("li");
    li.textContent = productName;

    productList.appendChild(li);
    orderedProducts.push(productName); // Add product to the ordered list
    productInput.value = "";
  } else {
    alert("Please enter a product name!");
  }
}

function showOrderedQueue() {
  const orderedQueue = document.getElementById("ordered-queue");
  orderedQueue.innerHTML = ""; // Clear previous content

  if (orderedProducts.length > 0) {
    orderedProducts.forEach((product, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${product}`;

      orderedQueue.appendChild(li);
    });

    orderedQueue.style.display = "block"; // Display the ordered queue
  } else {
    alert("No products ordered yet!");
  }
}

// Function to create a new order element
function createOrder() {
    const orderQueue = document.querySelector('.order-queue');
    
    // Create a new order div
    const newOrder = document.createElement('div');
    newOrder.classList.add('order');
    newOrder.textContent = 'New Order'; // Example text for the new order
    
    // Append the new order to the order queue
    orderQueue.appendChild(newOrder);
  }
  
  // Event listener for the "Add Order" button
  document.addEventListener('DOMContentLoaded', function() {
    const addOrderBtn = document.getElementById('addOrderBtn');
    addOrderBtn.addEventListener('click', createOrder);
  });
  

