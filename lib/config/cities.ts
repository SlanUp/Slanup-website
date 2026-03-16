// Master list of Indian cities for dropdowns and filters
// Matches backend src/config/cities.js

export const ALL_CITIES = [
  'Ahmedabad',
  'Amritsar',
  'Bangalore',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Dehradun',
  'Delhi',
  'Ernakulam',
  'Faridabad',
  'Gandhinagar',
  'Ghaziabad',
  'Goa',
  'Greater Noida',
  'Gurgaon',
  'Guwahati',
  'Howrah',
  'Hyderabad',
  'Indore',
  'Jabalpur',
  'Jaipur',
  'Jodhpur',
  'Kalyan',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Manali',
  'Mangalore',
  'Mohali',
  'Mumbai',
  'Mussoorie',
  'Mysore',
  'Nagpur',
  'Navi Mumbai',
  'Noida',
  'Panchkula',
  'Patna',
  'Pimpri-Chinchwad',
  'Pondicherry',
  'Pune',
  'Ranchi',
  'Rishikesh',
  'Salt Lake',
  'Secunderabad',
  'Shimla',
  'Srinagar',
  'Surat',
  'Thane',
  'Thiruvananthapuram',
  'Udaipur',
  'Vadodara',
  'Varanasi',
  'Visakhapatnam',
];

// Only Delhi NCR as a region group
export const REGION_GROUPS: Record<string, string[]> = {
  'Delhi NCR': ['Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida'],
};

export const REGION_GROUP_NAMES = Object.keys(REGION_GROUPS);

// Old compat
export const CITIES = ALL_CITIES;

// Cities for plan creation: individual + Delhi NCR
export const PLAN_CITIES = [...ALL_CITIES, 'Delhi NCR'].sort();

// Expand city to all related cities (for feed filtering)
export function expandCity(city: string): string[] {
  if (!city) return [];
  const results = [city];
  if (REGION_GROUPS[city]) results.push(...REGION_GROUPS[city]);
  for (const [region, subs] of Object.entries(REGION_GROUPS)) {
    if (subs.map(s => s.toLowerCase()).includes(city.toLowerCase()) && !results.includes(region)) {
      results.push(region);
    }
  }
  return [...new Set(results)];
}

// Predefined tags for plan creation and feed filtering
export const PLAN_TAGS = [
  'Hiking',
  'Trekking',
  'Coffee',
  'Brunch',
  'Dinner',
  'Drinks',
  'Rooftop',
  'House Party',
  'Beach',
  'Road Trip',
  'Movie',
  'Concert',
  'Stand-up',
  'Gaming',
  'Sports',
  'Cricket',
  'Football',
  'Badminton',
  'Gym',
  'Yoga',
  'Photography',
  'Art',
  'Music Jam',
  'Book Club',
  'Startup Meetup',
  'Tech Meetup',
  'Networking',
  'Workshop',
  'Potluck',
  'Picnic',
  'Camping',
  'Cycling',
  'Running',
  'Swimming',
  'Karaoke',
  'Board Games',
  'Volunteering',
  'Temple Run',
  'Sightseeing',
  'Festival',
  'Chill',
];
