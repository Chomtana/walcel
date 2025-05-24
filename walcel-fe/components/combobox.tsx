"use client"

import {useState} from "react";
import {Command, CommandInput, CommandList, CommandItem} from "@/components/ui/command";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";

export type Option = {
  value: string;
  label: string;
}

export default function ComboboxComponent({options, onSelect, disabled = false, defaultValue}: {
  options: Option[],
  onSelect: (value: string) => void,
  disabled?: boolean,
  defaultValue?: string
}) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]?.value || "");

  const handleSelect = (opt: Option) => {
    setSelectedValue(opt.value);
    onSelect(opt.value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full" disabled={disabled}>
          {options.find((option) => option.value === selectedValue)?.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput placeholder="Search..." disabled={disabled}/>
          <CommandList>
            {options.map((option: Option) => (
              <CommandItem key={option.value} onSelect={() => handleSelect(option)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
