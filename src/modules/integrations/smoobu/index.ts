/**
 * General Smoobu integration types and utilities.
 */

export class SmoobuApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail: string
  ) {
    super(`Smoobu API Error: ${title} - ${detail}`);
    this.name = "SmoobuApiError";
  }
}
