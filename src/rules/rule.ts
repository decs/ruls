import type { SignalSet } from "../signals";
import type { EncodedGroupRule } from "./group";
import type { EncodedInverseRule } from "./inverse";
import type { EncodedSignalRule } from "./signal";

import Evaluator from "../core/evaluator";

export type EncodedRule<TContext> =
  | EncodedGroupRule<TContext>
  | EncodedInverseRule<TContext>
  | EncodedSignalRule;

export default abstract class Rule<TContext> extends Evaluator<
  TContext,
  boolean
> {
  abstract encode(signals: SignalSet<TContext>): EncodedRule<TContext>;
}
