// Auto-generated from vo15/timeline.json
export const FPS = 30;
export const TOTAL_FRAMES = 450;
export type Line = { id: string; spk: 'maya' | 'zara'; text: string; startF: number; endF: number; durF: number };
export const LINES: Line[] = [
  {
    "id": "F1",
    "spk": "zara",
    "text": "You built this?",
    "startF": 6,
    "endF": 47,
    "durF": 41
  },
  {
    "id": "M1",
    "spk": "maya",
    "text": "Last night.",
    "startF": 48,
    "endF": 77,
    "durF": 29
  },
  {
    "id": "F2",
    "spk": "zara",
    "text": "Whole site?",
    "startF": 79,
    "endF": 112,
    "durF": 33
  },
  {
    "id": "M2",
    "spk": "maya",
    "text": "Menu, prices, bookings, dashboard.",
    "startF": 114,
    "endF": 200,
    "durF": 86
  },
  {
    "id": "F3",
    "spk": "zara",
    "text": "No way.",
    "startF": 202,
    "endF": 235,
    "durF": 33
  },
  {
    "id": "M3",
    "spk": "maya",
    "text": "I described my bakery.",
    "startF": 237,
    "endF": 290,
    "durF": 53
  },
  {
    "id": "M4",
    "spk": "maya",
    "text": "It built everything.",
    "startF": 291,
    "endF": 346,
    "durF": 55
  },
  {
    "id": "F4",
    "spk": "zara",
    "text": "The link?",
    "startF": 348,
    "endF": 379,
    "durF": 31
  },
  {
    "id": "M5",
    "spk": "maya",
    "text": "Comment link. I'll send it to you.",
    "startF": 380,
    "endF": 438,
    "durF": 58
  }
];
export const lineById = (id: string) => LINES.find((l) => l.id === id)!;
