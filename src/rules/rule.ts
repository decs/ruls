import type {SignalSet} from '../signals';
import type {EncodedGroupRule} from './group';
import type {EncodedInverseRule} from './inverse';
import type {EncodedSignalRule} from './signal';

import Evaluator from '../core/evaluator';

export type EncodedRule<TContext> =
  | EncodedGroupRule<TContext>
  | EncodedInverseRule<TContext>
  | EncodedSignalRule;

/**
 * Allows you to define complex conditions and criteria for decision-making. It
 * consists of one or more signals, which can be combined using logical
 * operators to create intricate structures.
 *
 * Takes a TContext argument which encapsulates the necessary information
 * required by signals to make decisions and determine the outcome of rules.
 */
export default abstract class Rule<TContext> extends Evaluator<
  TContext,
  boolean
> {
  abstract encode(signals: SignalSet<TContext>): EncodedRule<TContext>;
}
