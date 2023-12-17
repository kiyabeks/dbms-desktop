function addAddress() {
  const fullName = document.getElementById('fullName').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const zipcode = document.getElementById('zipcode').value;

  const addressList = document.getElementById('addressList');

  // Check if any field is empty
  if (fullName === '' || address === '' || city === '' || zipcode === '') {
    alert('Please fill in all fields.');
    return; // Stop execution if any field is empty
  }

  const newAddress = document.createElement('li');
  newAddress.innerHTML = `<strong>${fullName}</strong><br>${address}, ${city}, ${zipcode}`;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Remove';
  deleteBtn.addEventListener('click', function() {
    addressList.removeChild(newAddress);
  });

  newAddress.appendChild(deleteBtn);
  addressList.appendChild(newAddress);

  // Clear the input fields after adding the address
  document.getElementById('fullName').value = '';
  document.getElementById('address').value = '';
  document.getElementById('city').value = '';
  document.getElementById('zipcode').value = '';
}
