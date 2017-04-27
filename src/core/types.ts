import * as utils from '../internal/utils';


/** A truthy string or falsy values */
export type ValidationResponse<TValidation> =
  TValidation
  | null
  | undefined
  | false

/**
 * A validator simply takes a value and returns a string or Promise<string>
 * If a truthy string is returned it represents a validation error
 **/
export interface Validator<TValue, TValidation> {
  (value: TValue): ValidationResponse<TValidation> | Promise<ValidationResponse<TValidation>>;
}

/**
 * Runs the value through a list of validators. As soon as a validation error is detected, the error is returned
 */
export function applyValidators<TValue, TValidation>(value: TValue, validators: Validator<TValue, TValidation>[]): Promise<TValidation | null | undefined> {
  return new Promise<TValidation | null | undefined>(resolve => {
    let currentIndex = 0;

    let gotoNextValidator = () => {
      currentIndex++;
      runCurrentValidator();
    }

    let runCurrentValidator = () => {
      if (currentIndex == validators.length) {
        resolve(null);
        return;
      }
      let validator = validators[currentIndex];
      let res: any = validator(value);

      // no error
      if (!res) {
        gotoNextValidator();
        return;
      }

      // some error
      if (!res.then) {
        resolve(res);
        return;
      }

      // wait for error response
      res.then((msg: any) => {
        if (!msg) gotoNextValidator();
        else resolve(msg);
      })
    }

    // kickoff
    runCurrentValidator();
  });
}


/** Anything that provides this interface can be plugged into the validation system */
export interface Validatable<TValue, TValidation> {
  validating: boolean;
  validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }>;
  hasError: boolean;
  error?: TValidation | null | undefined;
  $: TValue;
  enableAutoValidation: () => void;
}

/**
 * Composible fields (fields that work in conjuction with a parent FormState)
 */
export interface ComposibleValidatable<TValue, TValidation> extends Validatable<TValue, TValidation> {
  /** Used to tell the parent about validation */
  on$ChangeAfterValidation: () => void;
  on$Reinit: () => void;

  /** Used by the parent to register listeners */
  setCompositionParent: (config: {
    on$ChangeAfterValidation: () => void;
    on$Reinit: () => void;
  }) => void;
}
