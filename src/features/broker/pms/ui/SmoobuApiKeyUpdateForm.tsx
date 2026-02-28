import { useUpdateSmoobuApiKey } from "@/features/broker/pms/queries/useUpdateSmoobuApiKey";
import { TextInput } from "@/modules/ui/react/form-inputs/TextInput";
import { useForm } from "react-hook-form";

type SmoobuApiKeyFormValues = {
  apiKey: string;
};

function useSmoobuApiKeyUpdateForm() {
  const form = useForm<SmoobuApiKeyFormValues>({ defaultValues: { apiKey: "" } });
  const mutation = useUpdateSmoobuApiKey();

  function handleSubmit(values: SmoobuApiKeyFormValues) {
    mutation.mutate(values.apiKey.trim(), {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return { form, mutation, handleSubmit };
}

export function SmoobuApiKeyUpdateForm() {
  const { form, mutation, handleSubmit } = useSmoobuApiKeyUpdateForm();

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <TextInput
        name="apiKey"
        control={form.control}
        label="Update Smoobu API Key"
        placeholder="Enter new API key"
        required
      />
      <button
        type="submit"
        disabled={!form.watch("apiKey").trim() || mutation.isPending}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? "Verifying..." : "Update"}
      </button>

      {mutation.isError && (
        <p className="mt-2 text-sm text-error">{mutation.error.message}</p>
      )}
      {mutation.isSuccess && (
        <p className="mt-2 text-sm text-success">API key updated</p>
      )}
    </form>
  );
}
