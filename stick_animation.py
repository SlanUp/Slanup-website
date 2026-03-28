#!/usr/bin/env python3
"""
Slanup Stick Animation v2 — Detailed & Realistic
══════════════════════════════════════════════════════════════════
Large, clear ASCII art. Every element is instantly recognizable.
Stick figure is bigger. Dust trail behind feet. Scene titles.
Smooth parallax scrolling. Full story in 9 scenes.

Usage:  python3 stick_animation.py
Keys:   q = quit | SPACE = pause | r = restart | d = debug
"""

import curses
import time
import math
import random

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SETTINGS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FPS = 14
SCROLL_SPEED = 2
WALK_CYCLE_RATE = 3
GROUND_OFFSET = 6
SUBTITLE_OFFSET = 2
TITLE_OFFSET = 4
MIN_WIDTH = 80
MIN_HEIGHT = 28
DUST_COUNT = 5


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BIGGER STICK FIGURE — 6 frames, 7 lines tall
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WALK = [
    # Frame 1: right foot forward, left arm forward
    [
        "   _O_   ",
        "  / | \\  ",
        "    |    ",
        "    |    ",
        "   / \\   ",
        "  /   |  ",
        " /     | ",
    ],
    # Frame 2: right foot passing
    [
        "   _O_   ",
        "  \\ | /  ",
        "    |    ",
        "    |    ",
        "   /|    ",
        "  / |    ",
        " /  |    ",
    ],
    # Frame 3: legs together (mid stride)
    [
        "   _O_   ",
        "  / | \\  ",
        "    |    ",
        "    |    ",
        "    |    ",
        "   /|\\   ",
        "  / | \\  ",
    ],
    # Frame 4: left foot forward, right arm forward
    [
        "   _O_   ",
        "  \\ | /  ",
        "    |    ",
        "    |    ",
        "   / \\   ",
        "  |   \\  ",
        " |     \\ ",
    ],
    # Frame 5: left foot passing
    [
        "   _O_   ",
        "  / | \\  ",
        "    |    ",
        "    |    ",
        "    |\\   ",
        "    | \\  ",
        "    |  \\ ",
    ],
    # Frame 6: legs together again
    [
        "   _O_   ",
        "  \\ | /  ",
        "    |    ",
        "    |    ",
        "    |    ",
        "   /|\\   ",
        "  / | \\  ",
    ],
]

STICK_WIDTH = max(len(line) for frame in WALK for line in frame)
STICK_HEIGHT = len(WALK[0])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LARGE, DETAILED, LABELED ASCII ART ELEMENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ═══════════════════════════
# SCENE 1: "we messed up"
# ═══════════════════════════

E_OOPS_SIGN = [
    "  .============.  ",
    "  |            |  ",
    "  |   OOPS !   |  ",
    "  |            |  ",
    "  '============'  ",
    "       ||||       ",
    "       ||||       ",
]

E_BROKEN_THING = [
    "     ___       ",
    "    /   \\      ",
    "   / * * \\     ",
    "  |  ___  |    ",
    "  | |   | |    ",
    "   \\|_X_|/     ",
    "    \\_|_/      ",
    "   BROKEN      ",
]

E_MESSY_CODE = [
    "  +------------+  ",
    "  | if(true){  |  ",
    "  |   ???      |  ",
    "  |   bugs++;  |  ",
    "  |   // help  |  ",
    "  | }          |  ",
    "  +------------+  ",
]

# ═══════════════════════════
# SCENE 2: "social app intro"
# ═══════════════════════════

E_SMARTPHONE = [
    "   ._________.   ",
    "   |  12:00  |   ",
    "   |_________|   ",
    "   |         |   ",
    "   | SLANUP  |   ",
    "   |         |   ",
    "   |  [POST  |   ",
    "   |  PLAN]  |   ",
    "   |         |   ",
    "   |_________|   ",
    "   |   (o)   |   ",
    "   '---------'   ",
]

E_ACTIVITY_PLAN = [
    "  .===============.  ",
    "  |  PLAN: Hike   |  ",
    "  |  When: Sun 4pm|  ",
    "  |  Where: Hills |  ",
    "  |  Spots: 5     |  ",
    "  |               |  ",
    "  |  [JOIN NOW]   |  ",
    "  '==============='  ",
]

E_PEOPLE_GROUP = [
    "      O    O    O      ",
    "     /|\\  /|\\  /|\\     ",
    "     / \\  / \\  / \\     ",
    "                       ",
    "   'hey, count me in!' ",
]

E_MAP_PIN = [
    "       /\\       ",
    "      /  \\      ",
    "     / () \\     ",
    "    |  ME  |    ",
    "     \\    /     ",
    "      \\  /      ",
    "       \\/       ",
    "       ||       ",
    "    NEARBY      ",
]

# ═══════════════════════════
# SCENE 3: "new city, alone, dating apps"
# ═══════════════════════════

E_CITY_SKYLINE = [
    "            ___                ",
    "     ___   |   |   ___        ",
    "    |   |  |___|  |   |  __   ",
    "    |   |  |   |  |   | |  |  ",
    "    | . |  | . |  | . | |. |  ",
    "    | . |  | . |  | . | |. |  ",
    "    | . |  | . |  | . | |. |  ",
    "    |___|  |___|  |___| |__|  ",
]

E_LONELY_DESK = [
    "         O          ",
    "        /|          ",
    "     ___||___       ",
    "    |  ____  |      ",
    "    | |    | |      ",
    "    | | :( | |      ",
    "    | |____| |      ",
    "    |________|      ",
    "    ||      ||      ",
    "  ALONE AT WORK     ",
]

E_DATING_APP_BAD = [
    "   .___________.   ",
    "   |   SWIPE    |   ",
    "   |   .---.    |   ",
    "   |   | >:) |  |   ",
    "   |   '---'    |   ",
    "   |  creepy..  |   ",
    "   |            |   ",
    "   |  [NOPE!]   |   ",
    "   '___________'   ",
]

E_NO_FRIENDS_SIGN = [
    "  .-----------------.  ",
    "  |  contacts: 0    |  ",
    "  |  friends:  0    |  ",
    "  |  plans:    0    |  ",
    "  |                 |  ",
    "  |    ... :(       |  ",
    "  '-----------------'  ",
]

E_SUITCASE = [
    "    .======.    ",
    "    |  ~~  |    ",
    " .--+------+--.  ",
    " |  NEW CITY  |  ",
    " |  who dis?  |  ",
    " '------------'  ",
]

# ═══════════════════════════
# SCENE 4: "too many ideas, year gone"
# ═══════════════════════════

E_LIGHTBULB_BIG = [
    "       ___       ",
    "      /   \\      ",
    "     | *** |     ",
    "     | *** |     ",
    "      \\   /      ",
    "       | |       ",
    "       |_|       ",
    "      IDEA!      ",
]

E_TODO_EXPLODING = [
    "  .==================.  ",
    "  |  TODO LIST:      |  ",
    "  |  [x] chat        |  ",
    "  |  [x] groups      |  ",
    "  |  [x] maps        |  ",
    "  |  [x] events      |  ",
    "  |  [x] AI match    |  ",
    "  |  [x] payments    |  ",
    "  |  [x] stories     |  ",
    "  |  [x] reels       |  ",
    "  |  ...50 more...   |  ",
    "  '==================' ",
]

E_OVERWHELMED_GUY = [
    "       \\O/       ",
    "        |        ",
    "   !!!!/|\\!!!!   ",
    "       / \\       ",
    "    TOO MUCH     ",
]

E_CALENDAR_YEAR = [
    "  .================.  ",
    "  |  JANUARY 2025  |  ",
    "  |  ...           |  ",
    "  |  JUNE 2025     |  ",
    "  |  ...           |  ",
    "  |  DECEMBER 2025 |  ",
    "  |  ...oops       |  ",
    "  '================'  ",
    "    1 YEAR GONE!      ",
]

E_HOURGLASS_BIG = [
    "    ._________.    ",
    "    |  \\   /  |    ",
    "    |   \\ /   |    ",
    "    |    |    |    ",
    "    |   / \\   |    ",
    "    |  /ooo\\  |    ",
    "    |_________|    ",
    "    TIME FLIES     ",
]

E_PROGRESS_BAR = [
    "  LAUNCH PROGRESS:      ",
    "  [##............] 12%  ",
    "  'still building...'   ",
]

# ═══════════════════════════
# SCENE 5: "realization / validate"
# ═══════════════════════════

E_THINKING_HARD = [
    "     ?     ?     ",
    "      ?   ?      ",
    "    ?   O   ?    ",
    "       /|\\       ",
    "       / \\       ",
    "     hmm...      ",
]

E_BIG_QUESTION = [
    "    .======.     ",
    "    |  ??  |     ",
    "    | ?  ? |     ",
    "    |   ?  |     ",
    "    |  ?   |     ",
    "    |      |     ",
    "    |  ?   |     ",
    "    '======'     ",
    "  IS THIS REAL?  ",
]

E_MIRROR = [
    "    ._______.    ",
    "   /  ME vs  \\   ",
    "  |  REALITY  |  ",
    "  |           |  ",
    "  |  am i     |  ",
    "  |  solving  |  ",
    "  |  a real   |  ",
    "  |  problem? |  ",
    "   \\_________/   ",
]

E_VALIDATE = [
    "  .===============.  ",
    "  |   STEP BACK   |  ",
    "  |               |  ",
    "  |  1. validate  |  ",
    "  |  2. build MVP |  ",
    "  |  3. launch    |  ",
    "  |  4. iterate   |  ",
    "  |               |  ",
    "  |     GOT IT!   |  ",
    "  '==============='  ",
]

E_CHECKMARK_BIG = [
    "             //  ",
    "            //   ",
    "           //    ",
    "    \\\\    //     ",
    "     \\\\  //      ",
    "      \\\\//       ",
    "       \\/        ",
    "      YES!       ",
]

# ═══════════════════════════
# SCENE 6: "BETA LAUNCH!"
# ═══════════════════════════

E_ROCKET_BIG = [
    "        /\\        ",
    "       /  \\       ",
    "      / ** \\      ",
    "     |      |     ",
    "     | BETA |     ",
    "     |      |     ",
    "     |  ()  |     ",
    "    /|      |\\    ",
    "   / |______| \\   ",
    "  /  |  ||  |  \\  ",
    "     | /  \\ |     ",
    "     |/ ** \\|     ",
    "      \\ ** /      ",
    "       \\  /       ",
    "        \\/        ",
    "       /|\\        ",
    "      LAUNCH!     ",
]

E_SLANUP_BANNER = [
    "  **  ****  *     ***   *   *  *   *  ***   **  ",
    " *   *    * *    *   *  **  *  *   *  *  * *    ",
    "  *  *    * *    *****  * * *  *   *  ***   *   ",
    "   * *    * *    *   *  *  **  *   *  *      *  ",
    " **   ****  **** *   *  *   *   ***   *    **   ",
    "                                                ",
    "           >>>  BETA IS LIVE!  <<<              ",
]

E_STAR_BIG = [
    "        .        ",
    "       /|\\       ",
    "      / | \\      ",
    "  ___/  |  \\___  ",
    "  \\___     ___/  ",
    "      \\  |/      ",
    "       \\ |       ",
    "        '        ",
]

E_CONFETTI = [
    "  *  .  *  .  *  ",
    " .  *  .  *  .   ",
    "  *  .  *  .  *  ",
    "    WOOHOO!!     ",
]

E_PARTY = [
    "    \\O/   \\O/    ",
    "     |     |     ",
    "    /|\\   /|\\    ",
    "    / \\   / \\    ",
    "   PARTY TIME!   ",
]

# ═══════════════════════════
# SCENE 7: "features"
# ═══════════════════════════

E_POST_A_PLAN = [
    "  .===================.  ",
    "  |   POST A PLAN     |  ",
    "  |                   |  ",
    "  |  'Coffee meetup   |  ",
    "  |   @ Blue Tokai    |  ",
    "  |   Saturday 5pm'   |  ",
    "  |                   |  ",
    "  |  Spots: 4 open    |  ",
    "  |  [POST]           |  ",
    "  '==================='  ",
]

E_PEOPLE_JOINING = [
    "       POST: Hike!        ",
    "                          ",
    "  O        O        O     ",
    " /|\\      /|\\      /|\\    ",
    " / \\      / \\      / \\    ",
    "  |        |        |     ",
    "  v        v        v     ",
    "  [JOIN]   [JOIN]  [JOIN] ",
    "                          ",
    "    '3 people joined!'    ",
]

E_GROUP_CHAT_BIG = [
    "  .========================.  ",
    "  |  GROUP CHAT            |  ",
    "  |                        |  ",
    "  |  Ravi:  'meeting at 4' |  ",
    "  |  Priya: 'on my way!'   |  ",
    "  |  You:   'see you!'     |  ",
    "  |                        |  ",
    "  |  [type message...]     |  ",
    "  '========================'  ",
]

E_REQ_ACCEPTED = [
    "  .================.  ",
    "  |   REQUEST      |  ",
    "  |   ACCEPTED!    |  ",
    "  |                |  ",
    "  |  O  -->  O O   |  ",
    "  | /|\\     /|\\/|\\  |  ",
    "  |                |  ",
    "  |  welcome in!   |  ",
    "  '================'  ",
]

# ═══════════════════════════
# SCENE 8: "safety"
# ═══════════════════════════

E_SHIELD_BIG = [
    "      _/===\\_      ",
    "     / SAFE  \\     ",
    "    /  SPACE  \\    ",
    "   |          |   ",
    "   |    ++    |   ",
    "   |   ++++   |   ",
    "   |    ++    |   ",
    "    \\        /    ",
    "     \\      /     ",
    "      \\    /      ",
    "       \\  /       ",
    "        \\/        ",
]

E_WOMAN_FLAG = [
    "  .==================.  ",
    "  |  WOMEN CAN:      |  ",
    "  |                  |  ",
    "  |  [/] mark safe   |  ",
    "  |  [/] flag creep  |  ",
    "  |  [/] report      |  ",
    "  |  [/] block       |  ",
    "  |                  |  ",
    "  |  YOUR SAFETY     |  ",
    "  |  MATTERS.        |  ",
    "  '=================='  ",
]

E_CREEP_BLOCKED = [
    "    .-----------.    ",
    "    |  FLAGGED!  |    ",
    "    |            |    ",
    "    |    >:(     |    ",
    "    |   /|\\      |    ",
    "    |            |    ",
    "    |  [BLOCKED] |    ",
    "    '-----------'    ",
    "    NO CREEPS HERE   ",
]

E_SAFE_BADGE = [
    "    .---------.    ",
    "   /   SAFE    \\   ",
    "  | PROFILE  ++ |  ",
    "  |  VERIFIED   |  ",
    "   \\           /   ",
    "    '---------'    ",
]

# ═══════════════════════════
# SCENE 9: "outro / milte hai"
# ═══════════════════════════

E_WAVING_BIG = [
    "       _O/      ",
    "      / |       ",
    "        |       ",
    "       / \\      ",
    "      /   \\     ",
    "    BYE BYE!    ",
]

E_HEART_BIG = [
    "    **      **    ",
    "  **  **  **  **  ",
    " **    ****    ** ",
    " **     **     ** ",
    "  **          **  ",
    "   **        **   ",
    "    **      **    ",
    "     **    **     ",
    "      **  **      ",
    "       **         ",
    "    <3 SLANUP     ",
]

E_TODO_DONE = [
    "  .================.  ",
    "  |  TODO LIST:    |  ",
    "  |                |  ",
    "  |  [/] build app |  ",
    "  |  [/] beta out  |  ",
    "  |  [/] LAUNCHED! |  ",
    "  |                |  ",
    "  |  WE DID IT :)  |  ",
    "  '================'  ",
]

E_MILTE_HAI = [
    "  .==================.  ",
    "  |                  |  ",
    "  |   milte hai :)   |  ",
    "  |                  |  ",
    "  |   download at    |  ",
    "  |   slanup.com     |  ",
    "  |                  |  ",
    "  '=================='  ",
]

E_FRIENDS_WALKING = [
    "   O   O   O   O   ",
    "  /|\\ /|\\ /|\\ /|\\  ",
    "  / \\ / \\ / \\ / \\  ",
    "  new friends! :)   ",
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SCENES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCENES = [
    {
        "title": "CHAPTER 1: oops",
        "sub": "we kinda messed up... but we're here for it",
        "dur": 5,
        "els": [
            (E_OOPS_SIGN, 0),
            (E_BROKEN_THING, 0),
            (E_MESSY_CODE, 0),
        ],
    },
    {
        "title": "CHAPTER 2: the idea",
        "sub": "a social app ~ post activity plans ~ people nearby can join",
        "dur": 9,
        "els": [
            (E_SMARTPHONE, 0),
            (E_ACTIVITY_PLAN, 0),
            (E_PEOPLE_GROUP, 0),
            (E_MAP_PIN, 0),
            (E_SMARTPHONE, 0),
        ],
    },
    {
        "title": "CHAPTER 3: the struggle",
        "sub": "new city... no one i knew... creepy dating apps everywhere",
        "dur": 12,
        "els": [
            (E_SUITCASE, 0),
            (E_CITY_SKYLINE, 0),
            (E_LONELY_DESK, 0),
            (E_NO_FRIENDS_SIGN, 0),
            (E_DATING_APP_BAD, 0),
            (E_DATING_APP_BAD, 0),
        ],
    },
    {
        "title": "CHAPTER 4: feature creep",
        "sub": "wanted to add EVERYTHING... an entire year gone, nowhere close",
        "dur": 12,
        "els": [
            (E_LIGHTBULB_BIG, 0),
            (E_TODO_EXPLODING, 0),
            (E_OVERWHELMED_GUY, 0),
            (E_LIGHTBULB_BIG, 1),
            (E_CALENDAR_YEAR, 0),
            (E_HOURGLASS_BIG, 0),
            (E_PROGRESS_BAR, 0),
        ],
    },
    {
        "title": "CHAPTER 5: the realization",
        "sub": "wait... is this even a real problem? let me validate first",
        "dur": 10,
        "els": [
            (E_THINKING_HARD, 0),
            (E_BIG_QUESTION, 0),
            (E_MIRROR, 0),
            (E_VALIDATE, 0),
            (E_CHECKMARK_BIG, 0),
        ],
    },
    {
        "title": ">>> SLANUP BETA IS LIVE! <<<",
        "sub": "slanup beta is out! make a plan, people join, group chat, GO!",
        "dur": 10,
        "els": [
            (E_CONFETTI, 2),
            (E_ROCKET_BIG, 0),
            (E_STAR_BIG, 1),
            (E_SLANUP_BANNER, 0),
            (E_STAR_BIG, 2),
            (E_PARTY, 0),
            (E_CONFETTI, 1),
        ],
    },
    {
        "title": "CHAPTER 7: how it works",
        "sub": "post a plan ~ people request to join ~ accepted? group chat!",
        "dur": 12,
        "els": [
            (E_POST_A_PLAN, 0),
            (E_PEOPLE_JOINING, 0),
            (E_REQ_ACCEPTED, 0),
            (E_GROUP_CHAT_BIG, 0),
        ],
    },
    {
        "title": "CHAPTER 8: safe space",
        "sub": "women can mark profiles safe or flag creeps ~ safety matters",
        "dur": 10,
        "els": [
            (E_SHIELD_BIG, 0),
            (E_WOMAN_FLAG, 0),
            (E_CREEP_BLOCKED, 0),
            (E_SAFE_BADGE, 0),
            (E_SHIELD_BIG, 0),
        ],
    },
    {
        "title": "milte hai :)",
        "sub": "features rolling out dheere dheere ~ we did it ~ milte hai :)",
        "dur": 8,
        "els": [
            (E_TODO_DONE, 0),
            (E_HEART_BIG, 0),
            (E_FRIENDS_WALKING, 0),
            (E_MILTE_HAI, 0),
            (E_WAVING_BIG, 0),
            (E_HEART_BIG, 1),
        ],
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RENDERING ENGINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def safe_addstr(scr, y, x, text, attr=0):
    h, w = scr.getmaxyx()
    if y < 0 or y >= h or x >= w:
        return
    if x < 0:
        text = text[-x:]
        x = 0
    max_len = w - x - 1
    if max_len <= 0:
        return
    text = text[:max_len]
    if text:
        try:
            scr.addstr(y, x, text, attr)
        except curses.error:
            pass


def draw_art(scr, art, base_y, base_x, h, w, attr=0):
    for i, line in enumerate(art):
        row = base_y + i
        if row < 0 or row >= h:
            continue
        for j, ch in enumerate(line):
            col = base_x + j
            if ch != ' ' and 0 <= col < w - 1:
                try:
                    scr.addch(row, col, ch, attr)
                except curses.error:
                    pass


def layout_all(scenes, screen_width):
    elements = []
    subs = []
    wx = screen_width

    for scene in scenes:
        scene_start = wx
        total_scroll = int(scene["dur"] * FPS * SCROLL_SPEED)
        n = len(scene["els"])

        if n > 0:
            spacing = total_scroll / (n + 1)
            for i, (art, y_off) in enumerate(scene["els"]):
                ex = wx + int(spacing * (i + 1))
                ew = max(len(line) for line in art)
                eh = len(art)
                elements.append({
                    "art": art,
                    "x": ex,
                    "w": ew,
                    "h": eh,
                    "y_off": y_off,
                })

        wx += total_scroll
        subs.append({
            "text": scene.get("sub", ""),
            "title": scene.get("title", ""),
            "start": scene_start,
            "end": wx,
        })

    return elements, subs, wx


def get_scene_index(subs, scroll, screen_width):
    mid = scroll + screen_width // 2
    for i, s in enumerate(subs):
        if s["start"] <= mid <= s["end"]:
            return i
    return -1


class DustParticle:
    def __init__(self, x, y):
        self.x = x + random.uniform(-3, 0)
        self.y = y + random.uniform(-0.5, 0.5)
        self.life = random.randint(5, 12)
        self.age = 0
        self.dx = random.uniform(-0.6, -0.1)
        self.dy = random.uniform(-0.2, 0.1)
        self.ch = random.choice(['.', ':', ',', '`', "'", '*'])

    def update(self):
        self.x += self.dx
        self.y += self.dy
        self.age += 1
        return self.age < self.life

    def draw(self, scr, h, w, attr):
        ix, iy = int(self.x), int(self.y)
        if 0 <= iy < h and 0 <= ix < w - 1:
            try:
                scr.addch(iy, ix, self.ch, attr | curses.A_DIM)
            except curses.error:
                pass


def main(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.timeout(0)

    has_color = curses.has_colors()
    if has_color:
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_WHITE, -1)
        curses.init_pair(2, curses.COLOR_CYAN, -1)
        curses.init_pair(3, curses.COLOR_YELLOW, -1)
        curses.init_pair(4, curses.COLOR_WHITE, -1)
        curses.init_pair(5, curses.COLOR_GREEN, -1)
        curses.init_pair(6, curses.COLOR_MAGENTA, -1)
        curses.init_pair(7, curses.COLOR_RED, -1)

    h, w = stdscr.getmaxyx()
    if h < MIN_HEIGHT or w < MIN_WIDTH:
        stdscr.addstr(0, 0, f"Need at least {MIN_WIDTH}x{MIN_HEIGHT}. Got {w}x{h}. Resize & press key.")
        stdscr.nodelay(False)
        stdscr.getch()
        h, w = stdscr.getmaxyx()

    ground_y = h - GROUND_OFFSET
    stick_x = w // 2 - STICK_WIDTH // 2
    stick_y = ground_y - STICK_HEIGHT

    elements, subs, total_w = layout_all(SCENES, w)

    scroll = 0
    frame = 0
    paused = False
    debug = False
    frame_time = 1.0 / FPS
    start_time = time.time()
    dust_particles = []

    while True:
        t_start = time.time()

        key = stdscr.getch()
        if key == ord('q') or key == 27:
            break
        elif key == ord(' '):
            paused = not paused
            if not paused:
                start_time = time.time() - (scroll / (FPS * SCROLL_SPEED))
        elif key == ord('r'):
            scroll = 0
            frame = 0
            start_time = time.time()
            paused = False
            dust_particles.clear()
        elif key == ord('d'):
            debug = not debug

        if paused:
            safe_addstr(stdscr, h // 2, w // 2 - 5, "|| PAUSED", curses.A_BOLD)
            stdscr.refresh()
            time.sleep(0.1)
            continue

        h, w = stdscr.getmaxyx()
        ground_y = h - GROUND_OFFSET
        stick_y = ground_y - STICK_HEIGHT
        stick_x = w // 2 - STICK_WIDTH // 2

        stdscr.erase()

        # ── Ground ──
        attr_ground = (curses.color_pair(4) | curses.A_DIM) if has_color else curses.A_DIM
        ground_str = ""
        for i in range(w - 1):
            ground_str += "=" if (i + scroll) % 4 == 0 else "-"
        safe_addstr(stdscr, ground_y, 0, ground_str, attr_ground)

        # ── Scene info ──
        scene_idx = get_scene_index(subs, scroll, w)

        # ── Scene title ──
        if scene_idx >= 0:
            s = subs[scene_idx]
            title = s.get("title", "")
            if title:
                scene_progress = (scroll + w // 2 - s["start"])
                title_sec = scene_progress / (FPS * SCROLL_SPEED)
                if title_sec < 3.0:
                    attr_title = (curses.color_pair(7) | curses.A_BOLD) if has_color else curses.A_BOLD
                    tx = max(0, (w - len(title)) // 2)
                    safe_addstr(stdscr, TITLE_OFFSET, tx, title, attr_title)

        # ── Elements ──
        for el in elements:
            screen_x = el["x"] - scroll
            if screen_x + el["w"] < 0 or screen_x >= w:
                continue

            elem_y = ground_y - el["h"] - el["y_off"]

            if has_color:
                if scene_idx == 5:
                    attr = curses.color_pair(5) | curses.A_BOLD
                elif scene_idx == 8:
                    attr = curses.color_pair(6)
                elif scene_idx == 0:
                    attr = curses.color_pair(7)
                else:
                    attr = curses.color_pair(2)
            else:
                attr = 0

            draw_art(stdscr, el["art"], elem_y, screen_x, h, w, attr)

        # ── Dust particles ──
        if frame % 2 == 0:
            foot_x = stick_x + STICK_WIDTH // 2
            foot_y = ground_y - 1
            dust_particles.append(DustParticle(foot_x - 2, foot_y))

        attr_dust = (curses.color_pair(4) | curses.A_DIM) if has_color else curses.A_DIM
        alive = []
        for p in dust_particles:
            if p.update():
                p.draw(stdscr, h, w, attr_dust)
                alive.append(p)
        dust_particles = alive[-30:]

        # ── Stick figure ──
        attr_stick = (curses.color_pair(1) | curses.A_BOLD) if has_color else curses.A_BOLD
        walk_idx = (frame // WALK_CYCLE_RATE) % len(WALK)
        draw_art(stdscr, WALK[walk_idx], stick_y, stick_x, h, w, attr_stick)

        # ── Subtitle ──
        if scene_idx >= 0:
            s = subs[scene_idx]
            if s["text"]:
                attr_sub = (curses.color_pair(3) | curses.A_BOLD) if has_color else curses.A_BOLD
                text = s["text"]
                tx = max(0, (w - len(text)) // 2)
                safe_addstr(stdscr, h - SUBTITLE_OFFSET, tx, text, attr_sub)

        # ── Progress bar ──
        if scene_idx >= 0:
            s = subs[scene_idx]
            mid = scroll + w // 2
            progress = (mid - s["start"]) / max(1, s["end"] - s["start"])
            progress = max(0.0, min(1.0, progress))
            bar_w = w // 2
            bar_x = w // 4
            filled = int(bar_w * progress)
            bar = "#" * filled + "." * (bar_w - filled)
            safe_addstr(stdscr, h - SUBTITLE_OFFSET - 1, bar_x, bar, curses.A_DIM)

        # ── Controls hint ──
        hint = " q:quit  SPC:pause  r:restart  d:debug "
        safe_addstr(stdscr, 0, w - len(hint) - 1, hint, curses.A_DIM)

        # ── Debug ──
        if debug:
            elapsed = time.time() - start_time
            sn = f"Scene {scene_idx + 1}/{len(SCENES)}" if scene_idx >= 0 else "---"
            dbg = f" t={elapsed:.1f}s | frame={frame} | scroll={scroll} | {sn} "
            safe_addstr(stdscr, 1, 0, dbg, curses.A_DIM)

        stdscr.refresh()

        scroll += SCROLL_SPEED
        frame += 1

        # ── End ──
        if scroll > total_w + w:
            stdscr.erase()
            end = "~ fin ~"
            safe_addstr(stdscr, h // 2 - 1, w // 2 - len(end) // 2, end,
                        (curses.color_pair(3) | curses.A_BOLD) if has_color else curses.A_BOLD)
            h2 = "r = restart | q = quit"
            safe_addstr(stdscr, h // 2 + 1, w // 2 - len(h2) // 2, h2, curses.A_DIM)
            stdscr.refresh()

            stdscr.nodelay(False)
            while True:
                k = stdscr.getch()
                if k == ord('q') or k == 27:
                    return
                elif k == ord('r'):
                    scroll = 0
                    frame = 0
                    start_time = time.time()
                    dust_particles.clear()
                    stdscr.nodelay(True)
                    break
            continue

        elapsed = time.time() - t_start
        time.sleep(max(0, frame_time - elapsed))


if __name__ == "__main__":
    print()
    print("  ╔════════════════════════════════════════════╗")
    print("  ║   SLANUP STICK ANIMATION v2 — Detailed    ║")
    print("  ╠════════════════════════════════════════════╣")
    print("  ║                                            ║")
    print("  ║   Resize terminal WIDE (120+ cols ideal)   ║")
    print("  ║   Make it TALL too (30+ rows ideal)        ║")
    print("  ║   Set transparent bg for video overlay     ║")
    print("  ║   Start screen recorder, then press Enter  ║")
    print("  ║                                            ║")
    print("  ║   q=quit  SPACE=pause  r=restart  d=debug  ║")
    print("  ║                                            ║")
    print("  ╚════════════════════════════════════════════╝")
    print()
    input("  Press ENTER to start... ")
    curses.wrapper(main)
