export class Span {
  constructor(
    readonly start: SpanLocation,
    readonly end: SpanLocation,
  ) {}
}

export class SpanLocation {
  constructor(
    readonly position: number,
    readonly line: number,
    readonly column: number,
  ) {}
}
