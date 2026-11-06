import { BibleVerse, BibleTranslationCode } from '../../types';

export interface ChapterSection {
  verse: number;
  title: string;
}

// Section Headings for biblical chapters
export const CHAPTER_SECTIONS: Record<string, ChapterSection[]> = {
  'JHN:3': [
    { verse: 1, title: 'Jesus Teaches Nicodemus' },
    { verse: 22, title: 'John the Baptist Testifies Again About Jesus' }
  ],
  'COL:1': [
    { verse: 1, title: 'Thanksgiving and Prayer' },
    { verse: 15, title: 'The Supremacy of the Son of God' },
    { verse: 24, title: 'Paul’s Labor for the Church' }
  ],
  'COL:3': [
    { verse: 1, title: 'Living as Those Made Alive in Christ' },
    { verse: 12, title: 'Clothe Yourselves with Love' },
    { verse: 18, title: 'Christian Households' }
  ],
  'PSA:23': [
    { verse: 1, title: 'The LORD Is My Shepherd' }
  ],
  'ROM:8': [
    { verse: 1, title: 'Life in the Spirit' },
    { verse: 18, title: 'Present Suffering and Future Glory' },
    { verse: 31, title: 'More Than Conquerors in Christ' }
  ],
  'MAT:5': [
    { verse: 1, title: 'The Beatitudes' },
    { verse: 13, title: 'Salt and Light' },
    { verse: 17, title: 'The Fulfillment of the Law' }
  ],
  'PHP:4': [
    { verse: 4, title: 'Rejoice in the Lord Always' },
    { verse: 10, title: 'God’s Provision and Contentment' }
  ],
  '1CO:13': [
    { verse: 1, title: 'The Excellence of Love' }
  ]
};

// Verse Footnotes / Study Notes (represented by the 💬 bubble in the YouVersion-style UI)
export const VERSE_FOOTNOTES: Record<string, string> = {
  'JHN:3:3': 'The Greek word ‘anōthen’ means both ‘again’ and ‘from above’.',
  'JHN:3:5': '‘Water and the Spirit’ refers to cleansing repentance and spiritual regeneration (cf. Ezekiel 36:25-27).',
  'JHN:3:6': 'The Greek word ‘pneuma’ serves for both breath/wind and the Holy Spirit.',
  'JHN:3:7': 'The Greek pronoun here is plural: ‘You all must be born again.’',
  'JHN:3:14': 'Refers to Numbers 21:8-9 where looking upon the bronze serpent brought healing; looking in faith to Christ crucified brings eternal salvation.',
  'JHN:3:16': 'The central gospel declaration: God’s unconditional love demonstrated in the gift of His Son for all who believe.',
  'COL:1:15': '‘Firstborn’ (prototokos) denotes supreme rank, preeminence, and eternal inheritance over creation, not origin in time.',
  'COL:1:17': 'In Christ, all cosmic order and physical reality is actively sustained and held together.',
  'PSA:23:1': '‘Yahweh Roi’ — The Lord my Shepherd, who provides complete spiritual satisfaction.',
  'ROM:8:28': 'God orchestrates all circumstances for the ultimate conformity of believers into Christ’s likeness.'
};

// Verse Red-Letter Specifications (Jesus' Words)
// Either whole verse is Jesus speaking or specific quotation segments
export const RED_LETTER_CONFIG: Record<string, { all?: boolean; segments?: string[] }> = {
  'JHN:3:3': { all: false, segments: ['“Very truly I tell you, no one can see the kingdom of God unless they are born again.”', '“Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.”'] },
  'JHN:3:5': { all: false, segments: ['“Very truly I tell you, no one can enter the kingdom of God unless they are born of water and the Spirit.', '“Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.'] },
  'JHN:3:6': { all: true },
  'JHN:3:7': { all: true },
  'JHN:3:8': { all: true },
  'JHN:3:10': { all: true },
  'JHN:3:11': { all: true },
  'JHN:3:12': { all: true },
  'JHN:3:13': { all: true },
  'JHN:3:14': { all: true },
  'JHN:3:15': { all: true },
  'JHN:3:16': { all: true },
  'JHN:3:17': { all: true },
  'JHN:3:18': { all: true },
  'JHN:3:19': { all: true },
  'JHN:3:20': { all: true },
  'JHN:3:21': { all: true },
  // Sermon on the mount
  'MAT:5:3': { all: true },
  'MAT:5:4': { all: true },
  'MAT:5:5': { all: true },
  'MAT:5:6': { all: true },
  'MAT:5:7': { all: true },
  'MAT:5:8': { all: true },
  'MAT:5:9': { all: true },
  'MAT:5:10': { all: true },
  'MAT:5:11': { all: true },
  'MAT:5:12': { all: true },
  'MAT:5:13': { all: true },
  'MAT:5:14': { all: true },
  'MAT:5:15': { all: true },
  'MAT:5:16': { all: true }
};

// Curated full chapters and cross-translation verses
export const CURATED_VERSES: Record<string, Record<BibleTranslationCode, string>> = {
  // -------------------------------------------------------------
  // JOHN 3:1-21 (Jesus Teaches Nicodemus — exact reference passage)
  // -------------------------------------------------------------
  'JHN:3:1': {
    NIV: 'Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.',
    KJV: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
    ESV: 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.',
    NLT: 'There was a man named Nicodemus, a Jewish religious leader who was a Pharisee.',
    WEB: 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.',
    ASV: 'Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
    NKJV: 'There was a man of the Pharisees named Nicodemus, a ruler of the Jews.',
    NASB: 'Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews;',
    FSV: 'May isang lalaki mula sa mga Fariseo na nagngangalang Nicodemo, isang pinuno ng mga Judio.'
  },
  'JHN:3:2': {
    NIV: 'He came to Jesus at night and said, “Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him.”',
    KJV: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.',
    ESV: 'This man came to Jesus by night and said to him, “Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him.”',
    NLT: 'After dark one evening, he came to speak with Jesus. “Rabbi,” he said, “we all know that God has sent you to teach us. Your miraculous signs are evidence that God is with you.”',
    WEB: 'The same came to Jesus by night, and said to him, “Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do, unless God is with him.”',
    ASV: 'the same came unto him by night, and said unto him, Rabbi, we know that thou art a teacher come from God; for no one can do these signs that thou doest, except God be with him.',
    NKJV: 'This man came to Jesus by night and said to Him, “Rabbi, we know that You are a teacher come from God; for no one can do these signs that You do unless God is with him.”',
    NASB: 'this man came to Jesus by night and said to Him, “Rabbi, we know that You have come from God as a teacher; for no one can do these signs that You do unless God is with him.”',
    FSV: 'Pumunta siya kay Jesus nang gabi at sinabi sa Kanya, “Rabi, nalalaman namin na Kayo ay isang gurong mula sa Diyos; sapagkat walang makagagawa ng mga tandang ito na Iyong ginagawa, malibang kasama Niya ang Diyos.”'
  },
  'JHN:3:3': {
    NIV: 'Jesus replied, “Very truly I tell you, no one can see the kingdom of God unless they are born again.”',
    KJV: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.',
    ESV: 'Jesus answered him, “Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.”',
    NLT: 'Jesus replied, “I tell you the truth, unless you are born again, you cannot see the Kingdom of God.”',
    WEB: 'Jesus answered him, “Most certainly, I tell you, unless one is born anew, he can’t see God’s Kingdom.”',
    ASV: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except one be born anew, he cannot see the kingdom of God.',
    NKJV: 'Jesus answered and said to him, “Most assuredly, I say to you, unless one is born again, he cannot see the kingdom of God.”',
    NASB: 'Jesus responded and said to him, “Truly, truly, I say to you, unless someone is born again he cannot see the kingdom of God.”',
    FSV: 'Sumagot si Jesus at sinabi sa kanya, “Katotohanang sinasabi Ko sa iyo, malibang ang isang tao ay ipanganak na muli, hindi niya makikita ang kaharian ng Diyos.”'
  },
  'JHN:3:4': {
    NIV: '“How can someone be born when they are old?” Nicodemus asked. “Surely they cannot enter a second time into their mother’s womb to be born!”',
    KJV: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother’s womb, and be born?',
    ESV: 'Nicodemus said to him, “How can a man be born when he is old? Can he enter a second time into his mother’s womb and be born?”',
    NLT: '“What do you mean?” exclaimed Nicodemus. “How can an old man go back into his mother’s womb and be born again?”',
    WEB: 'Nicodemus said to him, “How can a man be born when he is old? Can he enter a second time into his mother’s womb, and be born?”',
    ASV: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter a second time into his mother’s womb, and be born?',
    NKJV: 'Nicodemus said to Him, “How can a man be born when he is old? Can he enter a second time into his mother’s womb and be born?”',
    NASB: 'Nicodemus said to Him, “How can a person be born when he is old? He cannot enter his mother’s womb a second time and be born, can he?”',
    FSV: 'Sinabi sa Kanya ni Nicodemo, “Paanong maipanganganak ang isang tao kung siya ay matanda na? Makapapasok ba siyang muli sa sinapupunan ng kanyang ina upang ipanganak?”'
  },
  'JHN:3:5': {
    NIV: 'Jesus answered, “Very truly I tell you, no one can enter the kingdom of God unless they are born of water and the Spirit.',
    KJV: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.',
    ESV: 'Jesus answered, “Truly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.',
    NLT: 'Jesus replied, “I assure you, no one can enter the Kingdom of God without being born of water and the Spirit.',
    WEB: 'Jesus answered, “Most certainly I tell you, unless one is born of water and spirit, he can’t enter into God’s Kingdom.',
    ASV: 'Jesus answered, Verily, verily, I say unto thee, Except one be born of water and the Spirit, he cannot enter into the kingdom of God.',
    NKJV: 'Jesus answered, “Most assuredly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.',
    NASB: 'Jesus answered, “Truly, truly, I say to you, unless someone is born of water and the Spirit, he cannot enter the kingdom of God.',
    FSV: 'Sumagot si Jesus, “Katotohanang sinasabi Ko sa iyo, malibang ang isang tao ay ipanganak ng tubig at ng Espiritu, hindi siya makapapasok sa kaharian ng Diyos.'
  },
  'JHN:3:6': {
    NIV: 'Flesh gives birth to flesh, but the Spirit gives birth to spirit.',
    KJV: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.',
    ESV: 'That which is born of the flesh is flesh, and that which is born of the Spirit is spirit.',
    NLT: 'Humans can reproduce only human life, but the Holy Spirit gives birth to spiritual life.',
    WEB: 'That which is born of the flesh is flesh. That which is born of the Spirit is spirit.',
    ASV: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.',
    NKJV: 'That which is born of the flesh is flesh, and that which is born of the Spirit is spirit.',
    NASB: 'That which has been born of the flesh is flesh, and that which has been born of the Spirit is spirit.',
    FSV: 'Ang ipinanganak ng laman ay laman; at ang ipinanganak ng Espiritu ay espiritu.'
  },
  'JHN:3:7': {
    NIV: 'You should not be surprised at my saying, ‘You must be born again.’',
    KJV: 'Marvel not that I said unto thee, Ye must be born again.',
    ESV: 'Do not marvel that I said to you, ‘You must be born again.’',
    NLT: 'So don’t be surprised when I say, ‘You must be born again.’',
    WEB: 'Don’t marvel that I said to you, ‘You must be born anew.’',
    ASV: 'Marvel not that I said unto thee, Ye must be born anew.',
    NKJV: 'Do not marvel that I said to you, ‘You must be born again.’',
    NASB: 'Do not be amazed that I said to you, ‘You must be born again.’',
    FSV: 'Huwag kang magtaka sa sinabi Ko sa iyo, ‘Kailangang kayo ay ipanganak na muli.’'
  },
  'JHN:3:8': {
    NIV: 'The wind blows wherever it pleases. You hear its sound, but you cannot tell where it comes from or where it is going. So it is with everyone born of the Spirit.”',
    KJV: 'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.',
    ESV: 'The wind blows where it wishes, and you hear its sound, but you do not know where it comes from or where it goes. So it is with everyone who is born of the Spirit.”',
    NLT: 'The wind blows wherever it wants. Just as you can hear the wind but can’t tell where it comes from or where it is going, so you can’t explain how people are born of the Spirit.”',
    WEB: 'The wind blows where it wants to, and you hear its sound, but don’t know where it comes from and where it is going. So is everyone who is born of the Spirit.”',
    ASV: 'The wind bloweth where it will, and thou hearest the voice thereof, but knowest not whence it cometh, and whither it goeth: so is every one that is born of the Spirit.',
    NKJV: 'The wind blows where it wishes, and you hear the sound of it, but cannot tell where it comes from and where it goes. So is everyone who is born of the Spirit.”',
    NASB: 'The wind blows where it wishes, and you hear the sound of it, but you do not know where it comes from and where it is going; so is everyone who has been born of the Spirit.”',
    FSV: 'Umiihip ang hangin kung saan nito ibig, at naririnig mo ang tunog nito, ngunit hindi mo nalalaman kung saan ito nanggagaling at kung saan ito patutungo; gayon ang bawat ipinanganak ng Espiritu.”'
  },
  'JHN:3:9': {
    NIV: '“How can this be?” Nicodemus asked.',
    KJV: 'Nicodemus answered and said unto him, How can these things be?',
    ESV: 'Nicodemus said to him, “How can these things be?”',
    NLT: '“How are these things possible?” Nicodemus asked.',
    WEB: 'Nicodemus answered him, “How can these things be?”',
    ASV: 'Nicodemus answered and said unto him, How can these things be?',
    NKJV: 'Nicodemus answered and said to Him, “How can these things be?”',
    NASB: 'Nicodemus responded and said to Him, “How can these things be?”',
    FSV: 'Sumagot si Nicodemo at sinabi sa Kanya, “Paanong mangyayari ang mga bagay na ito?”'
  },
  'JHN:3:10': {
    NIV: '“You are Israel’s teacher,” said Jesus, “and do you not understand these things?',
    KJV: 'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?',
    ESV: 'Jesus answered him, “Are you the teacher of Israel and yet you do not understand these things?',
    NLT: 'Jesus replied, “You are a respected Jewish teacher, and yet you don’t understand these things?',
    WEB: 'Jesus answered him, “Are you the teacher of Israel, and don’t understand these things?',
    ASV: 'Jesus answered and said unto him, Art thou the teacher of Israel, and understandest not these things?',
    NKJV: 'Jesus answered and said to him, “Are you the teacher of Israel, and do not know these things?',
    NASB: 'Jesus responded and said to him, “You are the teacher of Israel, and yet you do not understand these things?',
    FSV: 'Sumagot si Jesus at sinabi sa kanya, “Ikaw ba ang guro ng Israel, at hindi mo nauunawaan ang mga bagay na ito?'
  },
  'JHN:3:11': {
    NIV: 'Very truly I tell you, we speak of what we know, and we testify to what we have seen, but still you people do not accept our testimony.',
    KJV: 'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.',
    ESV: 'Truly, truly, I say to you, we speak of what we know, and bear witness to what we have seen, but you do not receive our testimony.',
    NLT: 'I assure you, we tell you what we know and have seen, and yet you won’t believe our testimony.',
    WEB: 'Most certainly I tell you, we speak that which we know, and testify of that which we have seen, and you don’t receive our witness.',
    ASV: 'Verily, verily, I say unto thee, We speak that which we know, and bear witness of that which we have seen; and ye receive not our witness.',
    NKJV: 'Most assuredly, I say to you, We speak what We know and testify what We have seen, and you do not receive Our witness.',
    NASB: 'Truly, truly, I say to you, we speak of what we know and testify of what we have seen, and you people do not accept our testimony.',
    FSV: 'Katotohanang sinasabi Ko sa iyo, sinasalita namin ang aming nalalaman, at pinatototohanan ang aming nakita; ngunit hindi ninyo tinatanggap ang aming patotoo.'
  },
  'JHN:3:12': {
    NIV: 'I have spoken to you of earthly things and you do not believe; how then will you believe if I speak of heavenly things?',
    KJV: 'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?',
    ESV: 'If I have told you earthly things and you do not believe, how can you believe if I tell you heavenly things?',
    NLT: 'But if you don’t believe me when I tell you about earthly things, how can you possibly believe if I tell you about heavenly things?',
    WEB: 'If I told you earthly things and you don’t believe, how will you believe if I tell you of heavenly things?',
    ASV: 'If I told you earthly things and ye believe not, how shall ye believe if I tell you heavenly things?',
    NKJV: 'If I have told you earthly things and you do not believe, how will you believe if I tell you heavenly things?',
    NASB: 'If I told you earthly things and you do not believe, how will you believe if I tell you heavenly things?',
    FSV: 'Kung sinabi Ko sa inyo ang mga bagay na makalupa at hindi kayo naniwala, paanong maniniwala kayo kung sabihin Ko sa inyo ang mga bagay na makalangit?'
  },
  'JHN:3:13': {
    NIV: 'No one has ever gone into heaven except the one who came from heaven—the Son of Man.',
    KJV: 'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.',
    ESV: 'No one has ascended into heaven except he who descended from heaven, the Son of Man.',
    NLT: 'No one has ever gone to heaven and returned. But the Son of Man has come down from heaven.',
    WEB: 'No one has ascended into heaven, but he who descended out of heaven, the Son of Man, who is in heaven.',
    ASV: 'And no one hath ascended into heaven, but he that descended out of heaven, even the Son of man, who is in heaven.',
    NKJV: 'No one has ascended to heaven but He who came down from heaven, that is, the Son of Man who is in heaven.',
    NASB: 'No one has ascended into heaven, except He who descended from heaven: the Son of Man.',
    FSV: 'Walang sinumang umakyat sa langit, maliban sa Kanya na bumaba mula sa langit, samakatuwid ay ang Anak ng Tao na nasa langit.'
  },
  'JHN:3:14': {
    NIV: 'Just as Moses lifted up the snake in the wilderness, so the Son of Man must be lifted up,',
    KJV: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:',
    ESV: 'And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,',
    NLT: 'And as Moses lifted up the bronze snake on a pole in the wilderness, so the Son of Man must be lifted up,',
    WEB: 'As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,',
    ASV: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up;',
    NKJV: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,',
    NASB: 'And just as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,',
    FSV: 'Kung paanong itinaas ni Moises ang ahas sa ilang, gayundin kailangang itaas ang Anak ng Tao,'
  },
  'JHN:3:15': {
    NIV: 'that everyone who believes may have eternal life in him.”',
    KJV: 'That whosoever believeth in him should not perish, but have eternal life.',
    ESV: 'that whoever believes in him may have eternal life.',
    NLT: 'so that everyone who believes in him will have eternal life.',
    WEB: 'that whoever believes in him should not perish, but have eternal life.',
    ASV: 'that whosoever believeth may in him have eternal life.',
    NKJV: 'that whoever believes in Him should not perish but have eternal life.',
    NASB: 'so that everyone who believes will have the eternal life in Him.”',
    FSV: 'upang ang sinumang sumampalataya sa Kanya ay magkaroon ng buhay na walang hanggan.'
  },
  'JHN:3:16': {
    NIV: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    KJV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    ESV: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    NLT: 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
    WEB: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    ASV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.',
    NKJV: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
    NASB: 'For God so loved the world, that He gave His only Son, so that everyone who believes in Him will not perish, but have eternal life.',
    FSV: 'Sapagkat gayon na lamang ang pag-ibig ng Diyos sa sanlibutan na ibinigay Niya ang Kanyang bugtong na Anak, upang ang sinumang sumampalataya sa Kanya ay hindi mapahamak kundi magkaroon ng buhay na walang hanggan.'
  },
  'JHN:3:17': {
    NIV: 'For God did not send his Son into the world to condemn the world, but to save the world through him.',
    KJV: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
    ESV: 'For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.',
    NLT: 'God sent his Son into the world not to judge the world, but to save the world through him.',
    WEB: 'For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.',
    ASV: 'For God sent not the Son into the world to judge the world; but that the world should be saved through him.',
    NKJV: 'For God did not send His Son into the world to condemn the world, but that the world through Him might be saved.',
    NASB: 'For God did not send the Son into the world to judge the world, but that the world might be saved through Him.',
    FSV: 'Sapagkat hindi sinugo ng Diyos ang Anak sa sanlibutan upang hatulan ang sanlibutan, kundi upang ang sanlibutan ay maligtas sa pamamagitan Niya.'
  },
  'JHN:3:18': {
    NIV: 'Whoever believes in him is not condemned, but whoever does not believe stands condemned already because they have not believed in the name of God’s one and only Son.',
    KJV: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
    ESV: 'Whoever believes in him is not condemned, but whoever does not believe is condemned already, because he has not believed in the name of the only Son of God.',
    NLT: 'There is no judgment against anyone who believes in him. But anyone who does not believe in him has already been judged for not believing in God’s one and only Son.',
    WEB: 'He who believes in him is not judged. He who doesn’t believe has been judged already, because he has not believed in the name of the one and only Son of God.',
    ASV: 'He that believeth on him is not judged: he that believeth not hath been judged already, because he hath not believed on the name of the only begotten Son of God.',
    NKJV: 'He who believes in Him is not condemned; but he who does not believe is condemned already, because he has not believed in the name of the only begotten Son of God.',
    NASB: 'The one who believes in Him is not judged; the one who does not believe has been judged already, because he has not believed in the name of the only Son of God.',
    FSV: 'Ang sumasampalataya sa Kanya ay hindi hinahatulan; ngunit ang hindi sumasampalataya ay hinatulan na, sapagkat hindi siya sumampalataya sa pangalan ng bugtong na Anak ng Diyos.'
  },
  'JHN:3:19': {
    NIV: 'This is the verdict: Light has come into the world, but people loved darkness instead of light because their deeds were evil.',
    KJV: 'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.',
    ESV: 'And this is the judgment: the light has come into the world, and people loved the darkness rather than the light because their works were evil.',
    NLT: 'And the judgment is based on this fact: God’s light came into the world, but people loved the darkness more than the light, for their actions were evil.',
    WEB: 'This is the judgment, that the light has come into the world, and men loved the darkness rather than the light; for their works were evil.',
    ASV: 'And this is the judgment, that the light is come into the world, and men loved the darkness rather than the light; for their works were evil.',
    NKJV: 'And this is the condemnation, that the light has come into the world, and men loved darkness rather than light, because their deeds were evil.',
    NASB: 'And this is the judgment, that the Light has come into the world, and people loved the darkness rather than the Light; for their deeds were evil.',
    FSV: 'At ito ang hatol: na ang ilaw ay dumating sa sanlibutan, at inibig pa ng mga tao ang kadiliman kaysa sa ilaw, sapagkat masasama ang kanilang mga gawa.'
  },
  'JHN:3:20': {
    NIV: 'Everyone who does evil hates the light, and will not come into the light for fear that their deeds will be exposed.',
    KJV: 'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.',
    ESV: 'For everyone who does wicked things hates the light and does not come to the light, lest his works should be exposed.',
    NLT: 'All who do evil hate the light and refuse to go near it for fear their sins will be exposed.',
    WEB: 'For everyone who does evil hates the light, and doesn’t come to the light, lest his works would be exposed.',
    ASV: 'For every one that doeth evil hateth the light, and cometh not to the light, lest his works should be reproved.',
    NKJV: 'For everyone practicing evil hates the light and does not come to the light, lest his deeds should be exposed.',
    NASB: 'For everyone who does evil hates the Light, and does not come to the Light, so that his deeds will not be exposed.',
    FSV: 'Sapagkat ang bawat gumagawa ng masama ay napopoot sa ilaw, at hindi lumalapit sa ilaw, upang hindi mahayag ang kanyang mga gawa.'
  },
  'JHN:3:21': {
    NIV: 'But whoever lives by the truth comes into the light, so that it may be seen plainly that what they have done has been done in the sight of God.',
    KJV: 'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.',
    ESV: 'But whoever does what is true comes to the light, so that it may be clearly seen that his works have been carried out in God.”',
    NLT: 'But those who do what is right come to the light, so others can see that they are doing what God wants.”',
    WEB: 'But he who does the truth comes to the light, that his works may be revealed, that they have been done in God.”',
    ASV: 'But he that doeth the truth cometh to the light, that his works may be made manifest, that they have been wrought in God.',
    NKJV: 'But he who does the truth comes to the light, that his deeds may be clearly seen, that they have been done in God.”',
    NASB: 'But the one who practices the truth comes to the Light, so that his deeds will be revealed as having been performed in God.”',
    FSV: 'Ngunit ang gumagawa ng totoo ay lumalapit sa ilaw, upang maihayag na ang kanyang mga gawa ay nagawa sa Diyos.”'
  },

  // -------------------------------------------------------------
  // COLOSSIANS 1:15-20 (Church Foundation)
  // -------------------------------------------------------------
  'COL:1:15': {
    NIV: 'The Son is the image of the invisible God, the firstborn over all creation.',
    KJV: 'Who is the image of the invisible God, the firstborn of every creature:',
    ESV: 'He is the image of the invisible God, the firstborn of all creation.',
    NLT: 'Christ is the visible image of the invisible God. He existed before anything was created and is supreme over all creation,',
    WEB: 'He is the image of the invisible God, the firstborn of all creation.',
    ASV: 'who is the image of the invisible God, the firstborn of all creation;',
    NKJV: 'He is the image of the invisible God, the firstborn over all creation.',
    NASB: 'He is the image of the invisible God, the firstborn of all creation:',
    FSV: 'Siya ang larawan ng di-nakikitang Diyos, ang panganay ng buong nilikha.'
  },
  'COL:1:16': {
    NIV: 'For in him all things were created: things in heaven and on earth, visible and invisible, whether thrones or powers or rulers or authorities; all things have been created through him and for him.',
    KJV: 'For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him:',
    ESV: 'For by him all things were created, in heaven and on earth, visible and invisible, whether thrones or dominions or rulers or authorities—all things were created through him and for him.',
    NLT: 'for through him God created everything in the heavenly realms and on earth. He made the things we can see and the things we cannot see—such as thrones, kingdoms, rulers, and authorities in the unseen world. Everything was created through him and for him.',
    WEB: 'For by him all things were created in the heavens and on the earth, things visible and things invisible, whether thrones or dominions or principalities or powers. All things have been created through him and for him.',
    ASV: 'for in him were all things created, in the heavens and upon the earth, things visible and things invisible, whether thrones or dominions or principalities or powers; all things have been created through him, and unto him;',
    NKJV: 'For by Him all things were created that are in heaven and that are on earth, visible and invisible, whether thrones or dominions or principalities or powers. All things were created through Him and for Him.',
    NASB: 'for by Him all things were created, both in the heavens and on earth, visible and invisible, whether thrones, or dominions, or rulers, or authorities—all things have been created through Him and for Him.',
    FSV: 'Sapagkat sa pamamagitan Niya nilikha ang lahat ng bagay na nasa langit at nasa lupa, nakikita at di-nakikita, maging mga luklukan o mga kapamahalaan o mga pamunuan o mga kapangyarihan; ang lahat ay nilikha sa pamamagitan Niya at para sa Kanya.'
  },
  'COL:1:17': {
    NIV: 'He is before all things, and in him all things hold together.',
    KJV: 'And he is before all things, and by him all things consist.',
    ESV: 'And he is before all things, and in him all things hold together.',
    NLT: 'He existed before anything else, and he holds all creation together.',
    WEB: 'He is before all things, and in him all things are held together.',
    ASV: 'And he is before all things, and in him all things hold together.',
    NKJV: 'And He is before all things, and in Him all things consist.',
    NASB: 'He is before all things, and in Him all things hold together.',
    FSV: 'Siya ay una sa lahat ng mga bagay, at sa Kanya ang lahat ng mga bagay ay nananatili.'
  },
  'COL:1:18': {
    NIV: 'And he is the head of the body, the church; he is the beginning and the firstborn from among the dead, so that in everything he might have the supremacy.',
    KJV: 'And he is the head of the body, the church: who is the beginning, the firstborn from the dead; that in all things he might have the preeminence.',
    ESV: 'And he is the head of the body, the church. He is the beginning, the firstborn from the dead, that in everything he might be preeminent.',
    NLT: 'Christ is also the head of the church, which is his body. He is the beginning, supreme over all who rise from the dead. So he is first in everything.',
    WEB: 'He is the head of the body, the assembly, who is the beginning, the firstborn from the dead, that in all things he might have the preeminence.',
    ASV: 'And he is the head of the body, the church: who is the beginning, the firstborn from the dead; that in all things he might have the preeminence.',
    NKJV: 'And He is the head of the body, the church, who is the beginning, the firstborn from the dead, that in all things He may have the preeminence.',
    NASB: 'He is also head of the body, the church; and He is the beginning, the firstborn from the dead, so that He Himself will come to have first place in everything.',
    FSV: 'Siya ang ulo ng katawan, ng iglesya; Siya ang simula, ang panganay mula sa mga patay, upang sa lahat ng bagay Siya ang maging una.'
  },
  'COL:1:19': {
    NIV: 'For God was pleased to have all his fullness dwell in him,',
    KJV: 'For it pleased the Father that in him should all fulness dwell;',
    ESV: 'For in him all the fullness of God was pleased to dwell,',
    NLT: 'For God in all his fullness was pleased to live in Christ,',
    WEB: 'For all the fullness was pleased to dwell in him,',
    ASV: 'For it was the good pleasure of the Father that in him should all the fulness dwell;',
    NKJV: 'For it pleased the Father that in Him all the fullness should dwell,',
    NASB: 'For it was the Father’s good pleasure for all the fullness to dwell in Him,',
    FSV: 'Sapagkat kinalugdan ng Diyos na ang buong kapuspusan ay manahan sa Kanya,'
  },
  'COL:1:20': {
    NIV: 'and through him to reconcile to himself all things, whether things on earth or things in heaven, by making peace through his blood, shed on the cross.',
    KJV: 'And, having made peace through the blood of his cross, by him to reconcile all things unto himself; by him, I say, whether they be things in earth, or things in heaven.',
    ESV: 'and through him to reconcile to himself all things, whether on earth or in heaven, making peace by the blood of his cross.',
    NLT: 'and through him God reconciled everything to himself. He made peace with everything in heaven and on earth by means of Christ’s blood on the cross.',
    WEB: 'and through him to reconcile all things to himself, having made peace through the blood of his cross—through him, whether things on the earth, or things in the heavens.',
    ASV: 'and through him to reconcile all things unto himself, having made peace through the blood of his cross; through him, I say, whether things upon the earth, or things in the heavens.',
    NKJV: 'and by Him to reconcile all things to Himself, by Him, whether things on earth or things in heaven, having made peace through the blood of His cross.',
    NASB: 'and through Him to reconcile all things to Himself, whether things on earth or things in heaven, having made peace through the blood of His cross.',
    FSV: 'at sa pamamagitan Niya ay ipagkasundo sa Kanyang sarili ang lahat ng mga bagay, sa lupa man o sa langit, nang gumawa Siya ng kapayapaan sa pamamagitan ng dugo ng Kanyang krus.'
  },

  // -------------------------------------------------------------
  // PSALM 23:1-6
  // -------------------------------------------------------------
  'PSA:23:1': {
    NIV: 'The LORD is my shepherd, I lack nothing.',
    KJV: 'The LORD is my shepherd; I shall not want.',
    ESV: 'The LORD is my shepherd; I shall not want.',
    NLT: 'The LORD is my shepherd; I have all that I need.',
    WEB: 'Yahweh is my shepherd: I shall lack nothing.',
    ASV: 'Jehovah is my shepherd; I shall not want.',
    NKJV: 'The LORD is my shepherd; I shall not want.',
    NASB: 'The LORD is my shepherd, I will not be in need.',
    FSV: 'Ang PANGINOON ang aking pastol; hindi ako magkukulang.'
  },
  'PSA:23:2': {
    NIV: 'He makes me lie down in green pastures, he leads me beside quiet waters,',
    KJV: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
    ESV: 'He makes me lie down in green pastures. He leads me beside still waters.',
    NLT: 'He lets me rest in green meadows; he leads me beside peaceful streams.',
    WEB: 'He makes me lie down in green pastures. He leads me beside still waters.',
    ASV: 'He maketh me to lie down in green pastures; He leadeth me beside still waters.',
    NKJV: 'He makes me to lie down in green pastures; He leads me beside the still waters.',
    NASB: 'He lets me lie down in green pastures; He leads me beside quiet waters.',
    FSV: 'Pinahihimlay Niya ako sa sariwang pastulan; inaakay Niya ako sa tabi ng payapang tubig.'
  },
  'PSA:23:3': {
    NIV: 'he refreshes my soul. He guides me along the right paths for his name’s sake.',
    KJV: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.',
    ESV: 'He restores my soul. He leads me in paths of righteousness for his name’s sake.',
    NLT: 'He renews my strength. He guides me along right paths, bringing honor to his name.',
    WEB: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.',
    ASV: 'He restoreth my soul: He guideth me in the paths of righteousness for his name’s sake.',
    NKJV: 'He restores my soul; He leads me in the paths of righteousness For His name’s sake.',
    NASB: 'He restores my soul; He guides me in the paths of righteousness For the sake of His name.',
    FSV: 'Pinapanumbalik Niya ang aking kaluluwa; pinapatnubayan Niya ako sa mga landas ng katuwiran alang-alang sa Kanyang pangalan.'
  },
  'PSA:23:4': {
    NIV: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    KJV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
    ESV: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    NLT: 'Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.',
    WEB: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.',
    ASV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.',
    NKJV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; For You are with me; Your rod and Your staff, they comfort me.',
    NASB: 'Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me.',
    FSV: 'Oo, kahit lumakad ako sa libis ng lilim ng kamatayan, wala akong katatakutang kasamaan; sapagkat Ikaw ay kasama ko; ang Iyong pamalo at ang Iyong tungkod ay umaaliw sa akin.'
  },
  'PSA:23:5': {
    NIV: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.',
    KJV: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
    ESV: 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.',
    NLT: 'You prepare a feast for me in the presence of my enemies. You honor me by anointing my head with oil. My cup overflows with blessings.',
    WEB: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.',
    ASV: 'Thou preparest a table before me in the presence of mine enemies: Thou hast anointed my head with oil; My cup runneth over.',
    NKJV: 'You prepare a table before me in the presence of my enemies; You anoint my head with oil; My cup runs over.',
    NASB: 'You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows.',
    FSV: 'Ipinaghahanda Mo ako ng dulang sa harapan ng aking mga kaaway; pinahiran Mo ng langis ang aking ulo; umaapaw ang aking saro.'
  },
  'PSA:23:6': {
    NIV: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.',
    KJV: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
    ESV: 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.',
    NLT: 'Surely your goodness and unfailing love will pursue me all the days of my life, and I will live in the house of the LORD forever.',
    WEB: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.',
    ASV: 'Surely goodness and lovingkindness shall follow me all the days of my life; And I will dwell in the house of Jehovah for ever.',
    NKJV: 'Surely goodness and mercy shall follow me All the days of my life; And I will dwell in the house of the LORD Forever.',
    NASB: 'Certainly goodness and faithfulness will follow me all the days of my life, And my dwelling will be in the house of the LORD forever.',
    FSV: 'Tunay na ang kabutihan at kagandahang-loob ay susunod sa akin sa lahat ng mga araw ng aking buhay; at ako ay mananahan sa bahay ng PANGINOON magpakailanman.'
  },

  // -------------------------------------------------------------
  // ROMANS 8:28, 31, 38-39
  // -------------------------------------------------------------
  'ROM:8:28': {
    NIV: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    KJV: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    ESV: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    NLT: 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.',
    WEB: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
    ASV: 'And we know that to them that love God all things work together for good, even to them that are called according to his purpose.',
    NKJV: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
    NASB: 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.',
    FSV: 'At nalalaman natin na sa lahat ng mga bagay ang Diyos ay gumagawang kasama ng mga umiibig sa Kanya, sa ikabubuti ng mga tinawag ayon sa Kanyang layunin.'
  },
  'ROM:8:31': {
    NIV: 'What, then, shall we say in response to these things? If God is for us, who can be against us?',
    KJV: 'What shall we then say to these things? If God be for us, who can be against us?',
    ESV: 'What then shall we say to these things? If God is for us, who can be against us?',
    NLT: 'What shall we say about such wonderful things as these? If God is for us, who can ever be against us?',
    WEB: 'What then shall we say about these things? If God is for us, who can be against us?',
    ASV: 'What then shall we say to these things? If God is for us, who is against us?',
    NKJV: 'What then shall we say to these things? If God is for us, who can be against us?',
    NASB: 'What then shall we say to these things? If God is for us, who is against us?',
    FSV: 'Ano nga ang ating sasabihin sa mga bagay na ito? Kung ang Diyos ay panig sa atin, sino ang laban sa atin?'
  },
  'ROM:8:38': {
    NIV: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers,',
    KJV: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
    ESV: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers,',
    NLT: 'And I am convinced that nothing can ever separate us from God’s love. Neither death nor life, neither angels nor demons, neither our fears for today nor our worries about tomorrow—not even the powers of hell can separate us from God’s love.',
    WEB: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,',
    ASV: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,',
    NKJV: 'For I am persuaded that neither death nor life, nor angels nor principalities nor powers, nor things present nor things to come,',
    NASB: 'For I am convinced that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,',
    FSV: 'Sapagkat ako ay may lubos na pagtitiwala na kahit ang kamatayan, o ang buhay, o ang mga anghel, o ang mga pamunuan, o ang mga bagay na kasalukuyan, o ang mga bagay na darating, o ang mga kapangyarihan,'
  },
  'ROM:8:39': {
    NIV: 'neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
    KJV: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    ESV: 'nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.',
    NLT: 'No power in the sky above or in the earth below—indeed, nothing in all creation will ever be able to separate us from the love of God that is revealed in Christ Jesus our Lord.',
    WEB: 'nor height, nor depth, nor any other created thing, will be able to separate us from God’s love, which is in Christ Jesus our Lord.',
    ASV: 'nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    NKJV: 'nor height nor depth, nor any other created thing, shall be able to separate us from the love of God which is in Christ Jesus our Lord.',
    NASB: 'nor height, nor depth, nor any other created thing will be able to separate us from the love of God that is in Christ Jesus our Lord.',
    FSV: 'o ang kataasan, o ang kalaliman, o ang alinmang iba pang nilikha, ay hindi makapaghihiwalay sa atin sa pag-ibig ng Diyos, na na kay Cristo Jesus na ating Panginoon.'
  },

  // -------------------------------------------------------------
  // PHILIPPIANS 4:6-7, 13
  // -------------------------------------------------------------
  'PHP:4:6': {
    NIV: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    KJV: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
    ESV: 'do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.',
    NLT: 'Don’t worry about anything; instead, pray about everything. Tell God what you need, and thank him for all he has done.',
    WEB: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.',
    ASV: 'In nothing be anxious; but in everything by prayer and supplication with thanksgiving let your requests be made known unto God.',
    NKJV: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God;',
    NASB: 'Do not be anxious about anything, but in everything by prayer and pleading with thanksgiving let your requests be made known to God.',
    FSV: 'Huwag kayong mabalisa sa anumang bagay; sa halip, sa lahat ng bagay sa pamamagitan ng panalangin at pagsusumamo na may pagpapasalamat ay ipaalam ninyo ang inyong mga kahilingan sa Diyos.'
  },
  'PHP:4:7': {
    NIV: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    KJV: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    ESV: 'And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.',
    NLT: 'Then you will experience God’s peace, which exceeds anything we can understand. His peace will guard your hearts and minds as you live in Christ Jesus.',
    WEB: 'And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.',
    ASV: 'And the peace of God, which passeth all understanding, shall guard your hearts and your thoughts in Christ Jesus.',
    NKJV: 'and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.',
    NASB: 'And the peace of God, which surpasses all comprehension, will guard your hearts and minds in Christ Jesus.',
    FSV: 'At ang kapayapaan ng Diyos, na higit sa lahat ng pang-unawa, ay mag-iingat sa inyong mga puso at sa inyong mga pag-iisip kay Cristo Jesus.'
  },
  'PHP:4:13': {
    NIV: 'I can do all this through him who gives me strength.',
    KJV: 'I can do all things through Christ which strengtheneth me.',
    ESV: 'I can do all things through him who strengthens me.',
    NLT: 'For I can do everything through Christ, who gives me strength.',
    WEB: 'I can do all things through Christ, who strengthens me.',
    ASV: 'I can do all things in him that strengtheneth me.',
    NKJV: 'I can do all things through Christ who strengthens me.',
    NASB: 'I can do all things through Him who strengthens me.',
    FSV: 'Kaya kong gawin ang lahat ng mga bagay sa pamamagitan Niya na nagpapalakas sa akin.'
  }
};
