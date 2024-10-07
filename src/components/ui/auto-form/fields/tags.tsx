import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { AutoFormLabel } from "../common/label";
import { AutoFormTooltip } from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";
import { InputTags } from "../../input-tags";

export const AutoFormTags = ({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) => {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  // eslint-disable-next-line no-nested-ternary -- This is a ternary
  const valueArray = Array.isArray(fieldProps?.value)
    ? fieldProps?.value
    : fieldProps?.value
      ? [fieldProps?.value]
      : [];

  return (
    <div className="flex flex-row  items-center space-x-2">
      <FormItem className="flex w-full flex-col justify-start">
        {showLabel ? (
          <AutoFormLabel
            label={fieldConfigItem?.label || label}
            isRequired={isRequired}
          />
        ) : null}
        <FormControl>
          <InputTags {...fieldPropsWithoutShowLabel} value={valueArray} />  
        </FormControl>
        <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
        <FormMessage />
      </FormItem>
    </div>
  );
};
