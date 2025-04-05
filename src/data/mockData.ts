// Mock user data for dashboard components
export const mockUserData = {
  fearAssessments: [
    { date: '2023-01-01', socialAnxiety: 8, publicSpeaking: 9, heights: 6, rejection: 7 },
    { date: '2023-02-01', socialAnxiety: 7, publicSpeaking: 8, heights: 6, rejection: 6 },
    { date: '2023-03-01', socialAnxiety: 6, publicSpeaking: 7, heights: 5, rejection: 6 },
    { date: '2023-04-01', socialAnxiety: 5, publicSpeaking: 6, heights: 5, rejection: 5 },
    { date: '2023-05-01', socialAnxiety: 4, publicSpeaking: 5, heights: 4, rejection: 4 },
    { date: '2023-06-01', socialAnxiety: 3, publicSpeaking: 4, heights: 3, rejection: 3 },
  ],
  completedActivities: [
    {
      id: '1',
      name: 'Public Speaking Workshop',
      date: '2023-05-28',
      fearType: 'public-speaking',
      difficultyLevel: 'intermediate',
      notes: 'Gave a 5-minute presentation on a topic I chose.',
    },
    {
      id: '2',
      name: 'Social Gathering',
      date: '2023-05-25',
      fearType: 'social-anxiety',
      difficultyLevel: 'beginner',
      notes: 'Attended a small gathering and introduced myself to 3 new people.',
    },
    {
      id: '3',
      name: 'Job Application',
      date: '2023-05-20',
      fearType: 'rejection',
      difficultyLevel: 'advanced',
      notes: 'Applied for a job I felt underqualified for but really wanted.',
    },
    {
      id: '4',
      name: 'Hiking Trail',
      date: '2023-05-15',
      fearType: 'heights',
      difficultyLevel: 'beginner',
      notes: 'Completed a hiking trail with moderate elevation.',
    },
  ],
  journalEntries: [
    {
      id: '1',
      title: 'First day of public speaking course',
      content: 'I was really nervous but I made it through the introduction...',
      date: '2023-05-28',
      mood: 'proud',
    },
    {
      id: '2',
      title: 'Networking event reflection',
      content: 'I pushed myself to talk to strangers and it went better than expected...',
      date: '2023-05-23',
      mood: 'excited',
    },
    {
      id: '3',
      title: 'Job rejection follow-up',
      content: "I didn't get the job but I asked for feedback and learned a lot...",
      date: '2023-05-18',
      mood: 'thoughtful',
    },
  ],
  recommendations: [
    {
      id: '1',
      title: 'Join a Toastmasters meeting',
      description: 'Attend a local Toastmasters club meeting to practice speaking',
      difficulty: 'Beginner',
      fearType: 'public-speaking',
      tags: ['speaking', 'group', 'structured']
    },
    {
      id: '2',
      title: 'Strike up a conversation',
      description: 'Talk to someone new at a coffee shop or in line',
      difficulty: 'Intermediate',
      fearType: 'social',
      tags: ['conversation', 'spontaneous']
    },
    {
      id: '3',
      title: 'Request feedback on work',
      description: 'Ask your manager or peer for constructive criticism',
      difficulty: 'Intermediate',
      fearType: 'rejection',
      tags: ['work', 'feedback', 'growth']
    },
    {
      id: '4',
      title: 'Visit a scenic viewpoint',
      description: 'Go to an observation deck or scenic overlook',
      difficulty: 'Beginner',
      fearType: 'heights',
      tags: ['outdoors', 'gradual', 'views']
    },
    {
      id: '5',
      title: 'Apply for a "reach" opportunity',
      description: 'Submit an application for something slightly beyond your comfort zone',
      difficulty: 'Advanced',
      fearType: 'rejection',
      tags: ['opportunity', 'career', 'challenge']
    },
    {
      id: '6',
      title: 'Host a small gathering',
      description: 'Invite 3-5 friends or acquaintances over for a simple event',
      difficulty: 'Intermediate',
      fearType: 'social',
      tags: ['hosting', 'planning', 'interpersonal']
    },
  ]
};
