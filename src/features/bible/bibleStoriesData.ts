export interface BibleStoryVerse {
  verse: number;
  text: string;
}

export interface BibleStory {
  id: string;
  title: string;
  category: 'The Life of Jesus' | 'Parables' | 'Women in the Bible' | 'New Testament' | 'Old Testament';
  bookId: string;
  bookName: string;
  chapter: number;
  versesRange: string;
  translation: string;
  summary: string;
  verses: BibleStoryVerse[];
  illustrationTheme: 'nativity' | 'disciples' | 'water' | 'rock' | 'sower' | 'sheep' | 'ruth' | 'esther' | 'deborah' | 'shepherds' | 'leper' | 'beatitudes' | 'creation' | 'fall' | 'abraham';
}

export const BIBLE_STORIES_DATA: BibleStory[] = [
  // ==========================================
  // THE LIFE OF JESUS
  // ==========================================
  {
    id: 'jesus-birth',
    title: "Jesus' Birth",
    category: 'The Life of Jesus',
    bookId: 'LUK',
    bookName: 'Luke',
    chapter: 2,
    versesRange: 'Luke 2:1-20',
    translation: 'NIV',
    summary: 'The birth of our Lord and Savior Jesus Christ in Bethlehem, wrapped in swaddling cloths and laid in a manger.',
    illustrationTheme: 'nativity',
    verses: [
      { verse: 1, text: "In those days Caesar Augustus issued a decree that a census should be taken of the entire Roman world." },
      { verse: 2, text: "(This was the first census that took place while Quirinius was governor of Syria.)" },
      { verse: 3, text: "And everyone went to their own town to register." },
      { verse: 4, text: "So Joseph also went up from the town of Nazareth in Galilee to Judea, to Bethlehem the town of David, because he belonged to the house and line of David." },
      { verse: 5, text: "He went there to register with Mary, who was pledged to be married to him and was expecting a child." },
      { verse: 6, text: "While they were there, the time came for the baby to be born," },
      { verse: 7, text: "and she gave birth to her firstborn, a son. She wrapped him in cloths and placed him in a manger, because there was no guest room available for them." },
      { verse: 8, text: "And there were shepherds living out in the fields nearby, keeping watch over their flocks at night." },
      { verse: 9, text: "An angel of the Lord appeared to them, and the glory of the Lord shone around them, and they were terrified." },
      { verse: 10, text: "But the angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people.'" },
      { verse: 11, text: "'Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.'" },
      { verse: 12, text: "'This will be a sign to you: You will find a baby wrapped in cloths and lying in a manger.'" },
      { verse: 13, text: "Suddenly a great company of the heavenly host appeared with the angel, praising God and saying," },
      { verse: 14, text: "'Glory to God in the highest heaven, and on earth peace to those on whom his favor rests.'" },
      { verse: 15, text: "When the angels had left them and gone into heaven, the shepherds said to one another, 'Let’s go to Bethlehem and see this thing that has happened, which the Lord has told us about.'" },
      { verse: 16, text: "So they hurried off and found Mary and Joseph, and the baby, who was lying in the manger." },
      { verse: 17, text: "When they had seen him, they spread the word concerning what had been told them about this child," },
      { verse: 18, text: "and all who heard it were amazed at what the shepherds said to them." },
      { verse: 19, text: "But Mary treasured up all these things and pondered them in her heart." },
      { verse: 20, text: "The shepherds returned, glorifying and praising God for all the things they had heard and seen, which were just as they had been told." }
    ]
  },
  {
    id: 'jesus-chooses-disciples',
    title: 'Jesus Chooses His Disciples',
    category: 'The Life of Jesus',
    bookId: 'MAT',
    bookName: 'Matthew',
    chapter: 4,
    versesRange: 'Matthew 4:18-22',
    translation: 'NIV',
    summary: 'Jesus calls Simon Peter, Andrew, James, and John along the Sea of Galilee to become fishers of men.',
    illustrationTheme: 'disciples',
    verses: [
      { verse: 18, text: "As Jesus was walking beside the Sea of Galilee, he saw two brothers, Simon called Peter and his brother Andrew. They were casting a net into the lake, for they were fishermen." },
      { verse: 19, text: "'Come, follow me,' Jesus said, 'and I will send you out to fish for people.'" },
      { verse: 20, text: "At once they left their nets and followed him." },
      { verse: 21, text: "Going on from there, he saw two other brothers, James son of Zebedee and his brother John. They were in a boat with their father Zebedee, preparing their nets. Jesus called them," },
      { verse: 22, text: "and immediately they left the boat and their father and followed him." }
    ]
  },
  {
    id: 'jesus-walks-on-water',
    title: 'Jesus Walks on Water',
    category: 'The Life of Jesus',
    bookId: 'MAT',
    bookName: 'Matthew',
    chapter: 14,
    versesRange: 'Matthew 14:22-33',
    translation: 'NIV',
    summary: 'Jesus comes to the disciples walking on the stormy sea, and Peter steps out of the boat in faith.',
    illustrationTheme: 'water',
    verses: [
      { verse: 22, text: "Immediately Jesus made the disciples get into the boat and go on ahead of him to the other side, while he dismissed the crowd." },
      { verse: 23, text: "After he had dismissed them, he went up on a mountainside by himself to pray. Later that night, he was there alone," },
      { verse: 24, text: "and the boat was already a considerable distance from land, buffeted by the waves because the wind was against it." },
      { verse: 25, text: "Shortly before dawn Jesus went out to them, walking on the lake." },
      { verse: 26, text: "When the disciples saw him walking on the lake, they were terrified. 'It’s a ghost,' they said, and cried out in fear." },
      { verse: 27, text: "But Jesus immediately said to them: 'Take courage! It is I. Don’t be afraid.'" },
      { verse: 28, text: "'Lord, if it’s you,' Peter replied, 'tell me to come to you on the water.'" },
      { verse: 29, text: "'Come,' he said. Then Peter got down out of the boat, walked on the water and came toward Jesus." },
      { verse: 30, text: "But when he saw the wind, he was afraid and, beginning to sink, cried out, 'Lord, save me!'" },
      { verse: 31, text: "Immediately Jesus reached out his hand and caught him. 'You of little faith,' he said, 'why did you doubt?'" },
      { verse: 32, text: "And when they climbed into the boat, the wind died down." },
      { verse: 33, text: "Then those who were in the boat worshiped him, saying, 'Truly you are the Son of God.'" }
    ]
  },

  // ==========================================
  // PARABLES
  // ==========================================
  {
    id: 'house-sand-rock',
    title: 'The House Built on the Sand and Rock',
    category: 'Parables',
    bookId: 'MAT',
    bookName: 'Matthew',
    chapter: 7,
    versesRange: 'Matthew 7:24-27',
    translation: 'NIV',
    summary: 'The wise builder who foundations his life upon the words of Jesus Christ, enduring every storm.',
    illustrationTheme: 'rock',
    verses: [
      { verse: 24, text: "'Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.'" },
      { verse: 25, text: "'The rain came down, the streams rose, and the winds blew and beat against that house; yet it did not fall, because it had its foundation on the rock.'" },
      { verse: 26, text: "'But everyone who hears these words of mine and does not put them into practice is like a foolish man who built his house on sand.'" },
      { verse: 27, text: "'The rain came down, the streams rose, and the winds blew and beat against that house, and it fell with a great crash.'" }
    ]
  },
  {
    id: 'the-sower',
    title: 'The Sower',
    category: 'Parables',
    bookId: 'MAT',
    bookName: 'Matthew',
    chapter: 13,
    versesRange: 'Matthew 13:1-9',
    translation: 'NIV',
    summary: 'The seed of God’s word sown upon path, rocky ground, thorns, and good soil yielding an abundant harvest.',
    illustrationTheme: 'sower',
    verses: [
      { verse: 1, text: "That same day Jesus went out of the house and sat by the lake." },
      { verse: 2, text: "Such large crowds gathered around him that he got into a boat and sat in it, while all the people stood on the shore." },
      { verse: 3, text: "Then he told them many things in parables, saying: 'A farmer went out to sow his seed.'" },
      { verse: 4, text: "'As he was scattering the seed, some fell along the path, and the birds came and ate it up.'" },
      { verse: 5, text: "'Some fell on rocky places, where it did not have much soil. It sprang up quickly, because the soil was shallow.'" },
      { verse: 6, text: "'But when the sun came up, the plants were scorched, and they withered because they had no root.'" },
      { verse: 7, text: "'Other seed fell among thorns, which grew up and choked the plants.'" },
      { verse: 8, text: "'Still other seed fell on good soil, where it produced a crop—a hundred, sixty or thirty times what was sown.'" },
      { verse: 9, text: "'Whoever has ears, let them hear.'" }
    ]
  },
  {
    id: 'lost-sheep-lost-coin',
    title: 'The Lost Sheep and Lost Coin',
    category: 'Parables',
    bookId: 'LUK',
    bookName: 'Luke',
    chapter: 15,
    versesRange: 'Luke 15:1-10',
    translation: 'NIV',
    summary: 'The tender heart of God rejoicing in heaven over one lost sinner who repents.',
    illustrationTheme: 'sheep',
    verses: [
      { verse: 1, text: "Now the tax collectors and sinners were all gathering around to hear Jesus." },
      { verse: 2, text: "But the Pharisees and the teachers of the law muttered, 'This man welcomes sinners and eats with them.'" },
      { verse: 3, text: "Then Jesus told them this parable:" },
      { verse: 4, text: "'Suppose one of you has a hundred sheep and loses one of them. Doesn’t he leave the ninety-nine in the open country and go after the lost sheep until he finds it?'" },
      { verse: 5, text: "'And when he finds it, he joyfully puts it on his shoulders'" },
      { verse: 6, text: "'and goes home. Then he calls his friends and neighbors together and says, Rejoice with me; I have found my lost sheep.'" },
      { verse: 7, text: "'I tell you that in the same way there will be more rejoicing in heaven over one sinner who repents than over ninety-nine righteous persons who do not need to repent.'" },
      { verse: 8, text: "'Or suppose a woman has ten silver coins and loses one. Doesn’t she light a lamp, sweep the house and search carefully until she finds it?'" },
      { verse: 9, text: "'And when she finds it, she calls her friends and neighbors together and says, Rejoice with me; I have found my lost coin.'" },
      { verse: 10, text: "'In the same way, I tell you, there is rejoicing in the presence of the angels of God over one sinner who repents.'" }
    ]
  },

  // ==========================================
  // WOMEN IN THE BIBLE
  // ==========================================
  {
    id: 'ruth-and-naomi',
    title: 'Ruth & Naomi',
    category: 'Women in the Bible',
    bookId: 'RUT',
    bookName: 'Ruth',
    chapter: 1,
    versesRange: 'Ruth 1:16-18',
    translation: 'NIV',
    summary: 'Ruth’s unwavering covenant of loyalty, love, and faith in the God of Israel.',
    illustrationTheme: 'ruth',
    verses: [
      { verse: 16, text: "But Ruth replied, 'Don’t urge me to leave you or to turn back from you. Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.'" },
      { verse: 17, text: "'Where you die I will die, and there I will be buried. May the Lord deal with me, be it ever so severely, if even death separates you and me.'" },
      { verse: 18, text: "When Naomi realized that Ruth was determined to go with her, she stopped urging her." }
    ]
  },
  {
    id: 'esther-request-to-king',
    title: "Esther's Request to the King",
    category: 'Women in the Bible',
    bookId: 'EST',
    bookName: 'Esther',
    chapter: 4,
    versesRange: 'Esther 4:14-16, 5:1-3',
    translation: 'NIV',
    summary: 'Queen Esther courageously risks her life before the King for such a time as this to save God’s people.',
    illustrationTheme: 'esther',
    verses: [
      { verse: 14, text: "'For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father’s family will perish. And who knows but that you have come to your royal position for such a time as this?'" },
      { verse: 15, text: "Then Esther sent this reply to Mordecai:" },
      { verse: 16, text: "'Go, gather together all the Jews who are in Susa, and fast for me. Do not eat or drink for three days, night or day. I and my attendants will fast as you do. When this is done, I will go to the king, even though it is against the law. And if I perish, I perish.'" }
    ]
  },
  {
    id: 'deborah-judge-israel',
    title: "Deborah Becomes Israel's Judge",
    category: 'Women in the Bible',
    bookId: 'JDG',
    bookName: 'Judges',
    chapter: 4,
    versesRange: 'Judges 4:4-9',
    translation: 'NIV',
    summary: 'Deborah, a prophet and judge full of God’s wisdom and courage, leads Israel into divine victory.',
    illustrationTheme: 'deborah',
    verses: [
      { verse: 4, text: "Now Deborah, a prophet, the wife of Lappidoth, was leading Israel at that time." },
      { verse: 5, text: "She held court under the Palm of Deborah between Ramah and Bethel in the hill country of Ephraim, and the Israelites went up to her to have their disputes decided." },
      { verse: 6, text: "She sent for Barak son of Abinoam from Kedesh in Naphtali and said to him, 'The Lord, the God of Israel, commands you: Go, take with you ten thousand men...'" }
    ]
  },

  // ==========================================
  // NEW TESTAMENT
  // ==========================================
  {
    id: 'shepherds-visit-jesus',
    title: 'The Shepherds Visit Jesus',
    category: 'New Testament',
    bookId: 'LUK',
    bookName: 'Luke',
    chapter: 2,
    versesRange: 'Luke 2:8-16',
    translation: 'NIV',
    summary: 'Humble shepherds hear the angelic proclamation of great joy and run to worship the newborn King.',
    illustrationTheme: 'shepherds',
    verses: [
      { verse: 8, text: "And there were shepherds living out in the fields nearby, keeping watch over their flocks at night." },
      { verse: 9, text: "An angel of the Lord appeared to them, and the glory of the Lord shone around them, and they were terrified." },
      { verse: 10, text: "But the angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people.'" },
      { verse: 11, text: "'Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.'" },
      { verse: 12, text: "'This will be a sign to you: You will find a baby wrapped in cloths and lying in a manger.'" },
      { verse: 13, text: "Suddenly a great company of the heavenly host appeared with the angel, praising God and saying," },
      { verse: 14, text: "'Glory to God in the highest heaven, and on earth peace to those on whom his favor rests.'" }
    ]
  },
  {
    id: 'man-with-leprosy',
    title: 'The Man With Leprosy',
    category: 'New Testament',
    bookId: 'MRK',
    bookName: 'Mark',
    chapter: 1,
    versesRange: 'Mark 1:40-45',
    translation: 'NIV',
    summary: 'Filled with compassion, Jesus touches an untouchable leper and declares: "I am willing; be clean!"',
    illustrationTheme: 'leper',
    verses: [
      { verse: 40, text: "A man with leprosy came to him and begged him on his knees, 'If you are willing, you can make me clean.'" },
      { verse: 41, text: "Jesus was indignant. He reached out his hand and touched the man. 'I am willing,' he said. 'Be clean!'" },
      { verse: 42, text: "Immediately the leprosy left him and he was cleansed." }
    ]
  },
  {
    id: 'the-beatitudes',
    title: 'The Beatitudes',
    category: 'New Testament',
    bookId: 'MAT',
    bookName: 'Matthew',
    chapter: 5,
    versesRange: 'Matthew 5:1-12',
    translation: 'NIV',
    summary: 'Jesus ascends the mountain and proclaims the kingdom blessings of humility, mercy, and righteousness.',
    illustrationTheme: 'beatitudes',
    verses: [
      { verse: 1, text: "Now when Jesus saw the crowds, he went up on a mountainside and sat down. His disciples came to him," },
      { verse: 2, text: "and he began to teach them." },
      { verse: 3, text: "'Blessed are the poor in spirit, for theirs is the kingdom of heaven.'" },
      { verse: 4, text: "'Blessed are those who mourn, for they will be comforted.'" },
      { verse: 5, text: "'Blessed are the meek, for they will inherit the earth.'" },
      { verse: 6, text: "'Blessed are those who hunger and thirst for righteousness, for they will be filled.'" },
      { verse: 7, text: "'Blessed are the merciful, for they will be shown mercy.'" },
      { verse: 8, text: "'Blessed are the pure in heart, for they will see God.'" },
      { verse: 9, text: "'Blessed are the peacemakers, for they will be called children of God.'" }
    ]
  },

  // ==========================================
  // OLD TESTAMENT
  // ==========================================
  {
    id: 'creation-of-world',
    title: 'The Creation of the World',
    category: 'Old Testament',
    bookId: 'GEN',
    bookName: 'Genesis',
    chapter: 1,
    versesRange: 'Genesis 1:1-5, 26-27',
    translation: 'NIV',
    summary: 'In the beginning God spoke light, beauty, order, and mankind into existence by His sovereign word.',
    illustrationTheme: 'creation',
    verses: [
      { verse: 1, text: "In the beginning God created the heavens and the earth." },
      { verse: 2, text: "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters." },
      { verse: 3, text: "And God said, 'Let there be light,' and there was light." },
      { verse: 4, text: "God saw that the light was good, and he separated the light from the darkness." },
      { verse: 5, text: "God called the light 'day,' and the darkness he called 'night.' And there was evening, and there was morning—the first day." },
      { verse: 27, text: "So God created mankind in his own image, in the image of God he created them; male and female he created them." }
    ]
  },
  {
    id: 'the-fall',
    title: 'The Fall',
    category: 'Old Testament',
    bookId: 'GEN',
    bookName: 'Genesis',
    chapter: 3,
    versesRange: 'Genesis 3:1-9, 15',
    translation: 'NIV',
    summary: 'The temptation in Eden, the entrance of sin into the world, and the first glorious promise of the Redeemer.',
    illustrationTheme: 'fall',
    verses: [
      { verse: 1, text: "Now the serpent was more crafty than any of the wild animals the Lord God had made. He said to the woman, 'Did God really say, You must not eat from any tree in the garden?'" },
      { verse: 6, text: "When the woman saw that the fruit of the tree was good for food and pleasing to the eye, and also desirable for gaining wisdom, she took some and ate it. She also gave some to her husband, who was with her, and he ate it." },
      { verse: 9, text: "But the Lord God called to the man, 'Where are you?'" },
      { verse: 15, text: "'And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.'" }
    ]
  },
  {
    id: 'abrahams-call',
    title: "Abraham's Call",
    category: 'Old Testament',
    bookId: 'GEN',
    bookName: 'Genesis',
    chapter: 12,
    versesRange: 'Genesis 12:1-4',
    translation: 'NIV',
    summary: 'God calls Abram to leave his homeland in faith, promising to make of him a great nation that blesses all peoples.',
    illustrationTheme: 'abraham',
    verses: [
      { verse: 1, text: "The Lord had said to Abram, 'Go from your country, your people and your father’s household to the land I will show you.'" },
      { verse: 2, text: "'I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.'" },
      { verse: 3, text: "'I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you.'" },
      { verse: 4, text: "So Abram went, as the Lord had told him; and Lot went with him. Abram was seventy-five years old when he set out from Harran." }
    ]
  }
];
