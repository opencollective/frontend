import React from 'react';
import type { FormikProps } from 'formik';
import { merge, pick } from 'lodash';
import { z } from 'zod';

import { splitName } from '../../../../lib/collective';
import type LoggedInUser from '../../../../lib/LoggedInUser';
import { cn } from '../../../../lib/utils';

import { generateInitialValuesFromSchema } from '../../../FormikZod';
import StyledInput from '../../../StyledInput';
import StyledInputFormikField from '../../../StyledInputFormikField';
import StyledInputLocation from '../../../StyledInputLocation';
import { ButtonSet } from '../../../ui/ButtonSet';
import { Checkbox } from '../../../ui/Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/Select';

import type { BaseFormValues } from './common';
import { BaseFormSchema, FederalTaxClassification, SubmitterType, TaxFormLocationFields } from './common';
import { HintText } from './HintText';
import type { AccountFromTaxInformationQuery } from './queries';

const FederalTaxClassificationLabels = {
  [FederalTaxClassification.Individual]: 'Individual/sole proprietor or single-member LLC',
  [FederalTaxClassification.C_Corporation]: 'C Corporation',
  [FederalTaxClassification.S_Corporation]: 'S Corporation',
  [FederalTaxClassification.Partnership]: 'Partnership',
  [FederalTaxClassification.TrustEstate]: 'Trust/estate',
  [FederalTaxClassification.LimitedLiabilityCompany]: 'Limited liability company',
  [FederalTaxClassification.Other]: 'Other',
};

export const getW9TaxFormValuesSchema = ({ submitterType }: BaseFormValues) =>
  BaseFormSchema.merge(
    z.object({
      taxIdNumberType: z.enum(['SSN', 'EIN']),
      taxIdNumber: z.string().min(9).max(11),
      accountNumbers: z.string().or(z.literal('')),
      federalTaxClassification: z.nativeEnum(FederalTaxClassification),
      hasConfirmedTOS: z.literal<boolean>(true),
      location: TaxFormLocationFields,
      ...(submitterType === SubmitterType.Individual
        ? {}
        : {
            businessName: z.string().min(1).max(255),
            federalTaxClassificationDetails: z.string().max(255).or(z.literal('')).optional(),
            exemptPayeeCode: z.string().max(5).or(z.literal('')).optional(),
            fatcaExemptionCode: z.string().max(14).or(z.literal('')).optional(),
          }),
    }),
  );

type W9TaxFormValues = z.infer<ReturnType<typeof getW9TaxFormValuesSchema>>;

export const getInitialValuesForW9 = (
  schema,
  user: LoggedInUser,
  account: AccountFromTaxInformationQuery,
  baseValues: BaseFormValues,
): W9TaxFormValues => {
  const signer = splitName(account.legalName || account.name);
  return merge(generateInitialValuesFromSchema(schema), {
    signer,
    accountNumbers: `@${account.slug} (#${account.id})`,
    location: { country: 'US', ...pick(account.location, ['country', 'structured']) },
    ...(baseValues.submitterType === SubmitterType.Individual
      ? { federalTaxClassification: FederalTaxClassification.Individual }
      : { federalTaxClassification: null }),
  });
};

export const W9TaxFormFields = ({ formik }: { formik: FormikProps<W9TaxFormValues> }) => {
  const { values, setFieldValue } = formik;
  return (
    <div className="flex flex-col gap-y-4">
      <div className="mt-2">
        <p className="text-lg font-bold">Submitter Full name</p>
        <HintText>The name should match the name on your tax return.</HintText>
      </div>
      <StyledInputFormikField name="signer.firstName" label="First Name" />
      <StyledInputFormikField name="signer.middleName" label="Middle Name" />
      <StyledInputFormikField
        name="signer.lastName"
        label="Last Name"
        hint="If you have changed your last name without informing the Social Security Administration (SSA) of the name change, enter your first name, the last name as shown on your social security card, and your new last name."
      />
      <div className="mt-2">
        <p className="text-lg font-bold">Address</p>
        <HintText>This is where we will mail your information returns.</HintText>
      </div>
      <StyledInputFormikField name="location" showError={false}>
        {({ field }) => (
          <StyledInputLocation
            name={field.name}
            location={field.value}
            onChange={value => setFieldValue(field.name, value)}
            labelFontWeight="normal"
            autoDetectCountry={false}
            errors={field.error}
            useStructuredForFallback={true}
            required={field.required}
          />
        )}
      </StyledInputFormikField>
      {formik.values.submitterType === SubmitterType.Business && (
        <React.Fragment>
          <p className="mt-2 text-lg font-bold">Business information</p>
          <StyledInputFormikField name="businessName" label="Business name" />
          <StyledInputFormikField name="federalTaxClassification" label="Federal tax classification">
            {({ field }) => (
              <Select value={values.federalTaxClassification} onValueChange={value => setFieldValue(field.name, value)}>
                <SelectTrigger id={field.name} className={cn('truncate', { 'border-red-500': field.error })}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FederalTaxClassification).map(federalTaxClassification => (
                    <SelectItem key={federalTaxClassification} value={federalTaxClassification}>
                      {FederalTaxClassificationLabels[federalTaxClassification]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </StyledInputFormikField>
          {values.federalTaxClassification === 'Other' && (
            <StyledInputFormikField name="federalTaxClassificationDetails" label="Federal tax classification details" />
          )}
          {/* From the reference PDF: Exemptions (codes apply only to certain entities, not individuals; see instructions on page 3) */}
          <div className="mt-2">
            <p className="text-lg font-bold">Exemptions</p>
            <HintText>
              If you are exempt from backup withholding and/or FATCA reporting, enter in the appropriate any code(s)
              that may apply to you
            </HintText>
          </div>
          <StyledInputFormikField name="exemptPayeeCode" label="Exempt payee code" placeholder="Exempt payee code" />
          <StyledInputFormikField name="fatcaExemptionCode" label="Exemption from FATCA reporting code" />
        </React.Fragment>
      )}

      <div className="mt-2">
        <p className="text-lg font-bold">Taxpayer Identification Number (TIN)</p>
        <HintText>
          The TIN provided must match the name given above to avoid backup withholding. For individuals, this is
          generally your social security number (SSN). However, for a resident alien, sole proprietor, or disregarded
          entity, see the instructions for Part I, later. For other entities, it is your employer identification number
          (EIN). If you do not have a number, see How to get a TIN, later.
        </HintText>
      </div>

      <StyledInputFormikField name="taxIdNumberType" label="Tax ID number type">
        {({ field }) => (
          <ButtonSet
            selected={field.value}
            error={field.error}
            onChange={value => {
              setFieldValue(field.name, value);
              setFieldValue('taxIdNumber', '');
            }}
            options={[
              { label: 'SSN', value: 'SSN' },
              { label: 'EIN', value: 'EIN' },
            ]}
          />
        )}
      </StyledInputFormikField>

      <StyledInputFormikField name="taxIdNumber" label={`${values.taxIdNumberType || 'Tax'} ID number`}>
        {({ field }) => (
          <StyledInput
            placeholder={values.taxIdNumberType === 'SSN' ? '123-45-6789' : '12-3456789'}
            disabled={!values.taxIdNumberType}
            {...field}
            maxLength={values.taxIdNumberType === 'SSN' ? 11 : 10}
            pattern={values.taxIdNumberType === 'SSN' ? '[0-9]{3}-[0-9]{2}-[0-9]{4}' : '[0-9]{2}-[0-9]{7}'}
            onChange={e => {
              const { value } = e.target;
              if (values.taxIdNumberType === 'SSN') {
                const formattedValue = value.replace(/[^0-9]/g, '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
                setFieldValue(field.name, formattedValue);
              } else {
                const formattedValue = value.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{7})/, '$1-$2');
                setFieldValue(field.name, formattedValue);
              }
            }}
          />
        )}
      </StyledInputFormikField>
      <StyledInputFormikField name="hasConfirmedTOS">
        {({ field }) => (
          <label className="cursor-pointer text-sm leading-normal font-normal">
            <Checkbox
              className={cn('mr-2 align-text-top', { 'border-red-500': field.error })}
              name={field.name}
              checked={field.value}
              onCheckedChange={checked => formik.setFieldValue(field.name, checked === true)}
            />
            <div className="inline align-text-bottom">
              Under penalties of perjury, I certify that:
              <ol className="list-inside list-decimal">
                <li>
                  The number shown on this form is my correct taxpayer identification number (or I am waiting for a
                  number to be issued to me);
                </li>
                <li>
                  I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have
                  not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a
                  result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no
                  longer subject to backup withholding;
                </li>
                <li>I am a U.S. citizen or other U.S. person (defined in the attached PDF);</li>
                <li>
                  The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is
                  correct.
                </li>
              </ol>
            </div>
          </label>
        )}
      </StyledInputFormikField>
    </div>
  );
};
