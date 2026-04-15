export const ALL_TROPES = [
  "enemies-to-lovers",
  "slow-burn",
  "second-chance",
  "forced-proximity",
  "fake-dating",
  "grumpy-sunshine",
  "friends-to-lovers",
  "forbidden-love",
  "one-bed",
  "opposites-attract",
  "small-town",
  "workplace-romance",
] as const;

export type Trope = (typeof ALL_TROPES)[number];

export const COVER_PRESETS: Array<{ bg: string; text: string }> = [
  { bg: "linear-gradient(135deg, #2c3e50 0%, #e74c3c 100%)", text: "#FFF8F0" },
  { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", text: "#FFFFFF" },
  { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", text: "#0a2540" },
  { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", text: "#0a2018" },
  { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", text: "#2a1010" },
  { bg: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", text: "#1a0d2e" },
  { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "#FFFFFF" },
  { bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", text: "#3a1515" },
];

export const DISCORD_URL =
  "https://discord.com/channels/1442556988163751970/1442559941918326939";

export const FEED_BATCH_SIZE = 10;
