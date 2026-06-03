import {
  FeedStatus,
  FeedType,
} from "@/types/database";

export const feedTypes: Array<{
  value: FeedType;
  label: string;
}> = [
  {
    value: "photo_walk",
    label: "Photo Walk",
  },
  {
    value: "food_visit",
    label: "Food Visit",
  },
  {
    value: "event_observation",
    label: "Event Observation",
  },
  {
    value: "local_discovery",
    label: "Local Discovery",
  },
];

export const feedStatuses: Array<{
  value: FeedStatus;
  label: string;
}> = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "archived",
    label: "Archived",
  },
];
