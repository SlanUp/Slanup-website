export interface Plan {
  id: string;
  creatorName: string;
  creatorProfileImage: string;
  planTitle: string;
  venue: string;
  eventDate: Date;
  planImageUrl: string;
  postedAt: Date;
  slotsLeft: number;
  participantImages: string[];
  totalParticipants: number;
}

export const SAMPLE_PLANS: Plan[] = [
  {
    id: '1',
    creatorName: 'Priya Sharma',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/female/74.jpg',
    planTitle: 'Sunset Beach Trek',
    venue: 'Muzhappilangad Beach, Kerala',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slotsLeft: 3,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/female/65.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/62.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/73.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/67.jpg'
    ],
    totalParticipants: 7,
  },
  {
    id: '2',
    creatorName: 'Arjun Patel',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/male/51.jpg',
    planTitle: 'Mountain Biking Adventure',
    venue: 'Nandi Hills, Bangalore',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 2,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/64.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/55.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/70.jpg'
    ],
    totalParticipants: 3,
  },
  {
    id: '3',
    creatorName: 'Meera Reddy',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg',
    planTitle: 'Rooftop Movie Night',
    venue: 'Sky Lounge, Mumbai',
    eventDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slotsLeft: 5,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/60.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/65.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/69.jpg'
    ],
    totalParticipants: 10,
  },
  {
    id: '4',
    creatorName: 'Rahul Kumar',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/male/56.jpg',
    planTitle: 'Surfing Session',
    venue: 'Kovalam Beach, Kerala',
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    slotsLeft: 1,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/66.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/64.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/69.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/72.jpg'
    ],
    totalParticipants: 4,
  },
  {
    id: '5',
    creatorName: 'Ananya Das',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/female/65.jpg',
    planTitle: 'House Party Vibes',
    venue: 'Koramangala, Bangalore',
    eventDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    slotsLeft: 8,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/67.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/68.jpg'
    ],
    totalParticipants: 2,
  },
  {
    id: '6',
    creatorName: 'Vikram Singh',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/male/73.jpg',
    planTitle: 'Campfire & Stargazing',
    venue: 'Coorg, Karnataka',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    slotsLeft: 4,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/52.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/58.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/61.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/75.jpg'
    ],
    totalParticipants: 6,
  },
  {
    id: '7',
    creatorName: 'Sneha Iyer',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/female/66.jpg',
    planTitle: 'Cafe Hopping Tour',
    venue: 'Bandra, Mumbai',
    eventDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 3,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/60.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/61.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/68.jpg'
    ],
    totalParticipants: 3,
  },
  {
    id: '8',
    creatorName: 'Karthik Menon',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/male/62.jpg',
    planTitle: 'Waterfall Trekking',
    venue: 'Athirapally Falls, Kerala',
    eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slotsLeft: 2,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/72.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/70.jpg',
      'https://xsgames.co/randomusers/assets/avatars/male/59.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/63.jpg'
    ],
    totalParticipants: 8,
  },
  {
    id: '9',
    creatorName: 'Diya Kapoor',
    creatorProfileImage: 'https://xsgames.co/randomusers/assets/avatars/female/73.jpg',
    planTitle: 'Pottery Workshop',
    venue: 'Indiranagar, Bangalore',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 6,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/57.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/59.jpg'
    ],
    totalParticipants: 2,
  },
];