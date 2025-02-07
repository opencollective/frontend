import React from 'react';
import { FormattedMessage } from 'react-intl';
import z from 'zod';

import useProcessExpense from '../../lib/expenses/useProcessExpense';
import type { Expense } from '../../lib/graphql/types/v2/schema';

import { useFormikZod } from '../FormikZod';
import ConfirmationModal from '../NewConfirmationModal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

type DeclineExpenseInviteButtonProps = {
  expense: Pick<Expense, 'legacyId' | 'id'>;
  draftKey?: string;
  onExpenseInviteDeclined?: () => void;
};

const schema = z.object({
  declineReason: z.string().min(3).max(255),
});

export default function DeclineExpenseInviteButton(props: DeclineExpenseInviteButtonProps) {
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const { declineInvitation } = useProcessExpense({ expense: props.expense });

  const formik = useFormikZod({
    initialValues: {
      declineReason: '',
    },
    onSubmit(values) {
      return declineInvitation({ message: values.declineReason, draftKey: props.draftKey });
    },
    schema,
  });

  const resetForm = formik.resetForm;
  React.useEffect(() => {
    resetForm();
  }, [isDeclineModalOpen, resetForm]);

  const { setFieldTouched, submitForm, validateForm } = formik;
  const { onExpenseInviteDeclined } = props;
  const onConfirm = React.useCallback(async () => {
    const errors = await validateForm();
    setFieldTouched('declineReason');
    if (errors.declineReason) {
      throw new Error(errors.declineReason);
    }
    await submitForm();
    onExpenseInviteDeclined?.();
  }, [submitForm, validateForm, setFieldTouched, onExpenseInviteDeclined]);

  return (
    <React.Fragment>
      <Button variant="outline" size="sm" onClick={() => setIsDeclineModalOpen(true)}>
        <FormattedMessage defaultMessage="Decline invitation" id="4DwePS" />
      </Button>
      <ConfirmationModal
        title={<FormattedMessage defaultMessage="Confirm declining this expense invitation" id="syX03a" />}
        onConfirm={onConfirm}
        open={isDeclineModalOpen}
        setOpen={setIsDeclineModalOpen}
      >
        <div className="text-base text-foreground">
          <Label className="mb-2">
            <FormattedMessage defaultMessage="Notes" id="expense.notes" />
          </Label>
          <Textarea showCount className="max-h-40" {...formik.getFieldProps('declineReason')} maxLength={255} />
          <div className="mt-1 ml-1 h-4 text-xs text-muted-foreground">
            <FormattedMessage defaultMessage="Provide a reason for declining this expense invitation" id="Iom3HU" />
          </div>
          <div className="mt-1 ml-1 h-4 text-xs text-red-500">
            {formik.errors.declineReason && formik.touched.declineReason ? formik.errors.declineReason : ''}
          </div>
        </div>
      </ConfirmationModal>
    </React.Fragment>
  );
}
