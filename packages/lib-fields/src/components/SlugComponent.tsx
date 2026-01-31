'use client';

import React, { useCallback } from 'react';

import type { TextFieldClientProps } from 'payload';

import {
  Button,
  FieldDescription,
  FieldError,
  FieldLabel,
  TextInput,
  useField,
} from '@payloadcms/ui';

import './SlugComponent.css';

type SlugComponentProps = TextFieldClientProps;

export function SlugComponent(props: SlugComponentProps) {
  const { field, path, readOnly: readOnlyProp } = props;
  const { label, required } = field;

  // Slug field state
  const { errorMessage, setValue, showError, value } = useField<string>({ path });

  // Resolve lock field path
  // Assuming lock field is a sibling named `${fieldName}Locked`
  const fieldName = field.name;
  const lockPath = path.endsWith(fieldName)
    ? path.substring(0, path.lastIndexOf(fieldName)) + fieldName + 'Locked'
    : fieldName + 'Locked';

  // Lock field state
  const { setValue: setLockValue, value: isLocked } = useField<boolean>({ path: lockPath });

  const handleLockToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setLockValue(!isLocked);
    },
    [isLocked, setLockValue]
  );

  const readOnly = readOnlyProp || isLocked;
  // const readOnly = readOnlyProp || isLocked;

  return (
    <div className="field-type slug-field-component">
      <FieldLabel label={label} path={path} required={required} />

      <div className="input-wrapper">
        <TextInput
          onChange={setValue}
          path={path}
          placeholder={field.admin?.placeholder as string}
          readOnly={readOnly} // Locked means synced/auto-generated, so read-only
          value={value}
        />
        <Button
          buttonStyle="none"
          className="lock-button"
          onClick={handleLockToggle}
          size="small"
          tooltip={isLocked ? 'Unlock to edit manually' : 'Lock to sync with title'}
        >
          {isLocked ? '🔒' : '🔓'}
        </Button>
        <FieldError message={errorMessage} path={path} showError={showError} />
      </div>

      <FieldDescription
        description={
          field.admin?.description ||
          (isLocked ? 'Auto-generated (Locked)' : 'Manual Entry (Unlocked)')
        }
        path={path}
      />
    </div>
  );
}
