import { cn } from "@/utils/helpers";
import { Select, SelectItem, SelectProps } from "@heroui/react";

interface LanguageSelectProps extends Omit<SelectProps, "children" | "selectionMode"> {
  onLanguageChange?: (language: string | null) => void;
}

const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "ja", name: "Japanese" },
  { id: "ko", name: "Korea" },
  { id: "zh", name: "Chinese" },
  { id: "hi", name: "Hindi" },
  { id: "te", name: "Telugu" },
  { id: "ta", name: "Tamil" },
  { id: "kn", name: "Kannada" },
  { id: "ml", name: "Malayalam" },
  { id: "bn", name: "Bengali" },
  { id: "si", name: "Sinhala" },
  { id: "id", name: "Indonesian" },
  { id: "ar", name: "Arabic" },
  { id: "vi", name: "Vietnam" },
  { id: "tr", name: "Turkish" },
  { id: "es", name: "Spain" },
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "pl", name: "Poland" },
  { id: "phi", name: "Philippine" },
];

const LanguageSelect: React.FC<LanguageSelectProps> = ({
  onLanguageChange,
  isLoading,
  ...props
}) => {
  return (
    <Select
      {...props}
      size="sm"
      isLoading={isLoading}
      selectionMode="single"
      label={props.label ?? "Language"}
      placeholder={props.placeholder ?? "Select language"}
      className={cn("max-w-xs", props.className)}
      onChange={({ target }) =>
        onLanguageChange?.(target.value === "" ? null : target.value)
      }
    >
      {LANGUAGES.map(({ id, name }) => {
        return <SelectItem key={id}>{name}</SelectItem>;
      })}
    </Select>
  );
};

export default LanguageSelect;
