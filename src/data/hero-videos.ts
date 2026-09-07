/**
 * Hero videos.
 *
 * Only the unit-circle loop ships: it is the one the home page's project deck
 * plays. The other three entries are kept because their prompts and figures are
 * the verified record of the same benchmark run, and the case study quotes them.
 *
 * Every prompt below is VERBATIM from the pipeline's own run traces, cross-checked
 * against backend/benchmarks/topics.json and each run's `pipeline_start` event.
 * The hero's whole premise is that these are the real inputs — do not paraphrase them.
 *
 * Per-video figures come from
 * backend/benchmarks/results/20260819-030823_sweep-final.json.
 * Chemistry was a one-off run with no sidecar; its numbers are reconstructed from
 * logs/traces/20260819_154948_a2665333.jsonl and the mp4 header, and it has no
 * recorded cost, so `cost` is omitted rather than guessed.
 */

export interface HeroVideo {
  id: string;
  /** Short label for the switcher button. */
  label: string;
  /** The exact prompt given to the pipeline. */
  prompt: string;
  src: string;
  /** Seconds of the finished video this loop was cut from. */
  clip: [number, number];
  shots: number;
  /** Full runtime of the finished video, seconds. */
  duration: number;
  reviewScore: number;
  costUsd?: number;
}

export const heroVideos: HeroVideo[] = [
  {
    id: "unit-circle",
    label: "The unit circle",
    prompt:
      "Explain how the unit circle defines sine and cosine, and how the sine wave is traced out as the angle increases",
    src: "/video/unit-circle.v1.mp4",
    clip: [79.5, 93.5],
    shots: 6,
    duration: 125,
    reviewScore: 0.758,
    costUsd: 0.2709,
  },
  {
    id: "pythagoras",
    label: "Pythagoras",
    prompt:
      "Explain the Pythagorean theorem and why a squared plus b squared equals c squared for a right triangle",
    src: "/video/pythagoras.v1.mp4",
    clip: [36.8, 50.8],
    shots: 5,
    duration: 93.2,
    reviewScore: 0.754,
    costUsd: 0.2277,
  },
  {
    id: "probability",
    label: "Conditional probability",
    prompt:
      "Explain conditional probability using a tree diagram for drawing two coloured balls from a bag without replacement",
    src: "/video/probability.v1.mp4",
    clip: [40, 54],
    shots: 6,
    duration: 118.8,
    reviewScore: 0.888,
    costUsd: 0.1897,
  },
  {
    id: "chemistry",
    label: "Balancing equations",
    prompt:
      "Explain what a chemical equation is and how to balance one, showing why the number of atoms of each element must be the same on both sides",
    src: "/video/chemistry.v1.mp4",
    clip: [64, 78],
    shots: 8,
    duration: 184.3,
    reviewScore: 0.854,
  },
];
