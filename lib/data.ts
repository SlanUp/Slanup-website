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
    creatorName: 'Kuhu Soni',
    creatorProfileImage: '/Gallery/People/KuhuSoni.JPG',
    planTitle: 'spontaneous girls trip?',
    venue: 'Udaipur, Rajasthan',
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/girls trip.jpeg',
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
    id: '2',
    creatorName: 'Atharva Seth',
    creatorProfileImage: '/Gallery/People/AtharvaSeth.JPG',
    planTitle: 'need clubbing friends badly',
    venue: 'Kitty Su, Mumbai',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/clubbing.JPG',
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
    creatorName: 'Jasmine Saluja',
    creatorProfileImage: '/Gallery/People/JasmineSaluja.jpeg',
    planTitle: 'wanna hike?',
    venue: 'Nandi Hills, Bangalore',
    eventDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/explore-mountains.jpeg',
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
    creatorName: 'Arbaaz Khan',
    creatorProfileImage: '/Gallery/People/ArbaazKhan.JPG',
    planTitle: "let's hop concerts?",
    venue: 'Phoenix Marketcity, Mumbai',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/concert.JPG',
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
    id: '5',
    creatorName: 'Rahul Sharma',
    creatorProfileImage: '/Gallery/People/RahulSharma.JPG',
    planTitle: 'get wasted in goa!',
    venue: 'Anjuna Beach, Goa',
    eventDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/goa.JPG',
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
    creatorName: 'Sara Joshi',
    creatorProfileImage: '/Gallery/People/SaraJoshi.JPG',
    planTitle: 'join in my houseparty this weekend',
    venue: 'Koramangala, Bangalore',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/houseparty.jpeg',
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
    creatorName: 'Siddharth Dubey',
    creatorProfileImage: '/Gallery/People/SIddharthDubey.JPG',
    planTitle: 'morning trek anyone?',
    venue: 'Skandagiri, Bangalore',
    eventDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/morningtrek.JPG',
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
    creatorName: 'Tushar Mishra',
    creatorProfileImage: '/Gallery/People/TusharMishra.JPG',
    planTitle: 'sunset beach walk?',
    venue: 'Juhu Beach, Mumbai',
    eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/sunset.JPG',
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
    creatorName: 'Vini Agarwal',
    creatorProfileImage: '/Gallery/People/ViniAgarwal.JPG',
    planTitle: "let's surfffff!",
    venue: 'Kovalam Beach, Kerala',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    planImageUrl: '/Gallery/Plans/surf.JPG',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slotsLeft: 6,
    participantImages: [
      'https://xsgames.co/randomusers/assets/avatars/male/57.jpg',
      'https://xsgames.co/randomusers/assets/avatars/female/59.jpg'
    ],
    totalParticipants: 2,
  },
];