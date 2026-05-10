export class SmoobuApiError extends Error {
  public readonly retryable: boolean;

  constructor(
    public status: number,
    public title: string,
    public detail: string
  ) {
    super(`Smoobu API Error: ${title} - ${detail}`);
    this.name = "SmoobuApiError";
    this.retryable = status === 429 || status >= 500;
  }
}
