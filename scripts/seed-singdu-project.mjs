import 'dotenv/config';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10
});

const actors = [
  { emoji: '🌱', label: 'New language learner' },
  { emoji: '🎤', label: 'Returning singer' },
  { emoji: '👤', label: 'Guest user' },
  { emoji: '💎', label: 'Signed-in member' }
];

const activities = [
  {
    id: 'A1',
    title: 'Start Using the App',
    actors: ['🌱', '👤', '💎'],
    tasks: [
      { id: 'A1-T1', title: 'Learn what the app does' },
      { id: 'A1-T2', title: 'Set learning preferences' },
      { id: 'A1-T3', title: 'Choose an access method' }
    ]
  },
  {
    id: 'A2',
    title: 'Find a Song',
    actors: ['🌱', '🎤', '👤', '💎'],
    tasks: [
      { id: 'A2-T1', title: 'Browse the home catalog' },
      { id: 'A2-T2', title: 'Search the catalog' },
      { id: 'A2-T3', title: 'Narrow the catalog' }
    ]
  },
  {
    id: 'A3',
    title: 'Organize Songs',
    actors: ['🌱', '🎤', '👤', '💎'],
    tasks: [
      { id: 'A3-T1', title: 'Inspect a song' },
      { id: 'A3-T2', title: 'Save a song' },
      { id: 'A3-T3', title: 'Manage the play queue' }
    ]
  },
  {
    id: 'A4',
    title: 'Practice a Song',
    actors: ['🌱', '🎤', '👤', '💎'],
    tasks: [
      { id: 'A4-T1', title: 'Prepare playback' },
      { id: 'A4-T2', title: 'Control playback' },
      { id: 'A4-T3', title: 'Follow the lyrics' },
      { id: 'A4-T4', title: 'Adjust learning aids' }
    ]
  },
  {
    id: 'A5',
    title: 'Review Learning',
    actors: ['🌱', '🎤', '💎'],
    tasks: [
      { id: 'A5-T1', title: 'Finish a song' },
      { id: 'A5-T2', title: 'Use the vocabulary bank' },
      { id: 'A5-T3', title: 'Check learning progress' }
    ]
  },
  {
    id: 'A6',
    title: 'Use the Community',
    actors: ['🎤', '💎'],
    tasks: [
      { id: 'A6-T1', title: 'Publish a lyric story' },
      { id: 'A6-T2', title: 'Browse learner activity' },
      { id: 'A6-T3', title: 'Inspect another learner' },
      { id: 'A6-T4', title: 'Manage friendships' },
      { id: 'A6-T5', title: 'Review notifications' }
    ]
  },
  {
    id: 'A7',
    title: 'Manage the Account',
    actors: ['👤', '💎'],
    tasks: [
      { id: 'A7-T1', title: 'Maintain the profile' },
      { id: 'A7-T2', title: 'Set app preferences' },
      { id: 'A7-T3', title: 'Use support and legal' }
    ]
  }
];

const story = (id, title, activity, task, asA, wantTo, soThat, source) => ({
  id,
  title,
  activity,
  task,
  pic: 'Edward',
  picColor: 'c1',
  done: true,
  asA,
  wantTo,
  soThat,
  pains: [],
  gains: [],
  details: [`Implemented in ${source}`],
  checkedAcs: [],
  assumptions: []
});

const stories = {
  'must-have': [
    story(
      'S01',
      'View the product introduction',
      'A1',
      'A1-T1',
      'new learner',
      'view the introduction',
      'I understand the karaoke-learning concept',
      'IntroductionScreen.kt'
    ),
    story(
      'S02',
      'Choose a learning language',
      'A1',
      'A1-T2',
      'new learner',
      'choose a language',
      'the catalog matches what I study',
      'OnboardingScreen.kt'
    ),
    story(
      'S03',
      'Choose a proficiency level',
      'A1',
      'A1-T2',
      'new learner',
      'choose my level',
      'songs match my ability',
      'OnboardingScreen.kt'
    ),
    story(
      'S04',
      'Choose a music genre',
      'A1',
      'A1-T2',
      'new learner',
      'choose a genre',
      'recommendations match my taste',
      'OnboardingScreen.kt'
    ),
    story(
      'S05',
      'Continue as a guest',
      'A1',
      'A1-T3',
      'new learner',
      'continue without an account',
      'I can try the app immediately',
      'SignInScreen.kt'
    ),
    story(
      'S06',
      'Register with email',
      'A1',
      'A1-T3',
      'new learner',
      'create an email account',
      'I can save progress',
      'RegisterScreen.kt'
    ),
    story(
      'S07',
      'Sign in with email',
      'A1',
      'A1-T3',
      'member',
      'sign in with email',
      'I can restore my account',
      'SignInScreen.kt'
    ),
    story(
      'S08',
      'Sign in with Google',
      'A1',
      'A1-T3',
      'member',
      'sign in with Google',
      'I can access my account quickly',
      'SignInScreen.kt'
    ),
    story(
      'S09',
      'Browse popular songs',
      'A2',
      'A2-T1',
      'learner',
      'browse popular songs',
      'I can choose a familiar song',
      'HomeScreen.kt'
    ),
    story(
      'S10',
      'Browse songs by level',
      'A2',
      'A2-T1',
      'learner',
      'browse a difficulty level',
      'I can find an appropriate challenge',
      'HomeScreen.kt'
    ),
    story(
      'S11',
      'Browse songs by genre',
      'A2',
      'A2-T1',
      'music fan',
      'open a genre',
      'I can find music I enjoy',
      'GenreScreen.kt'
    ),
    story(
      'S12',
      'Browse songs by artist',
      'A2',
      'A2-T1',
      'music fan',
      'open an artist',
      'I can find more songs by that artist',
      'ArtistScreen.kt'
    ),
    story(
      'S13',
      'Search for a song',
      'A2',
      'A2-T2',
      'learner',
      'search by song title',
      'I can reach a specific song',
      'HomeScreen.kt'
    ),
    story(
      'S14',
      'Search for an artist',
      'A2',
      'A2-T2',
      'music fan',
      'search by artist name',
      'I can reach that artist',
      'HomeScreen.kt'
    ),
    story(
      'S15',
      'Open song details',
      'A3',
      'A3-T1',
      'learner',
      'open a song',
      'I can inspect it before practicing',
      'SongDetailScreen.kt'
    ),
    story(
      'S16',
      'View song difficulty',
      'A3',
      'A3-T1',
      'learner',
      'view the difficulty',
      'I can judge the challenge',
      'SongDetailScreen.kt'
    ),
    story(
      'S17',
      'View song language',
      'A3',
      'A3-T1',
      'learner',
      'view the language',
      'I know what language I will practice',
      'SongDetailScreen.kt'
    ),
    story(
      'S65',
      'View the song title',
      'A3',
      'A3-T1',
      'learner',
      'view the song title',
      'I can confirm which song I opened',
      'SongDetailScreen.kt'
    ),
    story(
      'S66',
      'View the song artist credit',
      'A3',
      'A3-T1',
      'music fan',
      'view the artist credit',
      'I know who performs the song',
      'SongDetailScreen.kt'
    ),
    story(
      'S67',
      'Open the song artist page',
      'A3',
      'A3-T1',
      'music fan',
      'open the credited artist',
      'I can browse more songs by that artist',
      'SongDetailScreen.kt'
    ),
    story(
      'S68',
      'View the song genre',
      'A3',
      'A3-T1',
      'music fan',
      'view the song genre',
      'I can understand its musical category',
      'SongDetailScreen.kt'
    ),
    story(
      'S69',
      'View the song play count',
      'A3',
      'A3-T1',
      'learner',
      'view the total play count',
      'I can gauge how often learners play it',
      'SongDetailScreen.kt'
    ),
    story(
      'S70',
      'View the song completion marker',
      'A3',
      'A3-T1',
      'returning singer',
      'view whether I completed the song',
      'I can recognize prior practice',
      'SongDetailScreen.kt'
    ),
    story(
      'S71',
      'View the song accent flag',
      'A3',
      'A3-T1',
      'language learner',
      'view the song accent flag',
      'I can recognize its regional language context',
      'SongDetailScreen.kt'
    ),
    story(
      'S18',
      'Favorite a song',
      'A3',
      'A3-T2',
      'member',
      'favorite one song',
      'I can find it again',
      'SongDetailScreen.kt'
    ),
    story(
      'S19',
      'Add a song to the queue',
      'A3',
      'A3-T3',
      'singer',
      'queue one song',
      'it plays later',
      'SingduViewModel.kt'
    ),
    story(
      'S20',
      'Remove a queued song',
      'A3',
      'A3-T3',
      'singer',
      'remove one queued song',
      'the queue contains only songs I want',
      'SongLibraryScreen.kt'
    ),
    story(
      'S21',
      'Reorder one queued song',
      'A3',
      'A3-T3',
      'singer',
      'move one queued song',
      'I control its play order',
      'SongLibraryScreen.kt'
    ),
    story(
      'S22',
      'Choose a translation language',
      'A4',
      'A4-T1',
      'learner',
      'choose one translation language',
      'lyrics use a language I understand',
      'TranslationLanguagePicker.kt'
    ),
    story(
      'S23',
      'Start the countdown',
      'A4',
      'A4-T1',
      'singer',
      'use the countdown',
      'I am ready before playback',
      'CountdownScreen.kt'
    ),
    story(
      'S24',
      'Play the song video',
      'A4',
      'A4-T2',
      'singer',
      'play the YouTube video',
      'I can practice with the recording',
      'SingScreen.kt'
    ),
    story(
      'S25',
      'Pause song playback',
      'A4',
      'A4-T2',
      'singer',
      'pause playback',
      'I can stop at the current moment',
      'SingScreen.kt'
    ),
    story(
      'S26',
      'Follow the active lyric line',
      'A4',
      'A4-T3',
      'learner',
      'follow the timed lyric highlight',
      'I keep my place in the song',
      'SingScreen.kt'
    ),
    story(
      'S27',
      'View a lyric translation',
      'A4',
      'A4-T3',
      'learner',
      'view the translation',
      'I understand the lyric meaning',
      'SingScreen.kt'
    ),
    story(
      'S28',
      'View lyric transliteration',
      'A4',
      'A4-T3',
      'learner',
      'view pronunciation text',
      'I can pronounce unfamiliar writing',
      'SingScreen.kt'
    ),
    story(
      'S29',
      'Look up one lyric word',
      'A4',
      'A4-T3',
      'learner',
      'open one word tooltip',
      'I understand that word in context',
      'SingScreen.kt'
    ),
    story(
      'S30',
      'Complete a song',
      'A5',
      'A5-T1',
      'learner',
      'mark one song complete',
      'the session is recorded',
      'SingduViewModel.kt'
    ),
    story(
      'S31',
      'Open the vocabulary bank',
      'A5',
      'A5-T2',
      'learner',
      'open saved vocabulary',
      'I can review words from songs',
      'LearnScreen.kt'
    ),
    story(
      'S32',
      'Open vocabulary details',
      'A5',
      'A5-T2',
      'learner',
      'open one vocabulary item',
      'I can study its meaning and examples',
      'VocabularyDetailScreen.kt'
    ),
    story(
      'S33',
      'View experience points',
      'A5',
      'A5-T3',
      'learner',
      'view my XP',
      'I can see accumulated progress',
      'ProfileScreen.kt'
    ),
    story(
      'S34',
      'View the practice streak',
      'A5',
      'A5-T3',
      'learner',
      'view my streak',
      'I can see my practice habit',
      'ProfileScreen.kt'
    ),
    story(
      'S35',
      'View my profile',
      'A7',
      'A7-T1',
      'member',
      'open my profile',
      'I can review my account',
      'ProfileScreen.kt'
    ),
    story(
      'S36',
      'Edit my display name',
      'A7',
      'A7-T1',
      'member',
      'change my display name',
      'my profile is accurate',
      'EditProfileScreen.kt'
    ),
    story(
      'S37',
      'Sign out',
      'A7',
      'A7-T3',
      'member',
      'sign out',
      'my account is no longer active on the device',
      'SettingsScreen.kt'
    ),
    story(
      'S74',
      'Remove a song from favorites',
      'A3',
      'A3-T2',
      'member',
      'remove one favorite song',
      'my favorites stay relevant',
      'SongDetailScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S75',
      'Restart song playback',
      'A4',
      'A4-T2',
      'singer',
      'restart the current song',
      'I can practice it from the beginning',
      'SingScreen.kt'
    ),
    story(
      'S76',
      'Resume song playback',
      'A4',
      'A4-T2',
      'singer',
      'resume a paused song',
      'I can continue the current session',
      'SingScreen.kt'
    ),
    story(
      'S77',
      'Quit an incomplete song',
      'A4',
      'A4-T2',
      'singer',
      'quit before completion',
      'I can leave an unwanted session',
      'SingScreen.kt'
    ),
    story(
      'S78',
      'Change translation during playback',
      'A4',
      'A4-T1',
      'learner',
      'choose another translation while practicing',
      'I can continue with a more useful language',
      'SingScreen.kt and TranslationLanguagePicker.kt'
    ),
    story(
      'S79',
      'Toggle lyric translations',
      'A4',
      'A4-T4',
      'learner',
      'toggle translated lyric text',
      'I can control the learning help on screen',
      'SingScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S80',
      'Toggle lyric transliteration',
      'A4',
      'A4-T4',
      'learner',
      'toggle pronunciation text',
      'I can control the pronunciation aid',
      'SingScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S81',
      'Toggle lyric sharing controls',
      'A4',
      'A4-T4',
      'member',
      'toggle lyric sharing controls',
      'sharing actions appear only when wanted',
      'SingScreen.kt'
    ),
    story(
      'S82',
      'Move to the previous lyric',
      'A4',
      'A4-T2',
      'learner',
      'move to the previous lyric line',
      'I can repeat the prior line without video playback',
      'SingScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S83',
      'Move to the next lyric',
      'A4',
      'A4-T2',
      'learner',
      'move to the next lyric line',
      'I can advance without video playback',
      'SingScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S84',
      'Continue with the next queued song',
      'A5',
      'A5-T1',
      'singer',
      'start the next queued song after completion',
      'my practice queue continues',
      'SingScreen.kt and SingduApp.kt'
    ),
    story(
      'S85',
      'View earned XP after completion',
      'A5',
      'A5-T1',
      'learner',
      'view XP earned for the completed song',
      'I understand the progress reward',
      'SingScreen.kt'
    ),
    story(
      'S86',
      'View learned words after completion',
      'A5',
      'A5-T1',
      'learner',
      'view words learned from the completed song',
      'I can review the session outcome',
      'SingScreen.kt'
    ),
    story(
      'S87',
      'Mark all vocabulary as read',
      'A5',
      'A5-T2',
      'learner',
      'mark every new vocabulary item as read',
      'the unread state reflects my review',
      'LearnScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S88',
      'View vocabulary meaning',
      'A5',
      'A5-T2',
      'learner',
      'view the meaning of one saved word',
      'I understand the vocabulary item',
      'VocabularyDetailScreen.kt'
    ),
    story(
      'S89',
      'View vocabulary song examples',
      'A5',
      'A5-T2',
      'learner',
      'view song lines containing one saved word',
      'I can recall it in context',
      'VocabularyDetailScreen.kt'
    ),
    story(
      'S90',
      'Change vocabulary example translation',
      'A5',
      'A5-T2',
      'learner',
      'change the translation used for song examples',
      'I can study examples in a familiar language',
      'VocabularyDetailScreen.kt'
    )
  ],
  performance: [
    story(
      'S38',
      'Switch the home country',
      'A2',
      'A2-T1',
      'learner',
      'switch one country catalog',
      'I can explore another language',
      'HomeScreen.kt'
    ),
    story(
      'S39',
      'Filter songs by difficulty',
      'A2',
      'A2-T3',
      'learner',
      'apply one difficulty filter',
      'results fit my ability',
      'SongListFilters.kt'
    ),
    story(
      'S40',
      'Sort songs by popularity',
      'A2',
      'A2-T3',
      'learner',
      'sort by popularity',
      'popular choices appear first',
      'SongListFilters.kt'
    ),
    story(
      'S41',
      'Sort songs by title',
      'A2',
      'A2-T3',
      'learner',
      'sort by title',
      'I can scan songs alphabetically',
      'SongListFilters.kt'
    ),
    story(
      'S72',
      'Sort songs by difficulty',
      'A2',
      'A2-T3',
      'learner',
      'sort songs by difficulty',
      'I can scan songs from easier to harder',
      'ArtistScreen.kt and GenreScreen.kt'
    ),
    story(
      'S73',
      'Sort songs by artist',
      'A2',
      'A2-T3',
      'music fan',
      'sort songs by artist',
      'I can scan a difficulty catalog alphabetically by performer',
      'DifficultyScreen.kt'
    ),
    story(
      'S42',
      'Browse favorite songs',
      'A3',
      'A3-T2',
      'member',
      'open my favorites',
      'I can revisit saved songs',
      'SongLibraryScreen.kt'
    ),
    story(
      'S43',
      'Browse song history',
      'A3',
      'A3-T2',
      'member',
      'open my history',
      'I can revisit practiced songs',
      'SongLibraryScreen.kt'
    ),
    story(
      'S44',
      'Seek backward five seconds',
      'A4',
      'A4-T2',
      'singer',
      'rewind five seconds',
      'I can repeat a difficult moment',
      'SingScreen.kt'
    ),
    story(
      'S45',
      'Seek forward five seconds',
      'A4',
      'A4-T2',
      'singer',
      'advance five seconds',
      'I can skip ahead precisely',
      'SingScreen.kt'
    ),
    story(
      'S46',
      'Change playback speed',
      'A4',
      'A4-T4',
      'learner',
      'change playback speed',
      'I can practice at a manageable pace',
      'SingScreen.kt'
    ),
    story(
      'S47',
      'Change lyric font size',
      'A4',
      'A4-T4',
      'learner',
      'change lyric size',
      'lyrics are comfortable to read',
      'SingScreen.kt'
    ),
    story(
      'S48',
      'Dim inactive lyrics',
      'A4',
      'A4-T4',
      'learner',
      'dim other lyric lines',
      'the active line is easier to follow',
      'SingScreen.kt'
    ),
    story(
      'S49',
      'Search saved vocabulary',
      'A5',
      'A5-T2',
      'learner',
      'search one vocabulary term',
      'I can find it quickly',
      'LearnScreen.kt'
    ),
    story(
      'S50',
      'Filter vocabulary by language',
      'A5',
      'A5-T2',
      'learner',
      'choose one vocabulary language',
      'I review the intended language',
      'LearnScreen.kt'
    ),
    story(
      'S51',
      'Submit app feedback',
      'A7',
      'A7-T3',
      'member',
      'submit one feedback message',
      'the team receives my input',
      'SettingsScreen.kt'
    ),
    story(
      'S52',
      'Toggle the song countdown',
      'A7',
      'A7-T2',
      'learner',
      'toggle countdown preference',
      'song starts match my preference',
      'SettingsScreen.kt'
    ),
    story(
      'S53',
      'Toggle vocabulary pronunciation',
      'A7',
      'A7-T2',
      'learner',
      'toggle vocabulary pronunciation',
      'word details match my study preference',
      'SettingsScreen.kt'
    ),
    story(
      'S54',
      'Toggle 24-hour time',
      'A7',
      'A7-T2',
      'learner',
      'toggle the time format',
      'history times match my preference',
      'SettingsScreen.kt'
    ),
    story(
      'S91',
      'Update learning languages',
      'A1',
      'A1-T2',
      'returning learner',
      'change my learning languages after onboarding',
      'the catalog follows my current goals',
      'HomeScreen.kt and OnboardingScreen.kt'
    ),
    story(
      'S92',
      'Refresh the home catalog',
      'A2',
      'A2-T1',
      'learner',
      'refresh the home catalog',
      'I can load current song data',
      'HomeScreen.kt'
    ),
    story(
      'S93',
      'Sign in from guest mode',
      'A1',
      'A1-T3',
      'guest user',
      'open sign-in from my profile or settings',
      'I can start saving progress',
      'ProfileScreen.kt and SettingsScreen.kt'
    ),
    story(
      'S94',
      'View learner level',
      'A5',
      'A5-T3',
      'learner',
      'view my current level',
      'I understand my progression stage',
      'ProfileScreen.kt'
    ),
    story(
      'S95',
      'View weekly practice minutes',
      'A5',
      'A5-T3',
      'learner',
      'view minutes practiced this week',
      'I can assess recent effort',
      'ProfileScreen.kt'
    ),
    story(
      'S96',
      'View saved vocabulary count',
      'A5',
      'A5-T3',
      'learner',
      'view my saved vocabulary count',
      'I can see the size of my vocabulary bank',
      'ProfileScreen.kt'
    ),
    story(
      'S97',
      'View top practiced genre',
      'A5',
      'A5-T3',
      'learner',
      'view my most practiced genre',
      'I can understand my listening pattern',
      'ProfileScreen.kt'
    ),
    story(
      'S98',
      'View shared lyric count',
      'A5',
      'A5-T3',
      'member',
      'view how many lyric stories I shared',
      'I can track my community activity',
      'ProfileScreen.kt'
    ),
    story(
      'S99',
      'View received relate count',
      'A5',
      'A5-T3',
      'member',
      'view relates received across my posts',
      'I can see community resonance',
      'ProfileScreen.kt'
    ),
    story(
      'S100',
      'Browse most-sung artists',
      'A5',
      'A5-T3',
      'learner',
      'browse my most-sung artists',
      'I can understand my practice preferences',
      'ProfileScreen.kt'
    ),
    story(
      'S101',
      'Open a most-sung artist',
      'A5',
      'A5-T3',
      'learner',
      'open one artist from my profile ranking',
      'I can practice more songs by that artist',
      'ProfileScreen.kt'
    )
  ],
  delighter: [
    story(
      'S55',
      'Publish one lyric story',
      'A6',
      'A6-T1',
      'member',
      'publish one lyric with a note',
      'I can share what it means to me',
      'SingScreen.kt'
    ),
    story(
      'S56',
      'Browse community stories',
      'A6',
      'A6-T2',
      'member',
      'browse learner stories',
      'I can discover learner experiences',
      'CommunityScreen.kt'
    ),
    story(
      'S57',
      'Relate to one community story',
      'A6',
      'A6-T2',
      'member',
      'relate to one story',
      'I can show resonance',
      'CommunityScreen.kt'
    ),
    story(
      'S58',
      'Search for a learner',
      'A6',
      'A6-T3',
      'member',
      'search for one learner',
      'I can find their profile',
      'SingduViewModel.kt'
    ),
    story(
      'S59',
      'View a learner profile',
      'A6',
      'A6-T3',
      'member',
      'open one public profile',
      'I can see that learner’s activity',
      'CommunityScreen.kt'
    ),
    story(
      'S60',
      'Report one song issue',
      'A4',
      'A4-T4',
      'member',
      'submit one song issue report',
      'the catalog can be corrected',
      'SingScreen.kt'
    ),
    story(
      'S61',
      'Read the terms of use',
      'A7',
      'A7-T3',
      'user',
      'open the terms',
      'I understand usage rules',
      'InfoScreen.kt'
    ),
    story(
      'S62',
      'Read the privacy policy',
      'A7',
      'A7-T3',
      'user',
      'open the privacy policy',
      'I understand data handling',
      'InfoScreen.kt'
    ),
    story(
      'S63',
      'Open the support email',
      'A7',
      'A7-T3',
      'user',
      'open the contact email',
      'I can contact support',
      'SingduApp.kt'
    ),
    story(
      'S64',
      'Read the app version',
      'A7',
      'A7-T3',
      'user',
      'open the About page',
      'I can identify the installed version',
      'SingduApp.kt'
    ),
    story(
      'S102',
      'Sort community posts by newest',
      'A6',
      'A6-T2',
      'member',
      'sort community posts by recency',
      'I can see the latest learner activity first',
      'CommunityScreen.kt'
    ),
    story(
      'S103',
      'Sort community posts by popularity',
      'A6',
      'A6-T2',
      'member',
      'sort community posts by relate count',
      'I can discover resonant posts',
      'CommunityScreen.kt'
    ),
    story(
      'S104',
      'Filter community posts to friends',
      'A6',
      'A6-T2',
      'member',
      'show posts from friends',
      'I can follow people I know',
      'CommunityScreen.kt'
    ),
    story(
      'S105',
      'Filter community posts to my posts',
      'A6',
      'A6-T2',
      'member',
      'show only my lyric posts',
      'I can review what I shared',
      'CommunityScreen.kt'
    ),
    story(
      'S106',
      'Open a song from a community post',
      'A6',
      'A6-T2',
      'member',
      'open the song attached to one post',
      'I can inspect the shared song',
      'CommunityScreen.kt and SingduApp.kt'
    ),
    story(
      'S107',
      'Delete my community post',
      'A6',
      'A6-T2',
      'member',
      'delete one post I created',
      'I control my shared content',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S108',
      'Remove relation from a community post',
      'A6',
      'A6-T2',
      'member',
      'remove my relation from one post',
      'my reaction reflects my current intent',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S109',
      'Browse my friends',
      'A6',
      'A6-T4',
      'member',
      'open my friend list',
      'I can find people I connected with',
      'CommunityScreen.kt'
    ),
    story(
      'S110',
      'Send a friend request',
      'A6',
      'A6-T4',
      'member',
      'send one friend request',
      'I can connect with another learner',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S111',
      'Cancel a friend request',
      'A6',
      'A6-T4',
      'member',
      'cancel one outgoing friend request',
      'I can withdraw an unwanted request',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S112',
      'Accept a friend request',
      'A6',
      'A6-T4',
      'member',
      'accept one incoming friend request',
      'the learner joins my friend list',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S113',
      'Decline a friend request',
      'A6',
      'A6-T4',
      'member',
      'decline one incoming friend request',
      'I control who joins my friend list',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S114',
      'Remove a friend',
      'A6',
      'A6-T4',
      'member',
      'remove one existing friend',
      'my friend list stays intentional',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S115',
      'Browse community notifications',
      'A6',
      'A6-T5',
      'member',
      'open community notifications',
      'I can review relates and friend requests',
      'CommunityScreen.kt'
    ),
    story(
      'S116',
      'Refresh the community feed',
      'A6',
      'A6-T2',
      'member',
      'refresh community content',
      'I can load current posts and requests',
      'CommunityScreen.kt and SingduViewModel.kt'
    ),
    story(
      'S117',
      'Browse a learner’s posts',
      'A6',
      'A6-T3',
      'member',
      'open the posts tab on a public profile',
      'I can review what that learner shared',
      'CommunityScreen.kt'
    ),
    story(
      'S118',
      'View a learner’s practice overview',
      'A6',
      'A6-T3',
      'member',
      'view public practice statistics',
      'I can understand that learner’s activity',
      'CommunityScreen.kt'
    ),
    story(
      'S119',
      'Browse a learner’s most-sung artists',
      'A6',
      'A6-T3',
      'member',
      'browse artists another learner practices most',
      'I can discover shared musical interests',
      'CommunityScreen.kt'
    ),
    story(
      'S120',
      'Open an artist from a learner profile',
      'A6',
      'A6-T3',
      'member',
      'open one artist from a public profile',
      'I can browse that artist’s songs',
      'CommunityScreen.kt and SingduApp.kt'
    )
  ]
};

const storyMap = {
  product: 'Singdu — Android karaoke language-learning app',
  actors,
  levels: 3,
  activities,
  stories
};

const sitemap = {
  siteName: 'Singdu Android',
  source: 'app/src/main/java/com/singdu/app/ui/SingduApp.kt',
  root: {
    id: 'app',
    title: 'Singdu App',
    path: 'app://singdu',
    type: 'section',
    children: [
      {
        id: 'launch-access',
        title: 'Launch & Access',
        path: 'state://launch',
        type: 'section',
        children: [
          {
            id: 'branded-splash',
            title: 'Branded Splash',
            path: 'state://branded-splash',
            type: 'screen',
            children: []
          },
          {
            id: 'introduction',
            title: 'Introduction',
            path: 'state://introduction',
            type: 'screen',
            children: []
          },
          {
            id: 'authentication',
            title: 'Authentication',
            path: 'state://authentication',
            type: 'section',
            children: [
              {
                id: 'sign-in',
                title: 'Sign In',
                path: 'state://sign-in',
                type: 'screen',
                children: []
              },
              {
                id: 'register',
                title: 'Register',
                path: 'state://register',
                type: 'screen',
                children: []
              },
              {
                id: 'auth-welcome',
                title: 'Authentication Success',
                path: 'state://auth-welcome',
                type: 'screen',
                children: []
              },
              {
                id: 'auth-sign-out',
                title: 'Sign-out Transition',
                path: 'state://auth-sign-out',
                type: 'screen',
                children: []
              }
            ]
          },
          {
            id: 'onboarding',
            title: 'Onboarding',
            path: 'state://onboarding',
            type: 'screen',
            children: []
          }
        ]
      },
      {
        id: 'main-navigation',
        title: 'Main Navigation',
        path: 'nav://main',
        type: 'section',
        children: [
          {
            id: 'home',
            title: 'Discover',
            path: 'home',
            type: 'screen',
            children: [
              {
                id: 'difficulty',
                title: 'Difficulty',
                path: 'difficulty/{level}',
                type: 'screen',
                children: []
              },
              {
                id: 'genre',
                title: 'Genre',
                path: 'genre/{genre}',
                type: 'screen',
                children: []
              },
              {
                id: 'artist-song',
                title: 'Artist by Song',
                path: 'artist/{songId}',
                type: 'screen',
                children: []
              },
              {
                id: 'song-detail',
                title: 'Song Details',
                path: 'song/{songId}',
                type: 'screen',
                children: [
                  {
                    id: 'countdown',
                    title: 'Countdown',
                    path: 'countdown/{songId}',
                    type: 'screen',
                    children: [
                      {
                        id: 'singer-player',
                        title: 'Singer Player',
                        path: 'sing/{songId}',
                        type: 'screen',
                        children: [
                          {
                            id: 'translation-picker',
                            title: 'Translation Picker',
                            path: 'translate/{songId}',
                            type: 'screen',
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'learn',
            title: 'Vocabulary Bank',
            path: 'learn',
            type: 'screen',
            children: [
              {
                id: 'vocabulary-detail',
                title: 'Vocabulary Detail',
                path: 'vocabulary/{word}',
                type: 'screen',
                children: []
              }
            ]
          },
          {
            id: 'community',
            title: 'Community',
            path: 'community',
            type: 'screen',
            children: [
              {
                id: 'community-profile',
                title: 'Learner Profile',
                path: 'community-profile/{userId}',
                type: 'screen',
                children: []
              }
            ]
          },
          {
            id: 'songbook',
            title: 'Songbook',
            path: 'songbook',
            type: 'screen',
            children: []
          },
          {
            id: 'profile',
            title: 'Profile',
            path: 'profile',
            type: 'screen',
            children: [
              {
                id: 'artist-name',
                title: 'Artist by Name',
                path: 'artist-name/{artist}',
                type: 'screen',
                children: []
              },
              {
                id: 'edit-profile',
                title: 'Edit Profile',
                path: 'edit-profile',
                type: 'screen',
                children: []
              },
              {
                id: 'settings',
                title: 'Settings',
                path: 'settings',
                type: 'screen',
                children: [
                  {
                    id: 'terms',
                    title: 'Terms of Use',
                    path: 'terms',
                    type: 'screen',
                    children: []
                  },
                  {
                    id: 'privacy',
                    title: 'Privacy Policy',
                    path: 'privacy',
                    type: 'screen',
                    children: []
                  },
                  {
                    id: 'about',
                    title: 'About',
                    path: 'about',
                    type: 'screen',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'developer-previews',
        title: 'Developer Previews',
        path: 'dev-tools',
        type: 'developer',
        children: [
          {
            id: 'dev-introduction',
            title: 'Introduction Preview',
            path: 'dev-introduction',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-splash',
            title: 'Splash Preview',
            path: 'dev-splash',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-completion',
            title: 'Completion Preview',
            path: 'dev-completion',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-countdown',
            title: 'Countdown Preview',
            path: 'dev-countdown',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-sign-in',
            title: 'Sign-in Preview',
            path: 'dev-sign-in',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-auth-welcome',
            title: 'Auth Success Preview',
            path: 'dev-auth-welcome',
            type: 'developer',
            children: []
          },
          {
            id: 'dev-auth-sign-out',
            title: 'Sign-out Preview',
            path: 'dev-auth-sign-out',
            type: 'developer',
            children: []
          }
        ]
      }
    ]
  }
};

const legacyAtomicKanbanCards = [
  {
    key: 'K001',
    title: 'Record the Home catalog loading baseline',
    description:
      'Measure cold and warm P50/P95 load time, Firestore reads, and rendered-song count for every Home section; commit the repeatable baseline and device conditions.',
    priority: 'high',
    type: 'task',
    storyPoints: 2
  },
  {
    key: 'K002',
    title: 'Spike cursor pagination for Home sections',
    description:
      'Prototype one Firestore cursor query per Home section and record latency, read count, index requirements, and the recommended production query shape.',
    priority: 'high',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K003',
    title: 'Define a lightweight song-summary document',
    description:
      'Define and validate the minimum catalog fields needed by Home, Genre, Difficulty, Artist, and Songbook without embedding lyrics or vocabulary payloads.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K004',
    title: 'Load each Home section independently',
    description:
      'Replace the shared all-song dependency with independently paged section requests so one slow section cannot block the other Home sections.',
    priority: 'critical',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K005',
    title: 'Fetch the full song only when opened',
    description:
      'Load lyrics, translations, and vocabulary only when Song Details or Singer Player opens, while catalog lists continue using summary data.',
    priority: 'critical',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K006',
    title: 'Cache catalog summary pages on device',
    description:
      'Persist fetched song-summary pages with a version and expiry so a warm launch can render cached sections before refreshing from Firestore.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K007',
    title: 'Debounce song-search requests',
    description:
      'Wait for a short idle interval before executing song search and cancel stale work so only the latest query updates the results.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 2
  },
  {
    key: 'K008',
    title: 'Add indexed backend song search',
    description:
      'Expose a paginated backend search that returns song summaries by normalized title or artist and verify that the Android client no longer loads the full catalog to search.',
    priority: 'high',
    type: 'feature',
    storyPoints: 5
  },
  {
    key: 'K009',
    title: 'Load-test catalog summary queries',
    description:
      'Run an automated concurrent-load scenario for catalog section and search queries, then record P95 latency, error rate, and read volume against agreed thresholds.',
    priority: 'high',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K010',
    title: 'Document the Firebase threat model',
    description:
      'Map trusted actors, sensitive collections, client-controlled fields, abuse cases, and required controls for authentication, progress, catalog, community, and friendship data.',
    priority: 'critical',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K011',
    title: 'Cover every Firestore write rule with emulator tests',
    description:
      'Add allow and deny tests for each writable collection, including ownership changes, forged identities, invalid statuses, oversized payloads, and unauthenticated writes.',
    priority: 'critical',
    type: 'task',
    storyPoints: 5
  },
  {
    key: 'K012',
    title: 'Enable Firebase App Check enforcement',
    description:
      'Integrate App Check in Android and enforce valid tokens for production Firebase resources while keeping an explicit emulator and debug-provider path.',
    priority: 'high',
    type: 'feature',
    storyPoints: 3
  },
  {
    key: 'K013',
    title: 'Create an authenticated backend service boundary',
    description:
      'Add a deployable backend module that verifies Firebase ID tokens, returns structured errors, and provides one health-checked authenticated endpoint.',
    priority: 'critical',
    type: 'feature',
    storyPoints: 5
  },
  {
    key: 'K014',
    title: 'Rate-limit backend mutation endpoints',
    description:
      'Apply per-user and per-IP limits to community and friendship mutations and return a deterministic retry response when a limit is exceeded.',
    priority: 'critical',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K015',
    title: 'Validate community payloads on the backend',
    description:
      'Reject community posts, relates, reports, and feedback that contain invalid ownership, unsupported fields, blank identifiers, or content over defined size limits.',
    priority: 'critical',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K016',
    title: 'Send verification after email registration',
    description:
      'Call Firebase email verification after a successful email/password registration and show a clear confirmation state with a resend action.',
    priority: 'critical',
    type: 'feature',
    storyPoints: 3
  },
  {
    key: 'K017',
    title: 'Gate unverified email accounts',
    description:
      'Prevent an email/password account with an unverified address from entering authenticated app flows while allowing verification refresh and sign-out.',
    priority: 'critical',
    type: 'feature',
    storyPoints: 3
  },
  {
    key: 'K018',
    title: 'Cancel stale friend-search queries',
    description:
      'Debounce learner-name input and ignore or cancel older Firestore requests so only the newest friend-search query can update the UI.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K019',
    title: 'Backfill normalized friend-search names',
    description:
      'Populate userNameSearch for existing profiles and remove the second legacy-name query after coverage is verified.',
    priority: 'high',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K020',
    title: 'Move friend-request writes to the backend',
    description:
      'Create one idempotent backend transaction for sending a friend request that validates both users and prevents duplicate or reverse pending requests.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K021',
    title: 'Load-test friend search',
    description:
      'Run concurrent prefix-search scenarios against representative profile volume and record P95 latency, failure rate, and Firestore read count.',
    priority: 'medium',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K022',
    title: 'Paginate the community feed with cursors',
    description:
      'Replace the fixed 50-post listener with an initial page plus cursor-based older pages while keeping real-time updates limited to the newest page.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K023',
    title: 'Remove catalog lyric scans from feed mapping',
    description:
      'Render each community post from stored post metadata without searching SongRepository lyrics for every snapshot document.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K024',
    title: 'Cache the first community-feed page',
    description:
      'Persist the newest community page and render it immediately on reopen before reconciling with the live Firestore snapshot.',
    priority: 'medium',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K025',
    title: 'Move relate mutations to the backend',
    description:
      'Replace the client transaction with one idempotent backend operation that updates the relation, count, and notification atomically.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K026',
    title: 'Load-test community-feed reads',
    description:
      'Exercise feed pagination under concurrent users, then record P95 latency, Firestore read volume, and error rate.',
    priority: 'high',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K027',
    title: 'Load-test relate mutations',
    description:
      'Exercise concurrent relate and unrelate requests, then record P95 latency, transaction retries, count accuracy, and error rate.',
    priority: 'high',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K028',
    title: 'Cache the vocabulary-bank index',
    description:
      'Build vocabulary entries once per profile and catalog revision, then reuse the indexed result instead of rescanning every song lyric on recomposition.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K029',
    title: 'Cache vocabulary character tokenization',
    description:
      'Memoize character, reading, and highlight tokenization by language and word so repeated vocabulary rows do not recompute identical tokens.',
    priority: 'medium',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K030',
    title: 'Page vocabulary-bank rows',
    description:
      'Load and filter vocabulary entries in bounded pages while preserving deterministic language, search, and mastery ordering.',
    priority: 'medium',
    type: 'improvement',
    storyPoints: 3
  },
  {
    key: 'K031',
    title: 'Automate the email-auth onboarding journey',
    description:
      'Add an emulator-backed end-to-end test for registration, verification gating, sign-in, onboarding completion, and Home arrival.',
    priority: 'high',
    type: 'task',
    storyPoints: 5
  },
  {
    key: 'K032',
    title: 'Automate the song-practice journey',
    description:
      'Add an end-to-end test that opens a song, starts countdown, enters the player, changes translation, completes playback, and returns safely.',
    priority: 'high',
    type: 'task',
    storyPoints: 5
  },
  {
    key: 'K033',
    title: 'Automate the community friendship journey',
    description:
      'Add a two-user emulator end-to-end test covering learner search, request send, acceptance, friend visibility, and removal.',
    priority: 'high',
    type: 'task',
    storyPoints: 5
  },
  {
    key: 'K034',
    title: 'Add a startup macrobenchmark',
    description:
      'Measure cold startup and Home first-content time with a stable benchmark fixture and repeatable device configuration.',
    priority: 'medium',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K035',
    title: 'Add list-scroll macrobenchmarks',
    description:
      'Measure catalog, community, and vocabulary scroll frame timing with stable fixtures and report slow-frame thresholds.',
    priority: 'medium',
    type: 'task',
    storyPoints: 3
  },
  {
    key: 'K036',
    title: 'Record the release bundle size baseline',
    description:
      'Build the minified release AAB, record download and installed size by component, and identify the five largest reducible contributors.',
    priority: 'medium',
    type: 'task',
    storyPoints: 2
  },
  {
    key: 'K037',
    title: 'Remove the extended Material icon bundle',
    description:
      'Replace material-icons-extended with only the icons used by Singdu and verify every screen still renders its intended icon.',
    priority: 'high',
    type: 'improvement',
    storyPoints: 5
  },
  {
    key: 'K038',
    title: 'Enforce a release-size regression budget',
    description:
      'Add a CI check that fails when the release artifact exceeds the agreed compressed or installed-size budget without an approved override.',
    priority: 'medium',
    type: 'task',
    storyPoints: 3
  }
].map((card, index) => ({
  ...card,
  kanbanDescription: card.description.split('\n\nChecklist:')[0],
  assignee: 'Kelvin',
  columnId: 'col-todo',
  dueDate: '',
  sortOrder: index,
  createdAt: '2026-07-26T00:00:00.000Z'
}));

const legacyAtomicKanbanTitles = legacyAtomicKanbanCards.map((card) => card.title);

const kelvinOutcomeBacklog = {
  K101: {
    title: 'Improve Home song loading',
    summary: 'Help learners see useful Home content sooner and keep each section responsive.',
    criteria: [
      'Useful content appears quickly on representative devices and connections.',
      'One slow section does not prevent the other Home sections from appearing.',
      'Complete song information remains available when a learner opens a song.',
      'Kelvin records the chosen approach and before-and-after results.'
    ]
  },
  K102: {
    title: 'Improve song search speed',
    summary: 'Make song search feel immediate and dependable as the catalog grows.',
    criteria: [
      'Results respond promptly while a learner types.',
      'Only the latest search is allowed to update the screen.',
      'Learners can reliably find songs by the information they naturally know.',
      'Kelvin validates the result against a realistically sized catalog.'
    ]
  },
  K103: {
    title: 'Strengthen app security',
    summary:
      'Protect Singdu accounts, content, and social data from invalid or unauthorized access.',
    criteria: [
      'Critical data and actions have clearly defined access expectations.',
      'Invalid and unauthorized actions are rejected consistently.',
      'The most important security rules are covered by repeatable checks.',
      'Kelvin documents remaining risks and the reasoning behind accepted trade-offs.'
    ]
  },
  K104: {
    title: 'Build the Singdu backend microservice',
    summary:
      'Create a focused backend service for Singdu operations that should not live only in the app.',
    criteria: [
      'The first backend responsibilities and their boundaries are clearly agreed.',
      'The service can identify users and handle sensitive operations safely.',
      'Health, failures, and important activity can be understood by the team.',
      'Kelvin chooses the architecture, deployment approach, and delivery sequence.'
    ]
  },
  K105: {
    title: 'Verify email accounts',
    summary: 'Give email-based accounts a clear and dependable verification journey.',
    criteria: [
      'New email-based users are asked to verify their address.',
      'Users can resend verification and refresh their status.',
      'Unverified accounts cannot enter protected member experiences.',
      'The complete journey is covered by a repeatable automated check.'
    ]
  },
  K106: {
    title: 'Improve finding and adding friends',
    summary: 'Make learner discovery and friend requests fast, clear, and reliable.',
    criteria: [
      'Learner search responds promptly and shows the latest query results.',
      'Existing eligible profiles remain discoverable.',
      'Duplicate or conflicting friend requests are prevented.',
      'Kelvin validates the experience with representative account volume.'
    ]
  },
  K107: {
    title: 'Improve community feed loading',
    summary: 'Make the community feed open quickly and continue smoothly as activity grows.',
    criteria: [
      'The newest useful feed content appears promptly.',
      'Learners can continue browsing older content without loading everything at once.',
      'New activity can appear without disrupting the current reading position.',
      'Kelvin records performance and data-usage results at representative scale.'
    ]
  },
  K108: {
    title: 'Protect community actions',
    summary: 'Keep posting and relating behavior accurate, safe, and understandable.',
    criteria: [
      'Invalid or unauthorized community actions are rejected.',
      'Repeated actions do not create duplicate effects.',
      'Counts and related notifications remain consistent.',
      'Failures give the learner a clear and recoverable outcome.'
    ]
  },
  K109: {
    title: 'Improve vocabulary bank loading',
    summary: 'Keep vocabulary browsing responsive as learners save more words.',
    criteria: [
      'Useful vocabulary content appears promptly.',
      'Search, language filters, and mastery ordering remain correct.',
      'Large vocabulary banks scroll and open smoothly.',
      'Kelvin documents before-and-after results using representative learner data.'
    ]
  },
  K110: {
    title: 'Automate critical user journeys',
    summary: 'Protect Singdu’s most important learner journeys from regressions.',
    criteria: [
      'Account setup, song practice, and core social journeys have automated coverage.',
      'Checks use stable and repeatable test data.',
      'Failures provide enough evidence to diagnose the affected step.',
      'The checks run automatically before a release is accepted.'
    ]
  },
  K111: {
    title: 'Track Android performance',
    summary: 'Make startup and core-screen performance measurable over time.',
    criteria: [
      'Startup and the busiest scrolling experiences have repeatable measurements.',
      'Acceptable performance thresholds are agreed and recorded.',
      'Regressions are visible before release.',
      'Kelvin documents the devices and conditions used for comparison.'
    ]
  },
  K112: {
    title: 'Reduce app download and install size',
    summary: 'Make Singdu lighter without removing important learner experiences.',
    criteria: [
      'The current download and installed sizes are recorded.',
      'The largest worthwhile reduction opportunities are reviewed.',
      'The final release is smaller and key screens still work correctly.',
      'A practical size budget makes future regressions visible.'
    ]
  },
  K113: {
    title: 'Prepare reliable Play Store releases',
    summary: 'Make release preparation repeatable, secure, and easy to review.',
    criteria: [
      'An approved change can produce a repeatable release candidate.',
      'Release credentials and approvals remain protected.',
      'A build can reach internal Play Store testing with clear release notes.',
      'Kelvin documents promotion, rollback, and failed-release recovery.'
    ]
  },
  K114: {
    title: 'Measure product usage and KPIs',
    summary: 'Give the team useful product insight without collecting unnecessary learner data.',
    criteria: [
      'The key product questions and success measures are agreed before instrumentation.',
      'Important feature outcomes can be reviewed in understandable dashboards.',
      'Sensitive learner content is excluded from analytics.',
      'Kelvin selects the most suitable analytics approach and documents why.'
    ]
  },
  K115: {
    title: 'Monitor app reliability',
    summary:
      'Make crashes, slow experiences, and recurring failures easier to discover and prioritize.',
    criteria: [
      'The team can identify the most important crashes and slow learner experiences.',
      'Reports contain useful context without exposing sensitive content.',
      'Alerts focus on issues that need action rather than creating noise.',
      'Kelvin defines appropriate coverage, retention, and sampling.'
    ]
  },
  K116: {
    title: 'Improve practice history loading',
    summary: 'Keep practice history fast and understandable for long-term learners.',
    criteria: [
      'Recent history appears promptly.',
      'Learners can reach older history without loading everything at once.',
      'Loading, refresh, retry, empty, and end states are clear.',
      'Kelvin validates the result with representative long-term history.'
    ]
  },
  K117: {
    title: 'Improve data loading across the app',
    summary: 'Find and address the remaining loading experiences that matter most to learners.',
    criteria: [
      'The main screen-loading paths are inventoried and ranked by user impact.',
      'The highest-value problems are improved first.',
      'Each completed improvement has before-and-after evidence.',
      'Kelvin records deferred opportunities and the reasoning behind their priority.'
    ]
  },
  K118: {
    title: 'Prepare subscription payments',
    summary: 'Enable a trustworthy subscription journey that can support paid Singdu benefits.',
    criteria: [
      'Subscription benefits, plans, and eligibility are clearly defined.',
      'The purchase approach follows the applicable Google Play requirements.',
      'Access stays correct through purchase, renewal, cancellation, refund, and reinstall.',
      'Kelvin chooses the payment architecture and documents testing and support needs.'
    ]
  },
  K119: {
    title: 'Run a full-app quality audit',
    summary:
      'Explore the real Singdu experience and turn verified bugs and friction into a prioritized backlog.',
    criteria: [
      'Core guest, account, song, learning, social, and settings journeys are reviewed.',
      'Each reported issue includes reproducible evidence and expected behavior.',
      'Issues are ranked by learner impact, frequency, and release risk.',
      'Kelvin owns the audit approach and recommends what should be fixed first.'
    ]
  },
  K120: {
    title: 'Build a bulk song catalog pipeline',
    summary:
      'Turn Singdu’s existing song scripts into a repeatable, reviewed path for adding many songs.',
    criteria: [
      'A batch can prepare song metadata, approved lyrics, translations, pronunciation, timing, and video references where available.',
      'Only content Singdu is permitted to process and publish enters the pipeline.',
      'Every song is validated and reviewable before it reaches the live catalog.',
      'Kelvin chooses the automation level and proves it with a representative pilot batch.'
    ]
  },
  K121: {
    title: 'Explore respectful in-app advertising',
    summary: 'Assess whether Google AdMob can support Singdu without harming learning or trust.',
    criteria: [
      'Potential placements are evaluated against learner focus and experience.',
      'Privacy, consent, age, regional, and store requirements are understood.',
      'Testing uses safe test advertisements and does not risk live invalid traffic.',
      'Kelvin presents a go, change, or stop recommendation with expected value and trade-offs.'
    ]
  }
};

const kanbanCards = [
  {
    key: 'K101',
    title: 'Optimize Home song delivery',
    description: `Deliver faster, section-based Home loading.

Checklist:
- Record cold and warm catalog-loading baselines.
- Define lightweight song-summary documents.
- Prototype cursor pagination for each Home section.
- Load Home sections independently.
- Fetch full lyrics and vocabulary only when a song opens.
- Cache summary pages on device with versioning and expiry.
- Load-test section queries against agreed latency and read thresholds.`,
    priority: 'critical',
    type: 'improvement',
    storyPoints: 13
  },
  {
    key: 'K102',
    title: 'Rebuild song search',
    description: `Make song search fast without loading the entire catalog.

Checklist:
- Debounce input and cancel stale searches.
- Add paginated indexed backend search by normalized title or artist.
- Return lightweight song summaries.
- Load-test representative concurrent searches and record P95 latency.`,
    priority: 'high',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K103',
    title: 'Harden Firebase security',
    description: `Strengthen the current Firebase boundary before expanding backend features.

Checklist:
- Document the threat model for auth, catalog, progress, community, and friendship data.
- Add allow and deny emulator tests for every writable Firestore collection.
- Cover forged identities, ownership changes, invalid states, and oversized payloads.
- Integrate Firebase App Check with production enforcement and an explicit debug path.`,
    priority: 'critical',
    type: 'task',
    storyPoints: 8
  },
  {
    key: 'K104',
    title: 'Establish the backend service',
    description: `Create a trusted service boundary for protected Singdu operations.

Checklist:
- Add a deployable backend module with a health endpoint.
- Verify Firebase ID tokens.
- Return consistent structured errors.
- Apply per-user and per-IP mutation rate limits.
- Define observability for latency, errors, and rejected requests.`,
    priority: 'critical',
    type: 'feature',
    storyPoints: 13
  },
  {
    key: 'K105',
    title: 'Add email verification',
    description: `Complete the email/password verification journey.

Checklist:
- Send a Firebase verification email after registration.
- Show confirmation, resend, refresh, and sign-out actions.
- Gate authenticated app flows for unverified email/password accounts.
- Cover the full journey with an emulator-backed automated test.`,
    priority: 'critical',
    type: 'feature',
    storyPoints: 8
  },
  {
    key: 'K106',
    title: 'Optimize friend discovery',
    description: `Improve learner search and friend-request reliability.

Checklist:
- Debounce friend search and cancel stale queries.
- Backfill normalized searchable names.
- Remove the legacy fallback query after coverage is verified.
- Move friend-request creation to an idempotent backend transaction.
- Prevent duplicate and reverse pending requests.
- Load-test representative profile-search volume.`,
    priority: 'high',
    type: 'improvement',
    storyPoints: 13
  },
  {
    key: 'K107',
    title: 'Optimize community feed delivery',
    description: `Reduce feed reads and eliminate catalog-wide lyric work.

Checklist:
- Add cursor pagination with real-time updates limited to the newest page.
- Store enough post metadata to render without scanning catalog lyrics.
- Cache the first page for immediate reopen rendering.
- Load-test paginated feed reads and record latency, errors, and read volume.`,
    priority: 'high',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K108',
    title: 'Secure community mutations',
    description: `Move sensitive community writes behind validated backend operations.

Checklist:
- Validate ownership, identifiers, supported fields, and payload size.
- Move relate and unrelate behavior to an idempotent backend transaction.
- Keep relate counts and notifications consistent.
- Load-test concurrent mutations and verify retry behavior and count accuracy.`,
    priority: 'critical',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K109',
    title: 'Optimize the vocabulary bank',
    description: `Stop rebuilding vocabulary data from every lyric during normal rendering.

Checklist:
- Build a reusable vocabulary index per profile and catalog revision.
- Cache character, reading, and highlight tokenization.
- Page vocabulary rows while preserving language, search, and mastery ordering.
- Measure warm-load and scroll performance before and after the change.`,
    priority: 'high',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K110',
    title: 'Build critical E2E coverage',
    description: `Automate Singdu's highest-risk user journeys with stable emulator fixtures.

Checklist:
- Cover registration, verification, onboarding, and Home arrival.
- Cover opening, practicing, translating, and completing a song.
- Cover learner search, friend requests, acceptance, visibility, and removal.
- Run the suite in CI with actionable failure artifacts.`,
    priority: 'high',
    type: 'task',
    storyPoints: 13
  },
  {
    key: 'K111',
    title: 'Add Android performance benchmarks',
    description: `Create repeatable performance checks for startup and the busiest lists.

Checklist:
- Add a cold-start and Home first-content macrobenchmark.
- Add catalog, community, and vocabulary scroll benchmarks.
- Use stable fixtures and device configuration.
- Report slow-frame and startup thresholds in CI.`,
    priority: 'medium',
    type: 'task',
    storyPoints: 8
  },
  {
    key: 'K112',
    title: 'Reduce the Android app size',
    description: `Shrink the production artifact and prevent regressions.

Checklist:
- Record compressed, download, and installed-size baselines.
- Identify the five largest reducible contributors.
- Replace material-icons-extended with only the icons Singdu uses.
- Verify every screen after icon replacement.
- Add a CI release-size budget with an explicit override process.`,
    priority: 'medium',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K113',
    title: 'Automate Play Store delivery',
    description: `Prepare a safe CI/CD path from the main branch to Google Play.

Checklist:
- Build, test, sign, and archive the release AAB in CI.
- Keep signing credentials in protected CI secrets.
- Upload approved builds to the Play internal-testing track.
- Generate release notes and retain artifact provenance.
- Add staged promotion with a manual production approval gate.
- Document rollback, version-code, and failed-release recovery procedures.`,
    priority: 'high',
    type: 'task',
    storyPoints: 8
  },
  {
    key: 'K114',
    title: 'Instrument feature KPIs with PostHog',
    description: `Create privacy-conscious product analytics without building a custom admin dashboard first.

Checklist:
- Define the KPI and event taxonomy for discovery, practice, vocabulary, community, and friendship.
- Track screen outcomes and meaningful feature actions instead of raw interaction noise.
- Attach anonymous performance buckets and failure outcomes where useful.
- Prevent lyrics, search text, email addresses, and other sensitive content from entering events.
- Build PostHog dashboards for adoption, conversion, retention, and feature health.
- Document event ownership and a schema-change review process.`,
    priority: 'high',
    type: 'feature',
    storyPoints: 8
  },
  {
    key: 'K115',
    title: 'Instrument mobile reliability',
    description: `Make slow and failing Android experiences diagnosable.

Checklist:
- Add release-safe crash reporting with useful non-sensitive context.
- Trace startup, Home loading, search, song opening, history, community, and vocabulary requests.
- Record request latency, cache outcome, payload size, and failure category.
- Add dashboards and alerts for crash-free users, ANRs, P95 latency, and error rate.
- Verify telemetry consent, retention, and production sampling behavior.`,
    priority: 'high',
    type: 'task',
    storyPoints: 8
  },
  {
    key: 'K116',
    title: 'Optimize history fetching',
    description: `Make practice history load quickly as the account grows.

Checklist:
- Record current history latency, read count, and payload size.
- Replace unbounded history reads with cursor pagination.
- Fetch lightweight list rows and defer full session details until opened.
- Cache the newest page with a clear invalidation rule.
- Add empty, loading, retry, and end-of-list states.
- Load-test representative long-term learner history.`,
    priority: 'high',
    type: 'improvement',
    storyPoints: 8
  },
  {
    key: 'K117',
    title: 'Audit remaining page fetching',
    description: `Find and fix expensive data access beyond the already identified screens.

Checklist:
- Inventory every screen query, listener, payload, cache, and refresh trigger.
- Rank hotspots by user impact, P95 latency, read volume, and duplicate work.
- Remove unbounded listeners and repeated repository scans.
- Add pagination, cancellation, deduplication, or caching per verified bottleneck.
- Add regression measurements for each optimized page.
- Record intentionally unchanged paths with evidence.`,
    priority: 'medium',
    type: 'improvement',
    storyPoints: 13
  },
  {
    key: 'K118',
    title: 'Prepare subscription payments',
    description: `Prepare a trustworthy subscription journey for paid Singdu benefits.`,
    priority: 'high',
    type: 'feature',
    storyPoints: 8
  },
  {
    key: 'K119',
    title: 'Run a full-app quality audit',
    description: `Explore Singdu and prioritize verified bugs, friction, and release risks.`,
    priority: 'high',
    type: 'task',
    storyPoints: 8
  },
  {
    key: 'K120',
    title: 'Build a bulk song catalog pipeline',
    description: `Create a safe, repeatable, reviewed path for adding many complete songs.`,
    priority: 'high',
    type: 'feature',
    storyPoints: 13
  },
  {
    key: 'K121',
    title: 'Explore respectful in-app advertising',
    description: `Assess whether advertising can support Singdu without harming learning or trust.`,
    priority: 'medium',
    type: 'task',
    storyPoints: 5
  }
].map((card, index) => {
  const outcome = kelvinOutcomeBacklog[card.key];
  if (!outcome) throw new Error(`Missing Kelvin-owned outcome copy for ${card.key}`);
  const description = `${outcome.summary}\n\nChecklist:\n${outcome.criteria
    .map((criterion) => `- ${criterion}`)
    .join('\n')}`;

  return {
    ...card,
    title: outcome.title,
    description,
    kanbanDescription: outcome.summary,
    assignee: 'Kelvin',
    columnId: 'col-todo',
    dueDate: '',
    sortOrder: index,
    createdAt: '2026-07-26T00:00:00.000Z'
  };
});

const epicSeeds = [
  {
    code: 'E1',
    title: 'Song Discovery Performance',
    ticketKeys: ['K101', 'K102']
  },
  {
    code: 'E2',
    title: 'Backend and Security',
    ticketKeys: ['K103', 'K104', 'K105']
  },
  {
    code: 'E3',
    title: 'Social Experience Performance',
    ticketKeys: ['K106', 'K107', 'K108']
  },
  {
    code: 'E4',
    title: 'Learning Data Performance',
    ticketKeys: ['K109']
  },
  {
    code: 'E5',
    title: 'Automated Quality',
    ticketKeys: ['K110', 'K111', 'K119']
  },
  {
    code: 'E6',
    title: 'Release Efficiency',
    ticketKeys: ['K112', 'K113']
  },
  {
    code: 'E7',
    title: 'Product Observability',
    ticketKeys: ['K114', 'K115']
  },
  {
    code: 'E8',
    title: 'Remaining Data Performance',
    ticketKeys: ['K116', 'K117']
  },
  {
    code: 'E9',
    title: 'Sustainable Monetization',
    ticketKeys: ['K118', 'K121']
  },
  {
    code: 'E10',
    title: 'Catalog Operations',
    ticketKeys: ['K120']
  }
].map((epic, index) => ({
  ...epic,
  sortOrder: index
}));

const kanbanCardsByKey = new Map(kanbanCards.map((card) => [card.key, card]));
const epicTickets = epicSeeds.flatMap((epic) =>
  epic.ticketKeys.map((key, index) => {
    const card = kanbanCardsByKey.get(key);
    if (!card) throw new Error(`Missing Kanban work package for Epic ticket ${key}`);
    return {
      epicCode: epic.code,
      code: card.key,
      title: card.title,
      kano: card.priority === 'medium' ? 'performance' : 'must-have',
      pic: card.assignee,
      picColor: '#6f917b',
      done: false,
      acceptanceCriteria: card.description
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2)),
      sortOrder: index
    };
  })
);

const ideas = [
  {
    id: 'IDEA-001',
    title: 'Daily free song for returning users',
    description: 'Offer one free song on each daily sign-in.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-002',
    title: 'Coins, interstitial ads, and subscriptions',
    description: 'Evaluate coin-based unlocks, ad-supported access, and a subscription tier.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-003',
    title: 'Temporary practice from a YouTube link',
    description:
      'Let premium learners paste a YouTube URL for a temporary song session without saving it to the catalog.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-004',
    title: 'Localized app interface',
    description: 'Translate navigation and interface copy into supported learning languages.',
    status: 'candidate',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-005',
    title: 'Automatic vocabulary flashcards',
    description: 'Create lightweight vocabulary flashcards without a spaced-repetition system.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-006',
    title: 'Catalog administration dashboard',
    description:
      'Manage songs, translations, genres, and difficulty metadata from an admin dashboard.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-007',
    title: 'Normalize genre and difficulty metadata',
    description: 'Correct song placement by genre and make difficulty labels consistent.',
    status: 'working-set',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-008',
    title: 'Improve search speed and caching',
    description: 'Reduce catalog search latency and evaluate an appropriate cache.',
    status: 'candidate',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-009',
    title: 'Expand Japanese and Korean translations',
    description: 'Add more Japanese and Korean translations to songs already in the catalog.',
    status: 'candidate',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-010',
    title: 'Add songs in more languages',
    description: 'Expand the catalog beyond the currently available language coverage.',
    status: 'triage',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  },
  {
    id: 'IDEA-011',
    title: 'Use ewodku@gmail.com for contact',
    description: 'Change the current hello@singdu.app contact action to ewodku@gmail.com.',
    status: 'candidate',
    proposer: 'AI',
    okrCode: '',
    createdAt: '2026-07-26T00:00:00.000Z'
  }
];

const allStories = Object.values(stories).flat();
const activityIds = new Set(activities.map((activity) => activity.id));
const taskIds = new Set(activities.flatMap((activity) => activity.tasks.map((task) => task.id)));
const storyIds = new Set(allStories.map((item) => item.id));
const nonAtomicTitles = allStories
  .filter((item) => /\b(and|or)\b|[&,/]/i.test(item.title))
  .map((item) => item.id);
const invalidReferences = allStories
  .filter((item) => !activityIds.has(item.activity) || !taskIds.has(item.task))
  .map((item) => item.id);
const sitemapNodes = [];
const collectSitemapNodes = (node) => {
  sitemapNodes.push(node);
  node.children.forEach(collectSitemapNodes);
};
collectSitemapNodes(sitemap.root);
const sitemapNodeIds = new Set(sitemapNodes.map((node) => node.id));
const kanbanTitles = new Set(kanbanCards.map((card) => card.title.toLowerCase()));
const epicCodes = new Set(epicSeeds.map((epic) => epic.code));
const epicTicketCodes = new Set(epicTickets.map((ticket) => ticket.code));

if (storyIds.size !== allStories.length) throw new Error('Story IDs must be unique');
if (invalidReferences.length > 0) {
  throw new Error(`Invalid story references: ${invalidReferences.join(', ')}`);
}
if (nonAtomicTitles.length > 0) {
  throw new Error(`Non-atomic story titles: ${nonAtomicTitles.join(', ')}`);
}
if (allStories.some((item) => !item.done || !item.details[0]?.startsWith('Implemented in '))) {
  throw new Error('Every Story Map item must be implemented and source-evidenced');
}
if (sitemapNodeIds.size !== sitemapNodes.length) throw new Error('Sitemap node IDs must be unique');
if (sitemapNodes.some((node) => !node.title || !node.path || !Array.isArray(node.children))) {
  throw new Error('Every Sitemap node needs a title, route, and children array');
}
if (kanbanTitles.size !== kanbanCards.length) throw new Error('Kanban card titles must be unique');
if (
  kanbanCards.some(
    (card) =>
      !card.title ||
      !card.description ||
      card.assignee !== 'Kelvin' ||
      card.columnId !== 'col-todo' ||
      !Number.isInteger(card.storyPoints)
  )
) {
  throw new Error('Every Kanban work package must be a complete To Do item assigned to Kelvin');
}
if (epicCodes.size !== epicSeeds.length) throw new Error('Epic codes must be unique');
if (epicTicketCodes.size !== epicTickets.length || epicTickets.length !== kanbanCards.length) {
  throw new Error('Every Kanban work package must map to one unique Epic ticket');
}
if (
  epicTickets.some(
    (ticket) =>
      !epicCodes.has(ticket.epicCode) ||
      ticket.pic !== 'Kelvin' ||
      ticket.done ||
      ticket.acceptanceCriteria.length === 0
  )
) {
  throw new Error('Every Epic ticket needs acceptance criteria and an unfinished Kelvin PIC');
}

try {
  const result = await sql.begin(async (tx) => {
    let [workspace] = await tx`
      select id, name
      from workspace
      where lower(name) = lower('Singdu')
      order by id
      limit 1
      for update
    `;
    let workspaceCreated = false;
    if (!workspace) {
      [workspace] = await tx`
        insert into workspace (name)
        values ('Singdu')
        returning id, name
      `;
      workspaceCreated = true;
    }

    let [project] = await tx`
      select id, workspace_id, name, short_name, levels
      from project
      where workspace_id = ${workspace.id}
        and lower(name) = lower('Singdu Android App')
      order by id
      limit 1
      for update
    `;
    let projectCreated = false;
    if (!project) {
      [project] = await tx`
        insert into project (workspace_id, name, short_name, levels)
        values (${workspace.id}, 'Singdu Android App', 'Singdu Android', 3)
        returning id, workspace_id, name, short_name, levels
      `;
      projectCreated = true;
    } else {
      [project] = await tx`
        update project
        set short_name = 'Singdu Android', levels = 3, updated_at = now()
        where id = ${project.id}
        returning id, workspace_id, name, short_name, levels
      `;
    }

    const [admin] = await tx`
      select id, display_name, preferences
      from app_user
      where role = 'admin'
      order by id
      limit 1
    `;
    if (!admin) throw new Error('No admin user found');

    if (
      !(
        await tx`select id from workspace_access where user_id = ${admin.id} and workspace_id = ${workspace.id} limit 1`
      )[0]
    ) {
      await tx`insert into workspace_access (user_id, workspace_id) values (${admin.id}, ${workspace.id})`;
    }
    if (
      !(
        await tx`select id from project_access where user_id = ${admin.id} and project_id = ${project.id} limit 1`
      )[0]
    ) {
      await tx`insert into project_access (user_id, project_id) values (${admin.id}, ${project.id})`;
    }

    const values = { storyMap: JSON.stringify(storyMap) };
    let [framework] = await tx`
      select id
      from framework_instance
      where project_id = ${project.id}
        and template_id = 'story-map'
      order by id
      limit 1
      for update
    `;
    let frameworkCreated = false;
    if (framework) {
      [framework] = await tx`
        update framework_instance
        set title = 'User Story Map',
            values = ${tx.json(values)},
            updated_at = now(),
            updated_by = ${admin.display_name}
        where project_id = ${project.id}
          and template_id = 'story-map'
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
    } else {
      [framework] = await tx`
        insert into framework_instance (project_id, template_id, title, values, updated_by)
        values (${project.id}, 'story-map', 'User Story Map', ${tx.json(values)}, ${admin.display_name})
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
      frameworkCreated = true;
    }

    const ideaValues = { ideas: JSON.stringify(ideas) };
    let [ideaBank] = await tx`
      select id
      from framework_instance
      where project_id = ${project.id}
        and template_id = 'idea-bank'
      order by id
      limit 1
      for update
    `;
    let ideaBankCreated = false;
    if (ideaBank) {
      [ideaBank] = await tx`
        update framework_instance
        set title = 'Idea Bank',
            values = ${tx.json(ideaValues)},
            updated_at = now(),
            updated_by = ${admin.display_name}
        where project_id = ${project.id}
          and template_id = 'idea-bank'
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
    } else {
      [ideaBank] = await tx`
        insert into framework_instance (project_id, template_id, title, values, updated_by)
        values (${project.id}, 'idea-bank', 'Idea Bank', ${tx.json(ideaValues)}, ${admin.display_name})
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
      ideaBankCreated = true;
    }

    const sitemapValues = { sitemap: JSON.stringify(sitemap) };
    let [sitemapFramework] = await tx`
      select id
      from framework_instance
      where project_id = ${project.id}
        and template_id = 'sitemap'
      order by id
      limit 1
      for update
    `;
    let sitemapCreated = false;
    if (sitemapFramework) {
      [sitemapFramework] = await tx`
        update framework_instance
        set title = 'Sitemap',
            values = ${tx.json(sitemapValues)},
            updated_at = now(),
            updated_by = ${admin.display_name}
        where project_id = ${project.id}
          and template_id = 'sitemap'
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
    } else {
      [sitemapFramework] = await tx`
        insert into framework_instance (project_id, template_id, title, values, updated_by)
        values (${project.id}, 'sitemap', 'Sitemap', ${tx.json(sitemapValues)}, ${admin.display_name})
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
      sitemapCreated = true;
    }

    let [kanbanFramework] = await tx`
      select id
      from framework_instance
      where project_id = ${project.id}
        and template_id = 'kanban'
      order by id
      limit 1
      for update
    `;
    let kanbanCreated = false;
    if (kanbanFramework) {
      [kanbanFramework] = await tx`
        update framework_instance
        set title = 'Kanban Board',
            updated_at = now(),
            updated_by = ${admin.display_name}
        where id = ${kanbanFramework.id}
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
    } else {
      [kanbanFramework] = await tx`
        insert into framework_instance (project_id, template_id, title, values, updated_by)
        values (${project.id}, 'kanban', 'Kanban Board', ${tx.json({})}, ${admin.display_name})
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
      kanbanCreated = true;
    }

    const seededKanbanCards = [];
    let kanbanCardsRemoved = 0;
    for (const title of legacyAtomicKanbanTitles) {
      const removedCards = await tx`
        delete from kanban_card
        where project_id = ${project.id}
          and lower(title) = lower(${title})
        returning id
      `;
      kanbanCardsRemoved += removedCards.length;
    }

    let kanbanCardsCreated = 0;
    for (const card of kanbanCards) {
      let [storedCard] = await tx`
        select kc.id, kc.column_id
        from kanban_card kc
        left join ticket t on t.id = kc.ticket_id
        where kc.project_id = ${project.id}
          and (
            lower(kc.title) = lower(${card.title})
            or lower(t.code) = lower(${card.key})
        )
        order by kc.id
        limit 1
        for update of kc
      `;
      if (storedCard) {
        [storedCard] = await tx`
          update kanban_card
          set title = ${card.title},
              description = ${card.kanbanDescription},
              assignee = ${card.assignee},
              due_date = ${card.dueDate},
              priority = ${card.priority},
              type = ${card.type},
              story_points = ${card.storyPoints},
              sort_order = ${card.sortOrder},
              updated_at = now()
          where id = ${storedCard.id}
          returning id, column_id, title, assignee, priority, type, story_points, sort_order
        `;
      } else {
        [storedCard] = await tx`
          insert into kanban_card (
            project_id,
            column_id,
            title,
            description,
            assignee,
            due_date,
            priority,
            type,
            story_points,
            sort_order,
            created_at,
            updated_at
          )
          values (
            ${project.id},
            ${card.columnId},
            ${card.title},
            ${card.kanbanDescription},
            ${card.assignee},
            ${card.dueDate},
            ${card.priority},
            ${card.type},
            ${card.storyPoints},
            ${card.sortOrder},
            ${card.createdAt},
            now()
          )
          returning id, column_id, title, assignee, priority, type, story_points, sort_order
        `;
        kanbanCardsCreated += 1;
      }
      seededKanbanCards.push(storedCard);
    }

    const seededEpics = [];
    const seededEpicTickets = [];
    let epicsCreated = 0;
    let epicTicketsCreated = 0;
    for (const epicSeed of epicSeeds) {
      let [storedEpic] = await tx`
        select id
        from epic
        where project_id = ${project.id}
          and lower(code) = lower(${epicSeed.code})
        order by id
        limit 1
        for update
      `;
      if (storedEpic) {
        [storedEpic] = await tx`
          update epic
          set title = ${epicSeed.title},
              sort_order = ${epicSeed.sortOrder},
              updated_at = now()
          where id = ${storedEpic.id}
          returning id, code, title, sort_order
        `;
      } else {
        [storedEpic] = await tx`
          insert into epic (project_id, code, title, sort_order)
          values (${project.id}, ${epicSeed.code}, ${epicSeed.title}, ${epicSeed.sortOrder})
          returning id, code, title, sort_order
        `;
        epicsCreated += 1;
      }
      seededEpics.push(storedEpic);

      const ticketSeeds = epicTickets.filter((ticket) => ticket.epicCode === epicSeed.code);
      for (const ticketSeed of ticketSeeds) {
        let [storedTicket] = await tx`
          select id
          from ticket
          where epic_id = ${storedEpic.id}
            and lower(code) = lower(${ticketSeed.code})
          order by id
          limit 1
          for update
        `;
        if (storedTicket) {
          [storedTicket] = await tx`
            update ticket
            set title = ${ticketSeed.title},
                kano = ${ticketSeed.kano},
                pic = ${ticketSeed.pic},
                pic_color = ${ticketSeed.picColor},
                acceptance_criteria = ${tx.json(ticketSeed.acceptanceCriteria)},
                sort_order = ${ticketSeed.sortOrder},
                updated_at = now()
            where id = ${storedTicket.id}
            returning id, epic_id, code, title, kano, pic, pic_color, done,
              acceptance_criteria, checked_acs, sort_order
          `;
        } else {
          [storedTicket] = await tx`
            insert into ticket (
              epic_id,
              code,
              title,
              kano,
              pic,
              pic_color,
              done,
              acceptance_criteria,
              checked_acs,
              sort_order
            )
            values (
              ${storedEpic.id},
              ${ticketSeed.code},
              ${ticketSeed.title},
              ${ticketSeed.kano},
              ${ticketSeed.pic},
              ${ticketSeed.picColor},
              ${ticketSeed.done},
              ${tx.json(ticketSeed.acceptanceCriteria)},
              ${tx.json([])},
              ${ticketSeed.sortOrder}
            )
            returning id, epic_id, code, title, kano, pic, pic_color, done,
              acceptance_criteria, checked_acs, sort_order
          `;
          epicTicketsCreated += 1;
        }
        seededEpicTickets.push(storedTicket);

        const matchingCard = kanbanCardsByKey.get(ticketSeed.code);
        if (matchingCard) {
          await tx`
            update kanban_card
            set ticket_id = ${storedTicket.id},
                description = ${matchingCard.kanbanDescription},
                updated_at = now()
            where project_id = ${project.id}
              and lower(title) = lower(${matchingCard.title})
          `;
        }
      }
    }

    const persistedBacklogValues = {
      backlog: JSON.stringify({
        epics: seededEpics.map((storedEpic) => ({
          code: storedEpic.code,
          title: storedEpic.title,
          actors: [],
          stories: seededEpicTickets
            .filter((storedTicket) => storedTicket.epic_id === storedEpic.id)
            .map((storedTicket) => ({
              id: storedTicket.code,
              title: storedTicket.title,
              epic: storedEpic.code,
              task: null,
              taskOrder: storedTicket.sort_order,
              kano: storedTicket.kano,
              pic: storedTicket.pic,
              picColor: storedTicket.pic_color,
              done: storedTicket.done,
              acceptanceCriteria: storedTicket.acceptance_criteria ?? [],
              checkedAcs: storedTicket.checked_acs ?? [],
              assumptions: []
            }))
        }))
      })
    };

    let [epicsFramework] = await tx`
      select id
      from framework_instance
      where project_id = ${project.id}
        and template_id = 'backlog'
      order by id
      limit 1
      for update
    `;
    let epicsFrameworkCreated = false;
    if (epicsFramework) {
      [epicsFramework] = await tx`
        update framework_instance
        set title = 'Epics',
            values = ${tx.json(persistedBacklogValues)},
            updated_at = now(),
            updated_by = ${admin.display_name}
        where id = ${epicsFramework.id}
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
    } else {
      [epicsFramework] = await tx`
        insert into framework_instance (project_id, template_id, title, values, updated_by)
        values (
          ${project.id},
          'backlog',
          'Epics',
          ${tx.json(persistedBacklogValues)},
          ${admin.display_name}
        )
        returning id, project_id, template_id, title, updated_at, updated_by
      `;
      epicsFrameworkCreated = true;
    }

    await tx`
      update app_user
      set preferences = coalesce(preferences, '{}'::jsonb)
        || ${tx.json({ lastWorkspaceId: workspace.id, lastProjectId: project.id })}
      where id = ${admin.id}
    `;

    return {
      workspace,
      project,
      framework,
      ideaBank,
      sitemapFramework,
      kanbanFramework,
      epicsFramework,
      workspaceCreated,
      projectCreated,
      frameworkCreated,
      ideaBankCreated,
      sitemapCreated,
      kanbanCreated,
      epicsFrameworkCreated,
      kanbanCardsCreated,
      kanbanCardsRemoved,
      epicsCreated,
      epicTicketsCreated,
      admin: { id: admin.id, displayName: admin.display_name },
      counts: {
        actors: actors.length,
        activities: activities.length,
        tasks: activities.reduce((sum, activity) => sum + activity.tasks.length, 0),
        stories: Object.values(stories).reduce((sum, group) => sum + group.length, 0),
        mustHave: stories['must-have'].length,
        performance: stories.performance.length,
        delighter: stories.delighter.length,
        ideas: ideas.length,
        sitemapDestinations: sitemapNodes.length,
        kanbanCards: seededKanbanCards.length,
        epics: seededEpics.length,
        epicTickets: seededEpicTickets.length
      }
    };
  });

  console.log(JSON.stringify(result, null, 2));
} finally {
  await sql.end();
}
