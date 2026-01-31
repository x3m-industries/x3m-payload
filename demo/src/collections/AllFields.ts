import type { CollectionConfig } from 'payload';

import {
  addressField,
  countryField,
  emailField,
  idField,
  numberField,
  phoneField,
  slugField,
  urlField,
  vatField,
} from '@x3m-industries/lib-fields';

export const AllFields: CollectionConfig = {
  slug: 'all-fields',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'The title of the document.',
      },
      defaultValue: 'Default Title',
      label: 'Title',
      required: true,
    },

    {
      type: 'collapsible',
      fields: [
        ...slugField({
          config: { lockOnCreate: true, trackingField: 'title' },
          overrides: {
            name: 'slug_default',
            admin: { description: 'Auto-generated from title, locked after create' },
            label: 'Default Slug',
          },
        }),
        ...slugField({
          config: { trackingField: 'title' },
          overrides: {
            name: 'slug_custom',
            admin: { description: 'Auto-generated from title, updates when title changes' },
            label: 'Custom Tracking',
          },
        }),
      ],
      label: 'Slug Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...idField({
          config: { type: 'uuid' },
          overrides: { name: 'id_default', label: 'UUID (Default)' },
        }),
        ...idField({
          config: { type: 'nanoid', uppercase: false },
          overrides: { name: 'id_nanoid', label: 'NanoID' },
        }),
        ...idField({
          config: { type: 'uuid', prefix: 'DOC-', uppercase: true },
          overrides: { name: 'id_uuid', label: 'UUID (Uppercase + Prefix)' },
        }),
        ...idField({
          config: {
            type: 'custom',
            count: 6,
            prefix: 'CUST-',
            suffix: '-X',
            uppercase: true,
          },
          overrides: { name: 'id_custom', label: 'Custom Format' },
        }),
        ...idField({
          config: { type: 'uuidv7' },
          overrides: { name: 'id_uuidv7', label: 'UUID v7 (Time-sortable)' },
        }),
      ],
      label: 'ID Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...emailField({
          overrides: {
            name: 'email_default',
            admin: { description: 'Standard validation' },
            defaultValue: 'demo@example.com',
            label: 'Default Email',
          },
        }),
        ...emailField({
          config: { allowedDomains: ['gmail.com'] },
          overrides: {
            name: 'email_required',
            admin: { description: 'Only gmail.com allowed' },
            defaultValue: 'required@gmail.com',
            label: 'Required Domain',
            required: true,
          },
        }),
      ],
      label: 'Email Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...phoneField({
          overrides: {
            name: 'phone_default',
            admin: { description: 'International format' },
            defaultValue: '+12345678901',
            label: 'Default Phone',
          },
        }),
      ],
      label: 'Phone Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...numberField({
          config: {},
          overrides: {
            name: 'number_priority',
            admin: { description: 'Simple number input' },
            defaultValue: 1,
            label: 'Priority (Default)',
          },
        }),
        ...numberField({
          config: {
            type: 'currency',
            currency: 'EUR',
            scaling: true,
          },
          overrides: {
            name: 'number_currency',
            defaultValue: 9999,
            label: 'Price (EUR)',
          },
        }),
        ...numberField({
          config: {
            type: 'percentage',
          },
          overrides: {
            name: 'number_percentage',
            defaultValue: 50,
            label: 'Percentage',
          },
        }),
      ],
      label: 'Number Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...urlField({
          config: { type: 'website' },
          overrides: {
            name: 'url_default',
            defaultValue: 'https://example.com',
            label: 'Website',
          },
        }),
        ...urlField({
          config: { type: 'x' },
          overrides: {
            name: 'url_social',
            admin: { description: 'Any valid URL' },
            defaultValue: 'https://twitter.com/payloadcms',
            label: 'Social Profile',
          },
        }),
      ],
      label: 'URL Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...vatField({
          overrides: {
            name: 'vat_default',
            admin: { description: 'Validates EU VAT numbers' },
            defaultValue: 'NL854502130B01',
            label: 'VAT Number',
          },
        }),
      ],
      label: 'VAT Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...countryField({
          overrides: {
            name: 'country_default',
            defaultValue: 'NL',
            label: 'Country (All)',
          },
        }),
        ...countryField({
          config: { priorityCountries: ['NL', 'BE', 'LU'] },
          overrides: {
            name: 'country_priority',
            admin: { description: 'NL, BE, LU at the top' },
            defaultValue: 'BE',
            label: 'Country (Priority)',
          },
        }),
        ...countryField({
          config: { allowedCountries: ['NL', 'BE', 'LU'] },
          overrides: {
            name: 'country_allowed',
            admin: { description: 'Only NL, BE, LU allowed' },
            defaultValue: 'LU',
            label: 'Country (Allowed)',
          },
        }),
      ],
      label: 'Country Fields',
    },

    {
      type: 'collapsible',
      fields: [
        ...addressField({
          config: { country: { priorityCountries: ['US', 'CA', 'GB'] } },
          overrides: {
            address: {
              name: 'address_default',
              defaultValue: {
                city: 'City',
                country: 'NL',
                line1: 'Street 1',
                line2: 'Apt 2',
                state: 'State',
                zip: '12345',
              },
              label: 'Billing Address',
            },
          },
        }),
      ],
      label: 'Address Fields',
    },
  ],
};
