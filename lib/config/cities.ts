// Master list of Indian cities for dropdowns and filters
// Matches backend src/config/cities.js

export const CITY_REGIONS: Record<string, string[]> = {
  'Delhi NCR': ['Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida'],
  'Mumbai Metropolitan': ['Mumbai', 'Navi Mumbai', 'Thane', 'Kalyan'],
  'Bangalore': ['Bangalore'],
  'Hyderabad': ['Hyderabad', 'Secunderabad'],
  'Chennai': ['Chennai'],
  'Pune': ['Pune', 'Pimpri-Chinchwad'],
  'Kolkata': ['Kolkata', 'Howrah', 'Salt Lake'],
  'Ahmedabad': ['Ahmedabad', 'Gandhinagar'],
  'Jaipur': ['Jaipur'],
  'Lucknow': ['Lucknow'],
  'Chandigarh Tricity': ['Chandigarh', 'Mohali', 'Panchkula'],
  'Kochi': ['Kochi', 'Ernakulam'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
  'Indore': ['Indore'],
  'Jabalpur': ['Jabalpur'],
  'Bhopal': ['Bhopal'],
  'Coimbatore': ['Coimbatore'],
  'Vizag': ['Visakhapatnam'],
  'Nagpur': ['Nagpur'],
  'Patna': ['Patna'],
  'Bhubaneswar': ['Bhubaneswar'],
  'Dehradun': ['Dehradun', 'Rishikesh', 'Mussoorie'],
  'Mysore': ['Mysore'],
  'Mangalore': ['Mangalore'],
  'Trivandrum': ['Thiruvananthapuram'],
  'Vadodara': ['Vadodara'],
  'Surat': ['Surat'],
  'Kanpur': ['Kanpur'],
  'Varanasi': ['Varanasi'],
  'Amritsar': ['Amritsar'],
  'Udaipur': ['Udaipur'],
  'Jodhpur': ['Jodhpur'],
  'Ranchi': ['Ranchi'],
  'Guwahati': ['Guwahati'],
  'Shimla': ['Shimla', 'Manali'],
  'Pondicherry': ['Pondicherry'],
  'Srinagar': ['Srinagar'],
};

// All individual cities (for onboarding, profile city selection)
export const ALL_CITIES = [...new Set(Object.values(CITY_REGIONS).flat())].sort();

// Region groups with multiple cities (for plan creation + preferences)
export const REGION_GROUPS: Record<string, string[]> = Object.fromEntries(
  Object.entries(CITY_REGIONS).filter(([, cities]) => cities.length > 1)
);

// Region group names
export const REGION_GROUP_NAMES = Object.keys(REGION_GROUPS).sort();

// Old compat: region keys only
export const CITIES = Object.keys(CITY_REGIONS).sort();

// Cities for plan creation: individual + region groups
export const PLAN_CITIES = [...ALL_CITIES, ...REGION_GROUP_NAMES].sort();

// Expand city to all related cities (for feed filtering)
export function expandCity(city: string): string[] {
  if (!city) return [];
  const results = [city];
  if (CITY_REGIONS[city]) results.push(...CITY_REGIONS[city]);
  for (const [region, subs] of Object.entries(CITY_REGIONS)) {
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
