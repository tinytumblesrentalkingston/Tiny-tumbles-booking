// Initialize EmailJS with your public key
emailjs.init('TuYoYTO_a2mtWCbtV');

// Castle data
const castles = {
    'yard-bounce': {
        name: 'Yard Bounce and Slide',
        price: 60,
        deposit: 50,
        rules: 'No food, paint, sharp objects, drinks. Socks must be worn at all times.'
    },
    'umblair': {
        name: 'Umblair - Climber and Slide',
        price: 85,
        deposit: 50,
        rules: 'No food, paint, sharp objects, drinks. Socks must be worn at all times.'
    },
    'banzai': {
        name: 'Banzai Bounce and Slide',
        price: 75,
        deposit: 50,
        rules: 'No food, paint, sharp objects, drinks. Socks must be worn at all times.'
    },
    'water-slide': {
        name: 'Water Slide and Climber with Pool',
        price: 120,
        deposit: 75,
        rules: 'Water slide - standard safety rules apply.'
    }
};

// Booking data storage (in production, this would be in a database)
let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};

// Current state
let currentMonth = new Date();
let selectedCastles = []; // Changed to array for multiple selection
let selectedDate = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeCastleSelection();
    renderCalendar();
    initializeFormHandlers();
});

// Castle Selection - Supports multiple selection (no limit)
function initializeCastleSelection() {
    const castleCards = document.querySelectorAll('.castle-card');
    
    castleCards.forEach(card => {
        card.querySelector('.select-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            
            const castleId = card.dataset.castle;
            
            // Check if already selected
            if (card.classList.contains('selected')) {
                // Deselect
                card.classList.remove('selected');
                selectedCastles = selectedCastles.filter(c => c !== castleId);
            } else {
                // Select (no limit)
                card.classList.add('selected');
                selectedCastles.push(castleId);
            }
            
            // Update hidden field with selected castles
            document.getElementById('selectedCastle').value = selectedCastles.join(',');
            
            // Update cost summary
            updateCostSummary();
            
            // Update castle-specific rules
            updateCastleRules();
            
            // Re-render calendar to show bookings for selected castles
            renderCalendar();
        });
    });
}

// Update castle-specific rules
function updateCastleRules() {
    const rulesElement = document.getElementById('castleSpecificRules');
    if (selectedCastles.length > 0) {
        const rules = selectedCastles.map(id => `${castles[id].name}: ${castles[id].rules}`).join(' | ');
        rulesElement.textContent = rules;
    } else {
        rulesElement.textContent = 'Please select a castle to see specific rules.';
    }
}

// Calendar Functions
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('currentMonth');
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Display current month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthDisplay.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = formatDate(currentDate);
        
        dayElement.className = 'calendar-day';
        
        // Check if date is in the past
        if (currentDate < today) {
            dayElement.classList.add('booked');
            dayElement.innerHTML = `<span class="date">${day}</span><span class="status">Past</span>`;
        }
        // Check if date is booked for any selected castle
        else if (selectedCastles.length > 0 && selectedCastles.some(castle => isDateBooked(dateString, castle))) {
            dayElement.classList.add('booked');
            dayElement.innerHTML = `<span class="date">${day}</span><span class="status">Booked</span>`;
        }
        // Available date
        else {
            dayElement.classList.add('available');
            dayElement.innerHTML = `<span class="date">${day}</span><span class="status">Available</span>`;
            
            // Add click handler for available dates
            dayElement.addEventListener('click', function() {
                if (selectedCastles.length === 0) {
                    alert('Please select at least one castle first!');
                    return;
                }
                
                // Remove previous selection
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Select this date
                dayElement.classList.add('selected');
                selectedDate = dateString;
                document.getElementById('selectedDate').value = dateString;
            });
        }
        
        calendar.appendChild(dayElement);
    }
}

// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    renderCalendar();
});

// Check if date is booked
function isDateBooked(dateString, castle) {
    return bookings[castle] && bookings[castle].includes(dateString);
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Form Handlers
function initializeFormHandlers() {
    // Location selection for delivery fee
    const locationSelect = document.getElementById('locationSelect');
    locationSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const distance = parseFloat(selectedOption.dataset.distance) || 0;
        
        // Show/hide custom distance input
        const customDistanceGroup = document.getElementById('customDistanceGroup');
        if (this.value === 'custom') {
            customDistanceGroup.style.display = 'block';
            document.getElementById('customDistance').required = true;
        } else {
            customDistanceGroup.style.display = 'none';
            document.getElementById('customDistance').required = false;
            updateCostSummary();
        }
    });
    
    // Custom distance input
    const customDistanceInput = document.getElementById('customDistance');
    customDistanceInput.addEventListener('input', updateCostSummary);
    
    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
}

// Update cost summary - now handles multiple castles and location-based delivery
function updateCostSummary() {
    // Get distance based on location selection
    let distance = 0;
    const locationSelect = document.getElementById('locationSelect');
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    
    if (locationSelect.value === 'custom') {
        distance = parseFloat(document.getElementById('customDistance').value) || 0;
    } else if (selectedOption) {
        distance = parseFloat(selectedOption.dataset.distance) || 0;
    }
    
    // Calculate total rental price and deposits for all selected castles
    let totalRentalPrice = 0;
    let totalDeposit = 0;
    
    selectedCastles.forEach(castleId => {
        totalRentalPrice += castles[castleId].price;
        totalDeposit += castles[castleId].deposit;
    });
    
    // Update hidden fields
    document.getElementById('rentalPrice').value = totalRentalPrice;
    document.getElementById('depositAmount').value = totalDeposit;
    
    // Calculate delivery fee with new structure
    let deliveryFee = 0;
    let feeBreakdown = '';
    
    if (distance === 0) {
        // Kingston - Free delivery
        deliveryFee = 0;
        feeBreakdown = '<p style="color: #28a745; font-weight: bold;">✓ Free delivery within Kingston!</p>';
    } else if (distance <= 20) {
        // Up to 20km - $20 flat fee
        deliveryFee = 20;
        feeBreakdown = `<p>Flat fee for ${distance} km: <strong>$20.00</strong></p>`;
    } else {
        // Over 20km - $20 base + $1.50 per additional km
        const additionalKm = distance - 20;
        const additionalFee = additionalKm * 1.5;
        deliveryFee = 20 + additionalFee;
        feeBreakdown = `
            <p>Base fee (up to 20 km): $20.00</p>
            <p>Additional ${additionalKm.toFixed(1)} km × $1.50: $${additionalFee.toFixed(2)}</p>
            <p style="border-top: 1px solid #ddd; padding-top: 5px; margin-top: 5px;">
                <strong>Total Delivery: $${deliveryFee.toFixed(2)}</strong>
            </p>
        `;
    }
    
    // Update display
    document.getElementById('deliveryFee').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('deliveryFeeBreakdown').innerHTML = feeBreakdown;
    document.getElementById('summaryRental').textContent = `$${totalRentalPrice.toFixed(2)}`;
    document.getElementById('summaryDeposit').textContent = `$${totalDeposit.toFixed(2)}`;
    document.getElementById('summaryDelivery').textContent = `$${deliveryFee.toFixed(2)}`;
    
    const total = totalRentalPrice + deliveryFee;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
}

// Handle form submission - now handles multiple castles
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate castle and date selection
    if (selectedCastles.length === 0) {
        alert('Please select at least one castle!');
        return;
    }
    
    if (!selectedDate) {
        alert('Please select a date from the calendar!');
        return;
    }
    
    // Get castle names and details
    const castleNames = selectedCastles.map(id => castles[id].name).join(' + ');
    const castleDetails = selectedCastles.map(id => ({
        name: castles[id].name,
        price: castles[id].price,
        deposit: castles[id].deposit
    }));
    
    // Get distance and location info
    const locationSelect = document.getElementById('locationSelect');
    const selectedLocation = locationSelect.options[locationSelect.selectedIndex].text;
    let distance = 0;
    
    if (locationSelect.value === 'custom') {
        distance = document.getElementById('customDistance').value;
    } else {
        distance = locationSelect.options[locationSelect.selectedIndex].dataset.distance || 0;
    }
    
    // Get form data
    const formData = {
        castles: castleNames,
        castleIds: selectedCastles.join(','),
        castleDetails: castleDetails,
        date: selectedDate,
        customerName: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        selectedLocation: selectedLocation,
        setupTime: document.getElementById('setupTime').value,
        teardownTime: document.getElementById('teardownTime').value,
        distance: distance,
        rentalPrice: document.getElementById('rentalPrice').value,
        depositAmount: document.getElementById('depositAmount').value,
        deliveryFee: document.getElementById('summaryDelivery').textContent,
        totalAmount: document.getElementById('summaryTotal').textContent,
        bookingDate: new Date().toLocaleString()
    };
    
    // Save booking for all selected castles
    selectedCastles.forEach(castleId => {
        if (!bookings[castleId]) {
            bookings[castleId] = [];
        }
        bookings[castleId].push(selectedDate);
    });
    localStorage.setItem('castleBookings', JSON.stringify(bookings));
    
    // Send emails
    try {
        await sendEmails(formData);
        
        // Show success modal
        document.getElementById('successModal').classList.add('show');
        
        // Reset form
        document.getElementById('bookingForm').reset();
        selectedCastles = [];
        selectedDate = null;
        document.querySelectorAll('.castle-card').forEach(c => c.classList.remove('selected'));
        renderCalendar();
        
    } catch (error) {
        console.error('Error sending emails:', error);
        alert('Booking saved but there was an error sending confirmation emails. Please contact us at tinytumblesrental@gmail.com');
    }
}

// Send emails using EmailJS
async function sendEmails(formData) {
    // Create detailed castle breakdown
    const castleBreakdown = formData.castleDetails.map(c =>
        `${c.name}: $${c.price}/day (Deposit: $${c.deposit})`
    ).join('\n');
    
    // Email template parameters for customer
    const customerParams = {
        to_email: formData.email,
        customer_name: formData.customerName,
        castles: formData.castles,
        castle_breakdown: castleBreakdown,
        booking_date: formData.date,
        setup_time: formData.setupTime,
        teardown_time: formData.teardownTime,
        location: formData.location,
        rental_price: formData.rentalPrice,
        deposit_amount: formData.depositAmount,
        delivery_fee: formData.deliveryFee,
        total_amount: formData.totalAmount,
        phone: formData.phone,
        distance: formData.distance,
        waiver_content: generateWaiverContent(formData),
        booking_summary: generateBookingSummary(formData),
        booking_reference: `TB-${Date.now()}`,
        booking_timestamp: formData.bookingDate
    };
    
    // Email template parameters for business
    const businessParams = {
        to_email: 'tinytumblesrental@gmail.com',
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        castles: formData.castles,
        castle_breakdown: castleBreakdown,
        booking_date: formData.date,
        setup_time: formData.setupTime,
        teardown_time: formData.teardownTime,
        location: formData.location,
        rental_price: formData.rentalPrice,
        deposit_amount: formData.depositAmount,
        delivery_fee: formData.deliveryFee,
        total_amount: formData.totalAmount,
        distance: formData.distance,
        booking_summary: generateBookingSummary(formData),
        booking_reference: `TB-${Date.now()}`,
        booking_timestamp: formData.bookingDate
    };
    
    // Send customer email
    await emailjs.send('service_hsngr17', 'template_cshl8lk', customerParams);
    
    // Send business notification email
    await emailjs.send('service_hsngr17', 'template_cshl8lk', businessParams);
}

// Generate waiver content - updated for multiple castles
function generateWaiverContent(formData) {
    const castleRules = formData.castleDetails.map(c =>
        `${c.name}: ${castles[formData.castleIds.split(',').find(id => castles[id].name === c.name)].rules}`
    ).join('\n');
    
    return `
RENTAL AGREEMENT AND LIABILITY WAIVER
Tiny Tumbles Castle Rentals
Booking Reference: TB-${Date.now()}

═══════════════════════════════════════════════════════════

CUSTOMER INFORMATION:
Name: ${formData.customerName}
Email: ${formData.email}
Phone: ${formData.phone}
Event Location: ${formData.location}

═══════════════════════════════════════════════════════════

RENTAL DETAILS:
Castle(s): ${formData.castles}
Date: ${formData.date}
Setup Time: ${formData.setupTime}
Teardown Time: ${formData.teardownTime}
Distance from Kingston: ${formData.distance} km

═══════════════════════════════════════════════════════════

FINANCIAL BREAKDOWN:
${formData.castleDetails.map(c => `${c.name}: $${c.price}/day (Deposit: $${c.deposit})`).join('\n')}

Subtotal Rental: $${formData.rentalPrice}
Total Safety Deposit: $${formData.depositAmount}
Delivery Fee: ${formData.deliveryFee}
─────────────────────────────────────
TOTAL DUE AT SETUP: ${formData.totalAmount}
DEPOSIT (separate payment): $${formData.depositAmount}

═══════════════════════════════════════════════════════════

TERMS AND CONDITIONS:

1. DEPOSIT POLICY:
   • The safety deposit CANNOT be used towards the rental fee
   • Deposit must be paid separately via e-transfer to: tinytumblesrental@gmail.com
   • Deposit will be refunded within 48 hours after equipment return if no damage

2. PAYMENT:
   • Rental amount is DUE AT TIME OF SETUP
   • Cash or e-transfer accepted
   • No refunds for early pickup

3. SAFETY RESPONSIBILITY:
   • The safety of ALL children is the PARENTS' RESPONSIBILITY
   • Parents/guardians must supervise children at all times
   • Maximum capacity must not be exceeded
   • Age and weight restrictions must be followed

4. USAGE RULES FOR YOUR CASTLE(S):
${castleRules}

5. GENERAL RULES:
   • No pets allowed on or near equipment
   • Equipment must not be moved once set up
   • Do not use in high winds or severe weather
   • Blower must remain plugged in at all times
   • No silly string, confetti, or glitter

6. CANCELLATION POLICY:
   • Cancellations accepted ONLY due to severe weather conditions
   • Must be mutually agreed upon
   • Full deposit refund upon approved cancellation
   • 48-hour notice required for non-weather cancellations (50% refund)

7. LIABILITY WAIVER:
   • The renter assumes ALL responsibility for injuries or damages
   • Tiny Tumbles Castle Rentals is not liable for any injuries
   • Renter agrees to supervise all participants
   • Any damage to equipment will be charged to the renter

8. DELIVERY & SETUP:
   • Setup location must be accessible and level
   • Electrical outlet within 50 feet required
   • Setup area must be clear of debris and obstacles
   • Renter responsible for securing pets during setup/teardown

═══════════════════════════════════════════════════════════

ACKNOWLEDGMENT:
By signing below, I acknowledge that I have read, understood, and agree
to ALL terms and conditions outlined in this agreement.

Customer Signature: ___________________________ Date: ___________

Print Name: _______________________________________________

═══════════════════════════════════════════════════════════

Please sign this waiver and return it to: tinytumblesrental@gmail.com
BEFORE your event date.

Thank you for choosing Tiny Tumbles Castle Rentals!
Contact: tinytumblesrental@gmail.com
`;
}

// Generate booking summary - updated for multiple castles
function generateBookingSummary(formData) {
    const castleList = formData.castleDetails.map(c =>
        `  • ${c.name} - $${c.price}/day (Deposit: $${c.deposit})`
    ).join('\n');
    
    return `
╔════════════════════════════════════════════════════════════╗
║          TINY TUMBLES CASTLE RENTALS                       ║
║              BOOKING CONFIRMATION                          ║
╚════════════════════════════════════════════════════════════╝

Booking Reference: TB-${Date.now()}
Booking Date/Time: ${formData.bookingDate}

─────────────────────────────────────────────────────────────
CUSTOMER INFORMATION
─────────────────────────────────────────────────────────────
Name:     ${formData.customerName}
Email:    ${formData.email}
Phone:    ${formData.phone}
Location: ${formData.location}

─────────────────────────────────────────────────────────────
RENTAL DETAILS
─────────────────────────────────────────────────────────────
Castle(s) Booked:
${castleList}

Event Date:    ${formData.date}
Setup Time:    ${formData.setupTime}
Teardown Time: ${formData.teardownTime}
Distance:      ${formData.distance} km from Kingston

─────────────────────────────────────────────────────────────
PAYMENT BREAKDOWN
─────────────────────────────────────────────────────────────
Rental Fee(s):        $${formData.rentalPrice}
Delivery Fee:         ${formData.deliveryFee}
                      ─────────────
TOTAL DUE AT SETUP:   ${formData.totalAmount}

Safety Deposit:       $${formData.depositAmount}
(Separate Payment Required)

─────────────────────────────────────────────────────────────
PAYMENT INSTRUCTIONS
─────────────────────────────────────────────────────────────
1. Safety Deposit: Send e-transfer to tinytumblesrental@gmail.com
   Amount: $${formData.depositAmount}
   Reference: TB-${Date.now()}

2. Rental Payment: Due at time of setup
   Amount: ${formData.totalAmount}
   Methods: Cash or E-transfer

─────────────────────────────────────────────────────────────
IMPORTANT REMINDERS
─────────────────────────────────────────────────────────────
✓ Sign and return the liability waiver before event date
✓ Ensure setup area is clear and accessible
✓ Have electrical outlet within 50 feet
✓ Review safety rules with all participants
✓ Contact us immediately if weather concerns arise

─────────────────────────────────────────────────────────────
CONTACT INFORMATION
─────────────────────────────────────────────────────────────
Email: tinytumblesrental@gmail.com

Thank you for choosing Tiny Tumbles Castle Rentals!
We look forward to making your event memorable! 🎉

═════════════════════════════════════════════════════════════
`;
}

// Close modal
function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Made with Bob
