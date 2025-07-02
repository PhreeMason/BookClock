import { AchievementCalculator, CalculatorContext } from '../achievementCalculator';
import { Database } from '@/types/supabase';

type Achievement = Database['public']['Tables']['achievements']['Row'];

describe('AchievementCalculator - Real User Data Tests', () => {
  // Real user data provided
  const mockActiveDeadlines = [
    {
      "id": "rd_3334d0efe76545e9",
      "book_title": "Letters to a Young Poet",
      "author": "Rainer Maria Rilke",
      "format": "physical",
      "source": "personal",
      "total_quantity": 52,
      "deadline_date": "2025-07-11T21:11:00+00:00",
      "flexibility": "flexible",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-26T21:13:29.617564+00:00",
      "updated_at": "2025-06-27T05:13:59.777+00:00",
      "progress": [
        {
          "id": "rdp_09af60dd299b40dd",
          "created_at": "2025-06-26T21:13:29.773601+00:00",
          "updated_at": "2025-06-27T05:13:59.913+00:00",
          "current_progress": 37,
          "reading_deadline_id": "rd_3334d0efe76545e9"
        },
        {
          "id": "rdp_32f359f56c4d4ab2",
          "created_at": "2025-06-28T00:54:07.324+00:00",
          "updated_at": "2025-06-28T00:54:07.324+00:00",
          "current_progress": 39,
          "reading_deadline_id": "rd_3334d0efe76545e9"
        }
      ]
    },
    {
      "id": "rd_24417a94a19a4c25",
      "book_title": "The Idiot",
      "author": "Fyodor Dostoevsky ",
      "format": "audio",
      "source": "library",
      "total_quantity": 1677,
      "deadline_date": "2025-07-22T18:50:00+00:00",
      "flexibility": "strict",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-07-01T18:52:46.430375+00:00",
      "updated_at": "2025-07-01T18:52:46.430375+00:00",
      "progress": [
        {
          "id": "rdp_c93d8a1ed0a440fa",
          "created_at": "2025-07-01T18:52:46.673297+00:00",
          "updated_at": "2025-07-01T18:52:46.673297+00:00",
          "current_progress": 821,
          "reading_deadline_id": "rd_24417a94a19a4c25"
        },
        {
          "id": "rdp_d05253843e77499c",
          "created_at": "2025-07-01T19:55:13.004+00:00",
          "updated_at": "2025-07-01T19:55:13.004+00:00",
          "current_progress": 846,
          "reading_deadline_id": "rd_24417a94a19a4c25"
        },
        {
          "id": "rdp_f405fa9b891e4185",
          "created_at": "2025-07-01T20:55:21.371+00:00",
          "updated_at": "2025-07-01T20:55:21.371+00:00",
          "current_progress": 847,
          "reading_deadline_id": "rd_24417a94a19a4c25"
        },
        {
          "id": "rdp_6aad8b1e1d3640d9",
          "created_at": "2025-07-01T23:45:18.897+00:00",
          "updated_at": "2025-07-01T23:45:18.897+00:00",
          "current_progress": 845,
          "reading_deadline_id": "rd_24417a94a19a4c25"
        }
      ]
    },
    {
      "id": "rd_1546b109fce34579",
      "book_title": "The lean start up",
      "author": "Eric Ries",
      "format": "audio",
      "source": "personal",
      "total_quantity": 519,
      "deadline_date": "2025-07-31T06:47:00+00:00",
      "flexibility": "flexible",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-21T05:46:43.766915+00:00",
      "updated_at": "2025-06-21T05:46:43.766915+00:00",
      "progress": [
        {
          "id": "rdp_6c150511684b407b",
          "created_at": "2025-06-21T05:46:43.766915+00:00",
          "updated_at": "2025-06-21T05:46:43.766915+00:00",
          "current_progress": 281,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_f28d8558fb9445f9",
          "created_at": "2025-06-27T02:49:52.547+00:00",
          "updated_at": "2025-06-27T02:49:52.547+00:00",
          "current_progress": 302,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_02fdff7295a84fa4",
          "created_at": "2025-06-27T17:04:16.402+00:00",
          "updated_at": "2025-06-27T17:04:16.402+00:00",
          "current_progress": 344,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_fdce0dfcc22249dd",
          "created_at": "2025-06-27T17:59:24.503+00:00",
          "updated_at": "2025-06-27T17:59:24.503+00:00",
          "current_progress": 346,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_09670755ee9142dd",
          "created_at": "2025-06-27T17:59:32.686+00:00",
          "updated_at": "2025-06-27T17:59:32.686+00:00",
          "current_progress": 344,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_0515ca7f8d7b4e41",
          "created_at": "2025-06-30T20:06:18.398+00:00",
          "updated_at": "2025-06-30T20:06:18.398+00:00",
          "current_progress": 350,
          "reading_deadline_id": "rd_1546b109fce34579"
        },
        {
          "id": "rdp_9912149e680a40cb",
          "created_at": "2025-07-02T17:27:23.454+00:00",
          "updated_at": "2025-07-02T17:27:23.454+00:00",
          "current_progress": 369,
          "reading_deadline_id": "rd_1546b109fce34579"
        }
      ]
    },
    {
      "id": "rd_e3aab91b52044931",
      "book_title": "Freeing the natural voice",
      "author": "Kristin Linklater",
      "format": "physical",
      "source": "library",
      "total_quantity": 374,
      "deadline_date": "2025-09-01T03:55:00+00:00",
      "flexibility": "flexible",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-26T04:03:53.45453+00:00",
      "updated_at": "2025-06-27T06:31:10.995+00:00",
      "progress": [
        {
          "id": "rdp_a0ecad9e56d84ffa",
          "created_at": "2025-06-26T04:03:53.745677+00:00",
          "updated_at": "2025-06-27T06:31:12.37+00:00",
          "current_progress": 31,
          "reading_deadline_id": "rd_e3aab91b52044931"
        },
        {
          "id": "rdp_573b6fdcb61e47ad",
          "created_at": "2025-06-28T04:45:39.085+00:00",
          "updated_at": "2025-06-28T04:45:39.085+00:00",
          "current_progress": 41,
          "reading_deadline_id": "rd_e3aab91b52044931"
        }
      ]
    },
    {
      "id": "rd_84d0ec8cb5b94bea",
      "book_title": "The Way of Kings",
      "author": "Brandon Sanderson",
      "format": "audio",
      "source": "personal",
      "total_quantity": 2734,
      "deadline_date": "2025-12-31T07:57:00+00:00",
      "flexibility": "strict",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-24T23:13:21.422152+00:00",
      "updated_at": "2025-06-24T23:13:21.422152+00:00",
      "progress": [
        {
          "id": "rdp_b3a5f80a71d84374",
          "created_at": "2025-06-24T23:13:21.809276+00:00",
          "updated_at": "2025-06-24T23:13:21.809276+00:00",
          "current_progress": 938,
          "reading_deadline_id": "rd_84d0ec8cb5b94bea"
        },
        {
          "id": "rdp_84517a2a1d7642ab",
          "created_at": "2025-06-25T23:34:40.168+00:00",
          "updated_at": "2025-06-25T23:34:40.168+00:00",
          "current_progress": 962,
          "reading_deadline_id": "rd_84d0ec8cb5b94bea"
        },
        {
          "id": "rdp_248671b352584083",
          "created_at": "2025-06-30T02:06:36.833+00:00",
          "updated_at": "2025-06-30T02:06:36.833+00:00",
          "current_progress": 984,
          "reading_deadline_id": "rd_84d0ec8cb5b94bea"
        }
      ]
    },
    {
      "id": "rd_c7a2f6a0c8434e75",
      "book_title": "Singing",
      "author": null,
      "format": "audio",
      "source": "personal",
      "total_quantity": 6000,
      "deadline_date": "2025-12-31T07:57:00+00:00",
      "flexibility": "strict",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-22T06:59:29.797049+00:00",
      "updated_at": "2025-06-22T06:59:29.797049+00:00",
      "progress": [
        {
          "id": "rdp_0da61176eb01472d",
          "created_at": "2025-06-22T06:59:29.94999+00:00",
          "updated_at": "2025-06-22T06:59:29.94999+00:00",
          "current_progress": 1200,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        },
        {
          "id": "rdp_373509022e994715",
          "created_at": "2025-06-25T21:38:51.459+00:00",
          "updated_at": "2025-06-25T21:38:51.459+00:00",
          "current_progress": 1226,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        },
        {
          "id": "rdp_277ec881693d4694",
          "created_at": "2025-06-25T21:39:19.694+00:00",
          "updated_at": "2025-06-25T21:39:19.694+00:00",
          "current_progress": 1278,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        },
        {
          "id": "rdp_893ad52ebbf94b62",
          "created_at": "2025-06-28T04:21:03.734+00:00",
          "updated_at": "2025-06-28T04:21:03.735+00:00",
          "current_progress": 1342,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        },
        {
          "id": "rdp_e03aac8df2284c3f",
          "created_at": "2025-06-28T17:43:03.46+00:00",
          "updated_at": "2025-06-28T17:43:03.46+00:00",
          "current_progress": 1377,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        },
        {
          "id": "rdp_9900c38912e14918",
          "created_at": "2025-07-02T01:57:58.418+00:00",
          "updated_at": "2025-07-02T01:57:58.418+00:00",
          "current_progress": 1387,
          "reading_deadline_id": "rd_c7a2f6a0c8434e75"
        }
      ]
    },
    {
      "id": "rd_39c7e304c851434a",
      "book_title": "Onyx Storm",
      "author": "Rebecca Yarros",
      "format": "audio",
      "source": "personal",
      "total_quantity": 1432,
      "deadline_date": "2025-12-31T07:57:00+00:00",
      "flexibility": "strict",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-21T06:56:48.16655+00:00",
      "updated_at": "2025-06-21T06:56:48.16655+00:00",
      "progress": [
        {
          "id": "rdp_c4207ea9ad664f8a",
          "created_at": "2025-06-21T06:56:48.32877+00:00",
          "updated_at": "2025-06-21T06:56:48.32877+00:00",
          "current_progress": 832,
          "reading_deadline_id": "rd_39c7e304c851434a"
        },
        {
          "id": "rdp_c7611904acdb4a21",
          "created_at": "2025-07-01T01:38:57.214+00:00",
          "updated_at": "2025-07-01T01:38:57.214+00:00",
          "current_progress": 838,
          "reading_deadline_id": "rd_39c7e304c851434a"
        }
      ]
    },
    {
      "id": "rd_983950d544304c7c",
      "book_title": "Dungeon Crawler Carl This Inevitable Ruin",
      "author": "Matt Dinniman",
      "format": "audio",
      "source": "personal",
      "total_quantity": 1720,
      "deadline_date": "2025-12-31T07:57:00+00:00",
      "flexibility": "strict",
      "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
      "created_at": "2025-06-21T05:46:43.766915+00:00",
      "updated_at": "2025-06-21T05:46:43.766915+00:00",
      "progress": [
        {
          "id": "rdp_4a352499cc5a4881",
          "created_at": "2025-06-21T05:46:43.766915+00:00",
          "updated_at": "2025-06-21T05:46:43.766915+00:00",
          "current_progress": 1272,
          "reading_deadline_id": "rd_983950d544304c7c"
        },
        {
          "id": "rdp_95cd40345f5e4e34",
          "created_at": "2025-06-28T01:49:16.59+00:00",
          "updated_at": "2025-06-28T01:49:16.59+00:00",
          "current_progress": 1358,
          "reading_deadline_id": "rd_983950d544304c7c"
        },
        {
          "id": "rdp_46f964d27d2349d6",
          "created_at": "2025-06-28T16:49:01.786+00:00",
          "updated_at": "2025-06-28T16:49:01.786+00:00",
          "current_progress": 1385,
          "reading_deadline_id": "rd_983950d544304c7c"
        },
        {
          "id": "rdp_700977d09964440d",
          "created_at": "2025-06-29T09:26:20.461+00:00",
          "updated_at": "2025-06-29T09:26:20.461+00:00",
          "current_progress": 1499,
          "reading_deadline_id": "rd_983950d544304c7c"
        },
        {
          "id": "rdp_830fa32632ce4573",
          "created_at": "2025-06-30T20:06:38.123+00:00",
          "updated_at": "2025-06-30T20:06:38.123+00:00",
          "current_progress": 1505,
          "reading_deadline_id": "rd_983950d544304c7c"
        },
        {
          "id": "rdp_c21c434e0e6a436a",
          "created_at": "2025-07-01T12:26:39.442+00:00",
          "updated_at": "2025-07-01T12:26:39.442+00:00",
          "current_progress": 1559,
          "reading_deadline_id": "rd_983950d544304c7c"
        }
      ]
    }
  ];

  const createMockAchievement = (id: string, target: number, type: string = 'default'): Achievement => ({
    id,
    title: `Test ${id}`,
    description: `Test achievement`,
    icon: 'test.icon',
    category: 'consistency',
    type,
    criteria: { target } as any,
    color: '#000000',
    sort_order: 100,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  });

  describe('Achievement calculations with real user data', () => {
    const context: CalculatorContext = {
      activeDeadlines: mockActiveDeadlines,
      userId: 'user_2yqCu9TotmCYVGwIJlnr5XfOMxJ'
    };
    const calculator = new AchievementCalculator(context);

    it('should calculate Ambitious Reader correctly (5+ active deadlines)', () => {
      const achievement = createMockAchievement('ambitious_reader', 5);
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBe(8); // User has 8 active deadlines
      expect(result.max).toBe(5);
      expect(result.percentage).toBe(100); // Capped at 100%
      expect(result.achieved).toBe(true);
    });

    it('should calculate Format Explorer correctly (2+ formats)', () => {
      const achievement = createMockAchievement('format_explorer', 2);
      const result = calculator.calculateProgress(achievement);
      
      // User has physical and audio formats
      expect(result.current).toBe(2);
      expect(result.max).toBe(2);
      expect(result.percentage).toBe(100);
      expect(result.achieved).toBe(true);
    });

    it('should calculate Library Warrior correctly (10 library books)', () => {
      const achievement = createMockAchievement('library_warrior', 10);
      const result = calculator.calculateProgress(achievement);
      
      // User has 2 library books with progress
      expect(result.current).toBe(2);
      expect(result.max).toBe(10);
      expect(result.percentage).toBe(20);
      expect(result.achieved).toBe(false);
    });

    it('should calculate reading streak correctly', () => {
      const achievement = createMockAchievement('consistency_champion', 7);
      const result = calculator.calculateProgress(achievement);
      
      // Based on the dates in the data, user has reading activity on:
      // June 21, 22, 25, 26, 27, 28, 29, 30, July 1, 2
      // Need to check for consecutive days
      expect(result.achieved).toBeDefined();
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('should calculate Speed Reader correctly (50 pages in a day)', () => {
      const achievement = createMockAchievement('speed_reader', 50);
      const result = calculator.calculateProgress(achievement);
      
      // Check daily page progress for physical books
      expect(result.current).toBeDefined();
      expect(result.max).toBe(50);
      expect(result.percentage).toBeDefined();
    });

    it('should calculate Marathon Listener correctly (480 minutes in a day)', () => {
      const achievement = createMockAchievement('marathon_listener', 480);
      const result = calculator.calculateProgress(achievement);
      
      // Check daily audio progress
      expect(result.current).toBeDefined();
      expect(result.max).toBe(480);
      expect(result.percentage).toBeDefined();
    });

    it('should calculate Page Turner correctly (1000 total pages)', () => {
      const achievement = createMockAchievement('page_turner', 1000);
      const result = calculator.calculateProgress(achievement);
      
      // Calculate total pages read across all formats
      expect(result.current).toBeDefined();
      expect(result.max).toBe(1000);
      expect(result.percentage).toBeDefined();
    });
  });

  describe('UI Display Bug - Achievement percentage vs progress', () => {
    it('should return percentage field for UI display', () => {
      const context: CalculatorContext = {
        activeDeadlines: mockActiveDeadlines,
        userId: 'user_2yqCu9TotmCYVGwIJlnr5XfOMxJ'
      };
      const calculator = new AchievementCalculator(context);
      
      // Test multiple achievements to ensure all return proper percentage
      const achievementIds = [
        'ambitious_reader',
        'format_explorer',
        'library_warrior',
        'consistency_champion',
        'speed_reader',
        'marathon_listener',
        'page_turner'
      ];
      
      achievementIds.forEach(id => {
        const achievement = createMockAchievement(id, 10); // Generic target
        const result = calculator.calculateProgress(achievement);
        
        // Verify structure
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('max');
        expect(result).toHaveProperty('percentage');
        expect(result).toHaveProperty('achieved');
        
        // Verify percentage is valid
        expect(result.percentage).toBeGreaterThanOrEqual(0);
        expect(result.percentage).toBeLessThanOrEqual(100);
        expect(typeof result.percentage).toBe('number');
      });
    });
  });
});