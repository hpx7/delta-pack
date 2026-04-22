import type { DeltaPackApi } from "./interpreter.js";
import { registerSnapshot } from "./tracking.js";

/**
 * A stateful handle over a one-way state-sync session between two endpoints.
 *
 * Each endpoint holds a {@link SyncSession} representing the current shared
 * view of the peer's state. The sender calls {@link encode} to produce bytes;
 * the receiver calls {@link decode} to apply them. Both sides converge on the
 * same view as long as messages are delivered in order.
 *
 * The class handles the "first call is full encode, subsequent are diffs"
 * distinction internally. It also ensures the sender's view always matches
 * what the peer reconstructs — even when the user's `state` object has been
 * mutated or reordered in ways that would break a raw `encodeDiff` call.
 *
 * @typeParam T - The type being synced, matching the {@link DeltaPackApi}
 */
export class SyncSession<T> {
  private view: T | null = null;

  constructor(private readonly api: DeltaPackApi<T>) {}

  /**
   * Produce bytes to send to the peer. First call emits a full encode;
   * subsequent calls emit a diff against the current view. Either way,
   * the internal view is updated to match what the peer will hold after
   * applying the returned bytes.
   */
  encode(state: T): Uint8Array {
    const bytes = this.view === null ? this.api.encode(state) : this.api.encodeDiff(this.view, state);
    // Maintain a view of what the peer will hold after applying `bytes`. For
    // the first call, a clone of `state` captures the wire order; for diffs,
    // simulating the peer's decode keeps us aligned even when `state` has been
    // reordered in ways that would break a raw encodeDiff. We then stamp the
    // view as a snapshot of `state` so tracking's version-based diff filter
    // keeps working on subsequent encodes (no-op when state isn't tracked).
    this.view = this.view === null ? this.api.clone(state) : this.api.decodeDiff(this.view, bytes);
    registerSnapshot(this.view as object, state as object);
    return bytes;
  }

  /**
   * Apply bytes received from the peer. First call expects a full encode;
   * subsequent calls expect a diff. Returns the updated view.
   */
  decode(bytes: Uint8Array): T {
    this.view = this.view === null ? this.api.decode(bytes) : this.api.decodeDiff(this.view, bytes);
    return this.view;
  }

  /** The current view, or `null` if neither `encode` nor `decode` has been called. */
  current(): T | null {
    return this.view;
  }
}
