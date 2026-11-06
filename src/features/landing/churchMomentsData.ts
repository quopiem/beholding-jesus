export interface ChurchMomentPhoto {
  id: string;
  title: string;
  category: 'all' | 'worship' | 'fellowship' | 'training' | 'outreach';
  categoryLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  imageUrl: string;
  tagline: string;
  description: string;
  scriptureReference: string;
  scriptureText: string;
  aspect: 'landscape' | 'portrait';
  featured?: boolean;
}

export const CHURCH_MOMENT_PHOTOS: ChurchMomentPhoto[] = [
  {
    id: 'moment-family',
    title: 'Church Family Table Fellowship',
    category: 'fellowship',
    categoryLabel: 'Church Family',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    imageUrl: '/images/bjc-family-fellowship.jpg',
    tagline: 'Multigenerational Covenant Community',
    description: 'Children, youth, parents, and pastoral elders gathering around the table with glad hearts, celebrating God’s goodness and sharing genuine Christian love.',
    scriptureReference: 'Acts 2:46',
    scriptureText: 'And day by day, attending the temple together and breaking bread in their homes, they received their food with glad and generous hearts.',
    aspect: 'landscape',
    featured: true
  },
  {
    id: 'moment-prayer',
    title: 'Pastoral Prayer & Ministry Impartation',
    category: 'worship',
    categoryLabel: 'Sacred Intercession',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-600 dark:text-amber-400',
    badgeBorder: 'border-amber-500/30',
    imageUrl: '/images/bjc-pastoral-prayer.jpg',
    tagline: 'Laying on of Hands & Pastoral Blessing',
    description: 'Senior Pastor and elders ministering with hands laid in prayer over church members, believing God for healing, spiritual breakthrough, and holy consecration.',
    scriptureReference: 'James 5:16',
    scriptureText: 'The prayer of a righteous person has great power as it is working.',
    aspect: 'portrait',
    featured: true
  },
  {
    id: 'moment-worship',
    title: 'Surrendered Heart of Worship',
    category: 'worship',
    categoryLabel: 'Reverent Devotion',
    badgeBg: 'bg-gold/15',
    badgeText: 'text-gold-dark dark:text-gold',
    badgeBorder: 'border-gold/30',
    imageUrl: '/images/bjc-worship-devotion.jpg',
    tagline: 'Beholding the Beauty of Jesus',
    description: 'A holy and intimate moment of praise, adoration, and prayer as our congregation lifts eyes and hands to Jesus Christ in reverence and gratitude.',
    scriptureReference: 'Psalm 27:4',
    scriptureText: 'One thing have I asked of the Lord, that will I seek after: that I may dwell in the house of the Lord all the days of my life, to gaze upon the beauty of the Lord.',
    aspect: 'portrait',
    featured: true
  },
  {
    id: 'moment-sisters',
    title: 'Sisters in Christ & NextGen Fellowship',
    category: 'fellowship',
    categoryLabel: 'Sisterhood & Youth',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30',
    imageUrl: '/images/bjc-youth-sisters.jpg',
    tagline: 'United in God’s Living Grace',
    description: 'Young women and youth sisters standing arm in arm in genuine Christian sisterhood, uplifting and cheering one another as they walk together in Christ.',
    scriptureReference: '1 Thessalonians 5:11',
    scriptureText: 'Therefore encourage one another and build one another up, just as you are doing.',
    aspect: 'landscape',
    featured: true
  },
  {
    id: 'moment-training',
    title: 'Campus Training & Discipleship',
    category: 'training',
    categoryLabel: 'Campus Discipleship',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-600 dark:text-purple-400',
    badgeBorder: 'border-purple-500/30',
    imageUrl: '/images/bjc-campus-training.jpg',
    tagline: 'Equipping the Saints at the Cross',
    description: 'Campus Training gathering empowering young disciple-makers before the cross to stand firm in God’s truth, reach universities, and impact this generation.',
    scriptureReference: '2 Timothy 2:2',
    scriptureText: 'And what you have heard from me in the presence of many witnesses entrust to faithful men, who will be able to teach others also.',
    aspect: 'landscape',
    featured: true
  },
  {
    id: 'moment-outreach',
    title: 'Evangelism & Public Gospel Witness',
    category: 'outreach',
    categoryLabel: 'Gospel Outreach',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeBorder: 'border-blue-500/30',
    imageUrl: '/images/bjc-evangelism-outreach.jpg',
    tagline: 'Jesus Came to Seek and to Save the Lost',
    description: 'Youth disciple boldly proclaiming the good news on the streets with scripture banners, reaching souls with the life-transforming Gospel of Jesus Christ.',
    scriptureReference: 'Luke 19:10',
    scriptureText: 'For the Son of Man came to seek and to save the lost.',
    aspect: 'portrait',
    featured: true
  }
];
