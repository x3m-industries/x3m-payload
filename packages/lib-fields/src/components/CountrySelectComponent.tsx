'use client';

import React, { useMemo } from 'react';

import type { OptionObject, TextFieldClientProps } from 'payload';

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  SelectInput,
  useField,
} from '@payloadcms/ui';
import type { Option } from '@payloadcms/ui/elements/ReactSelect';
import { type ICountry, type TCountryCode, countries, getEmojiFlag } from 'countries-list';

import type { CountryFieldConfig } from '../fields/country/field';

type CountrySelectComponentProps = {
  config: CountryFieldConfig;
  // Using 'any' for the component types here matches how RenderCustomComponent
  // expects its props to be passed in the Payload UI package.
  customComponents?: {
    AfterInput?: React.ReactNode;
    BeforeInput?: React.ReactNode;
    Description?: React.ReactNode;
    Error?: React.ReactNode;
    Label?: React.ReactNode;
  };
} & TextFieldClientProps;

export function CountrySelectComponent(props: CountrySelectComponentProps) {
  const { config, customComponents, field, path, readOnly, validate } = props;

  const { AfterInput, BeforeInput, Description, Error, Label } = customComponents || {};

  const { errorMessage, setValue, showError, value } = useField<string>({
    path,
    validate: (val, options) => {
      if (typeof validate === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return validate(val as null | string, { ...options, required: field.required } as any);
      }
      return true;
    },
  });

  // Destructure config here so the variables are available to the dependency array
  const { allowedCountries, priorityCountries = [] } = config || {};

  const finalOptions = useMemo((): OptionObject[] => {
    let availableEntries = Object.entries(countries);

    if (allowedCountries?.length) {
      availableEntries = availableEntries.filter(([code]) =>
        allowedCountries.includes(code as TCountryCode)
      );
    }

    const mapToOption = ([code, country]: [string, ICountry]): OptionObject => ({
      label: `${getEmojiFlag(code as TCountryCode)} ${country.name}`,
      value: code,
    });

    const priority = availableEntries
      .filter(([code]) => priorityCountries.includes(code as TCountryCode))
      .sort(
        (a, b) =>
          priorityCountries.indexOf(a[0] as TCountryCode) -
          priorityCountries.indexOf(b[0] as TCountryCode)
      )
      .map(mapToOption);

    const others = availableEntries
      .filter(([code]) => !priorityCountries.includes(code as TCountryCode))
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(mapToOption);

    const result: OptionObject[] = [...priority];
    if (priority.length > 0 && others.length > 0) {
      result.push({
        label: '──────────',
        value: 'separator',
      });
    }
    result.push(...others);
    return result;
  }, [allowedCountries, priorityCountries]); // These now exist in the scope

  return (
    <div className="field-type select">
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={<FieldLabel label={field.label} path={path} required={field.required} />}
      />

      {BeforeInput}

      <div className="field-error-wrapper">
        <SelectInput
          name={path}
          onChange={(option: Option | Option[]) => {
            if (Array.isArray(option)) {
              return;
            }
            const val = (option?.value !== 'separator' ? option?.value : null) as null | string;
            setValue(val);
          }}
          options={finalOptions}
          path={path}
          readOnly={readOnly}
          value={value}
        />

        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={field.admin?.description} path={path} />}
        />

        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError message={errorMessage} path={path} showError={showError} />}
        />
      </div>

      {AfterInput}
    </div>
  );
}
