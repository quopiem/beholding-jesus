import { CHURCH_INFO } from '../../services/churchInfo';

export const PUBLIC_CHURCH_DATA = {
  name: CHURCH_INFO.name,
  tagline: CHURCH_INFO.tagline,
  motto: CHURCH_INFO.motto,
  seniorPastor: CHURCH_INFO.seniorPastor,
  address: CHURCH_INFO.address,
  shortAddress: CHURCH_INFO.shortAddress,
  googleMapsUrl: CHURCH_INFO.googleMapsUrl,
  schedules: CHURCH_INFO.schedules,

  themeVerses: [
    {
      ref: 'Hebrews 12:2',
      text: 'Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.'
    },
    {
      ref: '2 Corinthians 3:18',
      text: 'And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another. For this comes from the Lord who is the Spirit.'
    }
  ],

  about: {
    heroTag: 'Who We Are',
    title: 'A Christ-Exalting, Grace-Filled Spiritual Family in Cavite',
    intro: 'Beholding Jesus Church (BJC) was founded with a singular, burning passion: to turn our eyes fully toward Jesus Christ, to proclaim the unsearchable riches of His gospel of grace, and to raise mature disciples who live for the glory of God in their homes, workplaces, schools, and communities.',
    paragraphs: [
      'Located in Bacoor City, Cavite, BJC is more than a weekly gathering—it is a covenant household of believers spanning children, vibrant young people, young professionals, and faithful elders walking in genuine love, fervent intercession, and discipleship.',
      'Our worship is heartfelt, Christ-centered, and Spirit-led. Our pulpit is committed to the sound, expository teaching of the Holy Scriptures. We believe that spiritual transformation does not happen through legalism or human effort, but by beholding Jesus Christ—His finished work on the cross, His unconditional love, and His sufficiency for every trial of life.',
      'Whether you have walked with Christ for decades or are stepping into church for the very first time, there is a warm, loving place for you at our table.'
    ],
    pillars: [
      {
        title: 'Christ-Centered Preaching',
        desc: 'Every sermon, bible study, and life group centers on the person, grace, and finished work of the Lord Jesus Christ.',
        icon: 'BookOpen'
      },
      {
        title: 'Covenant Family Culture',
        desc: 'We are a church family where every generation is celebrated, discipled, and loved unconditionally.',
        icon: 'Heart'
      },
      {
        title: 'Spirit-Led Worship & Prayer',
        desc: 'We cultivate an altar of passionate adoration and fervent intercessory prayer that moves the hand of God.',
        icon: 'Music'
      },
      {
        title: 'Intentional Discipleship',
        desc: 'We raise believers from spiritual infancy into strong spiritual mothers, fathers, and leaders of the faith.',
        icon: 'Users'
      }
    ]
  },

  visionMission: {
    vision: {
      statement: 'To be a vibrant, Christ-exalting, Spirit-led, and Word-anchored community in Cavite and beyond, transforming lives, homes, and generations by continuously beholding the beauty and supremacy of Jesus Christ.',
      expansion: 'We envision a church where the broken find healing, the searching find truth, and believers are equipped to shine the light of Christ in every sphere of society until Jesus returns.'
    },
    mission: {
      statement: 'Love God with all our heart, soul, and mind; Love people with the genuine grace of Christ; and Make Christ-like Disciples who impact their generation.',
      points: [
        'Proclaim the uncompromised Gospel of Jesus Christ to the lost.',
        'Nurture believers through systematic, Bible-based discipleship and sound doctrine.',
        'Foster intimate, caring relationships through Life Groups and covenant fellowship.',
        'Mobilize every member into active Christian ministry using their God-given spiritual gifts.',
        'Send and support missions, campus outreaches, and kingdom initiatives.'
      ]
    },
    values: [
      {
        title: 'Supremacy of Christ',
        desc: 'In all things, Christ holds the preeminence (Colossians 1:18). He is the center of our doctrine, our worship, and our lives.',
        ref: 'Colossians 1:18'
      },
      {
        title: 'Biblical Authority',
        desc: 'The Holy Scriptures are our ultimate, inerrant standard for truth, faith, worship, and conduct.',
        ref: '2 Timothy 3:16-17'
      },
      {
        title: 'Radical Grace & Truth',
        desc: 'We extend unconditional love and grace to all people while holding firmly to the truth in love.',
        ref: 'John 1:14'
      },
      {
        title: 'Fervent Intercession',
        desc: 'Prayer is not an afterthought; it is the vital heartbeat of everything we do in God’s kingdom.',
        ref: '1 Thessalonians 5:17'
      },
      {
        title: 'Servant Leadership',
        desc: 'We lead not to be served, but to serve, following the humble example of our Lord Jesus Christ.',
        ref: 'Mark 10:45'
      },
      {
        title: 'Generational Legacy',
        desc: 'We pass the torch of faith boldly to the next generation, investing deeply in children and youth.',
        ref: 'Psalm 145:4'
      }
    ]
  },

  beliefs: [
    {
      topic: 'The Holy Scriptures',
      summary: 'The Holy Bible—both the Old and New Testaments—is the verbally inspired, inerrant, and authoritative Word of God.',
      detail: 'We believe that the sixty-six canonical books of the Bible are inspired by the Holy Spirit, completely without error in their original manuscripts, and the supreme, final authority for Christian faith, doctrine, and living.',
      references: ['2 Timothy 3:16-17', '2 Peter 1:20-21', 'Psalm 119:105']
    },
    {
      topic: 'The Triune God',
      summary: 'There is only one true, living, and eternal God, existing in three co-equal persons: the Father, the Son, and the Holy Spirit.',
      detail: 'God is infinite in holiness, wisdom, power, and love. The Father reigns with providential care, the Son redeems humanity through His blood, and the Holy Spirit regenerates, sanctifies, and indwells believers.',
      references: ['Deuteronomy 6:4', 'Matthew 28:19', '2 Corinthians 13:14']
    },
    {
      topic: 'The Lord Jesus Christ',
      summary: 'Jesus Christ is the eternal Son of God, fully divine and fully human, the only Mediator between God and man.',
      detail: 'We believe in His virgin birth, sinless life, substitutionary death on the cross for our sins, bodily resurrection on the third day, ascension to the right hand of the Father, and His imminent, personal, visible return in glory.',
      references: ['John 1:1,14', '1 Corinthians 15:3-4', '1 Timothy 2:5', 'Titus 2:13']
    },
    {
      topic: 'Salvation by Grace Alone',
      summary: 'Salvation is a free gift of God’s grace received through faith alone in Jesus Christ, apart from human works.',
      detail: 'Because of humanity’s fallen nature, no one can earn justification before God. Through repentance and faith in Christ’s shed blood, a sinner is justified, forgiven, born again, and granted eternal life.',
      references: ['Ephesians 2:8-9', 'Romans 3:23-26', 'John 3:16', 'Titus 3:5']
    },
    {
      topic: 'The Holy Spirit & Sanctification',
      summary: 'The Holy Spirit indwells every believer at regeneration and empowers the church for holy living and fruitful ministry.',
      detail: 'The Spirit convicts the world of sin, seals believers unto the day of redemption, produces spiritual fruit (love, joy, peace), and bestows spiritual gifts for the building up of the body of Christ.',
      references: ['John 14:16-17', 'Galatians 5:22-23', '1 Corinthians 12:4-7', 'Romans 8:9-11']
    },
    {
      topic: 'The Church',
      summary: 'The Church is the spiritual Body of Christ, composed of all regenerated believers united under Christ as Head.',
      detail: 'The local church is a visible community of baptized believers observing the ordinances, cultivating fellowship, worshiping together, and fulfilling the Great Commission throughout the earth.',
      references: ['Ephesians 1:22-23', 'Acts 2:42-47', 'Hebrews 10:24-25']
    },
    {
      topic: 'The Ordinances: Baptism & Communion',
      summary: 'We observe Water Baptism by immersion and the Lord’s Supper (Holy Communion) in obedience to Christ.',
      detail: 'Water baptism symbolizes a believer’s union with Christ in His death, burial, and resurrection. Communion is a sacred commemoration of Christ’s broken body and shed blood, observed with reverent hearts in unity.',
      references: ['Matthew 28:19', 'Romans 6:3-5', '1 Corinthians 11:23-26']
    },
    {
      topic: 'The Resurrection & Eternal State',
      summary: 'There will be a bodily resurrection of both the righteous and the unrighteous.',
      detail: 'Believers in Christ will enjoy eternal life in the presence of God in the new heavens and new earth, while those who reject Christ face eternal separation from God.',
      references: ['1 Thessalonians 4:16-17', 'Revelation 21:1-4', 'Matthew 25:46']
    }
  ],

  ministries: [
    {
      id: 'worship',
      title: 'Worship & Creative Arts',
      tagline: 'Leading Hearts into the Holy Presence of God',
      desc: 'Our Worship Ministry ushers the congregation into genuine adoration of Jesus Christ through vocal arrangements, instrumentals, acoustic resonance, and prayerful songs.',
      responsibilities: [
        'Vocalists & Song Leads',
        'Keyboardists, Acoustic & Electric Guitars, Bass, Drums',
        'Choir & Special Ensembles',
        'Audio Engineering & Sound Reinforcement'
      ],
      icon: 'Music',
      color: 'purple'
    },
    {
      id: 'youth',
      title: 'NextGen Youth (Jesus Gen)',
      tagline: 'Empowering the Rising Generation for Christ',
      desc: 'Jesus Gen is our passionate youth ministry reaching high school, college, and university students across Cavite with high-energy worship, relevant teaching, and discipleship.',
      responsibilities: [
        'Sunday Youth Service (1:00 PM)',
        'Campus Discipleship & Life Groups',
        'Youth Leadership Training Camps',
        'Music, Creative Arts, and Media Outreaches'
      ],
      icon: 'Users',
      color: 'blue'
    },
    {
      id: 'prayer',
      title: 'Prayer & Intercession',
      tagline: 'Standing in the Gap for Church, Families, & Nation',
      desc: 'A faithful army of intercessors dedicated to spiritual warfare, praying for the sick, supporting church leadership, and bathing every service in prayer.',
      responsibilities: [
        'Wednesday Night Corporate Prayer (7:00 PM)',
        'Sunday Pre-Service Prayer Altar (8:15 AM)',
        'Emergency & 24/7 Prayer Request Network',
        'Fasting & Consecration Weeks'
      ],
      icon: 'Heart',
      color: 'rose'
    },
    {
      id: 'lifegroups',
      title: 'Life Groups & Discipleship',
      tagline: 'Doing Life Together Around the Word',
      desc: 'Small relational gatherings meeting in homes, campuses, and coffee spots across Cavite for Bible study, intimate prayer, mutual care, and practical discipleship.',
      responsibilities: [
        'Weekly Cell Gatherings across Bacoor & Molino',
        'Men’s, Women’s, and Young Adults Groups',
        'One-on-One Discipleship Mentorship',
        'Hospitality, Care Packages, and Benevolence'
      ],
      icon: 'BookOpen',
      color: 'amber'
    },
    {
      id: 'media',
      title: 'Multimedia & Production',
      tagline: 'Broadcasting the Gospel with Excellence',
      desc: 'Behind-the-scenes creatives serving with camera operations, projection, live streaming, social media graphics, and digital communications.',
      responsibilities: [
        'Live Stream & Video Broadcasting',
        'Lyrics, Scripture, & Presentation Screens',
        'Photography & Church Archive',
        'Digital Design & Church Website Administration'
      ],
      icon: 'Camera',
      color: 'emerald'
    },
    {
      id: 'ushering',
      title: 'Ushering & Hospitality',
      tagline: 'Welcoming Every Soul as Unto the Lord',
      desc: 'The warm first impression of BJC, guiding members and first-time guests to comfortable seating, distributing bulletins, and caring for logistics.',
      responsibilities: [
        'Door Greeting & Welcome Team',
        'Sanctuary Seating & Crowd Flow',
        'Offering & Tithes Stewardship',
        'First-Time Visitor Care Bags & Refreshments'
      ],
      icon: 'ShieldCheck',
      color: 'gold'
    }
  ],

  lifeGroups: {
    heroTag: 'Covenant Community',
    title: 'Life Groups: Where Church Becomes Family',
    intro: 'Sunday services are where we celebrate corporately, but Life Groups are where we do life intimately. Modeled after Acts 2:46—"attending the temple together and breaking bread in their homes"—our Life Groups provide a safe, loving environment to grow.',
    benefits: [
      {
        title: 'Authentic Relationships',
        desc: 'Build deep, lasting friendships with brothers and sisters who encourage you in seasons of trial and victory.',
        icon: 'Heart'
      },
      {
        title: 'Practical Scripture Application',
        desc: 'Go beyond hearing Sunday preaching by discussing how God’s Word applies directly to your marriage, career, studies, and relationships.',
        icon: 'BookOpen'
      },
      {
        title: 'Personalized Prayer & Care',
        desc: 'Share your burdens with trusted spiritual family members who will intercede and walk alongside you.',
        icon: 'ShieldCheck'
      },
      {
        title: 'Leadership Development',
        desc: 'Discover your spiritual gifts and learn how to shepherd, facilitate discussions, and mentor others in Christ.',
        icon: 'Users'
      }
    ],
    clusters: [
      {
        name: 'Molino & Camella Springville Cluster',
        target: 'Families, Adults & Seniors',
        schedule: 'Every Friday • 7:30 PM',
        location: 'Camella Springville Phase 2 / In-Person Homes'
      },
      {
        name: 'Jesus Gen Campus & Youth Cell',
        target: 'High School & College Students',
        schedule: 'Every Saturday • 3:00 PM',
        location: 'Church Sanctuary Annex & Campus Hubs'
      },
      {
        name: 'Young Professionals & Career Hub',
        target: 'Working Adults & Creatives',
        schedule: 'Every Thursday • 8:00 PM',
        location: 'Hybrid (Online / Bacoor Coffee Spots)'
      },
      {
        name: 'Sisters of Grace Women’s Fellowship',
        target: 'Mothers, Single Women & Sisters in Christ',
        schedule: 'Alternate Saturdays • 10:00 AM',
        location: 'Sanctuary Lounge & Hosted Homes'
      }
    ]
  },

  prayerMinistry: {
    heroTag: 'Altar of Fire',
    title: 'Fervent Prayer & Intercession',
    intro: 'We firmly believe that nothing of eternal significance happens apart from prayer. At Beholding Jesus Church, prayer is not our last resort—it is our primary strategy.',
    scriptures: [
      {
        ref: 'Philippians 4:6-7',
        text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.'
      },
      {
        ref: 'James 5:16',
        text: 'The effective, fervent prayer of a righteous man avails much.'
      }
    ],
    gatherings: [
      {
        title: 'Wednesday Corporate Prayer Night',
        time: 'Wednesdays • 7:00 PM – 8:30 PM',
        location: 'Main Sanctuary & Live Prayer Room',
        desc: 'Our weekly corporate gathering where we lay aside work, enter deep worship, and intercede for revival, families, healings, and the nation.'
      },
      {
        title: 'Sunday Pre-Service Prayer Watch',
        time: 'Sundays • 8:15 AM – 8:45 AM',
        location: 'Prayer Room / Front Altar',
        desc: 'Pastors, leaders, worship team, and intercessors consecrating the Sunday morning service in the Holy Spirit.'
      },
      {
        title: '24/7 Prayer Requests Chain',
        time: 'Always Available',
        location: 'BJC Member App & Pastor Intercessory Line',
        desc: 'Submit your urgent prayer request anytime. Our intercessors pray over every need submitted with confidentiality and faith.'
      }
    ]
  },

  firstTime: {
    heroTag: 'Welcome Home',
    title: 'What to Expect on Your First Sunday',
    intro: 'Stepping into a new church for the first time can feel intimidating. At Beholding Jesus Church, we want your visit to be smooth, uplifting, and completely stress-free.',
    welcomeQuote: 'Come join us this Sunday. Everyone will happily greet you and find a seat. Wear whatever you’re comfortable in. We are just glad you’re here!',
    steps: [
      {
        num: '01',
        title: 'Warm Greeting at the Door',
        desc: 'As you arrive on the 2nd Floor, our ushering and hospitality team will greet you with a genuine smile, hand you a bulletin, and guide you into the air-conditioned sanctuary.'
      },
      {
        num: '02',
        title: 'Help Finding a Comfortable Seat',
        desc: 'No reserved seats! Our team will help you and your family find comfortable seats with a clear view of the stage and screens.'
      },
      {
        num: '03',
        title: 'Heartfelt Praise & Worship',
        desc: 'We begin at 9:00 AM with 25–30 minutes of Spirit-led praise and worship. Feel free to lift your hands, sing along with the lyrics on screen, or simply reflect silently.'
      },
      {
        num: '04',
        title: 'Clear, Bible-Based Preaching',
        desc: 'Pastor John Eric Manjares or guest pastors deliver an expository, practical, and Christ-centered sermon from the Word of God that will feed your spirit and build your faith.'
      },
      {
        num: '05',
        title: 'Fellowship & Welcome Care',
        desc: 'After the service, enjoy light refreshments and warm conversations. We’d love to connect, pray with you if you desire, and welcome you into the family!'
      }
    ],
    faqs: [
      {
        q: 'What is the dress code?',
        a: 'Come as you are! You will see people wearing Sunday casual, jeans, polo shirts, dresses, and sneakers. Wear whatever is comfortable and modest for you.'
      },
      {
        q: 'Where do I park my car or motorcycle?',
        a: 'Designated parking is available in front of the building and along the wide perimeter street of Camella Springville Phase 2 with neighborhood security.'
      },
      {
        q: 'How long does the Sunday Worship Service last?',
        a: 'Our Sunday morning celebration runs from 9:00 AM to approximately 11:15 AM (about 2 hours and 15 minutes of worship, communion, prayer, and Word).'
      },
      {
        q: 'Can I bring my kids?',
        a: 'Yes, absolutely! We love children. They can worship together with you in the main sanctuary, and we have dedicated children ministry teachers during the Word.'
      },
      {
        q: 'Do I have to give in the offering?',
        a: 'As our guest, please do not feel obligated to give! The offering is an act of worship for our regular church members. Your presence is your gift to us.'
      }
    ]
  },

  contact: {
    title: 'Visit Us in Cavite & Get in Touch',
    sanctuaryAddress: CHURCH_INFO.address,
    shortAddress: CHURCH_INFO.shortAddress,
    googleMapsUrl: CHURCH_INFO.googleMapsUrl,
    landmarks: 'Located on the 2nd Floor of B15 L35 MVillar Ave, Phase 2 Central Camella Springville, Molino 3, Bacoor City, Cavite (Near Molino Boulevard / Springville Main Gate).',
    amenities: [
      'Fully Air-Conditioned Sanctuary',
      'High-Definition Audio & Visual Presentation',
      'Clean Restrooms & Family Room',
      'Safe, Gated Camella Springville Neighborhood',
      'Accessible via Tricycle, Jeepney, & Private Vehicle'
    ],
    commuteDirections: [
      {
        from: 'From Bacoor / Molino Boulevard',
        steps: 'Take a jeepney or UV Express along Molino Boulevard to Camella Springville Molino 3 entrance. Take a local shuttle or tricycle to Phase 2 Central (MVillar Ave).'
      },
      {
        from: 'From Alabang / Daang Hari',
        steps: 'Head west along Daang Hari Road towards Molino Road, enter Camella Springville gate, and proceed to Phase 2 Central MVillar Ave.'
      },
      {
        from: 'From Imus / Aguinaldo Highway',
        steps: 'Take Molino-Paliparan Road towards Molino 3, turn into Camella Springville, and proceed to the 2nd floor sanctuary.'
      }
    ]
  }
};
