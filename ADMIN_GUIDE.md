# Admin Guide - Managing Castle Bookings

## How to Update Castle Availability

The booking system uses browser localStorage to track bookings. Here are several ways to manage availability:

---

## Method 1: Using Browser Console (Easiest)

### View All Bookings:
1. Open the booking website
2. Press `F12` to open Developer Tools
3. Go to the "Console" tab
4. Type and press Enter:
```javascript
console.log(JSON.parse(localStorage.getItem('castleBookings')));
```

### Add a Booking Manually:
```javascript
// Get current bookings
let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};

// Add a booking (example: Yard Bounce on June 15, 2026)
if (!bookings['yard-bounce']) bookings['yard-bounce'] = [];
bookings['yard-bounce'].push('2026-06-15');

// Save back to storage
localStorage.setItem('castleBookings', JSON.stringify(bookings));

// Refresh the page to see changes
location.reload();
```

### Remove a Booking:
```javascript
// Get current bookings
let bookings = JSON.parse(localStorage.getItem('castleBookings'));

// Remove a specific date (example: Yard Bounce on June 15, 2026)
bookings['yard-bounce'] = bookings['yard-bounce'].filter(date => date !== '2026-06-15');

// Save back to storage
localStorage.setItem('castleBookings', JSON.stringify(bookings));

// Refresh the page
location.reload();
```

### Clear All Bookings:
```javascript
localStorage.removeItem('castleBookings');
location.reload();
```

---

## Method 2: Using Browser Storage Inspector

1. Open the booking website
2. Press `F12` to open Developer Tools
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Expand "Local Storage" in the left sidebar
5. Click on your website URL
6. Find the `castleBookings` key
7. Double-click the value to edit
8. Modify the JSON directly
9. Refresh the page

---

## Method 3: Create an Admin Panel (Advanced)

Add this HTML to your booking system for easy management:

```html
<!-- Add this section to castle-booking-system.html -->
<section class="admin-panel" style="display: none;">
    <h2>Admin Panel</h2>
    <button onclick="showBookings()">View All Bookings</button>
    <button onclick="exportBookings()">Export Bookings</button>
    <button onclick="clearAllBookings()">Clear All Bookings</button>
    
    <div id="bookingsList"></div>
    
    <h3>Add Manual Booking</h3>
    <select id="adminCastle">
        <option value="yard-bounce">Yard Bounce and Slide</option>
        <option value="umblair">Umblair - Climber and Slide</option>
        <option value="banzai">Banzai Bounce and Slide</option>
        <option value="water-slide">Water Slide and Climber with Pool</option>
    </select>
    <input type="date" id="adminDate">
    <button onclick="addManualBooking()">Add Booking</button>
</section>

<script>
// Admin functions
function showBookings() {
    const bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
    const list = document.getElementById('bookingsList');
    list.innerHTML = '<h4>Current Bookings:</h4>';
    
    for (const [castle, dates] of Object.entries(bookings)) {
        list.innerHTML += `<h5>${castle}:</h5><ul>`;
        dates.forEach(date => {
            list.innerHTML += `<li>${date} <button onclick="removeBooking('${castle}', '${date}')">Remove</button></li>`;
        });
        list.innerHTML += '</ul>';
    }
}

function addManualBooking() {
    const castle = document.getElementById('adminCastle').value;
    const date = document.getElementById('adminDate').value;
    
    let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
    if (!bookings[castle]) bookings[castle] = [];
    
    if (!bookings[castle].includes(date)) {
        bookings[castle].push(date);
        localStorage.setItem('castleBookings', JSON.stringify(bookings));
        alert('Booking added!');
        location.reload();
    } else {
        alert('This date is already booked!');
    }
}

function removeBooking(castle, date) {
    let bookings = JSON.parse(localStorage.getItem('castleBookings'));
    bookings[castle] = bookings[castle].filter(d => d !== date);
    localStorage.setItem('castleBookings', JSON.stringify(bookings));
    alert('Booking removed!');
    location.reload();
}

function exportBookings() {
    const bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'castle-bookings-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

function clearAllBookings() {
    if (confirm('Are you sure you want to clear ALL bookings? This cannot be undone!')) {
        localStorage.removeItem('castleBookings');
        alert('All bookings cleared!');
        location.reload();
    }
}

// Show admin panel with password
function checkAdminPassword() {
    const password = prompt('Enter admin password:');
    if (password === 'tinytumbles2026') { // Change this password!
        document.querySelector('.admin-panel').style.display = 'block';
    }
}
</script>

<!-- Add admin access button -->
<button onclick="checkAdminPassword()" style="position: fixed; bottom: 10px; right: 10px; opacity: 0.3;">Admin</button>
```

---

## Castle IDs Reference

When managing bookings, use these exact castle IDs:

| Castle Name | ID |
|-------------|-----|
| Yard Bounce and Slide | `yard-bounce` |
| Umblair - Climber and Slide | `umblair` |
| Banzai Bounce and Slide | `banzai` |
| Water Slide and Climber with Pool | `water-slide` |

---

## Date Format

Always use this format: `YYYY-MM-DD`

Examples:
- June 15, 2026 = `2026-06-15`
- December 25, 2026 = `2026-12-25`
- January 1, 2027 = `2027-01-01`

---

## Booking Data Structure

The booking data is stored as JSON:

```json
{
  "yard-bounce": ["2026-06-15", "2026-06-20", "2026-07-04"],
  "umblair": ["2026-06-15", "2026-06-22"],
  "banzai": ["2026-06-18"],
  "water-slide": ["2026-07-01", "2026-07-15"]
}
```

---

## Common Tasks

### Block a Date for Maintenance:
```javascript
let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
// Block all castles for June 10, 2026
['yard-bounce', 'umblair', 'banzai', 'water-slide'].forEach(castle => {
    if (!bookings[castle]) bookings[castle] = [];
    bookings[castle].push('2026-06-10');
});
localStorage.setItem('castleBookings', JSON.stringify(bookings));
location.reload();
```

### Block Multiple Dates:
```javascript
let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
const castle = 'yard-bounce';
const dates = ['2026-06-15', '2026-06-16', '2026-06-17'];

if (!bookings[castle]) bookings[castle] = [];
dates.forEach(date => {
    if (!bookings[castle].includes(date)) {
        bookings[castle].push(date);
    }
});
localStorage.setItem('castleBookings', JSON.stringify(bookings));
location.reload();
```

### Check if Date is Available:
```javascript
let bookings = JSON.parse(localStorage.getItem('castleBookings')) || {};
const castle = 'yard-bounce';
const date = '2026-06-15';

const isBooked = bookings[castle] && bookings[castle].includes(date);
console.log(isBooked ? 'Date is BOOKED' : 'Date is AVAILABLE');
```

---

## Email Management

### Check Sent Emails:
1. Log in to your EmailJS account
2. Go to "Email History"
3. View all sent emails with status
4. Check for delivery failures

### Resend Confirmation Email:
If a customer didn't receive their email:
1. Get their booking details from your email copy
2. Use EmailJS dashboard to manually send
3. Or ask them to rebook (system will send automatically)

---

## Backup and Restore

### Backup Bookings:
```javascript
// Copy this output and save it
console.log(localStorage.getItem('castleBookings'));
```

### Restore Bookings:
```javascript
// Replace 'YOUR_BACKUP_DATA' with your saved data
localStorage.setItem('castleBookings', 'YOUR_BACKUP_DATA');
location.reload();
```

---

## Upgrading to Database (Future)

For production use, consider upgrading from localStorage to a database:

### Recommended Options:
1. **Firebase Realtime Database** (easiest)
2. **MongoDB Atlas** (free tier available)
3. **MySQL/PostgreSQL** (requires backend server)

### Benefits:
- Bookings persist across devices
- Multiple admins can manage bookings
- Better security
- Automatic backups
- Real-time synchronization

---

## Troubleshooting

### Bookings Not Showing:
1. Check browser console for errors (F12)
2. Verify localStorage has data
3. Clear browser cache and reload
4. Check if JavaScript is enabled

### Calendar Not Updating:
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear localStorage and re-add bookings
3. Check for JavaScript errors in console

### Emails Not Sending:
1. Verify EmailJS credentials in booking-script.js
2. Check EmailJS dashboard for errors
3. Ensure template ID is correct
4. Check email quota (EmailJS free tier has limits)

---

## Security Notes

⚠️ **Important:**
- localStorage is visible to anyone with browser access
- For production, implement proper authentication
- Consider adding password protection for admin functions
- Regularly backup your booking data
- Use HTTPS for your website

---

## Support

For technical issues:
- Check browser console for errors
- Review SETUP_INSTRUCTIONS.md
- Contact: tinytumblesrental@gmail.com

---

## Quick Reference Commands

```javascript
// View all bookings
console.log(JSON.parse(localStorage.getItem('castleBookings')));

// Add booking
let b = JSON.parse(localStorage.getItem('castleBookings')) || {};
if (!b['castle-id']) b['castle-id'] = [];
b['castle-id'].push('YYYY-MM-DD');
localStorage.setItem('castleBookings', JSON.stringify(b));

// Remove booking
let b = JSON.parse(localStorage.getItem('castleBookings'));
b['castle-id'] = b['castle-id'].filter(d => d !== 'YYYY-MM-DD');
localStorage.setItem('castleBookings', JSON.stringify(b));

// Clear all
localStorage.removeItem('castleBookings');

// Reload page
location.reload();