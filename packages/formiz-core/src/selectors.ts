import type { ExposedFieldState, Field, Step, Store } from "@/types";
import {
  getFormIsValid,
  getFormIsPristine,
  getFormIsValidating,
  getFieldIsValid,
  getFieldIsPristine,
  getFieldIsValidating,
  getFieldIsDebouncing,
  getFieldIsProcessing,
  getFieldIsReady,
  getStepIsValid,
  getStepIsPristine,
  getStepIsValidating,
} from "@/utils/form";

export const formInterfaceSelector = (state: Store) => {
  const currentStep = state.steps.find(
    (step) => step.name === state.form.currentStepName
  );

  return {
    id: state.form.id,
    submit: state.actions.submitForm,
    setValues: state.actions.setValues,
    setErrors: state.actions.setErrors,
    getStepByFieldName: (fieldName: string) => {
      const field = [...state.fields.values()].find(
        (f) => f.name === fieldName
      );
      const step = state.steps.find((s) => s.name === field?.stepName);
      if (!step) return undefined;
      return stepInterfaceSelector(state)(step);
    },
    reset: state.actions.reset,
    resetKey: state.form.resetKey,
    isSubmitted: state.form.isSubmitted,
    isValid: getFormIsValid(state.fields),
    isValidating: getFormIsValidating(state.fields),
    isPristine: getFormIsPristine(state.fields),
    submitStep: state.actions.submitStep,
    steps: state.steps.map(stepInterfaceSelector(state)),
    currentStep: currentStep
      ? stepInterfaceSelector(state)(currentStep)
      : undefined,
    goToStep: state.actions.goToStep,
    nextStep: state.actions.nextStep,
    prevStep: state.actions.prevStep,
    isStepPristine: currentStep
      ? getStepIsPristine(currentStep.name, state.fields)
      : true,
    isStepValid: currentStep
      ? getStepIsValid(currentStep.name, state.fields)
      : true,
    isStepValidating: currentStep
      ? getStepIsValidating(currentStep.name, state.fields)
      : false,
    isStepSubmitted: currentStep?.isSubmitted ?? false,
    isFirstStep: state.steps.at(0)?.name === currentStep?.name,
    isLastStep: state.steps.at(-1)?.name === currentStep?.name,
  };
};

export const stepInterfaceSelector = (state: Store) => (step: Step) => {
  return {
    name: step.name,
    label: step.label,
    isSubmitted: step.isSubmitted || state.form.isSubmitted,
    index: state.steps.findIndex((s) => s.name === step.name),
    isCurrent: state.form.currentStepName === step.name,
    isValid: getStepIsValid(step.name, state.fields),
    isPristine: getStepIsPristine(step.name, state.fields),
    isValidating: getStepIsValidating(step.name, state.fields),
    isVisited: step.isVisited,
  };
};

export const fieldInterfaceSelector =
  <Value>(state: Store) =>
  (field: Field<Value>): ExposedFieldState<Value> => {
    const fieldStep = state.steps.find((step) => step.name === field.stepName);
    const errorMessages = [
      field.externalErrors.filter((message) => !!message),
      field.requiredErrors.filter((message) => !!message),
      field.validationsErrors.filter((message) => !!message),
      field.validationsAsyncErrors.filter((message) => !!message),
    ].flat();
    const isValid = getFieldIsValid(field);
    const isPristine = getFieldIsPristine(field);
    const isSubmitted = fieldStep
      ? fieldStep.isSubmitted
      : state.form.isSubmitted;
    const isProcessing = getFieldIsProcessing(field);
    return {
      value: field.value,
      formattedValue: field.formattedValue,
      id: `formiz${state.form.id ? `-${state.form.id}` : ""}-field-${
        field.name
      }__${field.id}`,
      isValid: isValid,
      shouldDisplayError:
        !isProcessing &&
        !isValid &&
        ((field.isTouched && !isPristine) || isSubmitted),
      isTouched: field.isTouched,
      errorMessages: errorMessages,
      errorMessage: errorMessages[0],
      isPristine: isPristine,
      isSubmitted: fieldStep ? fieldStep.isSubmitted : state.form.isSubmitted,
      isValidating: getFieldIsValidating(field),
      isDebouncing: getFieldIsDebouncing(field),
      isProcessing: getFieldIsProcessing(field),
      isReady: getFieldIsReady(field),
      resetKey: state.form.resetKey,
    };
  };