// Parse raw invite list and generate clean CSV for Google Sheets

const rawData = `Siddhi	SID01	Aastha	AAS27
shubh (agrawal)	SHU02	palak dekate	PAL28
radhe (Harsh Singhai)	RAD03	mansi nayak	MAN29
abeer	ABE04	somya jain	SOM30
aradhya (mishra)	ARA05	minal pagaria	MIN31
nipun singh	NIP06	harshita	HAR32
anadi misgra	ANA07	nehak di	NEH33
Tushar Singh	TUS08	kashish	KAS34
cho2 bhaiya	CHO09	kuhu gupta	KUH35
ritvik diwakar	RIT10	niyati pareta	NIY36
pavitra	PAV11	jiya	JIY37
ablaze 	ABL12	payal 	PAY38
siddharth	SID13	Shreem	SHR39
amit	AMI14	pia	PIA40
zeeshan	ZEE15	nona 	NON41
jay	JAY16	sakshi bhabhi	SAK42
nishant	NIS17	- aditi (cho2)	ADI43
- deepesh bhaiya	DEE18	priya sinha 	PRI44
Prakhar	PRA19	janvi	JAN45
-Sanskar yadav	SAN20	jagrati	JAG46
-Aman (Abeer)	AMA21	nandita	NAN47
Rishabh (niyati)	RIS22	Urvi	URV48
Siddharth (aastha)	SID23	Sakshi(ritvik)	SAK49
Kartik Lalwani (siddharth)	KAR24		
Honey (aastha)	HON25		
Abhinav (niyati)	ABH26`;

// Parse the data
const lines = rawData.split('\n');
const inviteList = [];

lines.forEach(line => {
  const parts = line.split('\t').filter(p => p.trim());
  
  // Process in pairs (name + code)
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      const name = parts[i].trim().replace(/^-\s*/, ''); // Remove leading dash
      const code = parts[i + 1].trim().toUpperCase();
      const serial = code.match(/\d+/)?.[0] || '';
      
      inviteList.push({
        serial: parseInt(serial),
        name: name,
        inviteCode: code,
        email: '',
        phone: '',
        booked: 'No',
        paymentStatus: '',
        referenceNumber: '',
        transactionId: '',
        bookingDate: '',
        checkedIn: 'No'
      });
    }
  }
});

// Sort by serial number
inviteList.sort((a, b) => a.serial - b.serial);

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         GOOGLE SHEETS DATA - Copy this to your sheet!         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('Total invite codes:', inviteList.length);
console.log('\n=== HEADER ROW (paste in row 1) ===\n');
console.log('Serial\tName\tInvite Code\tEmail\tPhone\tBooked\tPayment Status\tReference Number\tTransaction ID\tBooking Date\tChecked In\n');

console.log('=== DATA ROWS (paste starting from row 2) ===\n');
inviteList.forEach(item => {
  console.log(`${item.serial}\t${item.name}\t${item.inviteCode}\t${item.email}\t${item.phone}\t${item.booked}\t${item.paymentStatus}\t${item.referenceNumber}\t${item.transactionId}\t${item.bookingDate}\t${item.checkedIn}`);
});

// Save as CSV file
const fs = require('fs');
const csvHeader = 'Serial,Name,Invite Code,Email,Phone,Booked,Payment Status,Reference Number,Transaction ID,Booking Date,Checked In\n';
const csvRows = inviteList.map(item => 
  `${item.serial},"${item.name}",${item.inviteCode},${item.email},${item.phone},${item.booked},${item.paymentStatus},${item.referenceNumber},${item.transactionId},${item.bookingDate},${item.checkedIn}`
).join('\n');

fs.writeFileSync('invite-codes.csv', csvHeader + csvRows);
console.log('\n✅ CSV file saved as: invite-codes.csv');
console.log('You can import this directly to Google Sheets!\n');
