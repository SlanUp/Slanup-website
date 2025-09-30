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
    creatorProfileImage: 'https://i.pravatar.cc/150?img=1',
    planTitle: 'Sunset Beach Trek',
    venue: 'Muzhappilangad Beach, Kerala',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slotsLeft: 3,
    participantImages: [
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=8',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=15'
    ],
    totalParticipants: 7,
  },
  {
    id: '2',
    creatorName: 'Arjun Patel',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=13',
    planTitle: 'Mountain Biking Adventure',
    venue: 'Nandi Hills, Bangalore',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 2,
    participantImages: [
      'https://i.pravatar.cc/150?img=16',
      'https://i.pravatar.cc/150?img=18',
      'https://i.pravatar.cc/150?img=20'
    ],
    totalParticipants: 3,
  },
  {
    id: '3',
    creatorName: 'Meera Reddy',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=9',
    planTitle: 'Rooftop Movie Night',
    venue: 'Sky Lounge, Mumbai',
    eventDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slotsLeft: 5,
    participantImages: [
      'https://i.pravatar.cc/150?img=22',
      'https://i.pravatar.cc/150?img=25',
      'https://i.pravatar.cc/150?img=28',
      'https://i.pravatar.cc/150?img=30'
    ],
    totalParticipants: 10,
  },
  {
    id: '4',
    creatorName: 'Rahul Kumar',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=33',
    planTitle: 'Surfing Session',
    venue: 'Kovalam Beach, Kerala',
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    slotsLeft: 1,
    participantImages: [
      'https://i.pravatar.cc/150?img=35',
      'https://i.pravatar.cc/150?img=38',
      'https://i.pravatar.cc/150?img=40',
      'https://i.pravatar.cc/150?img=42'
    ],
    totalParticipants: 4,
  },
  {
    id: '5',
    creatorName: 'Ananya Das',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=5',
    planTitle: 'House Party Vibes',
    venue: 'Koramangala, Bangalore',
    eventDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    slotsLeft: 8,
    participantImages: [
      'https://i.pravatar.cc/150?img=44',
      'https://i.pravatar.cc/150?img=47'
    ],
    totalParticipants: 2,
  },
  {
    id: '6',
    creatorName: 'Vikram Singh',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=12',
    planTitle: 'Campfire & Stargazing',
    venue: 'Coorg, Karnataka',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    slotsLeft: 4,
    participantImages: [
      'https://i.pravatar.cc/150?img=50',
      'https://i.pravatar.cc/150?img=52',
      'https://i.pravatar.cc/150?img=55',
      'https://i.pravatar.cc/150?img=58'
    ],
    totalParticipants: 6,
  },
  {
    id: '7',
    creatorName: 'Sneha Iyer',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=10',
    planTitle: 'Cafe Hopping Tour',
    venue: 'Bandra, Mumbai',
    eventDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 3,
    participantImages: [
      'https://i.pravatar.cc/150?img=60',
      'https://i.pravatar.cc/150?img=62',
      'https://i.pravatar.cc/150?img=65'
    ],
    totalParticipants: 3,
  },
  {
    id: '8',
    creatorName: 'Karthik Menon',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=14',
    planTitle: 'Waterfall Trekking',
    venue: 'Athirapally Falls, Kerala',
    eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slotsLeft: 2,
    participantImages: [
      'https://i.pravatar.cc/150?img=68',
      'https://i.pravatar.cc/150?img=70',
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=19'
    ],
    totalParticipants: 8,
  },
  {
    id: '9',
    creatorName: 'Diya Kapoor',
    creatorProfileImage: 'https://i.pravatar.cc/150?img=26',
    planTitle: 'Pottery Workshop',
    venue: 'Indiranagar, Bangalore',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 6,
    participantImages: [
      'https://i.pravatar.cc/150?img=23',
      'https://i.pravatar.cc/150?img=27'
    ],
    totalParticipants: 2,
  },
];