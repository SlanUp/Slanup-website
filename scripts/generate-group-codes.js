// Generate group-based invite codes for Google Sheets

const fs = require('fs');

const groups = [
  {
    groupNumber: 1,
    members: [
      'Siddhivinayak Dubey',
      'Harsh Singhai',
      'Aradhya Mishra',
      'Aastha Pandey'
    ]
  },
  {
    groupNumber: 2,
    members: [
      'Shubh Agrawal',
      'Abeer',
      'Kuhu Gupta',
      'Jiya Mehta',
      'Jay',
      'Aman',
      'Anshuman Bhaiya',
      'Aditi',
      'Nehak'
    ]
  },
  {
    groupNumber: 3,
    members: [
      'Niyati pareta',
      'Abhinav Parachwani',
      'Janvi Balani',
      'Rishabh Rai'
    ]
  },
  {
    groupNumber: 4,
    members: [
      'Siddharth Devgan',
      'Kartik Lalwani',
      'Arslaan Qureshi',
      'Khushi Sukhija',
      'Rajveer Jaggi',
      'Mahek khatri'
    ]
  },
  {
    groupNumber: 5,
    members: [
      'Sakshi',
      'Shreem',
      'Anadi Mishra',
      'Siddharth',
      'ritvik shrivastava',
      'Nandita',
      'Amit Gupta'
    ]
  },
  {
    groupNumber: 6,
    members: [
      'Udit Tejwani',
      'Harshita Tejwani',
      'Kirti Tejwani',
      'Fazil Shah',
      'Shreyash',
      'Kanishka',
      'Siddhant'
    ]
  },
  {
    groupNumber: 7,
    members: [
      'Tushar Singh',
      'Somya Jain',
      'Nipun Singh',
      'Minal Pagaria',
      'Zeeshan',
      'Harshita Chourasia',
      'Sanskar Yadav'
    ]
  },
  {
    groupNumber: 8,
    members: [
      'Prakhar Gupta',
      'Urvi Gour',
      'Priya Sinha',
      'Palak Dekate',
      'Mansi Nayak'
    ]
  },
  {
    groupNumber: 9,
    members: [
      'vamika',
      'anjali',
      'jagrati',
      'shivani'
    ]
  }
];

// Function to get first 3 letters of name
function getInitials(name) {
  // Clean up name: remove extra spaces, get first word
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const firstName = cleanName.split(' ')[0];
  
  // Get first 3 letters, uppercase
  const initials = firstName.substring(0, 3).toUpperCase();
  return initials;
}

// Generate invite codes
const inviteList = [];
let serialNumber = 1;

groups.forEach(group => {
  group.members.forEach((member, index) => {
    const initials = getInitials(member);
    const memberNumber = index + 1;
    const inviteCode = `G${group.groupNumber}-${initials}-${memberNumber}`;
    
    inviteList.push({
      serial: serialNumber++,
      group: `Group ${group.groupNumber}`,
      name: member.trim(),
      inviteCode: inviteCode,
      email: '',
      phone: '',
      booked: 'No',
      paymentStatus: '',
      referenceNumber: '',
      transactionId: '',
      bookingDate: '',
      checkedIn: 'No'
    });
  });
});

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║       GROUP-BASED INVITE CODES - Copy to Google Sheets!       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`Total invite codes: ${inviteList.length}`);
console.log(`Total groups: ${groups.length}\n`);

// Show group summary
console.log('=== GROUP SUMMARY ===\n');
groups.forEach(group => {
  console.log(`Group ${group.groupNumber}: ${group.members.length} members`);
});

console.log('\n=== HEADER ROW (paste in row 1) ===\n');
console.log('Serial\tGroup\tName\tInvite Code\tEmail\tPhone\tBooked\tPayment Status\tReference Number\tTransaction ID\tBooking Date\tChecked In\n');

console.log('=== DATA ROWS (paste starting from row 2) ===\n');
inviteList.forEach(item => {
  console.log(`${item.serial}\t${item.group}\t${item.name}\t${item.inviteCode}\t${item.email}\t${item.phone}\t${item.booked}\t${item.paymentStatus}\t${item.referenceNumber}\t${item.transactionId}\t${item.bookingDate}\t${item.checkedIn}`);
});

// Save as CSV file
const csvHeader = 'Serial,Group,Name,Invite Code,Email,Phone,Booked,Payment Status,Reference Number,Transaction ID,Booking Date,Checked In\n';
const csvRows = inviteList.map(item => 
  `${item.serial},"${item.group}","${item.name}",${item.inviteCode},${item.email},${item.phone},${item.booked},${item.paymentStatus},${item.referenceNumber},${item.transactionId},${item.bookingDate},${item.checkedIn}`
).join('\n');

const csvContent = csvHeader + csvRows;
fs.writeFileSync('invite-codes.csv', csvContent);
console.log('\n✅ CSV file saved as: invite-codes.csv');

// Also save just the invite codes for easy backend import
const codesOnly = inviteList.map(item => item.inviteCode);
fs.writeFileSync('invite-codes-list.json', JSON.stringify(codesOnly, null, 2));
console.log('✅ Invite codes list saved as: invite-codes-list.json');

// Check for potential duplicate initials within groups
console.log('\n=== CHECKING FOR DUPLICATES ===\n');
let duplicatesFound = false;
groups.forEach(group => {
  const initialsInGroup = {};
  group.members.forEach(member => {
    const initials = getInitials(member);
    if (initialsInGroup[initials]) {
      console.log(`⚠️  Group ${group.groupNumber}: "${member}" has same initials "${initials}" as "${initialsInGroup[initials]}"`);
      duplicatesFound = true;
    } else {
      initialsInGroup[initials] = member;
    }
  });
});

if (!duplicatesFound) {
  console.log('✅ No duplicate initials within groups! All codes are unique.');
}

console.log('\n');
