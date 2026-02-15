export type ExperienceAvailabilityMap = Record<
  string,
  { bookedParticipants: number }
>;

type AvailabilityResponse = {
  data: ExperienceAvailabilityMap;
};

export async function fetchExperienceAvailability(
  experienceId: string,
  month: string
): Promise<ExperienceAvailabilityMap> {
  const response = await fetch(
    `/api/experiences/${experienceId}/availability?month=${month}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch experience availability");
  }

  const json = (await response.json()) as AvailabilityResponse;
  return json.data;
}
