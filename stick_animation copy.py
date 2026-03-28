#!/usr/bin/env python3
"""
Slanup Stick Animation
══════════════════════════════════════════════════════════════════
Terminal-based stick figure animation with scrolling scene elements.
Record this terminal window and overlay on your video.

Usage:  python3 stick_animation.py
Keys:   q = quit | SPACE = pause | r = restart | d = debug overlay

Setup for recording:
  1. Set terminal background to transparent (or green for chroma key)
  2. Resize terminal to desired overlay size (wider = better)
  3. Run script, press Enter to start
  4. Record with OBS / QuickTime / any screen recorder

Customization:
  - Edit SCENES list to change elements, timing, subtitles
  - Edit WALK frames to change stick figure animation
  - Edit element ASCII art (E_*) to change visuals
  - Tweak FPS, SCROLL_SPEED, etc. for pacing
"""

import curses
import time

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SETTINGS — tweak these to match your video timing
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FPS = 12                  # frames per second (higher = smoother)
SCROLL_SPEED = 2          # element scroll speed (pixels per frame)
WALK_CYCLE_RATE = 3       # frames between walk animation steps
GROUND_OFFSET = 5         # ground line: rows from bottom
SUBTITLE_OFFSET = 2       # subtitle: rows from bottom
MIN_WIDTH = 60            # minimum terminal width
MIN_HEIGHT = 18           # minimum terminal height


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STICK FIGURE WALK CYCLE (4 frames)
# Each frame is 3 lines, 3 chars wide
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WALK = [
    # Frame 1: stride (legs apart)
    [" O ",
     "/|\\",
     "/ \\"],
    # Frame 2: right leg swings back
    [" O ",
     "/|\\",
     "|\\ "],
    # Frame 3: legs together (passing)
    [" O ",
     "/|\\",
     " | "],
    # Frame 4: left leg swings forward
    [" O ",
     "/|\\",
     "/| "],
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ASCII ART ELEMENTS
# Each element = list of strings (lines). Keep them compact (3-7 lines).
# Non-space characters are drawn; spaces are transparent.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# --- Intro / messed up ---
E_QUESTION = [
    " ?  ? ",
    "  ??  ",
    "  ?!  ",
]

E_CROSS = [
    "\\ / ",
    " X  ",
    "/ \\ ",
]

E_SCATTER = [
    " !  ? ",
    "?  !  ",
    " ?  ! ",
]

# --- Social app / plans ---
E_PHONE = [
    ".----.",
    "| :) |",
    "|    |",
    "'----'",
]

E_PEOPLE = [
    " o  o  o ",
    "/|\\ | /|\\",
    "/ \\ | / \\",
]

E_PLAN = [
    ".------.",
    "| PLAN |",
    "| [x]  |",
    "| [x]  |",
    "'------'",
]

# --- New city / alone ---
E_BUILDING_TALL = [
    " .---. ",
    " |[]|| ",
    " |[]|| ",
    " |[]|| ",
    " |[]|| ",
    " '---' ",
]

E_BUILDING_SHORT = [
    " .--. ",
    " |[]| ",
    " |[]| ",
    " '--' ",
]

E_ALONE = [
    "  o  ",
    " /|\\ ",
    " / \\ ",
    "  .  ",
    " ... ",
]

# --- Dating apps ---
E_DATING_APP = [
    ".----.",
    "| </3|",
    "|  X |",
    "'----'",
]

E_NOPE = [
    " .--. ",
    " |NO| ",
    " '--' ",
]

# --- Too many ideas ---
E_BULB = [
    "  _  ",
    " (!) ",
    "  |  ",
]

E_GEAR = [
    " _|_ ",
    "|_o_|",
    "  |  ",
]

E_ARROWS = [
    "  ^   ",
    "<-+-> ",
    "  v   ",
]

E_IDEA = [
    " .--. ",
    " |!!| ",
    " '--' ",
]

# --- Time passed ---
E_CLOCK = [
    " .--. ",
    "|9 3|",
    "| 6 |",
    " '--' ",
]

E_CALENDAR = [
    ".------.",
    "| 2025 |",
    "| XXXX |",
    "'------'",
]

E_HOURGLASS = [
    " \\  / ",
    "  \\/  ",
    "  /\\  ",
    " /  \\ ",
]

# --- Validate / realization ---
E_BIG_Q = [
    " ???  ",
    "?   ? ",
    "   ?  ",
    "  ?   ",
    "      ",
    "  ?   ",
]

E_CHECKMARK = [
    "      /",
    "     / ",
    "\\   /  ",
    " \\ /   ",
    "  V    ",
]

E_THINK = [
    " o  ",
    "(?) ",
    "    ",
    " .  ",
    " .. ",
]

# --- Beta launch ---
E_ROCKET = [
    "  /\\  ",
    " /  \\ ",
    "| ** |",
    "|    |",
    " \\__/ ",
    " /||\\ ",
]

E_STAR = [
    "  .  ",
    " -*- ",
    "  '  ",
]

E_BETA = [
    "+---------+",
    "|  SLANUP |",
    "|  BETA!  |",
    "+---------+",
]

E_SPARKLE = [
    " *   * ",
    "   *   ",
    " *   * ",
]

# --- Features: plans, join, chat ---
E_CHAT = [
    " .-----. ",
    " | ... | ",
    " '--+--' ",
    "    V    ",
]

E_JOIN = [
    " o   o  ",
    "/|\\ /|\\ ",
    " -> o<- ",
    "   /|\\  ",
]

E_GROUP_CHAT = [
    " o o o  ",
    " |=|=|  ",
    " .---. ",
    " |...| ",
    " '---' ",
]

# --- Safety ---
E_SHIELD = [
    " /---\\ ",
    "|  +  |",
    "|  +  |",
    " \\   / ",
    "  \\_/  ",
]

E_FLAG = [
    " |### ",
    " |### ",
    " |    ",
    " |    ",
]

E_SAFE = [
    ".------.",
    "| SAFE |",
    "'------'",
]

# --- Outro ---
E_WAVE = [
    " \\o  ",
    "  |\\ ",
    " / \\ ",
]

E_HEART = [
    " ** ** ",
    " ***** ",
    "  ***  ",
    "   *   ",
]

E_SMILE = [
    "  :)  ",
]

E_PEACE = [
    "  //  ",
    " //   ",
    " V    ",
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SCENES — edit these to match your script and timing
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Each scene:
#   "sub"  = subtitle text shown at bottom (keep short)
#   "dur"  = duration in seconds (match to your narration)
#   "els"  = list of (ELEMENT, y_offset)
#            y_offset: 0 = on ground, 1+ = floating above ground
#
# TIP: Watch the animation and adjust "dur" to sync with your video.
#       Add/remove elements to taste. Reorder scenes freely.

SCENES = [
    # ── Scene 1: Intro ──
    {
        "sub": "we kinda messed up... but we're here for it",
        "dur": 4,
        "els": [
            (E_QUESTION, 1),
            (E_CROSS, 0),
            (E_SCATTER, 2),
            (E_QUESTION, 0),
        ],
    },

    # ── Scene 2: The app concept ──
    {
        "sub": "a social app ~ post activity plans ~ people nearby join",
        "dur": 8,
        "els": [
            (E_PHONE, 0),
            (E_PLAN, 0),
            (E_PEOPLE, 0),
            (E_PHONE, 0),
            (E_PEOPLE, 0),
        ],
    },

    # ── Scene 3: New city, alone, dating apps ──
    {
        "sub": "new city... no one i knew... just creepy dating apps",
        "dur": 10,
        "els": [
            (E_BUILDING_TALL, 0),
            (E_BUILDING_SHORT, 0),
            (E_ALONE, 0),
            (E_BUILDING_SHORT, 0),
            (E_BUILDING_TALL, 0),
            (E_DATING_APP, 0),
            (E_NOPE, 1),
            (E_CROSS, 0),
        ],
    },

    # ── Scene 4: Too many ideas, year gone ──
    {
        "sub": "wanted to add EVERYTHING... a whole year gone",
        "dur": 10,
        "els": [
            (E_BULB, 1),
            (E_GEAR, 0),
            (E_IDEA, 1),
            (E_ARROWS, 2),
            (E_BULB, 0),
            (E_GEAR, 1),
            (E_CLOCK, 0),
            (E_CALENDAR, 0),
            (E_HOURGLASS, 0),
        ],
    },

    # ── Scene 5: Realization — validate the problem ──
    {
        "sub": "wait... is this even a real problem?",
        "dur": 8,
        "els": [
            (E_THINK, 0),
            (E_BIG_Q, 0),
            (E_BIG_Q, 0),
            (E_CHECKMARK, 0),
            (E_CHECKMARK, 0),
        ],
    },

    # ── Scene 6: BETA LAUNCH ──
    {
        "sub": ">>> SLANUP BETA IS OUT! <<<",
        "dur": 8,
        "els": [
            (E_STAR, 2),
            (E_ROCKET, 0),
            (E_SPARKLE, 3),
            (E_BETA, 0),
            (E_STAR, 1),
            (E_ROCKET, 0),
            (E_SPARKLE, 2),
            (E_STAR, 3),
        ],
    },

    # ── Scene 7: Features — plans, join, chat ──
    {
        "sub": "make plans ~ people join ~ group chat ~ make it happen",
        "dur": 10,
        "els": [
            (E_PLAN, 0),
            (E_JOIN, 0),
            (E_CHAT, 0),
            (E_GROUP_CHAT, 0),
            (E_PEOPLE, 0),
            (E_PLAN, 0),
            (E_CHAT, 0),
        ],
    },

    # ── Scene 8: Safety ──
    {
        "sub": "safe space ~ flag behavior ~ safety first",
        "dur": 8,
        "els": [
            (E_SHIELD, 0),
            (E_FLAG, 0),
            (E_SAFE, 0),
            (E_CHECKMARK, 0),
            (E_SHIELD, 0),
            (E_FLAG, 0),
        ],
    },

    # ── Scene 9: Outro ──
    {
        "sub": "milte hai :)",
        "dur": 5,
        "els": [
            (E_WAVE, 0),
            (E_HEART, 1),
            (E_STAR, 2),
            (E_SMILE, 1),
            (E_PEACE, 0),
            (E_WAVE, 0),
            (E_HEART, 2),
        ],
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RENDERING ENGINE — you probably don't need to edit below here
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def safe_addstr(scr, y, x, text, attr=0):
    """Safely draw a string, clipping to screen bounds."""
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
    """Draw multi-line ASCII art. Only non-space chars are drawn (transparency)."""
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
    """
    Pre-compute world x-positions for all elements.
    Elements are evenly spread across each scene's scroll distance.
    Returns: (elements_list, subtitle_regions, total_world_width)
    """
    elements = []
    subs = []
    wx = screen_width  # first elements start just off right edge

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
            "start": scene_start,
            "end": wx,
        })

    return elements, subs, wx


def get_scene_index(subs, scroll, screen_width):
    """Return the current scene index based on scroll position."""
    mid = scroll + screen_width // 2
    for i, s in enumerate(subs):
        if s["start"] <= mid <= s["end"]:
            return i
    return -1


def main(stdscr):
    # ── Setup ──
    curses.curs_set(0)        # hide cursor
    stdscr.nodelay(True)      # non-blocking input
    stdscr.timeout(0)

    # Colors
    has_color = curses.has_colors()
    if has_color:
        curses.start_color()
        curses.use_default_colors()  # -1 = default/transparent bg
        curses.init_pair(1, curses.COLOR_WHITE, -1)    # stick figure
        curses.init_pair(2, curses.COLOR_CYAN, -1)     # elements
        curses.init_pair(3, curses.COLOR_YELLOW, -1)   # subtitle
        curses.init_pair(4, curses.COLOR_WHITE, -1)    # ground
        curses.init_pair(5, curses.COLOR_GREEN, -1)    # beta/special
        curses.init_pair(6, curses.COLOR_MAGENTA, -1)  # hearts

    h, w = stdscr.getmaxyx()
    if h < MIN_HEIGHT or w < MIN_WIDTH:
        stdscr.addstr(0, 0, f"Terminal too small! Need at least {MIN_WIDTH}x{MIN_HEIGHT}, got {w}x{h}")
        stdscr.addstr(1, 0, "Resize and press any key...")
        stdscr.nodelay(False)
        stdscr.getch()
        h, w = stdscr.getmaxyx()

    # Positions
    ground_y = h - GROUND_OFFSET
    stick_h = len(WALK[0])
    stick_w = len(WALK[0][0])
    stick_x = w // 2 - stick_w // 2
    stick_y = ground_y - stick_h

    # Layout
    elements, subs, total_w = layout_all(SCENES, w)

    # State
    scroll = 0
    frame = 0
    paused = False
    debug = False
    frame_time = 1.0 / FPS
    start_time = time.time()

    # ── Main Loop ──
    while True:
        t_start = time.time()

        # Input
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
        elif key == ord('d'):
            debug = not debug

        if paused:
            # Show pause indicator
            attr_pause = curses.A_BOLD | curses.A_BLINK if has_color else curses.A_BOLD
            safe_addstr(stdscr, h // 2, w // 2 - 5, "|| PAUSED", attr_pause)
            stdscr.refresh()
            time.sleep(0.1)
            continue

        # Refresh terminal size (in case of resize)
        h, w = stdscr.getmaxyx()
        ground_y = h - GROUND_OFFSET
        stick_y = ground_y - stick_h
        stick_x = w // 2 - stick_w // 2

        stdscr.erase()

        # ── Draw ground line ──
        attr_ground = (curses.color_pair(4) | curses.A_DIM) if has_color else curses.A_DIM
        ground_line = "-" * (w - 1)
        safe_addstr(stdscr, ground_y, 0, ground_line, attr_ground)

        # ── Draw elements ──
        scene_idx = get_scene_index(subs, scroll, w)
        for el in elements:
            screen_x = el["x"] - scroll

            # Cull off-screen elements
            if screen_x + el["w"] < 0 or screen_x >= w:
                continue

            # Position: bottom of element sits on ground, shifted up by y_off
            elem_y = ground_y - el["h"] - el["y_off"]

            # Pick color based on current scene
            if has_color:
                if scene_idx == 5:      # beta launch
                    attr = curses.color_pair(5) | curses.A_BOLD
                elif scene_idx == 8:    # outro
                    attr = curses.color_pair(6)
                else:
                    attr = curses.color_pair(2)
            else:
                attr = 0

            draw_art(stdscr, el["art"], elem_y, screen_x, h, w, attr)

        # ── Draw stick figure (always on top) ──
        attr_stick = (curses.color_pair(1) | curses.A_BOLD) if has_color else curses.A_BOLD
        walk_idx = (frame // WALK_CYCLE_RATE) % len(WALK)
        wf = WALK[walk_idx]
        draw_art(stdscr, wf, stick_y, stick_x, h, w, attr_stick)

        # ── Draw subtitle ──
        attr_sub = (curses.color_pair(3) | curses.A_BOLD) if has_color else curses.A_BOLD
        mid = scroll + w // 2
        for s in subs:
            if s["start"] <= mid <= s["end"] and s["text"]:
                text = s["text"]
                tx = max(0, (w - len(text)) // 2)
                ty = h - SUBTITLE_OFFSET
                safe_addstr(stdscr, ty, tx, text, attr_sub)
                break

        # ── Controls hint ──
        hint = " q:quit  SPC:pause  r:restart  d:debug "
        safe_addstr(stdscr, 0, w - len(hint) - 1, hint, curses.A_DIM)

        # ── Debug overlay ──
        if debug:
            elapsed = time.time() - start_time
            scene_name = f"Scene {scene_idx + 1}/{len(SCENES)}" if scene_idx >= 0 else "---"
            dbg = f" t={elapsed:.1f}s | frame={frame} | scroll={scroll} | {scene_name} "
            safe_addstr(stdscr, 0, 0, dbg, curses.A_DIM)

        stdscr.refresh()

        # ── Advance ──
        scroll += SCROLL_SPEED
        frame += 1

        # End of animation
        if scroll > total_w + w:
            # Show end screen
            stdscr.erase()
            end_msg = "~ fin ~"
            safe_addstr(stdscr, h // 2, w // 2 - len(end_msg) // 2, end_msg,
                        (curses.color_pair(3) | curses.A_BOLD) if has_color else curses.A_BOLD)
            hint2 = "r = restart | q = quit"
            safe_addstr(stdscr, h // 2 + 2, w // 2 - len(hint2) // 2, hint2, curses.A_DIM)
            stdscr.refresh()

            # Wait for restart or quit
            stdscr.nodelay(False)
            while True:
                k = stdscr.getch()
                if k == ord('q') or k == 27:
                    return
                elif k == ord('r'):
                    scroll = 0
                    frame = 0
                    start_time = time.time()
                    stdscr.nodelay(True)
                    break

            continue

        # Frame timing
        elapsed = time.time() - t_start
        sleep_time = max(0, frame_time - elapsed)
        time.sleep(sleep_time)


if __name__ == "__main__":
    print()
    print("  ╔══════════════════════════════════════╗")
    print("  ║     SLANUP STICK ANIMATION           ║")
    print("  ╠══════════════════════════════════════╣")
    print("  ║  Resize terminal to desired size     ║")
    print("  ║  Set transparent bg for overlay      ║")
    print("  ║  Start your screen recorder          ║")
    print("  ║                                      ║")
    print("  ║  Controls:                           ║")
    print("  ║    q     = quit                      ║")
    print("  ║    SPACE = pause/resume              ║")
    print("  ║    r     = restart                   ║")
    print("  ║    d     = debug overlay (time/fps)  ║")
    print("  ╚══════════════════════════════════════╝")
    print()
    input("  Press ENTER to start... ")
    curses.wrapper(main)
