class Cart {
    constructor() {
        this.cart = [];
        this.cartTableBody = document.querySelector('#cart-table tbody');
        this.cartList = document.querySelector('#cart-list');
        this.cartDiv = document.getElementById('cart');
        this.step = 1;
        this.stepCount = 5;


        this.exclTotal = 0;
        this.btw = 21;
        this.total = 0;

        // buttons
        this.previous = document.getElementById('previous-button');
        this.next = document.getElementById('next-button');
    }

    add(product) {
        const row = document.createElement('li');
        // Check if an item with the same id already exists in the cart
        const existingProductIndex = this.cart.findIndex(existingProduct => existingProduct.id === product.id);

        // If it exists, update quantity and total
        if (existingProductIndex !== -1) {
            this.update(existingProductIndex, product.quantity);
        } else {
            // If it doesn't exist, add the new item to the cart
            this.cart.push(product);
            row.setAttribute('id', 'item-' + product.id);

            // row.innerHTML = `
            // <td><button type="button" class="btn btn-sm btn-danger" onclick="deleteCartProduct(${product.id})">X</button></td>
            // <td>${product.id}</td>
            // <td>${product.category}</td>
            // <td>${product.title}</td>
            // <td data-id="${product.id}" class="data-quantity"><input type="number" class="cart-counter" value="${product.quantity}" onchange="changeQuantity(this)" min="1"/></td>
            // <td>€${product.price}</td>
            // <td data-id="${product.id}" class="data-total">€${product.quantity * product.price}</td>
            // `;
            // this.cartTableBody.append(row);


            row.innerHTML = `
            <li class="d-flex align-items-center pb-2 mb-2 border-bottom">
                        <div class="flex-grow-1">
                            <p>${product.category} > ${product.title}</p>
                            <p data-id="${product.id}" class="data-quantity"><input type="number" class="cart-counter" value="${product.quantity}" onchange="changeQuantity(this)" min="1"/> x €${product.price} = <span data-id="${product.id}" class="data-total">€${product.quantity * product.price}</span></p>
                        </div>
                        <div>
                            <button type="button" class="btn btn-sm btn-danger" onclick="deleteCartProduct(${product.id})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </li>`;
            this.cartList.append(row);
        }

        if (this.cart.length > 0) {
            this.cartDiv.classList.remove('d-none');
        }

        // get total
        this.calculateCartTotal();
    }

    update(index, additionalQuantity) {
        // Update quantity and total based on additional quantity
        this.cart[index].quantity += additionalQuantity;
        this.cart[index].total = this.calculateTotal(this.cart[index]);

        const _cart = this.cart[index];

        const findQuantity = this.cartList.querySelector('[data-id="' + _cart.id + '"].data-quantity input');
        const findTotal = this.cartList.querySelector('[data-id="' + _cart.id + '"].data-total');

        if (findTotal && findQuantity) {
            findQuantity.value = _cart.quantity;
            findTotal.innerHTML = '€' + _cart.total;
        }
        // log
        // console.log(`Quantity updated for item with id ${this.cart[index].id}. New total: ${this.cart[index].total}`);
    }

    delete(id) {
        const indexToDelete = this.cart.findIndex(product => product.id === id);

        if (indexToDelete !== -1) {
            this.cart.splice(indexToDelete, 1);
            this.calculateCartTotal();
            return true;
        } else {
            return false;
        }
    }

    calculateTotal(product) {
        // Your logic to calculate total based on quantity and price
        return product.quantity * product.price;
    }
    calculateCartTotal() {
        if (this.cart.length > 0) {
            let total = 0;
            this.cart.forEach((item) => {
                total += item.quantity * item.price;
            })

            this.exclTotal = total / 1.21;
            this.total = total;
            this.btw = this.total - this.exclTotal;

            $('#excl-total').html('<b style="font-weight:500">Excl: ' + this.exclTotal.toFixed(2) + '</b>');
            $('#btw').html('<b style="font-weight:500">BTW: ' + this.btw.toFixed(2) + '</b>');
            $('#total').html('<b style="font-weight:500">Totaal: ' + this.total.toFixed(2) + '</b>');
        }

    }
    toNextStep() {

        this.finish();
        let validate = this.validateInputs();

        if (!validate) {
            if (this.step == 1) {
                alert('U moet ten minste één dienst selecteren');
            } else {
                alert('Verplichte velden moeten worden ingevuld.');
            }
            return false;
        }

        if (this.step < this.stepCount) {
            this.step++;

            this.previous.classList.remove('d-none');

            const steps = document.querySelectorAll('.steps');
            if (steps.length > 0) {
                steps.forEach((step) => step.classList.add('d-none'));
            }
            const nextStep = document.getElementById('step-' + this.step);
            nextStep.classList.remove('d-none');
        }

        if (this.step == 5) {

            getAllAdres();
            // $('#cart').removeClass('d-none');
        }

    }
    toPreviousStep() {

        if (this.step > 1) {
            this.step--;
            const steps = document.querySelectorAll('.steps');
            if (steps.length > 0) {
                steps.forEach((step) => step.classList.add('d-none'));
            }
            const previousStep = document.getElementById('step-' + this.step);
            previousStep.classList.remove('d-none');
        }

        if (this.step == 1) {
            this.previous.classList.add('d-none');
        }


        // if (this.step == 1) {
        //     $('#cart').removeClass('d-none');
        // } else {
        //     $('#cart').addClass('d-none');
        // }

    }

    finish() {
        if (this.step == this.stepCount) {
            let template = "";
            if (this.cart.length > 0) {
                this.cart.forEach((item, index) => {
                    template += `
                        <input type="hidden" name="cart[${index}][service_id]" value="${item.id}" />
                        <input type="hidden" name="cart[${index}][category_id]" value="${item.category_id}" />
                        <input type="hidden" name="cart[${index}][quantity]" value="${item.quantity}" />
                        <input type="hidden" name="cart[${index}][price]" value="${item.price}" />
                        <input type="hidden" name="cart[${index}][total]" value="${item.quantity * item.price}" />
                    `
                });

                $('#order-form').append(template);
            }
            $('#order-form').submit();
        }
    }
    validateInputs() {
        if (this.cart.length === 0) {
            return false;
        }

        const inputs = document.getElementById(`step-${this.step}`).querySelectorAll('input, select, textarea');

        for (const input of inputs) {
            // Check if the input has the required attribute
            const isRequired = input.hasAttribute('required');

            // Check if the input is required and empty
            if (isRequired && input.value.trim() === '') {
                return false; // Return false if any required input is empty
            }
        }

        return true; // All required inputs are filled
    }

}

// Define Cart class
const cart = new Cart();

document.addEventListener('DOMContentLoaded', function () {


    // buttons
    const addToCartButton = document.querySelectorAll('.add-to-cart');
    const deleteCartButton = document.querySelectorAll('.delete-cart');

    if (addToCartButton) {
        addToCartButton.forEach((button) => {
            const product = JSON.parse(button.getAttribute('data-product'));

            button.addEventListener('click', function () {
                addToCartButton.forEach((oldButton) => oldButton.classList.remove('selected'));
                button.classList.add('selected');
                cart.add(product);
            });
        })
    }

    if (deleteCartButton) {
        deleteCartButton.forEach((button) => {
            const id = button.getAttribute('data-id');
            button.addEventListener('click', function () {
                cart.delete(id);
            });
        })
    }


});


// functions
function deleteCartProduct(id) {
    const response = cart.delete(id);

    if (response) {
        const row = cart.cartList.querySelector('#item-' + id);
        if (row) {
            row.remove();
        }

    }
}

function toNextStep() {
    cart.toNextStep();
}

function toPreviousStep() {
    cart.toPreviousStep();
}

function getSubDienst(category_id, element) {
    // class events
    $('.step-box').removeClass('active');
    $(element).addClass('active');
    let subs = $('#subs');
    subs.empty();
    $.ajax({
        type: 'get',
        url: '/ajax/getSubDienst/' + category_id,
        success: function (response) {
            if (response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    let item = response[i];
                    let template = `
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="step-box border px-2 py-4 text-center sub-step-box" onclick="addToCart(this, {id:${item.id}, category:'${item.category.title.replace("'", "\\'")}', category_id: ${item.category_id}, title:'${item.title}', quantity:1, price:'${item.price}'})">
                            <div class="step-box-image">
                                ${item.icon}
                            </div>
                            <div class="step-box-title mt-2">
                                ${item.title}
                            </div>
                        </div>
                    </div>
                `;
                    subs.append(template);
                }
            }
        }
    });
}

function addToCart(element, { id, category, category_id, title, quantity, price }) {
    $('.sub-step-box').removeClass('active');
    $(element).addClass('active');

    cart.add({ id: id, category: category, category_id: category_id, title: title, quantity: quantity, price: price });
}

// Assuming the changeQuantity function looks like this:
function changeQuantity(inputElement) {
    const productId = inputElement.closest('p').getAttribute('data-id');
    const newQuantity = parseInt(inputElement.value, 10);

    // Find the product in the cart
    const existingProductIndex = cart.cart.findIndex(existingProduct => parseInt(existingProduct.id) === parseInt(productId));

    if (existingProductIndex !== -1) {
        // Update the quantity in the cart
        cart.cart[existingProductIndex].quantity = newQuantity;

        // Update the total in the cart
        cart.cart[existingProductIndex].total = cart.calculateTotal(cart.cart[existingProductIndex]);

        // Update the corresponding HTML elements
        const quantityCell = inputElement.closest('td.data-quantity');
        const totalCell = inputElement.closest('li').querySelector('.data-total');

        if (totalCell) {
            totalCell.innerHTML = '€' + cart.cart[existingProductIndex].total;
        }
    }

    // Update the overall cart total
    cart.calculateCartTotal();
}


function isValidFileType(file) {
    // Define allowed file types
    // const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    return allowedTypes.includes(file.type);
}

function uploadPreview(event) {
    const input = event.target;
    const preview = document.getElementById('filesPreview');

    // Clear previous previews
    preview.innerHTML = '';

    if (input.files && input.files.length > 0) {
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            if (isValidFileType(file)) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    // Create an image element
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '74px'; // You can adjust the maximum height as needed

                    // Check if the file is a PDF
                    if (file.type === 'application/pdf') {
                        // If it's a PDF, use a default image
                        img.src = '/img/pdf-icon.png'; // Replace with your actual image path
                    }

                    // Add multiple classes to the img element
                    img.className = 'border px-1 py-1 me-2 rounded';

                    // Append the image to the preview div
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                // Display an error message for invalid file types
                alert('Invalid file type. Please select only jpg, jpeg, png, or pdf files.');
            }

        }

        $('#filesPreview p').addClass('d-none');
    }
}



var invoiceBoolean = true;
function invoiceSame() {

    const street = document.getElementById('street');
    const number = document.getElementById('number');
    const bus = document.getElementById('bus');
    const postal_code = document.getElementById('postal_code');
    const district = document.getElementById('district');

    // invoice
    const invoice_street = document.getElementById('invoice_street');
    const invoice_number = document.getElementById('invoice_number');
    const invoice_bus = document.getElementById('invoice_bus');
    const invoice_postcode = document.getElementById('invoice_postcode');
    const invoice_district = document.getElementById('invoice_district');

    if (invoiceBoolean) {
        invoice_street.value = street.value;
        invoice_number.value = number.value;
        invoice_bus.value = bus.value;
        invoice_postcode.value = postal_code.value;
        invoice_district.value = district.value;
        invoiceBoolean = false;
    } else {
        invoice_street.value = "";
        invoice_number.value = "";
        invoice_bus.value = "";
        invoice_postcode.value = "";
        invoice_district.value = "";
        invoiceBoolean = true;
    }

}

function getAllAdres() {

    const name = document.getElementById('name').value + ' ' + document.getElementById('surname').value;
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const date = document.getElementById('datum');
    const company = document.getElementById('company');

    // last
    document.getElementById('last_name').innerHTML = name;
    document.getElementById('last_email').innerHTML = email.value;
    document.getElementById('last_phone').innerHTML = phone.value;
    document.getElementById('last_date').innerHTML = date.value;

    // adres
    const street = document.getElementById('street');
    const number = document.getElementById('number');
    const bus = document.getElementById('bus');
    const postal_code = document.getElementById('postal_code');
    const district = document.getElementById('district');

    // invoice
    const invoice_street = document.getElementById('invoice_street');
    const invoice_number = document.getElementById('invoice_number');
    const invoice_bus = document.getElementById('invoice_bus');
    const invoice_postcode = document.getElementById('invoice_postcode');
    const invoice_district = document.getElementById('invoice_district');


    const invoice_all_adres = document.getElementById('invoice_all_adres');
    const all_adres = document.getElementById('all_adres');


    all_adres.innerHTML = street.value + ' ' + number.value + ' ' + bus.value + ' ' + postal_code.value + ' ' + district.value;

    invoice_all_adres.innerHTML = invoice_street.value + ' ' + invoice_number.value + ' ' + invoice_bus.value + ' ' + invoice_postcode.value + ' ' + invoice_district.value;

    if ( company.value != '' ){
        $('#company-text').removeClass('d-none');
        $('#last_company').html(company.value);
    } else{
        $('#company-text').addClass('d-none');
    }
}