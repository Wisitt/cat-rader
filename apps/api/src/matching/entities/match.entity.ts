export type MatchScore = {
  score: number;
  level: "Low" | "Medium" | "High";
  reasons: string[];
  distanceMeters: number;
};
