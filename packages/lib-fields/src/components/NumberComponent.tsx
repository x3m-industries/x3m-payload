'use client';

import React, { useCallback } from 'react';
import { NumericFormat } from 'react-number-format';

import type { NumberFieldClientProps, TextFieldClientProps, ValidateOptions } from 'payload';

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useField,
} from '@payloadcms/ui';

import type { NumberFieldConfig } from '../fields/number/types';
import './NumberComponent.css';

type NumberComponentProps = {
  config: NumberFieldConfig;
  // Using 'any' for the component types here matches how RenderCustomComponent
  // expects its props to be passed in the Payload UI package.
  customComponents?: {
    AfterInput?: React.ReactNode;
    BeforeInput?: React.ReactNode;
    Description?: React.ReactNode;
    Error?: React.ReactNode;
    Label?: React.ReactNode;
  };
} & (NumberFieldClientProps | TextFieldClientProps);

export function NumberComponent(props: NumberComponentProps) {
  const { config, customComponents, field, path, readOnly, validate } = props;

  const {
    // type,
    admin: { className, description, placeholder, readOnly: adminReadOnly } = {},
    label,
    required,
  } = field;

  // Memoize validate to handle type mismatch if needed, though useField handles generic validate
  const memoizedValidate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: unknown, options: ValidateOptions<any, any, any, any>) => {
      if (typeof validate === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (validate as any)(value, { ...options, required });
      }
      return true;
    },
    [validate, required]
  );

  const { errorMessage, setValue, showError, value } = useField<number | string>({
    path,
    validate: memoizedValidate,
  });

  const { AfterInput, BeforeInput, Description, Label } = customComponents || {};

  const {
    type: configType,
    decimalScale = 0,
    prefix,
    scaling,
    suffix,
    thousandSeparator,
    ...otherConfig
  } = config;

  // Helper to safely divide by power of 10 if scaling is enabled
  const getDisplayValue = (val: null | number | string | undefined) => {
    if (!scaling || val === undefined || val === null || val === '') {
      return val;
    }
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) {
      return val;
    }
    return num / Math.pow(10, decimalScale);
  };

  const classes = [
    'field-type',
    'text',
    className,
    showError && 'error',
    readOnly && 'read-only',
    'number-field-container',
  ]
    .filter(Boolean)
    .join(' ');

  const isReadonly = Boolean(readOnly) || Boolean(adminReadOnly);

  return (
    <div className={classes}>
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={<FieldLabel label={label} path={path} required={required} />}
      />

      {BeforeInput}

      <div className="input-wrapper">
        <FieldError message={errorMessage ?? ''} showError={showError} />
        <NumericFormat
          className="number-input"
          id={`field-${path.replace(/\./g, '__')}`}
          name={path}
          onValueChange={(values) => {
            // react-number-format provides floatValue, valid for 'number' type
            let newVal = configType === 'number' ? (values.floatValue ?? null) : values.value;

            if (scaling && newVal !== null && newVal !== undefined && newVal !== '') {
              // If it's a number, scale it up
              const num = typeof newVal === 'string' ? parseFloat(newVal) : newVal;
              if (!isNaN(num)) {
                newVal = Math.round(num * Math.pow(10, decimalScale));
              }
            }
            setValue(newVal);
          }}
          placeholder={typeof placeholder === 'string' ? placeholder : ''}
          prefix={prefix}
          readOnly={isReadonly}
          suffix={suffix}
          thousandSeparator={thousandSeparator}
          value={getDisplayValue(value)}
          {...otherConfig}
        />
      </div>

      <RenderCustomComponent
        CustomComponent={Description}
        Fallback={
          <FieldDescription
            className={`field-description-${path.replace(/\./g, '__')}`}
            description={description ?? ''}
            path={path}
          />
        }
      />

      {AfterInput}
    </div>
  );
}
