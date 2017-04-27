import * as React from "react";
import {Button, render} from "./mui";
import {Vertical} from "./gls";
import {ValidateFieldState, FormState} from "../../index";
import {orange500, red500} from "material-ui/styles/colors";
import TextField from "material-ui/TextField";
import {observer} from "mobx-react";

type ValidationResultLevel = "error" | "warning"

interface ValidationResult {
  level: ValidationResultLevel
  message: string
}

const passwordStrength = (val: string): ValidationResult | null => {
  if (val.length < 3) {
    return {level: "error", message: "Terrible password"}
  }
  if (val.length < 5) {
    return {level: "warning", message: "Weak password"}
  }
  return null
};

const form = new FormState({
  password: new ValidateFieldState<string, ValidationResult>('').validators(passwordStrength),
});

type FieldProps = {
  /** Any UI stuff you need */
  id: string,
  label: string,

  /** The fieldState */
  fieldState: ValidateFieldState<string, ValidationResult>
}

const Field = observer((props: FieldProps) => (
  <TextField
    type="password"
    id={props.id}
    fullWidth={true}
    floatingLabelText={props.label}
    value={props.fieldState.value}
    onChange={function () {
      props.fieldState.onChange(arguments[1])
    }}
    errorText={props.fieldState.error && props.fieldState.error.message}
    errorStyle={getErrorStyle(props.fieldState.error)}
  />
));

const getErrorStyle = (validationResult?: ValidationResult) => {
  if (!validationResult) {
    return undefined;
  }
  switch (validationResult.level) {
    case "error":
      return {color: red500};
    case "warning":
      return {color: orange500};
  }
};


render(() => {
  return (<form>
    <Vertical>
      <Field id="password" label="Password" fieldState={form.$.password}/>

      <Button type="submit"> Submit </Button>

    </Vertical>
  </form>);
});
